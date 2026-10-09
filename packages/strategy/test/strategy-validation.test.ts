import { expect, test } from 'bun:test';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { runStrategyValidation, createStrategySpec, STRATEGY_TEMPLATES, BacktestError, type DailyDataset, type StrategySpec } from '../skills/galleon-defi-strategy-backtest/scripts/engine.mjs';
const examples = resolve(import.meta.dirname, '../skills/galleon-defi-strategy-backtest/examples');
function series(prices: number[]): DailyDataset {
  const dataset = JSON.parse(readFileSync(resolve(examples, 'synthetic-daily.json'), 'utf8'));
  dataset.candles = dataset.candles.slice(0, prices.length).map((row: { timestamp: string }, i: number) => ({ ...row, close: prices[i] }));
  return dataset;
}
const spec = (): StrategySpec => ({ schemaVersion: 1, initialCashUsd: 100, feeBps: 0, slippageBps: 0, strategy: { type: 'buy-and-hold' } });
test('flat-price higher fees/slippage have hand-calculated marked costs in both periods', () => {
  const report = runStrategyValidation(series([100, 100, 100, 100, 100, 100]), { ...spec(), feeBps: 100, slippageBps: 100 });
  expect(report.costScenarios.higherCosts).toEqual({ feeBps: 200, slippageBps: 200 });
  for (const period of Object.values(report.periods)) {
    expect(period.baseline.metrics.endingEquityUsd).toBeCloseTo(100 / 1.01 / 1.01, 10);
    expect(period.higherCosts.metrics.endingEquityUsd).toBeCloseTo(100 / 1.02 / 1.02, 10);
    expect(period.costSensitivity.endingEquityDifferenceUsd).toBeCloseTo(100 / 1.02 / 1.02 - 100 / 1.01 / 1.01, 10);
    expect(period.costSensitivity.modeledCostDifferenceUsd).toBeCloseTo(-period.costSensitivity.endingEquityDifferenceUsd, 10);
    expect(period.baseline.metrics).toEqual(period.baseline.benchmark.metrics);
    expect(period.higherCosts.metrics).toEqual(period.higherCosts.benchmark.metrics);
  }
});
test('split contributions, restarts and final marked balances reconcile without aggregation', () => {
  const dataset = series([100, 200, 300, 100, 50, 100]);
  const report = runStrategyValidation(dataset, { ...spec(), contributions: [
    { timestamp: dataset.candles[1]!.timestamp, amountUsd: 100 },
    { timestamp: dataset.candles[3]!.timestamp, amountUsd: 50 },
    { timestamp: dataset.candles[5]!.timestamp, amountUsd: 200 },
  ] });
  const reference = report.periods.reference.baseline, heldOut = report.periods.heldOut.baseline;
  expect(reference.metrics).toMatchObject({ initialCashUsd: 100, totalContributedUsd: 200, endingEquityUsd: 300, netProfitUsd: 100, timeWeightedReturnPct: 50 });
  expect(heldOut.metrics).toMatchObject({ initialCashUsd: 100, totalContributedUsd: 350, endingEquityUsd: 500, netProfitUsd: 150, timeWeightedReturnPct: 100 });
  expect(heldOut.equityCurve[0]).toMatchObject({ cashUsd: 150, assetUnits: 0, equityUsd: 150, contributionUsd: 50, returnIndex: 1 });
  expect(heldOut.trades[0]).toMatchObject({ decisionAt: dataset.candles[3]!.timestamp, executedAt: dataset.candles[4]!.timestamp, quantity: 3 });
  expect(report.accounting.mode).toBe('independent-restarts');
  expect(report).not.toHaveProperty('metrics');
  expect(report).not.toHaveProperty('combinedBalanceUsd');
});
test('held-out SMA uses fresh warmup and never carries a pending reference decision', () => {
  const dataset = series([100, 120, 80, 60, 100, 90, 100, 110]);
  const report = runStrategyValidation(dataset, { ...spec(), strategy: { type: 'sma', period: 2 } });
  expect(report.periods.reference.baseline.metrics.endingEquityUsd).toBe(75);
  const heldOut = report.periods.heldOut.baseline;
  expect(heldOut.equityCurve.slice(0, 3).map(row => row.cashUsd)).toEqual([100, 100, 100]);
  expect(heldOut.trades).toHaveLength(1);
  expect(heldOut.trades[0]).toMatchObject({ decisionAt: dataset.candles[6]!.timestamp, executedAt: dataset.candles[7]!.timestamp, fillUsd: 110 });
  expect(heldOut.metrics.endingEquityUsd).toBeCloseTo(100, 10);
});
test('funded DCA cadence and budgets restart explicitly in each period', () => {
  const dataset = series(Array(8).fill(100));
  const report = runStrategyValidation(dataset, { ...spec(), strategy: { type: 'dca', amountUsd: 60, everyBars: 2 } });
  for (const [offset, period] of [[0, report.periods.reference], [4, report.periods.heldOut]] as const) {
    expect(period.baseline.trades.map(row => row.cashDeltaUsd)).toEqual([-60, -40]);
    expect(period.baseline.trades.map(row => row.executedAt)).toEqual([dataset.candles[offset + 1]!.timestamp, dataset.candles[offset + 3]!.timestamp]);
    expect(period.baseline.metrics.endingEquityUsd).toBe(100);
    expect(period.baseline.metrics.endingCashUsd).toBe(0);
  }
});
test('changing held-out prices cannot affect reference decisions, costs or metrics', () => {
  const input = { ...spec(), strategy: { type: 'sma', period: 2 } } as StrategySpec;
  const before = runStrategyValidation(series([100, 120, 80, 60, 100, 90, 100, 110]), input);
  const after = runStrategyValidation(series([100, 120, 80, 60, 10000, 1, 1, 9999]), input);
  expect(after.periods.reference).toEqual(before.periods.reference);
  expect(after.frozenSpec).toEqual(before.frozenSpec);
});
test('valid uneven split is an exact non-overlapping partition; results deterministic and inputs unchanged', () => {
  const dataset = series([100, 100, 200, 400, 100, 50, 200]), input = spec();
  const before = JSON.stringify([dataset, input]);
  const report = runStrategyValidation(dataset, input, { splitIndex: 3 });
  expect(report.partition).toMatchObject({ splitIndex: 3, firstHeldOutObservation: dataset.candles[3]!.timestamp, inputObservations: 7 });
  expect(report.periods.reference.period.observations).toBe(3);
  expect(report.periods.heldOut.period.observations).toBe(4);
  expect(report.periods.reference.baseline.metrics.endingEquityUsd).toBe(200);
  expect(report.periods.heldOut.baseline.metrics.endingEquityUsd).toBe(200);
  expect(runStrategyValidation(dataset, input, { splitIndex: 3 })).toEqual(report);
  expect(JSON.stringify([dataset, input])).toBe(before);
});
test('rejects malformed splits and too-short rule-specific periods', () => {
  const dataset = series(Array(12).fill(100));
  for (const splitIndex of [-1, 0, 12, 1.5, NaN, Infinity, '6', null]) {
    expect(() => runStrategyValidation(dataset, spec(), { splitIndex } as any)).toThrow('invalid_split');
  }
  for (const splitIndex of [1, 2, 10, 11]) expect(() => runStrategyValidation(dataset, spec(), { splitIndex })).toThrow('insufficient_validation_samples');
  expect(() => runStrategyValidation(dataset, { ...spec(), strategy: { type: 'sma', period: 5 } })).toThrow('insufficient_validation_samples');
  expect(() => runStrategyValidation(dataset, { ...spec(), strategy: { type: 'dca', amountUsd: 10, everyBars: 5 } })).toThrow('insufficient_validation_samples');
  expect(() => runStrategyValidation(series(Array(5).fill(100)), spec())).toThrow('insufficient_validation_samples');
});
test('rejects lower/equal/unsupported stress costs and hidden optimization options', () => {
  const dataset = series(Array(6).fill(100)), input = { ...spec(), feeBps: 20, slippageBps: 30 };
  for (const options of [
    { stressFeeBps: 19 }, { stressSlippageBps: 29 }, { stressFeeBps: 20, stressSlippageBps: 30 },
    { stressFeeBps: 1001 }, { stressSlippageBps: Infinity }, { stressFeeBps: null },
  ]) expect(() => runStrategyValidation(dataset, input, options as any)).toThrow('invalid_stress_costs');
  expect(() => runStrategyValidation(dataset, input, { optimize: true } as any)).toThrow('invalid_validation_options');
  expect(() => runStrategyValidation(dataset, { ...input, feeBps: 1000, slippageBps: 1000 })).toThrow('invalid_stress_costs');
  const maximum = runStrategyValidation(dataset, { ...input, feeBps: 999, slippageBps: 1000 });
  expect(maximum.costScenarios.higherCosts).toEqual({ feeBps: 1000, slippageBps: 1000 });
});
test('fixed templates declare data and horizon requirements without optimizing', () => {
  expect(STRATEGY_TEMPLATES.map(row => row.id)).toEqual(['buy-and-hold', 'weekly-dca', 'sma-10', 'sma-30']);
  for (const template of STRATEGY_TEMPLATES) {
    expect(template.horizon.minimumValidationObservations).toBe(template.horizon.minimumObservationsPerPeriod * 2);
    expect(template.horizon.recommendedValidationObservations).toBeGreaterThan(template.horizon.minimumValidationObservations);
    expect(template.requiredData).toHaveLength(3);
    expect(Object.isFrozen(template.strategy)).toBe(true);
  }
  const input = createStrategySpec('weekly-dca', { initialCashUsd: 200, amountUsd: 50, feeBps: 10, slippageBps: 20 });
  expect(input.strategy).toEqual({ type: 'dca', everyBars: 7, amountUsd: 50 });
  expect(input).not.toHaveProperty('contributions');
  const report = runStrategyValidation(series(Array(18).fill(100)), input);
  expect(report.partition.minimumObservationsPerPeriod).toBe(9);
  expect(report.periods.heldOut.baseline.metrics.totalContributedUsd).toBe(200);
});
test('templates reject absent funding, unknown variants and unsupported parameters', () => {
  const parameters = { initialCashUsd: 100, feeBps: 10, slippageBps: 20 };
  expect(() => createStrategySpec('sma-best', parameters)).toThrow('unknown_template');
  expect(() => createStrategySpec('weekly-dca', parameters)).toThrow('invalid_template_parameters');
  expect(() => createStrategySpec('buy-and-hold', { ...parameters, amountUsd: 10 })).toThrow('invalid_template_parameters');
  expect(() => createStrategySpec('sma-10', { ...parameters, leverage: 2 } as any)).toThrow('invalid_template_parameters');
  expect(() => createStrategySpec('sma-10', { ...parameters, contributions: [{ timestamp: 'tomorrow', amountUsd: 10 }] })).toThrow(BacktestError);
});
test('standalone Node CLI hashes actual envelope/spec bytes and reports split; invalid options fail cleanly', () => {
  const dir = mkdtempSync(resolve(tmpdir(), 'strategy-validation-'));
  try {
    const data = JSON.stringify({ ok: true, dataset: series(Array(6).fill(100)) }), input = JSON.stringify(spec());
    writeFileSync(resolve(dir, 'data.json'), data); writeFileSync(resolve(dir, 'spec.json'), input);
    const script = resolve(examples, '../scripts/validate-strategy.mjs');
    const args = [script, '--data', resolve(dir, 'data.json'), '--spec', resolve(dir, 'spec.json')];
    const command = spawnSync('node', [...args, '--split', '3', '--stress-fee-bps', '100', '--stress-slippage-bps', '100'], { encoding: 'utf8' });
    expect(command.status).toBe(0);
    const result = JSON.parse(command.stdout);
    expect(result.integrity).toEqual({ datasetSha256: createHash('sha256').update(data).digest('hex'), specSha256: createHash('sha256').update(input).digest('hex'), algorithm: 'sha256' });
    expect(result.costScenarios.higherCosts).toEqual({ feeBps: 100, slippageBps: 100 });
    expect(result.evidence).toBe('historical-simulation');
    for (const extra of [['--split', '3.1'], ['--split', '3', '--split', '3'], ['--optimize', 'true'], ['--split', '0']]) {
      const invalid = spawnSync('node', [...args, ...extra], { encoding: 'utf8' });
      expect(invalid.status).toBe(1); expect(JSON.parse(invalid.stdout).ok).toBe(false);
      expect(invalid.stderr).toBe('');
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
