import { describe, expect, test } from "bun:test";
import { liquidationDistance, normalizeFunding, reviewTrade, roundDown, sizeRisk } from "../src/math.ts";

describe("roundDown", () => {
  test("never returns more than the input", () => {
    const value = 1.23456789;
    expect(roundDown(value, 4)).toBe(1.2345);
    expect(roundDown(value, 4)).toBeLessThanOrEqual(value);
  });
});

describe("sizeRisk", () => {
  test("sizes from the stressed stop and rounds down", () => {
    const result = sizeRisk({
      side: "long",
      equityUsd: 10_200,
      riskPercent: 0.5,
      entryPrice: 3_000,
      stopPrice: 2_900,
      stopSlippageBps: 10,
      entryFeeBps: 4.5,
      exitFeeBps: 4.5,
      sizeDecimals: 4,
      leverage: 3,
    });
    expect(result.riskBudgetUsd).toBe(51);
    expect(result.stressedStopFill).toBe(2_897);
    expect(result.size).toBe(0.4827);
    expect(result.stressedRiskUsd).toBeLessThanOrEqual(51);
    expect(result.marginUsd).toBeCloseTo(482.7, 8);
  });

  test("rejects a stop on the wrong side", () => {
    expect(() => sizeRisk({
      side: "short",
      equityUsd: 10_000,
      riskPercent: 1,
      entryPrice: 100,
      stopPrice: 90,
      stopSlippageBps: 10,
      entryFeeBps: 1,
      exitFeeBps: 4,
      sizeDecimals: 2,
    })).toThrow("short stop");
  });
});

describe("normalizeFunding", () => {
  test("normalizes by the stated venue interval", () => {
    const result = normalizeFunding({ side: "long", notionalUsd: 25_000, rate: 0.00005, intervalHours: 4, hours: 24 });
    expect(result.ratePerHour).toBe(0.0000125);
    expect(result.simpleAnnualRatePercent).toBeCloseTo(10.95, 8);
    expect(result.accountCashflowUsd).toBeCloseTo(-7.5, 8);
  });
});

describe("liquidationDistance", () => {
  test("uses direction-aware distance", () => {
    expect(liquidationDistance({ side: "long", markPrice: 3_000, liquidationPrice: 2_500 }).bufferPercent).toBeCloseTo(16.6666667, 6);
    expect(liquidationDistance({ side: "short", markPrice: 3_000, liquidationPrice: 3_300 }).bufferPercent).toBe(10);
  });
});

describe("reviewTrade", () => {
  test("keeps funding signed from the account perspective", () => {
    const result = reviewTrade({
      side: "long",
      size: 0.5,
      entryPrice: 3_000,
      exitPrice: 3_090,
      entryFeeUsd: 0.25,
      exitFeeUsd: 1.2,
      fundingUsd: -0.4,
      riskUsd: 50,
    });
    expect(result.grossPnlUsd).toBe(45);
    expect(result.netPnlUsd).toBeCloseTo(43.15, 8);
    expect(result.rMultiple).toBeCloseTo(0.863, 8);
  });
});
