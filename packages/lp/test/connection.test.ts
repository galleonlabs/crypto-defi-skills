import { expect, test } from "bun:test";
import { cp, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
// Portable installed scripts deliberately use dependency-free JavaScript.
// @ts-ignore JavaScript module is exercised directly as an installed artifact.
import { diagnose } from "../skills/lp-setup/scripts/connection.mjs";

const now = 1788600000000;
const block = { number: "0x123", timestamp: `0x${Math.floor(now / 1000).toString(16)}`, hash: `0x${"ab".repeat(32)}` };
function fixture(chain: unknown = "0x2105", result: unknown = block) {
  const methods: string[] = [];
  return { methods, fetcher: async (_url: string, options: { body: string }) => {
    const request = JSON.parse(options.body);
    methods.push(request.method);
    return { ok: true, json: async () => ({ jsonrpc: "2.0", id: request.id, result: request.method === "eth_chainId" ? chain : result }) };
  } };
}
const base = { url: "https://rpc.example/private-token", expectedChainId: "8453", now };

test("RPC diagnostic performs only the two allowed reads and returns limited evidence", async () => {
  const mock = fixture();
  const result = await diagnose({ ...base, fetcher: mock.fetcher });
  expect(mock.methods).toEqual(["eth_chainId", "eth_getBlockByNumber"]);
  expect(result).toMatchObject({ ok: true, chainId: "8453", blockNumber: "291", fresh: true, walletReadiness: "not-tested", protocolReadiness: "not-tested" });
  expect(JSON.stringify(result)).not.toContain("private-token");
});

test("RPC diagnostic refuses missing configuration and wrong chain before further reads", async () => {
  await expect(diagnose({ ...base, url: undefined })).rejects.toThrow("MISSING_RPC_URL");
  const mock = fixture("0x1");
  await expect(diagnose({ ...base, fetcher: mock.fetcher })).rejects.toThrow("CHAIN_MISMATCH");
  expect(mock.methods).toEqual(["eth_chainId"]);
});

test("RPC diagnostic rejects stale/future/malformed blocks and remote errors", async () => {
  for (const [result, error] of [
    [{ ...block, timestamp: "0x1" }, "STALE_BLOCK"],
    [{ ...block, timestamp: `0x${(now / 1000 + 60).toString(16)}` }, "FUTURE_BLOCK"],
    [{ ...block, hash: "0xabc" }, "MALFORMED_BLOCK"],
    [null, "MALFORMED_BLOCK"],
  ] as const) {
    await expect(diagnose({ ...base, fetcher: fixture("0x2105", result).fetcher })).rejects.toThrow(error);
  }
  await expect(diagnose({ ...base, fetcher: fixture("0x02105").fetcher })).rejects.toThrow("MALFORMED_CHAIN_ID");
  await expect(diagnose({ ...base, fetcher: async () => ({ ok: true, json: async () => ({ jsonrpc: "2.0", id: 1, error: { message: "private-token" } }) }) })).rejects.toThrow("INVALID_RPC_RESPONSE");
  await expect(diagnose({ ...base, fetcher: async () => { throw new Error("private-token"); } })).rejects.toThrow("RPC_UNAVAILABLE");
  await expect(diagnose({ ...base, fetcher: async () => ({ ok: false }) })).rejects.toThrow("RPC_HTTP_ERROR");
  await expect(diagnose({ ...base, fetcher: async () => ({ ok: true, json: async () => { throw new Error("private-token"); } }) })).rejects.toThrow("MALFORMED_RPC_RESPONSE");
});

test("single setup installation works without repository or sibling skill dependencies", async () => {
  const directory = await mkdtemp(resolve(tmpdir(), "lp-single-skill-"));
  try {
    await cp(resolve(import.meta.dirname, "../skills/lp-setup"), directory, { recursive: true });
    const script = resolve(directory, "scripts/connection.mjs");
    const help = spawnSync("node", [script, "--help"], { cwd: tmpdir(), encoding: "utf8" });
    expect(help.status).toBe(0);
    const missing = spawnSync("node", [script, "--chain-id", "8453"], { cwd: tmpdir(), env: { PATH: process.env.PATH }, encoding: "utf8" });
    expect(missing.status).toBe(1);
    expect(JSON.parse(missing.stdout).error.code).toBe("MISSING_RPC_URL");
    const instructions = await readFile(resolve(directory, "SKILL.md"), "utf8");
    for (const match of instructions.matchAll(/\]\((references\/[^)]+)\)/g)) expect((await readFile(resolve(directory, match[1]!), "utf8")).length).toBeGreaterThan(0);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
