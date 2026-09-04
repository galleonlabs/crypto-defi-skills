import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

function run(relativeScript: string, args: string[]): Record<string, unknown> {
  const result = spawnSync(process.execPath, [resolve(root, relativeScript), ...args], { encoding: "utf8" });
  expect(result.status).toBe(0);
  expect(result.stderr).toBe("");
  return JSON.parse(result.stdout) as Record<string, unknown>;
}

describe("portable skill scripts", () => {
  test("risk sizing matches the package function", () => {
    const result = run("skills/hyperliquid-plan/scripts/risk.mjs", [
      "--side", "long", "--equity", "10200", "--risk-percent", "0.5", "--entry", "3000", "--stop", "2900",
      "--stop-slippage-bps", "10", "--entry-fee-bps", "4.5", "--exit-fee-bps", "4.5", "--size-decimals", "4", "--leverage", "3",
    ]);
    expect(result.size).toBe(0.4827);
    expect(result.stressedRiskUsd as number).toBeLessThanOrEqual(51);
  });

  test("funding uses the supplied interval", () => {
    const result = run("skills/hyperliquid-monitor/scripts/funding.mjs", [
      "--side", "long", "--notional", "25000", "--rate", "0.00005", "--interval-hours", "4", "--hours", "24",
    ]);
    expect(result.ratePerHour).toBe(0.0000125);
    expect(result.accountCashflowUsd).toBeCloseTo(-7.5, 8);
  });

  test("review keeps funding signed", () => {
    const result = run("skills/hyperliquid-review/scripts/review.mjs", [
      "--side", "long", "--size", "0.5", "--entry", "3000", "--exit", "3090", "--entry-fee", "0.25",
      "--exit-fee", "1.2", "--funding", "-0.4", "--risk-usd", "50",
    ]);
    expect(result.netPnlUsd).toBeCloseTo(43.15, 8);
    expect(result.rMultiple).toBeCloseTo(0.863, 8);
  });
});
