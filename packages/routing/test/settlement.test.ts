import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
const script = `${import.meta.dirname}/../skills/lifi-cross-chain/scripts/settlement.mjs`;
const base = { status: "DONE", substatus: "COMPLETED", expectedChain: 8453, receivedChain: 8453, expectedToken: "0x1111111111111111111111111111111111111111", receivedToken: "0x1111111111111111111111111111111111111111", minimumRaw: "9007199254740993000", receivedRaw: "9007199254740993001" };
const run = (input: object) => spawnSync(process.execPath, [script, JSON.stringify(input)], { encoding: "utf8" });
test("compares large raw amounts without float loss but never claims chain proof", () => {
  const result = JSON.parse(run(base).stdout);
  expect(result).toMatchObject({ minimumMet: true, state: "reported-delivery-awaiting-chain-proof" });
  expect(JSON.parse(run({ ...base, receivedRaw: "9007199254740992999" }).stdout).minimumMet).toBe(false);
});
test("partial, refund, pending and token mismatch never become completed", () => {
  for (const [patch, state] of [[{ substatus: "PARTIAL" }, "partial"], [{ substatus: "REFUNDED" }, "refunded"], [{ status: "PENDING" }, "pending"], [{ receivedChain: 1 }, "asset-mismatch"]] as const) expect(JSON.parse(run({ ...base, ...patch }).stdout).state).toBe(state);
});
test("rejects floating point raw amounts and invalid token identities", () => {
  expect(run({ ...base, receivedRaw: 1 }).status).not.toBe(0);
  expect(run({ ...base, expectedToken: "USDC" }).status).not.toBe(0);
});

test("standalone CLI supports relative path and help without exposing malformed input", () => {
  const cwd = `${import.meta.dirname}/../skills/lifi-cross-chain`;
  const help = spawnSync("node", ["scripts/settlement.mjs", "--help"], { cwd, encoding: "utf8" });
  expect(help.status).toBe(0);
  expect(help.stdout).toContain("Usage:");
  const malformed = spawnSync("node", ["scripts/settlement.mjs", "sensitive malformed input"], { cwd, encoding: "utf8" });
  expect(malformed.status).toBe(1);
  expect(malformed.stderr).not.toContain("sensitive");
});
