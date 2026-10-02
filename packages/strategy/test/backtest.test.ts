import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
// The same host-independent engine is usable in the CLI and browser.
// @ts-expect-error JavaScript skill resource deliberately ships without TypeScript.
import { runBacktest, BacktestError } from '../skills/galleon-defi-strategy-backtest/scripts/engine.mjs';
const examples = resolve(import.meta.dirname, '../skills/galleon-defi-strategy-backtest/examples');
const load = (name: string) => JSON.parse(readFileSync(resolve(examples, name + '.json'), 'utf8'));
function series(prices: number[]) {
  const dataset = load('synthetic-daily');
  dataset.candles = dataset.candles.slice(0, prices.length).map((row: { timestamp: string }, i: number) => ({ ...row, close: prices[i] }));
  return dataset;
}
const spec = (strategy = { type: 'buy-and-hold' }) => ({ schemaVersion: 1, initialCashUsd: 100, feeBps: 0, slippageBps: 0, strategy });
test('buy and hold executes on next observation, not signal price', () => {
  const report = runBacktest(series([100, 200, 300]), spec());
  expect(report.trades).toHaveLength(1);
  expect(report.trades[0]).toMatchObject({ decisionAt: '2026-01-01T00:00:00.000Z', executedAt: '2026-01-02T00:00:00.000Z', quantity: 0.5, fillUsd: 200 });
  expect(report.metrics.endingEquityUsd).toBe(150);
  expect(report.metrics.timeWeightedReturnPct).toBe(50);
  expect(report.metrics).toEqual(report.benchmark.metrics);
});
test('fees and adverse slippage reduce marked equity; cash is not overspent', () => {
  const report = runBacktest(series([100, 100]), { ...spec(), feeBps: 100, slippageBps: 100 });
  expect(report.metrics.endingEquityUsd).toBeCloseTo(100 / 1.01 / 1.01, 10);
  expect(report.metrics.totalFeesUsd + report.metrics.totalSlippageUsd).toBeCloseTo(100 - report.metrics.endingEquityUsd, 10);
  expect(report.metrics.endingCashUsd).toBe(0);
});
test('a contribution is not investment profit and does not hide drawdown', () => {
  const dataset = series([100, 100, 50]);
  const report = runBacktest(dataset, { ...spec(), contributions: [{ timestamp: dataset.candles[2].timestamp, amountUsd: 1000 }] });
  expect(report.metrics.totalContributedUsd).toBe(1100);
  expect(report.metrics.endingEquityUsd).toBe(1050);
  expect(report.metrics.netProfitUsd).toBe(-50);
  expect(report.metrics.timeWeightedReturnPct).toBe(-50);
  expect(report.metrics.maxDrawdownPct).toBe(50);
  expect(report.metrics).toEqual(report.benchmark.metrics);
});
test('flat prices and a new contribution remain zero return', () => {
  const dataset = series([100, 100, 100, 100]);
  const report = runBacktest(dataset, { ...spec(), contributions: [{ timestamp: dataset.candles[2].timestamp, amountUsd: 123 }] });
  expect(report.metrics.endingEquityUsd).toBe(223);
  expect(report.metrics.timeWeightedReturnPct).toBe(0);
  expect(report.metrics.maxDrawdownPct).toBe(0);
});
test('DCA obeys calendar, budget including fees, and finite funded cash', () => {
  const strategy = { type: 'dca', amountUsd: 60, everyBars: 2 };
  const report = runBacktest(series([100, 100, 100, 100, 100, 100]), { ...spec(), feeBps: 100, strategy });
  expect(report.trades).toHaveLength(2);
  expect(report.trades.map((trade: { executedAt: string }) => trade.executedAt)).toEqual(['2026-01-02T00:00:00.000Z', '2026-01-04T00:00:00.000Z']);
  expect(report.trades.map((trade: { cashDeltaUsd: number }) => trade.cashDeltaUsd)).toEqual([-60, -40]);
  expect(report.metrics.endingCashUsd).toBe(0);
  expect(report.metrics.totalFeesUsd).toBeCloseTo(100 - 100 / 1.01, 10);
});
test('SMA waits for warmup, makes next-bar buy and sell, and has no future leakage', () => {
  const input = { ...spec(), strategy: { type: 'sma', period: 2 } };
  const report = runBacktest(series([100, 120, 80, 60, 100, 110]), input);
  expect(report.trades.map((trade: { side: string; fillUsd: number }) => [trade.side, trade.fillUsd])).toEqual([['buy', 80], ['sell', 60], ['buy', 110]]);
  const modified = runBacktest(series([100, 120, 80, 60, 10000, 1]), input);
  expect(modified.trades.slice(0, 2)).toEqual(report.trades.slice(0, 2));
  const prefix = runBacktest(series([100, 120, 80, 60]), input);
  expect(prefix.equityCurve).toEqual(report.equityCurve.slice(0, 4));
});
test('final bullish signal is not executed without a next observation', () => {
  const report = runBacktest(series([100, 90, 100]), { ...spec(), strategy: { type: 'sma', period: 2 } });
  expect(report.trades).toHaveLength(0);
  expect(report.metrics.endingAssetUnits).toBe(0);
});
test('drawdown measures peak to trough rather than loss from initial funding', () => {
  const report = runBacktest(series([100, 100, 200, 100]), spec());
  expect(report.metrics.netProfitUsd).toBe(0);
  expect(report.metrics.maxDrawdownPct).toBe(50);
});
test('rejects gaps, duplicate/reversed dates, future evidence, invalid price and schema', () => {
  for (const mutate of [
    (d: any) => { d.candles[1].timestamp = d.candles[0].timestamp; },
    (d: any) => { d.candles[1].timestamp = '2026-01-04T00:00:00.000Z'; },
    (d: any) => { d.provenance.retrievedAt = '2025-12-31T00:00:00.000Z'; },
    (d: any) => { d.candles[1].close = NaN; },
    (d: any) => { d.candles[1].close = 0; },
    (d: any) => { d.candles[1].timestamp = '2026-02-30T00:00:00.000Z'; },
    (d: any) => { d.intervalSeconds = 3600; },
    (d: any) => { d.identity.id = 'BTC ETH'; },
    (d: any) => { d.provenance.synthetic = false; d.provenance.source = 'https://example.com/data?key=secret'; },
  ]) { const d = series([100, 101]); mutate(d); expect(() => runBacktest(d, spec())).toThrow(BacktestError); }
});
test('rejects unknown rules, shorting, excessive costs, zero cash and invalid contributions', () => {
  const dataset = series([100, 101, 102]);
  for (const bad of [
    { ...spec(), strategy: { type: 'short' } },
    { ...spec(), strategy: { type: 'sma', period: 1 } },
    { ...spec(), strategy: { type: 'sma', period: 3 } },
    { ...spec(), strategy: { type: 'dca', amountUsd: 100, everyBars: 0 } },
    { ...spec(), feeBps: -1 }, { ...spec(), slippageBps: 10000 },
    { ...spec(), initialCashUsd: 0 }, { ...spec(), leverage: 2 },
    { ...spec(), contributions: [{ timestamp: dataset.candles[1].timestamp, amountUsd: -100 }] },
    { ...spec(), contributions: [{ timestamp: dataset.candles[1].timestamp, amountUsd: 100 }, { timestamp: dataset.candles[1].timestamp, amountUsd: 100 }] },
  ]) expect(() => runBacktest(dataset, bad)).toThrow(BacktestError);
});
test('shipped examples produce reproducible reports without mutating input', () => {
  const data = load('synthetic-daily'), input = load('sma'), before = JSON.stringify([data, input]);
  const first = runBacktest(data, input), second = runBacktest(data, input);
  expect(second).toEqual(first);
  expect(JSON.stringify([data, input])).toBe(before);
  expect(first.limitations).toContain('Synthetic fixture: results describe an invented price path.');
});
