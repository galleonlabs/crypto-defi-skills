import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

function run(script: string, args: string[], input?: string) {
  return spawnSync("node", [script, ...args], { encoding: "utf8", input });
}

test("portable range script returns snapped ticks", () => {
  const script = resolve(import.meta.dirname, "../skills/lp-plan/scripts/range.mjs");
  const result = run(script, ["--price", "1", "--width", "10", "--tick-spacing", "60"]);
  expect(result.status).toBe(0);
  const output = JSON.parse(result.stdout) as { ok: boolean; tickLower: number; tickUpper: number };
  expect(output).toEqual(expect.objectContaining({ ok: true, tickLower: -1080, tickUpper: 960 }));
});

test("portable position script keeps the upper tick exclusive", () => {
  const script = resolve(import.meta.dirname, "../skills/lp-monitor/scripts/position.mjs");
  const input = JSON.stringify({
    tickCurrent: 200,
    tickLower: 0,
    tickUpper: 200,
    positionAssetsUsd: 950,
    holdValueUsd: 1000,
    claimableFeesUsd: 40,
    claimableIncentivesUsd: 20,
    costsUsd: 10,
  });
  const result = run(script, ["--input", "-"], input);
  expect(result.status).toBe(0);
  const output = JSON.parse(result.stdout) as {
    range: { state: string; inRange: boolean };
    accounting: { lpNetValueUsd: number };
  };
  expect(output.range).toEqual(expect.objectContaining({ state: "above-range", inRange: false, percentThroughRange: null }));
  expect(output.accounting.lpNetValueUsd).toBe(1000);
});

test("portable range script floors a boundary price to its protocol tick", () => {
  const script = resolve(import.meta.dirname, "../skills/lp-plan/scripts/range.mjs");
  for (const [price, tick] of [["0.6065458221578348", -5000], ["1.0005001000100004", 4]] as const) {
    const result = run(script, ["--price", price, "--width", "10", "--tick-spacing", "1"]);
    expect(result.status).toBe(0);
    const output = JSON.parse(result.stdout) as { tickCurrent: number; tickLower: number; tickUpper: number };
    expect(output.tickCurrent).toBe(tick);
    expect(output.tickCurrent).toBeGreaterThanOrEqual(output.tickLower);
    expect(output.tickCurrent).toBeLessThan(output.tickUpper);
  }
});

test("portable position script reports exact divergence at the range edges", () => {
  const script = resolve(import.meta.dirname, "../skills/lp-monitor/scripts/position.mjs");
  const atLower = run(script, ["--input", "-"], JSON.stringify({
    tickCurrent: 0,
    tickLower: 0,
    tickUpper: 100,
    edgeBufferTicks: 0,
    positionAssetsUsd: 4,
    holdValueUsd: 8,
    claimableFeesUsd: 6,
    costsUsd: 1,
  }));
  expect(atLower.status).toBe(0);
  const lower = JSON.parse(atLower.stdout) as {
    range: { state: string; nearEdge: boolean; percentThroughRange: number; distanceToLower: number };
    accounting: { lpNetValueUsd: number; inventoryDivergencePercent: number; netResultVsHoldPercent: number };
  };
  expect(lower.range).toEqual(expect.objectContaining({ state: "in-range", nearEdge: true, percentThroughRange: 0, distanceToLower: 0 }));
  expect(lower.accounting).toEqual(expect.objectContaining({ lpNetValueUsd: 9, inventoryDivergencePercent: -50, netResultVsHoldPercent: 12.5 }));

  const below = run(script, ["--input", "-"], JSON.stringify({
    tickCurrent: -5,
    tickLower: 0,
    tickUpper: 10,
    positionAssetsUsd: 0,
    holdValueUsd: 8,
  }));
  expect(below.status).toBe(0);
  const missed = JSON.parse(below.stdout) as {
    range: { state: string; inRange: boolean; percentThroughRange: number | null; distanceToLower: number; distanceToUpper: number };
    accounting: { inventoryDivergencePercent: number; netResultVsHoldPercent: number };
  };
  expect(missed.range).toEqual(expect.objectContaining({
    state: "below-range",
    inRange: false,
    percentThroughRange: null,
    distanceToLower: -5,
    distanceToUpper: 15,
  }));
  expect(missed.accounting.inventoryDivergencePercent).toBe(-100);
  expect(missed.accounting.netResultVsHoldPercent).toBe(-100);
});

test("portable position script rejects a zero hold, negative value and fractional tick", () => {
  const script = resolve(import.meta.dirname, "../skills/lp-monitor/scripts/position.mjs");
  for (const input of [
    { tickCurrent: 0, tickLower: 0, tickUpper: 1, positionAssetsUsd: 1, holdValueUsd: 0 },
    { tickCurrent: 0, tickLower: 0, tickUpper: 1, positionAssetsUsd: -1, holdValueUsd: 1 },
    { tickCurrent: 0.5, tickLower: 0, tickUpper: 1, positionAssetsUsd: 1, holdValueUsd: 1 },
  ]) {
    const result = run(script, ["--input", "-"], JSON.stringify(input));
    expect(result.status).toBe(1);
    expect(JSON.parse(result.stdout).ok).toBe(false);
  }
});

test("portable position script does not echo malformed JSON", () => {
  const script = resolve(import.meta.dirname, "../skills/lp-monitor/scripts/position.mjs");
  const result = run(script, ["--input", "-"], "sensitive malformed input");
  expect(result.status).toBe(1);
  expect(result.stdout + result.stderr).not.toContain("sensitive");
  expect(result.stdout).toContain("invalid JSON input");
});

test("portable Uniswap link script builds a reviewable custom-range URL", () => {
  const script = resolve(import.meta.dirname, "../skills/lp-plan/scripts/uniswap-link.mjs");
  const result = run(script, [
    "--version",
    "v3",
    "--chain",
    "base",
    "--currency-a",
    "NATIVE",
    "--currency-b",
    "0x1111111111111111111111111111111111111111",
    "--fee",
    "3000",
    "--tick-spacing",
    "60",
    "--min-price",
    "2800",
    "--max-price",
    "3600",
    "--amount",
    "1",
    "--exact-field",
    "TOKEN0",
    "--json",
  ]);
  expect(result.status).toBe(0);
  const output = JSON.parse(result.stdout) as { ok: boolean; url: string };
  const url = new URL(output.url);
  expect(output.ok).toBe(true);
  expect(url.origin).toBe("https://app.uniswap.org");
  expect(url.pathname).toBe("/positions/create");
  expect(JSON.parse(url.searchParams.get("fee") ?? "")).toEqual({
    feeAmount: 3000,
    tickSpacing: 60,
    isDynamic: false,
  });
  expect(JSON.parse(url.searchParams.get("priceRangeState") ?? "")).toEqual(
    expect.objectContaining({ fullRange: false, minPrice: "2800", maxPrice: "3600" }),
  );
});

test("portable Uniswap link script rejects a v2 fee payload", () => {
  const script = resolve(import.meta.dirname, "../skills/lp-plan/scripts/uniswap-link.mjs");
  const result = run(script, [
    "--version",
    "v2",
    "--chain",
    "base",
    "--currency-a",
    "NATIVE",
    "--currency-b",
    "0x1111111111111111111111111111111111111111",
    "--fee",
    "3000",
    "--json",
  ]);
  expect(result.status).toBe(1);
  expect(JSON.parse(result.stdout)).toEqual(
    expect.objectContaining({ ok: false, error: expect.objectContaining({ code: "INVALID_INPUT" }) }),
  );
});

test("portable Uniswap link script builds the documented v2 route", () => {
  const script = resolve(import.meta.dirname, "../skills/lp-plan/scripts/uniswap-link.mjs");
  const result = run(script, [
    "--version",
    "v2",
    "--chain",
    "ethereum",
    "--currency-a",
    "0x1111111111111111111111111111111111111111",
    "--currency-b",
    "0x2222222222222222222222222222222222222222",
  ]);
  expect(result.status).toBe(0);
  expect(result.stdout.trim()).toBe(
    "https://app.uniswap.org/positions/create?currencyA=0x1111111111111111111111111111111111111111&currencyB=0x2222222222222222222222222222222222222222&chain=ethereum&version=v2",
  );
});

test("portable Uniswap link script preserves v4 hook and dynamic-fee terms", () => {
  const script = resolve(import.meta.dirname, "../skills/lp-plan/scripts/uniswap-link.mjs");
  const hook = "0x3333333333333333333333333333333333333333";
  const result = run(script, [
    "--version",
    "v4",
    "--chain",
    "base",
    "--currency-a",
    "NATIVE",
    "--currency-b",
    "0x2222222222222222222222222222222222222222",
    "--fee",
    "8388608",
    "--tick-spacing",
    "60",
    "--full-range",
    "--dynamic",
    "--hook",
    hook,
    "--json",
  ]);
  expect(result.status).toBe(0);
  const output = JSON.parse(result.stdout) as { url: string };
  const url = new URL(output.url);
  expect(url.searchParams.get("hook")).toBe(hook);
  expect(JSON.parse(url.searchParams.get("fee") ?? "")).toEqual({
    feeAmount: 8_388_608,
    tickSpacing: 60,
    isDynamic: true,
  });
});

test("portable Uniswap link script rejects reversed or equal range bounds", () => {
  const script = resolve(import.meta.dirname, "../skills/lp-plan/scripts/uniswap-link.mjs");
  const result = run(script, [
    "--version",
    "v3",
    "--chain",
    "base",
    "--currency-a",
    "NATIVE",
    "--currency-b",
    "0x2222222222222222222222222222222222222222",
    "--fee",
    "500",
    "--tick-spacing",
    "10",
    "--min-price",
    "1.0000000000000000001",
    "--max-price",
    "1.0000000000000000000",
    "--json",
  ]);
  expect(result.status).toBe(1);
  expect(JSON.parse(result.stdout).error.message).toBe("--min-price must be below --max-price");
});
