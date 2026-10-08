import { expect, test } from "bun:test";
import { summarizeBook } from "../skills/galleon-prediction-market-research/scripts/book-summary.mjs";

const assetId = "123456789012345678901234567890123456789";
const options = { assetId, shares: 5, nowMs: 1791446400000, maxAgeMs: 60000 };
const book = {
  asset_id: assetId, timestamp: "1791446390000", hash: "public-state",
  bids: [{ price: "0.40", size: "20" }, { price: "0.52", size: "10" }],
  asks: [{ price: "0.80", size: "100" }, { price: "0.55", size: "3" }],
};
test("best prices and depth do not depend on API array ordering", () => {
  const result = summarizeBook(book, options);
  expect(result.assetId).toBe(assetId);
  expect(result.bestBid).toBe(0.52);
  expect(result.bestAsk).toBe(0.55);
  expect(result.hypotheticalBuy.grossCost).toBeCloseTo(3.25);
  expect(result.hypotheticalBuy.vwap).toBeCloseTo(0.65);
  expect(result.usableForCurrentResearch).toBe(true);
});
test("missing liquidity stays unknown and partial depth stays partial", () => {
  const result = summarizeBook({ ...book, bids: [], asks: [{ price: "0.55", size: "3" }] }, options);
  expect(result.bestBid).toBeNull();
  expect(result.spread).toBeNull();
  expect(result.hypotheticalBuy.remainingShares).toBe(2);
  expect(result.hypotheticalBuy.complete).toBe(false);
  const empty = summarizeBook({ ...book, bids: [], asks: [] }, options);
  expect(empty.hypotheticalBuy.vwap).toBeNull();
  expect(empty.hypotheticalBuy.complete).toBe(false);
});
test("stale, missing, future and crossed evidence cannot be a current quote", () => {
  for (const [timestamp, expected] of [["1791446300000", "stale"], [undefined, "unknown"], ["1791446500000", "future"]]) {
    const result = summarizeBook({ ...book, timestamp }, options);
    expect(result.freshness).toBe(expected);
    expect(result.usableForCurrentResearch).toBe(false);
  }
  expect(summarizeBook({ ...book, bids: [{ price: "0.70", size: "10" }] }, options).crossed).toBe(true);
});
test("reject mismatched identifiers, corrupt levels and invalid bounds", () => {
  expect(() => summarizeBook({ ...book, asset_id: "123" }, options)).toThrow();
  expect(() => summarizeBook({ ...book, assetId: "123" }, options)).toThrow();
  for (const price of ["NaN", "1", "-0.1", "0.2abc", 0.5]) expect(() => summarizeBook({ ...book, asks: [{ price, size: "1" }] }, options)).toThrow();
  expect(() => summarizeBook(book, { ...options, shares: Infinity })).toThrow();
  expect(() => summarizeBook({ ...book, timestamp: "garbage" }, options)).toThrow();
});

test("duplicate aggregated levels cannot inflate fillable depth", () => {
  expect(() => summarizeBook({ ...book, asks: [{ price: "0.5", size: "3" }, { price: "0.50", size: "3" }] }, options)).toThrow("Duplicate");
  expect(() => summarizeBook({ ...book, bids: Array.from({ length: 10001 }, () => ({ price: "0.5", size: "1" })) }, options)).toThrow("research limit");
});
