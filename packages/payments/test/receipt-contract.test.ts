import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const skill = resolve(import.meta.dirname, "../skills/galleon-erc20-payment-receipt");
const example = JSON.parse(readFileSync(join(skill, "examples/synthetic.json"), "utf8"));

test("receipt CLI preserves evidence boundaries for a submitted payment", () => {
  const dir = mkdtempSync(join(tmpdir(), "galleon-receipt-"));
  const file = join(dir, "input.json");
  function run(input: typeof example) {
    writeFileSync(file, JSON.stringify(input));
    const result = spawnSync("node", [join(skill, "scripts/receipt.mjs"), file], { encoding: "utf8" });
    expect(result.status).toBe(0);
    return JSON.parse(result.stdout);
  }
  try {
    expect(run(example)).toMatchObject({ status: "transfer-event-matched", finality: "rpc-finalized", senderToRecipientRaw: "12500000" });
    expect(run({ ...example, chainId: "0x1" }).status).toBe("chain-mismatch");
    expect(run({ ...example, receipt: null }).status).toBe("receipt-unavailable");
    expect(run({ ...example, finalizedBlock: null }).finality).toBe("unverified");
    expect(run({ ...example, canonicalBlock: example.finalizedBlock }).status).toBe("canonical-block-mismatch");
    const receipt = example.receipt;
    const transfer = receipt.logs[0];
    const withLogs = (...logs: typeof receipt.logs) => run({ ...example, receipt: { ...receipt, logs } });
    expect(withLogs({ ...transfer, address: example.expected.sender }).status).toBe("no-matching-transfer");
    expect(withLogs({ ...transfer, removed: true }).status).toBe("conflicting-log");
    expect(withLogs(transfer, transfer).status).toBe("conflicting-log");
    expect(withLogs({ ...transfer, data: "0x" + "0".repeat(63) + "1" }).status).toBe("amount-mismatch");
    expect(withLogs(transfer, { ...transfer, logIndex: "0x1", topics: [transfer.topics[0], transfer.topics[2], transfer.topics[1]] }).status).toBe("recipient-forwarded-review");
    expect(run({ ...example, receipt: { ...receipt, status: "0x0" } }).status).toBe("reverted");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
