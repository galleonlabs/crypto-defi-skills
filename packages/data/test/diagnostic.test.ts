import { describe, expect, test } from "bun:test";
// @ts-ignore Portable JavaScript helper is directly executable outside npm.
import { checkPrice, parseArgs } from "../skills/galleon-defi-data/scripts/price-check.mjs";
const now = 1788609000000;
const good = { bitcoin: { usd: 80000, last_updated_at: now / 1000 - 20 } };
const json = (body: unknown) => new Response(JSON.stringify(body), { headers: { "content-type": "application/json" } });
const run = (body: unknown) => checkPrice({}, { now: () => now, fetch: async () => json(body) });
describe("public observation diagnostic", () => {
  test("one fixed keyless GET preserves identity and distinct timestamps", async () => {
    let calls = 0;
    const result = await checkPrice({}, { now: () => now, fetch: async (url: string, init: RequestInit) => {
      calls++;
      expect(url).toBe("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_last_updated_at=true");
      expect(init.method).toBe("GET"); expect(init.redirect).toBe("error"); expect(init.credentials).toBe("omit");
      expect(init.headers).toEqual({ accept: "application/json" }); return json(good);
    } });
    expect(calls).toBe(1);
    expect(result).toMatchObject({ ok: true, identity: { namespace: "coingecko", id: "bitcoin" }, ageSeconds: 20, price: 80000, unit: "USD" });
    expect(result.observedAt).not.toBe(result.retrievedAt);
  });
  test("DefiLlama preserves CoinGecko namespace instead of claiming independent source", async () => {
    const result = await checkPrice({ provider: "defillama" }, { now: () => now, fetch: async (url: string) => {
      expect(url).toBe("https://coins.llama.fi/prices/current/coingecko:bitcoin");
      return json({ coins: { "coingecko:bitcoin": { price: 80001, timestamp: now / 1000 } } });
    } });
    expect(result).toMatchObject({ ok: true, provider: "defillama", identity: { namespace: "coingecko", id: "bitcoin" } });
  });
  test.each([
    [null, "invalid_data"], [[], "invalid_data"], [{}, "missing_observation"],
    [{ bitcoin: { usd: null, last_updated_at: now / 1000 } }, "invalid_price"],
    [{ bitcoin: { usd: "80000", last_updated_at: now / 1000 } }, "invalid_price"],
    [{ bitcoin: { usd: 0, last_updated_at: now / 1000 } }, "invalid_price"],
    [{ bitcoin: { usd: 80000 } }, "invalid_timestamp"],
    [{ bitcoin: { usd: 80000, last_updated_at: now / 1000 - 301 } }, "stale_observation"],
    [{ bitcoin: { usd: 80000, last_updated_at: now } }, "future_timestamp"],
  ])("rejects unusable data %#", async (body, error) => { expect(await run(body)).toMatchObject({ ok: false, error }); });
  test.each([[401, "authentication_required"], [403, "authentication_required"], [402, "payment_required"], [429, "rate_limited"], [500, "http_error"]] as const)("handles HTTP %s without retries or body leakage", async (status, error) => {
    let calls = 0;
    const result = await checkPrice({}, { fetch: async () => { calls++; return new Response("secret-test-token", { status, headers: { "retry-after": "12" } }); } });
    expect(result).toMatchObject({ ok: false, status, error });
    expect(JSON.stringify(result)).not.toContain("secret-test-token"); expect(calls).toBe(1);
  });
  test("network error messages and hostile Retry-After never echoed", async () => {
    const failed = await checkPrice({}, { fetch: async () => { throw new Error("https://secret-token@host/private-key"); } });
    expect(failed).toEqual({ ok: false, provider: "coingecko", error: "network_error" });
    const limited = await checkPrice({}, { fetch: async () => new Response("secret", { status: 429, headers: { "retry-after": "secret-key" } }) });
    expect(limited).toEqual({ ok: false, provider: "coingecko", error: "rate_limited", status: 429 });
  });
  test("bounds streamed body with no advertised length", async () => {
    expect((await checkPrice({}, { fetch: async () => new Response("x".repeat(65537), { headers: { "content-type": "application/json" } }) })).error).toBe("response_too_large");
  });
  test("HTTP 200 HTML and malformed JSON are failures", async () => {
    expect((await checkPrice({}, { fetch: async () => new Response("<html>secret</html>") })).error).toBe("invalid_content_type");
    expect((await checkPrice({}, { fetch: async () => new Response("{secret", { headers: { "content-type": "application/json" } }) })).error).toBe("invalid_json");
  });
  test("deadline includes body that never completes", async () => {
    expect((await checkPrice({}, { timeoutMs: 10, fetch: async () => new Response(new ReadableStream(), { headers: { "content-type": "application/json" } }) })).error).toBe("timeout");
  });
  test("rejects arbitrary URLs and invalid args before network", async () => {
    for (const options of [{ id: "https://host/key" }, { provider: "pro" }, { maxAge: Infinity }, { maxAge: 0 }, { id: "bitcoin,ethereum" }]) {
      const result = await checkPrice(options, { fetch: async () => { throw new Error("must not fetch"); } });
      expect(result.ok).toBe(false); expect(result.error).not.toBe("network_error");
    }
    expect(() => parseArgs(["--key", "secret"])).toThrow();
    expect(() => parseArgs(["--id", "bitcoin", "--id", "ethereum"])).toThrow();
  });
});
