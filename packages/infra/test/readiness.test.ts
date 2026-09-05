import { expect, test } from "bun:test";
import { credentialPresence, diagnoseRpc, type Transport } from "../src/index.js";
const now = 1_800_000_000_000;
const url = "https://rpc.example/v2/private-secret?token=private-secret";
function fake(results: unknown[]) {
  const calls: { init?: RequestInit | undefined; payload: Record<string, unknown> }[] = [];
  const transport: Transport = async (_, init) => {
    const payload = JSON.parse(String(init?.body)); calls.push({ init, payload });
    return Response.json({ jsonrpc: "2.0", id: payload.id, result: results.shift() });
  };
  return { transport, calls };
}
const block = (offset = 1) => ({ number: "0x123", timestamp: "0x" + (now / 1_000 - offset).toString(16) });
test("only two read methods, redirect refusal, redacted output", async () => {
  const { transport, calls } = fake(["0x2105", { ...block(), privateKey: "private-secret" }]);
  const report = await diagnoseRpc({ rpcUrl: url, chainId: 8453 }, transport, now);
  expect(report).toEqual({ ok: true, code: "ready", chainId: 8453, blockNumber: "291", blockAgeSeconds: 1, requests: 2 });
  expect(calls.map(c => c.payload)).toEqual([{ jsonrpc: "2.0", id: 1, method: "eth_chainId", params: [] }, { jsonrpc: "2.0", id: 2, method: "eth_getBlockByNumber", params: ["latest", false] }]);
  expect(calls.every(c => c.init?.redirect === "error")).toBe(true);
  expect(JSON.stringify(report)).not.toContain("private-secret");
});
test("wrong chain stops immediately", async () => {
  const { transport, calls } = fake(["0x1"]);
  expect((await diagnoseRpc({ rpcUrl: url, chainId: 8453 }, transport, now)).code).toBe("chain_mismatch");
  expect(calls).toHaveLength(1);
});
test("bad configuration cannot hit network; loopback supports local nodes", async () => {
  const { transport, calls } = fake([]);
  for (const rpcUrl of ["http://rpc.example", "file:///secret", "https://user:password@rpc.example", "https://rpc.example/#secret", "not a url"]) expect((await diagnoseRpc({ rpcUrl, chainId: 1 }, transport, now)).code).toBe("invalid_config");
  expect((await diagnoseRpc({ chainId: 1 }, transport, now)).code).toBe("missing_rpc");
  expect((await diagnoseRpc({ rpcUrl: url, chainId: 1, maxAgeSeconds: Infinity }, transport, now)).code).toBe("invalid_config");
  expect(calls).toHaveLength(0);
  const local = fake(["0x1", block()]);
  expect((await diagnoseRpc({ rpcUrl: "http://127.0.0.1:8545", chainId: 1 }, local.transport, now)).ok).toBe(true);
});
test("stale or future state is not ready", async () => {
  for (const [offset, code] of [[121, "stale_block"], [-31, "future_block"]] as const) {
    const { transport } = fake(["0x1", block(offset)]);
    expect((await diagnoseRpc({ rpcUrl: url, chainId: 1 }, transport, now)).code).toBe(code);
  }
});
test("malformed quantities, missing block and response ID mismatch fail closed", async () => {
  for (const malformed of [null, { number: "0x00", timestamp: "0x0" }, { number: "secret", timestamp: "0x0" }]) {
    const { transport } = fake(["0x1", malformed]);
    expect((await diagnoseRpc({ rpcUrl: url, chainId: 1 }, transport, now)).code).toBe("invalid_response");
  }
  const wrongId: Transport = async () => Response.json({ jsonrpc: "2.0", id: 7, result: "0x1" });
  expect((await diagnoseRpc({ rpcUrl: url, chainId: 1 }, wrongId, now)).code).toBe("invalid_response");
});
test("402, 429 and redirects do not trigger payment or retry", async () => {
  for (const status of [402, 429, 302]) {
    let count = 0;
    const transport: Transport = async () => { count++; return new Response("private-secret", { status }); };
    const report = await diagnoseRpc({ rpcUrl: url, chainId: 1 }, transport, now);
    expect(report.code).toBe("http_error"); expect(count).toBe(1);
    expect(JSON.stringify(report)).not.toContain("private-secret");
  }
});
test("provider errors and exceptions never echo endpoint secrets", async () => {
  const transports: Transport[] = [async () => Response.json({ jsonrpc: "2.0", id: 1, error: { message: url } }), async () => { throw new Error(url); }];
  for (const transport of transports) {
    const report = await diagnoseRpc({ rpcUrl: url, chainId: 1 }, transport, now);
    expect(report.ok).toBe(false); expect(JSON.stringify(report)).not.toContain("private-secret"); expect(JSON.stringify(report)).not.toContain("rpc.example");
  }
});
test("oversized response rejected without echo", async () => {
  const transport: Transport = async () => new Response('"' + "x".repeat(65_537) + '"');
  expect((await diagnoseRpc({ rpcUrl: url, chainId: 1 }, transport, now)).code).toBe("invalid_response");
});
test("presence emits fixed names and booleans only", () => {
  const report = credentialPresence({ DEFI_RPC_URL: url, ALCHEMY_API_KEY: "private-secret", ALCHEMY_NETWORK: " ", PRIVATE_KEY: "private-secret", "private-secret": "secret" });
  expect(report).toEqual({ DEFI_RPC_URL: true, ALCHEMY_API_KEY: true, ALCHEMY_NETWORK: false });
  expect(JSON.stringify(report)).not.toContain("private-secret");
});
test("unresponsive transport times out without another request", async () => {
  let count = 0;
  let requestSignal: AbortSignal | null | undefined;
  const transport: Transport = async (_, init) => { count++; requestSignal = init?.signal; return new Promise<Response>(() => {}); };
  const result = await diagnoseRpc({ rpcUrl: url, chainId: 1 }, transport, now);
  expect(result).toEqual({ ok: false, code: "request_failed", requests: 1 });
  expect(count).toBe(1);
  expect(requestSignal?.aborted).toBe(true);
}, 7_000);
test("CLI failures never reproduce unknown secret-bearing arguments", async () => {
  const processResult = Bun.spawn([process.execPath, "src/cli.ts", "doctor", "--unknown-private-secret"], { cwd: import.meta.dir + "/..", stdout: "pipe", stderr: "pipe", env: { PATH: process.env.PATH ?? "" } });
  const [stdout, stderr, status] = await Promise.all([new Response(processResult.stdout).text(), new Response(processResult.stderr).text(), processResult.exited]);
  expect(status).toBe(1);
  expect(stdout + stderr).not.toContain("private-secret");
  expect(JSON.parse(stderr).code).toBe("invalid_command_or_package");
});
