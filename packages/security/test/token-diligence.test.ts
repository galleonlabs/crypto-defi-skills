import { describe, expect, test } from "bun:test";
import {
  collect,
  compare,
  decodeMetadata,
  load,
  rpc,
  validate,
} from "../skills/galleon-defi-security-token-diligence/scripts/evidence";
import fixture from "./fixtures/token-diligence-valid.json";
const copy = (): any => structuredClone(fixture);
const word = (n: bigint) => n.toString(16).padStart(64, "0");
const abiString = (s: string) =>
  `0x${word(32n)}${word(BigInt(Buffer.byteLength(s)))}${Buffer.from(s)
    .toString("hex")
    .padEnd(Math.ceil(Buffer.byteLength(s) / 32) * 64, "0")}`;
function server(handler: (body: any) => unknown | Promise<unknown>) {
  return Bun.serve({
    port: 0,
    hostname: "127.0.0.1",
    async fetch(request) {
      const body = await request.json();
      const result = await handler(body);
      return result instanceof Response ? result : Response.json(result);
    },
  });
}
describe("diligence evidence validation", () => {
  test("accepts complete synthetic snapshot without calling it a security pass", () => {
    expect(validate(copy()).findings[0]?.status).toBe("unknown");
  });
  for (const field of ["observed", "reported"]) {
    test(`rejects ${field} chain mismatch`, () => {
      const value = copy();
      value[field].chainId = "8453";
      expect(() => validate(value)).toThrow("targets differ");
    });
    test(`rejects ${field} address mismatch`, () => {
      const value = copy();
      value[field].address = `0x${"2".repeat(40)}`;
      expect(() => validate(value)).toThrow("targets differ");
    });
  }
  test("rejects fake chain observation even if all labels agree", () => {
    const value = copy();
    value.evidence[0].value = "0x2";
    expect(() => validate(value)).toThrow("chain observation");
  });
  for (const key of ["number", "hash", "timestamp"])
    test(`rejects mismatched ${key} pin`, () => {
      const value = copy();
      value.pin[key] =
        key === "hash"
          ? "0x64da4804da492b605ae33a959a01f7e61b7e6b881d941906005f1b574bf1b86f"
          : key === "number"
            ? "0x2"
            : "2026-01-01T00:00:00.000Z";
      expect(() => validate(value)).toThrow("captured header");
    });
  test("rejects altered captured header without matching artifact", () => {
    const value = copy();
    value.pin.header.hash = value.pin.hash =
      "0x64da4804da492b605ae33a959a01f7e61b7e6b881d941906005f1b574bf1b86f";
    for (const item of value.evidence) item.blockHash = value.pin.hash;
    expect(() => validate(value)).toThrow("header evidence");
  });
  test("rejects wrong-chain and wrong-block evidence", () => {
    for (const field of ["chain", "block"]) {
      const value = copy();
      if (field === "chain") value.evidence[2].target.chainId = "2";
      else
        value.evidence[2].blockHash =
          "0x64da4804da492b605ae33a959a01f7e61b7e6b881d941906005f1b574bf1b86f";
      expect(() => validate(value)).toThrow("evidence target or block");
    }
  });
  test("rejects wrong-token runtime code evidence", () => {
    const value = copy();
    value.evidence.find((e: any) => e.id === "runtime-code").query =
      `eth_getCode 0x${"2".repeat(40)}`;
    expect(() => validate(value)).toThrow("matching runtime code");
  });
  test("rejects wrong-token metadata query and invented decoding", () => {
    const value = copy();
    value.metadata.decimals.value = "6";
    expect(() => validate(value)).toThrow("getter evidence");
    const other = copy();
    other.evidence.find((e: any) => e.id === "metadata-decimals").query =
      `eth_call 0x${"2".repeat(40)} 0x313ce567`;
    expect(() => validate(other)).toThrow("getter evidence");
  });
  test("rejects unknown-as-pass and unknown-as-complete metadata", () => {
    const value = copy();
    value.findings[0].status = "pass";
    expect(() => validate(value)).toThrow("cannot pass");
    const other = copy();
    other.metadata.name.status = "unknown";
    other.metadata.name.value = null;
    expect(() => validate(other)).toThrow("unknown metadata");
  });
  test("rejects missing area, evidence reference, duplicate IDs and undeclared fields", () => {
    const edits = [
      (r: any) => r.coverage.pop(),
      (r: any) => r.findings[0].evidence.push("missing"),
      (r: any) => r.contracts.push(r.contracts[0]),
      (r: any) => (r.signingAuthorized = true),
    ];
    for (const edit of edits) {
      const value = copy();
      edit(value);
      expect(() => validate(value)).toThrow();
    }
  });
});
describe("semantic comparison", () => {
  test("ignores keyed collection ordering, object key order and reference ordering", () => {
    const after = copy();
    after.evidence.reverse();
    after.coverage.reverse();
    after.findings[0].evidence = ["block-header", "runtime-code"];
    const before = copy();
    before.findings[0].evidence = ["runtime-code", "block-header"];
    expect(compare(before, after).substantiveChange).toBe(false);
  });
  test("flags lost findings and reduced coverage without calling them resolved", () => {
    const after = copy();
    after.findings = [];
    after.coverage.find((c: any) => c.id === "metadata").status = "partial";
    const diff = compare(copy(), after);
    expect(
      diff.changes.some(
        (c) => c.section === "findings" && c.change === "removed",
      ),
    ).toBe(true);
    expect(diff.changes.some((c) => c.section === "coverage")).toBe(true);
    expect(JSON.stringify(diff)).not.toContain('"resolved"');
  });
  test("preserves ordering inside raw evidence values", () => {
    const before = copy(),
      after = copy();
    before.evidence.push({
      ...before.evidence[0],
      id: "transfers",
      query: "ordered transfer trace",
      value: [1, 2],
    });
    after.evidence.push({
      ...after.evidence[0],
      id: "transfers",
      query: "ordered transfer trace",
      value: [2, 1],
    });
    expect(compare(before, after).substantiveChange).toBe(true);
  });
  test("distinguishes pin only changes and reports backwards and same-height reorg pins", () => {
    const after = copy();
    after.pin.number = after.pin.header.number = "0x2";
    after.pin.hash = after.pin.header.hash =
      "0x5d37184bff9ff55b320e8a48a03b6087aab0d5abf39143666947f4458241b4af";
    for (const item of after.evidence) item.blockHash = after.pin.hash;
    after.evidence.find((e: any) => e.id === "block-header").value =
      structuredClone(after.pin.header);
    expect(compare(copy(), after).pinOnly).toBe(true);
    expect(compare(after, copy()).pin.backward).toBe(true);
    after.pin.number = after.pin.header.number = "0x1";
    after.evidence.find((e: any) => e.id === "block-header").value.number =
      "0x1";
    expect(compare(copy(), after).pin.sameHeightDifferentHash).toBe(true);
  });
  test("rejects cross-target comparisons", () => {
    const after = copy();
    for (const target of [
      after.requested,
      after.observed,
      after.reported,
      ...after.evidence.map((e: any) => e.target),
    ])
      target.chainId = "2";
    after.evidence[0].value = "0x2";
    expect(() => compare(copy(), after)).toThrow("different targets");
  });
});
describe("bounded collector", () => {
  test("pins every state request by hash, omits RPC URL, leaves economics and controls unknown", async () => {
    const calls: any[] = [];
    const mock = server((body) => {
      calls.push(body);
      let result: any;
      if (body.method === "eth_chainId") result = "0x1";
      else if (body.method === "eth_getBlockByNumber")
        result = fixture.pin.header;
      else if (body.method === "eth_getCode") result = "0x6000";
      else {
        const selector = body.params[0].data;
        result =
          selector === "0x06fdde03"
            ? abiString("Synthetic")
            : selector === "0x95d89b41"
              ? abiString("SYN")
              : `0x${word(selector === "0x313ce567" ? 18n : 1000n)}`;
      }
      return { jsonrpc: "2.0", id: body.id, result };
    });
    try {
      const report = await collect(
        "1",
        fixture.requested.address,
        `${mock.url}?key=private-test-key`,
      );
      expect(calls).toHaveLength(7);
      for (const call of calls.filter((c) =>
        ["eth_call", "eth_getCode"].includes(c.method),
      ))
        expect(call.params[1]).toEqual({
          blockHash: fixture.pin.hash,
          requireCanonical: true,
        });
      expect(
        report.coverage
          .filter((c) => c.id !== "metadata")
          .every((c) => c.status === "unknown"),
      ).toBe(true);
      expect(JSON.stringify(report)).not.toContain("private-test-key");
      expect(validate(report)).toBe(report);
    } finally {
      mock.stop(true);
    }
  });
  test("failed getter remains unknown rather than producing default metadata", async () => {
    const mock = server((body) => ({
      jsonrpc: "2.0",
      id: body.id,
      ...(body.method === "eth_call"
        ? { error: { code: -32000, message: "provider private details" } }
        : {
            result:
              body.method === "eth_chainId"
                ? "0x1"
                : body.method === "eth_getCode"
                  ? "0x6000"
                  : fixture.pin.header,
          }),
    }));
    try {
      const report = await collect(
        "1",
        fixture.requested.address,
        String(mock.url),
      );
      expect(report.metadata.decimals.value).toBeNull();
      expect(report.coverage.find((c) => c.id === "metadata")?.status).toBe(
        "unknown",
      );
      expect(JSON.stringify(report)).not.toContain("provider private details");
    } finally {
      mock.stop(true);
    }
  });
  test("stops before state reads on wrong chain", async () => {
    let calls = 0;
    const mock = server((body) => {
      calls++;
      return { jsonrpc: "2.0", id: body.id, result: "0x2" };
    });
    try {
      await expect(
        collect("1", fixture.requested.address, String(mock.url)),
      ).rejects.toThrow("chain differs");
      expect(calls).toBe(1);
    } finally {
      mock.stop(true);
    }
  });
  test("rejects oversized responses, wrong IDs, RPC errors and redirects", async () => {
    const handlers = [
      () => new Response("x".repeat(100)),
      () => ({ jsonrpc: "2.0", id: 99, result: "0x1" }),
      () => ({
        jsonrpc: "2.0",
        id: 1,
        error: { code: -1, message: "sensitive" },
      }),
      () =>
        new Response(null, {
          status: 302,
          headers: { location: "http://localhost:1/never" },
        }),
    ];
    for (const handler of handlers) {
      const mock = server(handler);
      try {
        await expect(
          rpc(String(mock.url), "eth_chainId", [], 1, { maxBytes: 80 }),
        ).rejects.toThrow();
      } finally {
        mock.stop(true);
      }
    }
  });
  test("bounds timeout and blocks unsupported RPC methods", async () => {
    const mock = server(async (body) => {
      await Bun.sleep(100);
      return { jsonrpc: "2.0", id: body.id, result: "0x1" };
    });
    try {
      await expect(
        rpc(String(mock.url), "eth_chainId", [], 1, { timeoutMs: 10 }),
      ).rejects.toThrow("RPC transport");
      await expect(
        rpc(String(mock.url), "eth_sendRawTransaction", [], 1),
      ).rejects.toThrow("not allowed");
    } finally {
      mock.stop(true);
    }
  });
  test("strict ABI rejects alternate offsets, bytes32 fallback, unsafe text and invalid uint8", () => {
    expect(decodeMetadata(abiString("Synthetic"), false)).toBe("Synthetic");
    expect(decodeMetadata(`0x${word(1000n)}`, true)).toBe("1000");
    for (const value of [
      `0x${word(0n)}`,
      `0x${word(64n)}${word(1n)}${word(0n)}`,
      abiString("bad\nname"),
    ])
      expect(() => decodeMetadata(value, false)).toThrow();
    expect(() => decodeMetadata(`0x${word(256n)}`, true, true)).toThrow();
  });
});

function withHistory(): any {
  const report = copy();
  const hash =
    "0x5e28c8491b01f74d7acf1b9c6308457441d691551749d12e1b5153ab0ab5caad";
  const header = { number: "0x0", hash, timestamp: "0x0" };
  report.historicalPins = [
    { ...header, timestamp: "1970-01-01T00:00:00.000Z", header },
  ];
  report.evidence.push({
    ...report.evidence[1],
    id: "launch-block-header",
    blockHash: hash,
    value: header,
  });
  report.evidence.push({
    ...report.evidence[2],
    id: "launch-event",
    blockHash: hash,
    query: "historical launch receipt, synthetic",
    value: { amount: "1000", logIndex: "0x0" },
  });
  return report;
}
describe("historical pins and execution boundary", () => {
  test("accepts older evidence with its own matching captured header", () => {
    expect(validate(withHistory()).historicalPins).toHaveLength(1);
  });
  test("rejects invented or uncaptured historical hashes", () => {
    const report = withHistory();
    report.evidence = report.evidence.filter(
      (e: any) => e.id !== "launch-block-header",
    );
    expect(() => validate(report)).toThrow("historical pin lacks");
  });
  test("rejects historical getter evidence presented as current metadata", () => {
    const report = withHistory();
    report.evidence.find((e: any) => e.id === "metadata-decimals").blockHash =
      report.historicalPins[0].hash;
    expect(() => validate(report)).toThrow("getter evidence");
  });
  test("surfaces changed historical evidence even with identical payload", () => {
    const before = withHistory(),
      after = withHistory();
    const hash =
      "0xcae0f34394b82f9593e8c05817087020232bb9c2b14b6c6d86b31e911c454bd7";
    after.historicalPins[0].hash = after.historicalPins[0].header.hash = hash;
    for (const e of after.evidence.filter((e: any) =>
      e.id.startsWith("launch-"),
    ))
      e.blockHash = hash;
    after.evidence.find((e: any) => e.id === "launch-block-header").value.hash =
      hash;
    const diff = compare(before, after);
    expect(diff.pinOnly).toBe(false);
    expect(diff.changes.some((c) => c.id === "launch-event")).toBe(true);
  });
  test("rejects missing execution declarations, signing, broadcast and placeholder hashes", () => {
    for (const mutate of [
      (r: any) => delete r.execution,
      (r: any) => (r.execution.realSigning = true),
      (r: any) => (r.execution.broadcast = true),
      (r: any) => (r.pin.header.hash = "0x" + "0".repeat(64)),
    ]) {
      const report = copy();
      mutate(report);
      expect(() => validate(report)).toThrow();
    }
  });
  test("refuses device files without reading them", async () => {
    await expect(load("/dev/null")).rejects.toThrow("regular file");
  });
});

describe("review regression checks", () => {
  test("preserves arrays named evidence inside arbitrary raw payloads", () => {
    const before = copy(),
      after = copy();
    before.evidence.push({
      ...before.evidence[2],
      id: "raw-trace",
      query: "trace payload",
      value: { evidence: ["sell", "revert"], nested: { evidence: ["a", "b"] } },
    });
    after.evidence.push({
      ...after.evidence[2],
      id: "raw-trace",
      query: "trace payload",
      value: { evidence: ["revert", "sell"], nested: { evidence: ["a", "b"] } },
    });
    expect(
      compare(before, after).changes.some((c) => c.id === "raw-trace"),
    ).toBe(true);
    after.evidence.at(-1).value = {
      evidence: ["sell", "revert"],
      nested: { evidence: ["b", "a"] },
    };
    expect(compare(before, after).substantiveChange).toBe(true);
  });
  test("malformed secret-bearing RPC URL never appears in CLI output", async () => {
    const secret = "private-secret-key";
    const helper = new URL(
      "../skills/galleon-defi-security-token-diligence/scripts/evidence.ts",
      import.meta.url,
    ).pathname;
    const child = Bun.spawn(
      [process.execPath, helper, "collect", "1", fixture.requested.address],
      {
        env: { ...process.env, DEFI_RPC_URL: `https://[${secret}` },
        stdout: "pipe",
        stderr: "pipe",
      },
    );
    const [exitCode, stdout, stderr] = await Promise.all([
      child.exited,
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
    ]);
    expect(exitCode).toBe(1);
    expect(stdout).toBe("");
    expect(stderr).toContain("RPC URL is invalid");
    expect(stdout + stderr).not.toContain(secret);
    expect(stdout + stderr).not.toContain("https://[");
  });
});
