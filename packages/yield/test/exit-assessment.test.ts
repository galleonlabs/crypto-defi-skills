import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { assessExit } from "../skills/galleon-vault-exit/scripts/assess-exit.mjs";

const script = `${import.meta.dirname}/../skills/galleon-vault-exit/scripts/assess-exit.mjs`;
const blockHash = `0x${"ab".repeat(32)}`;
const otherBlock = `0x${"cd".repeat(32)}`;
const address = (digit: string) => `0x${digit.repeat(40)}`;
const observation = (raw: string, hash = blockHash) => ({ raw, blockHash: hash });
const request = (requestId: string, pendingSharesRaw: string | null, claimableSharesRaw: string | null, hash = blockHash) => ({ requestId, pendingSharesRaw, claimableSharesRaw, blockHash: hash });
const sync = () => ({
  schemaVersion: 1,
  snapshot: {
    chainId: "8453", vault: address("1"), asset: address("2"), shareToken: address("3"),
    owner: address("4"), controller: address("5"), receiver: address("6"), caller: address("7"),
    blockNumber: "9007199254740993", blockHash, assetDecimals: 6, shareDecimals: 18,
  },
  mode: "erc4626",
  intent: { unit: "assets", amountRaw: "10000000" },
  reads: {
    shareBalance: observation("10000000000000000000"),
    maxWithdraw: observation("8000000"),
    maxRedeem: observation("8000000000000000000"),
  },
});
const asynchronous = () => ({
  ...sync(), mode: "erc7540",
  reads: { shareBalance: observation("0"), maxWithdraw: observation("4000000"), maxRedeem: observation("3000000000000000000") },
  requests: { coverage: "complete", items: [request("0", "5000000000000000000", "3000000000000000000")] },
});
const run = (args: string[], input?: string, cwd?: string) => spawnSync("node", args, { input, cwd, encoding: "utf8" });

describe("synchronous historical exit limits", () => {
  test("reports a partial asset withdrawal with a nonlinear exact preview and distinct decimals", () => {
    const result = assessExit({ ...sync(), preview: { method: "previewWithdraw", amountRaw: "8000000", resultRaw: "8080808080808080808", blockHash } });
    expect(result).toMatchObject({
      status: "observed-partial-limit", requested: { unit: "assets", amountRaw: "10000000" },
      available: { unit: "assets", amountRaw: "8000000" }, remaining: { unit: "assets", amountRaw: "2000000" },
      candidate: { method: "withdraw", accountRole: "owner", account: address("4"), receiver: address("6"), previewEstimate: { unit: "shares", amountRaw: "8080808080808080808", meaning: "shares-required" } },
    });
    expect(result.snapshot).toEqual(sync().snapshot);
    expect(result.evidence.scope).toBe("supplied-only-historical-block");
    expect(result.evidence.requirements).toContain("exact-candidate-simulation");
    expect(result.evidence.requirements).toContain("explicit-execution-authority");
  });

  test("does not rescale an original-amount preview to a partial candidate", () => {
    const result = assessExit({ ...sync(), preview: { method: "previewWithdraw", amountRaw: "10000000", resultRaw: "9500000000000000000", blockHash } });
    expect(result.candidate.previewEstimate).toBeNull();
    expect(result.evidence.issues).toContain("preview:not-exact-candidate");
    expect(result.nextRead).toContain("read-preview-for-exact-candidate-amount");
  });

  test("preview method must match the candidate method", () => {
    const result = assessExit({ ...sync(), preview: { method: "previewRedeem", amountRaw: "8000000", resultRaw: "42", blockHash } });
    expect(result.candidate.previewEstimate).toBeNull();
    expect(result.evidence.issues).toContain("preview:not-exact-candidate");
  });

  test("reports partial shares and the exact candidate's asset estimate", () => {
    const result = assessExit({ ...sync(), intent: { unit: "shares", amountRaw: "9000000000000000000" }, preview: { method: "previewRedeem", amountRaw: "8000000000000000000", resultRaw: "7950123", blockHash } });
    expect(result).toMatchObject({
      status: "observed-partial-limit", available: { unit: "shares", amountRaw: "8000000000000000000" },
      remaining: { unit: "shares", amountRaw: "1000000000000000000" },
      candidate: { method: "redeem", previewEstimate: { unit: "assets", amountRaw: "7950123", meaning: "assets-returned" } },
    });
  });

  test("does not need a preview to report a full observed limit", () => {
    const result = assessExit({ ...sync(), intent: { unit: "assets", amountRaw: "1234567" } });
    expect(result.status).toBe("observed-full-limit");
    expect(result.available.amountRaw).toBe("1234567");
    expect(result.remaining.amountRaw).toBe("0");
    expect(result.candidate.previewEstimate).toBeNull();
  });

  test("zero limit produces no candidate and leaves the full request remaining", () => {
    const input = sync();
    input.reads.maxWithdraw = observation("0");
    const result = assessExit(input);
    expect(result.status).toBe("observed-zero-limit");
    expect(result.candidate).toBeNull();
    expect(result.available.amountRaw).toBe("0");
    expect(result.remaining.amountRaw).toBe("10000000");
  });

  test("all arithmetic remains exact above 2^53 and at uint256 max", () => {
    const maximum = ((1n << 256n) - 1n).toString();
    const input = sync();
    input.intent = { unit: "shares", amountRaw: maximum };
    input.reads.shareBalance = observation(maximum);
    input.reads.maxRedeem = observation("9007199254740993");
    const result = assessExit(input);
    expect(result.available.amountRaw).toBe("9007199254740993");
    expect(result.remaining.amountRaw).toBe((BigInt(maximum) - 9007199254740993n).toString());
  });

  test("requires missing synchronous reads without treating null as zero", () => {
    const input = sync();
    const result = assessExit({ ...input, reads: { ...input.reads, shareBalance: null } });
    expect(result.status).toBe("needs-evidence");
    expect(result.evidence.issues).toContain("reads.shareBalance:missing");
    expect(result.candidate).toBeNull();
    expect(result.available.amountRaw).toBeNull();
  });

  test("rejects maximum redeem over the wallet balance", () => {
    const input = sync();
    input.reads.shareBalance = observation("1");
    const result = assessExit(input);
    expect(result.status).toBe("inconsistent-evidence");
    expect(result.candidate).toBeNull();
  });

  test("rejects an exact withdrawal preview requiring more shares than observed", () => {
    const result = assessExit({ ...sync(), preview: { method: "previewWithdraw", amountRaw: "8000000", resultRaw: "10000000000000000001", blockHash } });
    expect(result.status).toBe("inconsistent-evidence");
    expect(result.candidate).toBeNull();
    expect(result.available.amountRaw).toBeNull();
    expect(result.remaining.amountRaw).toBeNull();
  });
});

describe("asynchronous controller limits and requests", () => {
  test("zero wallet shares never caps a claim from escrowed or burned shares", () => {
    const result = assessExit(asynchronous());
    expect(result.status).toBe("observed-partial-limit");
    expect(result.candidate).toMatchObject({ method: "withdraw", amountRaw: "4000000", accountRole: "controller", account: address("5"), previewEstimate: null });
    expect(result.remaining).toEqual({ unit: "assets", amountRaw: "6000000" });
    expect(result.asyncRequests).toMatchObject({ walletSharesRaw: "0", pendingSharesRaw: "5000000000000000000", claimableSharesRaw: "3000000000000000000", idMode: "aggregate" });
    expect(result.nextRead).toContain("reconcile-controller-request-inventory-before-any-new-request");
    expect(JSON.stringify(result)).not.toContain("requestRedeem");
    expect(JSON.stringify(result.asyncRequests)).not.toContain("assets");
  });

  test("share claim uses controller maxRedeem without wallet cap or preview", () => {
    const result = assessExit({ ...asynchronous(), intent: { unit: "shares", amountRaw: "7000000000000000000" } });
    expect(result.available).toEqual({ unit: "shares", amountRaw: "3000000000000000000" });
    expect(result.remaining.amountRaw).toBe("4000000000000000000");
    expect(result.candidate.method).toBe("redeem");
    expect(result.candidate.previewEstimate).toBeNull();
  });

  test("partial nonzero inventory does not attribute a controller limit to its request IDs", () => {
    const result = assessExit({ ...asynchronous(), requests: { coverage: "partial", items: [request("42", "9", "2")] } });
    expect(result.status).toBe("observed-partial-limit");
    expect(result.candidate.amountRaw).toBe("4000000");
    expect(result.asyncRequests).toMatchObject({ coverage: "partial", idMode: "individual", totalsScope: "listed-requests-only", pendingSharesRaw: "9", claimableSharesRaw: "2" });
    expect(result.evidence.issues).toContain("requests:inventory-incomplete");
    expect(result.candidate).not.toHaveProperty("requestId");
  });

  test("unknown request inventory preserves observed limits and unknown totals", () => {
    const { requests, ...input } = asynchronous();
    const result = assessExit(input);
    expect(result.status).toBe("observed-partial-limit");
    expect(result.asyncRequests).toMatchObject({ coverage: "unknown", idMode: "none", pendingSharesRaw: null, claimableSharesRaw: null });
    expect(result.evidence.issues).toContain("requests:state-unknown");
  });

  test("unreadable pending and claimable components remain independently unknown", () => {
    const result = assessExit({ ...asynchronous(), requests: { coverage: "complete", items: [request("0", null, "3000000000000000000")] } });
    expect(result.asyncRequests.pendingSharesRaw).toBeNull();
    expect(result.asyncRequests.claimableSharesRaw).toBe("3000000000000000000");
    expect(result.candidate).not.toBeNull();
    const both = assessExit({ ...asynchronous(), requests: { coverage: "complete", items: [request("0", null, null)] } });
    expect(both.asyncRequests.claimableSharesRaw).toBeNull();
    expect(both.candidate).not.toBeNull();
  });

  test("sums separate nonzero IDs exactly once without inferring assets", () => {
    const result = assessExit({ ...asynchronous(), requests: { coverage: "complete", items: [request("1", "9007199254740993", "2000000000000000000"), request("2", "1", "1000000000000000000")] } });
    expect(result.asyncRequests.pendingSharesRaw).toBe("9007199254740994");
    expect(result.asyncRequests.claimableSharesRaw).toBe("3000000000000000000");
    expect(result.status).toBe("observed-partial-limit");
  });

  test("zero pending and zero claimable never proves claimed or settlement", () => {
    const input = asynchronous();
    input.reads.maxWithdraw = observation("0");
    input.reads.maxRedeem = observation("0");
    input.reads.shareBalance = observation("9000000000000000000");
    input.requests.items = [request("0", "0", "0")];
    const result = assessExit(input);
    expect(result.status).toBe("observed-zero-limit");
    expect(result.candidate).toBeNull();
    expect(result.asyncRequests.interpretation).toBe("request-state-only;zero-does-not-prove-claimed");
    expect(result.nextRead).toContain("reconcile-controller-request-inventory-before-any-new-request");
  });

  test("rejects duplicate aggregate, duplicate individual and mixed request IDs without double-counted totals", () => {
    for (const items of [[request("0", "5", "9"), request("0", "5", "9")], [request("7", "5", "9"), request("7", "5", "9")], [request("0", "5", "9"), request("7", "5", "9")]]) {
      const result = assessExit({ ...asynchronous(), requests: { coverage: "partial", items } });
      expect(result.status).toBe("inconsistent-evidence");
      expect(result.candidate).toBeNull();
      expect(result.asyncRequests.pendingSharesRaw).toBeNull();
      expect(result.asyncRequests.claimableSharesRaw).toBeNull();
    }
  });

  test("maxRedeem cannot exceed a known complete claimable sum", () => {
    for (const items of [[], [request("0", "0", "1")]]) {
      const result = assessExit({ ...asynchronous(), requests: { coverage: "complete", items } });
      expect(result.status).toBe("inconsistent-evidence");
      expect(result.evidence.issues).toContain("reads.maxRedeem:exceeds-complete-claimable-shares");
    }
  });

  test("positive maxWithdraw conflicts with complete zero claimable shares even without maxRedeem", () => {
    const input = asynchronous();
    for (const items of [[], [request("0", "900", "0")], [request("1", "200", "0"), request("2", "300", "0")]]) {
      for (const maxRedeem of [null, observation("0")]) {
        const result = assessExit({ ...input, reads: { ...input.reads, maxWithdraw: observation("420"), maxRedeem }, requests: { coverage: "complete", items } });
        expect(result.status).toBe("inconsistent-evidence");
        expect(result.evidence.issues).toContain("reads.maxWithdraw:positive-with-no-complete-claimable-shares");
        expect(result.available.amountRaw).toBeNull();
        expect(result.candidate).toBeNull();
        expect(result.asyncRequests.claimableSharesRaw).toBeNull();
      }
    }
  });

  test("zero or unknown scoped claimable evidence never erases maxWithdraw without a complete known total", () => {
    const input = asynchronous();
    for (const requests of [
      { coverage: "partial", items: [] },
      { coverage: "partial", items: [request("1", "900", "0")] },
      { coverage: "unknown", items: [request("0", "900", "0")] },
      { coverage: "complete", items: [request("0", "900", null)] },
    ]) {
      const result = assessExit({ ...input, reads: { ...input.reads, maxWithdraw: observation("420"), maxRedeem: null }, requests });
      expect(result.status).toBe("observed-partial-limit");
      expect(result.candidate.amountRaw).toBe("420");
      expect(result.evidence.issues).not.toContain("reads.maxWithdraw:positive-with-no-complete-claimable-shares");
    }
  });

  test("async exit preview success conflicts with the declared mechanism", () => {
    for (const method of ["previewWithdraw", "previewRedeem"]) {
      const result = assessExit({ ...asynchronous(), preview: { method, amountRaw: "4000000", resultRaw: "2", blockHash } });
      expect(result.status).toBe("inconsistent-evidence");
      expect(result.evidence.issues).toContain("preview:async-redeem-previews-must-revert");
      expect(result.candidate).toBeNull();
    }
  });

  test("only the selected-unit limit is required; unknown wallet balance cannot erase a claim", () => {
    const input = asynchronous();
    const result = assessExit({ ...input, reads: { shareBalance: null, maxWithdraw: input.reads.maxWithdraw, maxRedeem: null } });
    expect(result.status).toBe("observed-partial-limit");
    expect(result.asyncRequests.walletSharesRaw).toBeNull();
    const missing = assessExit({ ...input, reads: { ...input.reads, maxWithdraw: null } });
    expect(missing.status).toBe("needs-evidence");
    expect(missing.available.amountRaw).toBeNull();
    expect(missing.candidate).toBeNull();
  });
});

describe("evidence consistency and validation", () => {
  test("any read, preview or request from another block prevents a candidate", () => {
    for (const key of ["shareBalance", "maxWithdraw", "maxRedeem"] as const) {
      const input = asynchronous();
      input.reads[key].blockHash = otherBlock;
      expect(assessExit(input).status).toBe("inconsistent-evidence");
    }
    expect(assessExit({ ...sync(), preview: { method: "previewWithdraw", amountRaw: "10000000", resultRaw: "1", blockHash: otherBlock } }).candidate).toBeNull();
    const mixedRequest = assessExit({ ...asynchronous(), requests: { coverage: "partial", items: [request("1", "1", "1", otherBlock)] } });
    expect(mixedRequest.status).toBe("inconsistent-evidence");
    expect(mixedRequest.asyncRequests.pendingSharesRaw).toBeNull();
    expect(mixedRequest.asyncRequests.claimableSharesRaw).toBeNull();
    expect(mixedRequest.evidence.issues).toContain("requests:totals-unusable");
  });

  test("hex hash casing does not create a block mismatch", () => {
    const input = sync();
    input.reads.maxWithdraw.blockHash = `0x${"AB".repeat(32)}`;
    expect(assessExit(input).status).toBe("observed-partial-limit");
  });

  test("unknown mechanism reports needs-evidence and no candidate", () => {
    const result = assessExit({ ...sync(), mode: "unknown" });
    expect(result.status).toBe("needs-evidence");
    expect(result.candidate).toBeNull();
    expect(result.nextRead).toContain("identify-deployed-exit-mechanism");
  });

  test("async request evidence cannot be silently ignored under sync mode", () => {
    expect(assessExit({ ...sync(), requests: { coverage: "complete", items: [] } }).status).toBe("inconsistent-evidence");
  });

  test("rejects floats, signed, exponent, padded, excessive and out-of-range raw values", () => {
    for (const amountRaw of [1, 1.5, "", "-1", "+1", "1.0", "1e18", "01", "0x10", "1".repeat(79), (1n << 256n).toString(), "private-secret"]) {
      expect(() => assessExit({ ...sync(), intent: { unit: "assets", amountRaw } })).toThrow("Invalid field: intent.amountRaw");
    }
    expect(() => assessExit({ ...sync(), intent: { unit: "assets", amountRaw: "0" } })).toThrow("Invalid field: intent.amountRaw");
  });

  test("validates identity, numeric metadata, required nullable fields and exact schema", () => {
    for (const [key, value] of [["chainId", 8453], ["chainId", "0"], ["assetDecimals", "6"], ["shareDecimals", 256], ["blockNumber", -1], ["blockHash", "secret"], ["owner", "secret"]]) {
      expect(() => assessExit({ ...sync(), snapshot: { ...sync().snapshot, [key]: value } })).toThrow(`Invalid field: snapshot.${key}`);
    }
    expect(() => assessExit({ ...sync(), schemaVersion: 2 })).toThrow("Invalid field: schemaVersion");
    expect(() => assessExit({ ...sync(), mode: "erc754000" })).toThrow("Invalid field: mode");
    expect(() => assessExit({ ...sync(), reads: {} })).toThrow("Invalid field: reads.shareBalance");
    expect(() => assessExit({ ...sync(), "private-secret": "secret" })).toThrow("Invalid field: input");
    expect(() => assessExit({ ...asynchronous(), requests: { coverage: "complete", items: [{ requestId: "1", blockHash }] } })).toThrow("Invalid field: requests.items[0].pendingSharesRaw");
  });

  test("does not mutate supplied objects or request inventory", () => {
    const input = asynchronous();
    const before = JSON.stringify(input);
    const result = assessExit(input);
    result.snapshot.owner = address("9");
    result.asyncRequests.items[0].pendingSharesRaw = "42";
    expect(JSON.stringify(input)).toBe(before);
  });
});

describe("standalone Node CLI", () => {
  test("stdin and file input yield equivalent JSON", () => {
    const directory = mkdtempSync(join(tmpdir(), "exit-assessment-"));
    try {
      const file = join(directory, "snapshot.json");
      writeFileSync(file, JSON.stringify(sync()));
      const fromFile = run([script, file]);
      const fromStdin = run([script, "-"], JSON.stringify(sync()));
      expect(fromFile.status).toBe(0);
      expect(fromStdin.status).toBe(0);
      expect(JSON.parse(fromFile.stdout)).toEqual(JSON.parse(fromStdin.stdout));
    } finally { rmSync(directory, { recursive: true, force: true }); }
  }, 30000);

  test("help and import work without input, network, or process argv assumptions", () => {
    expect(run([script, "--help"]).stdout).toContain("Usage:");
    const imported = run(["--input-type=module", "-e", `process.argv.length = 1; const m = await import(${JSON.stringify(pathToFileURL(script).href)}); console.log(typeof m.assessExit);`]);
    expect(imported.status).toBe(0);
    expect(imported.stdout.trim()).toBe("function");
    expect(imported.stderr).toBe("");
  }, 30000);

  test("errors expose only static messages or field names, never values, file paths or stacks", () => {
    const cases = [
      run([script, "-"], '{"private-secret":'),
      run([script, "/missing/private-secret/snapshot.json"]),
      run([script, "-"], JSON.stringify({ ...sync(), intent: { unit: "assets", amountRaw: "private-secret" } })),
      run([script, "--private-secret"]),
      run([script]),
    ];
    for (const result of cases) {
      expect(result.status).toBe(1);
      expect(result.stdout).toBe("");
      expect(result.stderr).not.toContain("private-secret");
      expect(result.stderr).not.toContain("at ");
      expect(result.stderr.trim().split("\n")).toHaveLength(1);
    }
  }, 30000);

  test("copied helper runs in a detached skill with Node built-ins only", () => {
    const directory = mkdtempSync(join(tmpdir(), "detached-exit-skill-"));
    try {
      mkdirSync(join(directory, "scripts"));
      copyFileSync(script, join(directory, "scripts", "assess-exit.mjs"));
      const result = run(["scripts/assess-exit.mjs", "-"], JSON.stringify(asynchronous()), directory);
      expect(result.status).toBe(0);
      expect(JSON.parse(result.stdout).candidate.accountRole).toBe("controller");
      expect(run(["scripts/assess-exit.mjs", "--help"], undefined, directory).status).toBe(0);
    } finally { rmSync(directory, { recursive: true, force: true }); }
  }, 30000);

  test("CLI also runs through a symlinked skill installation", () => {
    const directory = mkdtempSync(join(tmpdir(), "linked-exit-skill-"));
    try {
      symlinkSync(script, join(directory, "assess-exit.mjs"));
      const result = run(["assess-exit.mjs", "-"], JSON.stringify(sync()), directory);
      expect(result.status).toBe(0);
      expect(JSON.parse(result.stdout).status).toBe("observed-partial-limit");
    } finally { rmSync(directory, { recursive: true, force: true }); }
  }, 30000);
});
