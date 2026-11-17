import { describe, expect, test } from "bun:test";
import { buildRange, evaluateEconomics, evaluatePosition } from "../src/math.ts";

describe("buildRange", () => {

  test("keeps the exact tick check cheap for common far-from-zero ticks", () => {
    const start = performance.now();
    const result = buildRange({ price: 2000, widthPercent: 5, tickSpacing: 10, decimals0: 18, decimals1: 6 });
    expect(result.tickCurrent).toBe(-200312);
    expect(performance.now() - start).toBeLessThan(100);
  });
  // Slow, obviously correct reference: 1.0001^tick <= price compared as exact
  // rationals. A double is a dyadic rational, so the comparison has no rounding.
  function exactFloorTick(price: number, start: number): number {
    const view = new DataView(new ArrayBuffer(8));
    view.setFloat64(0, price);
    const bits = view.getBigUint64(0);
    const power = Number((bits >> 52n) & 0x7ffn) - 1075;
    const mantissa = (bits & ((1n << 52n) - 1n)) | (1n << 52n);
    const num = power >= 0 ? mantissa << BigInt(power) : mantissa;
    const den = power >= 0 ? 1n : 1n << BigInt(-power);
    const reached = (tick: number) => {
      const exponent = BigInt(Math.abs(tick));
      return tick < 0
        ? 10000n ** exponent * den <= num * 10001n ** exponent
        : 10001n ** exponent * den <= num * 10000n ** exponent;
    };
    let tick = start;
    while (reached(tick + 1)) tick += 1;
    while (!reached(tick)) tick -= 1;
    return tick;
  }

  test("current tick equals the exact floor for boundary prices at any tick size", () => {
    let seed = 20261117;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 2 ** 32;
    };
    let checked = 0;
    for (let index = 0; index < 60; index += 1) {
      // Two thirds beyond +/-20,000, where 18/6-decimal pairs sit; the rest near zero.
      // Capped at 60,000: the exact reference raises 10001n to the tick, and past
      // about a million bits a loaded CI runner refuses the BigInt.
      const magnitude = index % 3 === 0 ? Math.floor(random() * 20_000) : 20_000 + Math.floor(random() * 40_000);
      const tick = random() < 0.5 ? -magnitude : magnitude;
      const boundary = Math.exp(tick * Math.log(1.0001));
      // The float nearest a boundary lands on either side of it; so do its neighbours.
      for (const price of [boundary, boundary * (1 + 2.3e-16), boundary * (1 - 2.3e-16), boundary * (1 + random() * 1e-4)]) {
        const result = buildRange({ price, widthPercent: 10, tickSpacing: 1 });
        expect([price, result.tickCurrent]).toEqual([price, exactFloorTick(price, result.tickCurrent)]);
        checked += 1;
      }
    }
    expect(checked).toBe(240);
    // Found by this property: the float log put this price one tick too high.
    expect(buildRange({ price: 139749.61407704905, widthPercent: 10, tickSpacing: 1 }).tickCurrent).toBe(118481);
  });

  test("current tick stays exact at the protocol tick bounds", () => {
    expect(buildRange({ price: 3e38, widthPercent: 1, tickSpacing: 1 }).tickCurrent).toBe(886012);
    expect(buildRange({ price: 3e-39, widthPercent: 1, tickSpacing: 1 }).tickCurrent).toBe(-887067);
  });

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
    expect(result.tickCurrent).toBe(-200312);
    expect(result.snappedPriceLower).toBeLessThanOrEqual(1900);
    expect(result.snappedPriceUpper).toBeGreaterThanOrEqual(2100);
  });

  test("rejects invalid width", () => {
    expect(() => buildRange({ price: 1, widthPercent: 100, tickSpacing: 60 })).toThrow();
  });

  test("rejects prices outside protocol tick bounds", () => {
    expect(() => buildRange({ price: 1e100, widthPercent: 10, tickSpacing: 60 })).toThrow();
  });

  test("floors the current tick when the float log is off by one", () => {
    for (const [price, tick] of [[0.6065458221578348, -5000], [1.0005001000100004, 4]] as const) {
      const result = buildRange({ price, widthPercent: 10, tickSpacing: 1 });
      expect(result.tickCurrent).toBe(tick);
      expect(result.tickCurrent).toBeGreaterThanOrEqual(result.tickLower);
      expect(result.tickCurrent).toBeLessThan(result.tickUpper);
    }
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
