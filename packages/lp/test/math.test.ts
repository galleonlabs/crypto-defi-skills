import { describe, expect, test } from "bun:test";
import { buildRange, evaluateEconomics, evaluatePosition } from "../src/math.ts";

describe("buildRange", () => {
  test("snaps outward to usable ticks", () => {
    const result = buildRange({ price: 1, widthPercent: 10, tickSpacing: 60 });
    expect(result.tickCurrent).toBe(0);
    expect(result.tickLower).toBe(-1080);
    expect(result.tickUpper).toBe(960);
    expect(result.snappedPriceLower).toBeLessThanOrEqual(result.requestedPriceLower);
    expect(result.snappedPriceUpper).toBeGreaterThanOrEqual(result.requestedPriceUpper);
  });

  test("accounts for decimal asymmetry", () => {
    const result = buildRange({
      price: 2000,
      widthPercent: 5,
      tickSpacing: 10,
      decimals0: 18,
      decimals1: 6,
    });
    expect(result.snappedPriceLower).toBeLessThanOrEqual(1900);
    expect(result.snappedPriceUpper).toBeGreaterThanOrEqual(2100);
  });

  test("rejects invalid width", () => {
    expect(() => buildRange({ price: 1, widthPercent: 100, tickSpacing: 60 })).toThrow();
  });

  test("rejects prices outside protocol tick bounds", () => {
    expect(() => buildRange({ price: 1e100, widthPercent: 10, tickSpacing: 60 })).toThrow();
  });
});

describe("evaluatePosition", () => {
  test("uses an exclusive upper tick", () => {
    expect(evaluatePosition({ tickCurrent: 200, tickLower: 0, tickUpper: 200 }).state).toBe("above-range");
  });

  test("marks a position near its edge", () => {
    const result = evaluatePosition({ tickCurrent: 185, tickLower: 0, tickUpper: 200, edgeBufferTicks: 20 });
    expect(result.inRange).toBe(true);
    expect(result.nearEdge).toBe(true);
  });
});

describe("evaluateEconomics", () => {
  test("separates fee, incentive, and net APR", () => {
    const result = evaluateEconomics({
      capitalUsd: 10_000,
      feesUsd: 100,
      incentivesUsd: 50,
      costsUsd: 25,
      days: 30,
    });
    expect(result.grossIncomeUsd).toBe(150);
    expect(result.netIncomeUsd).toBe(125);
    expect(result.periodReturnPercent).toBe(1.25);
    expect(result.feeAprPercent).toBeCloseTo(12.1666667, 6);
    expect(result.incentiveAprPercent).toBeCloseTo(6.0833333, 6);
    expect(result.netSimpleAprPercent).toBeCloseTo(15.2083333, 6);
  });
});
