import { expect, test } from 'bun:test';
// @ts-expect-error Portable standalone JavaScript skill resource.
import { marketSnapshot, collectHistory, normalizeHistory, MarketDataError, parseArgs } from '../skills/galleon-defi-market-snapshot/scripts/market-data.mjs';
const now = Date.parse('2026-10-02T12:00:00.000Z'), seconds = now / 1000;
const json = (value: unknown, status = 200, headers = {}) => new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json', ...headers } });
const observation = (price = 100, time = seconds - 30) => ({ usd: price, last_updated_at: time });
function history(days = 91) {
  const today = Date.parse('2026-10-02T00:00:00.000Z');
  return { prices: Array.from({ length: days }, (_, i) => [today - (days - 1 - i) * 86400000, 100 + i]) };
}
const dependencies = (request: (url: string, options: any) => Promise<Response>) => ({ now: () => now, fetch: request });
test('snapshot makes bounded fixed-host reads with no credentials, auth or redirects', async () => {
  const calls: any[] = [];
  const report = await marketSnapshot({ ids: ['bitcoin'] }, dependencies(async (url, options) => {
    calls.push([url, options]);
    return url.includes('coingecko.com') ? json({ bitcoin: observation() }) : json({ coins: { 'coingecko:bitcoin': { price: 102, timestamp: seconds - 40, confidence: 0.9 } } });
  }));
  expect(report.ok).toBe(true); expect(report.status).toBe('complete');
  expect(calls).toHaveLength(2);
  for (const [, options] of calls) {
    expect(options).toMatchObject({ method: 'GET', credentials: 'omit', redirect: 'error', headers: { accept: 'application/json' } });
    expect(Object.keys(options.headers)).toEqual(['accept']);
  }
  expect(report.reads[0].rawSha256).toMatch(/^[a-f0-9]{64}$/);
  expect(report.comparisons[0]).toMatchObject({ status: 'aligned', skewSeconds: 10 });
  expect(report.comparisons[0].spreadPct).toBeCloseTo(2 / 101 * 100, 10);
});
test('rejects extreme finite prices before comparative arithmetic can overflow', async () => {
  const report = await marketSnapshot({ ids: ['bitcoin'] }, dependencies(async url => url.includes('coingecko.com') ? json({ bitcoin: observation(Number.MAX_VALUE) }) : json({ coins: { 'coingecko:bitcoin': { price: Number.MAX_VALUE / 2, timestamp: seconds } } })));
  expect(report.ok).toBe(false);
  expect(report.status).toBe('unavailable');
  expect(report.comparisons[0]).toMatchObject({ status: 'incomplete', spreadPct: null });
  for (const read of report.reads) expect(read.observations[0].error).toBe('invalid_price');
});
test('partial failure preserves valid evidence, marks unknown and never fabricates a price', async () => {
  const report = await marketSnapshot({ provider: 'coingecko', ids: ['bitcoin', 'ethereum'] }, dependencies(async () => json({ bitcoin: observation(100) })));
  expect(report.ok).toBe(false); expect(report.status).toBe('partial');
  expect(report.reads[0].observations[0].priceUsd).toBe(100);
  expect(report.reads[0].observations[1]).toMatchObject({ ok: false, error: 'missing_observation' });
  expect(report.reads[0].observations[1].priceUsd).toBeUndefined();
});
test('fresh but unaligned prices are not compared', async () => {
  const report = await marketSnapshot({ ids: ['bitcoin'], maxAgeSeconds: 600, maxSkewSeconds: 30 }, dependencies(async url => url.includes('coingecko.com') ? json({ bitcoin: observation(100, seconds - 10) }) : json({ coins: { 'coingecko:bitcoin': { price: 110, timestamp: seconds - 100 } } })));
  expect(report.ok).toBe(true);
  expect(report.comparisons[0]).toMatchObject({ status: 'unaligned', skewSeconds: 90, spreadPct: null });
});
test('stale/future/null/zero prices and invalid confidence fail rather than pass freshness', async () => {
  for (const bad of [observation(100, seconds - 301), observation(100, seconds + 61), { usd: null, last_updated_at: seconds }, observation(0), { usd: 1 }]) {
    const report = await marketSnapshot({ provider: 'coingecko', ids: ['bitcoin'] }, dependencies(async () => json({ bitcoin: bad })));
    expect(report.ok).toBe(false); expect(report.status).toBe('unavailable');
  }
  const report = await marketSnapshot({ provider: 'defillama', ids: ['bitcoin'] }, dependencies(async () => json({ coins: { 'coingecko:bitcoin': { price: 100, timestamp: seconds, confidence: 2 } } })));
  expect(report.reads[0].observations[0].error).toBe('invalid_confidence');
});
test('invalid/duplicate/unbounded IDs and options make no network requests', async () => {
  let calls = 0; const dep = dependencies(async () => { calls++; return json({}); });
  for (const options of [{ ids: [] }, { ids: ['bitcoin', 'bitcoin'] }, { ids: ['../secret'] }, { ids: Array(11).fill('bitcoin') }, { provider: 'paid' }, { maxAgeSeconds: 0 }, { maxSkewSeconds: -1 }]) expect((await marketSnapshot(options, dep)).ok).toBe(false);
  for (const options of [{ days: 90 }, { days: 366 }, { id: 'bitcoin?key=secret' }]) expect((await collectHistory(options, dep)).ok).toBe(false);
  expect(calls).toBe(0);
});
test('provider error bodies and raw exceptions never enter output; Retry-After retained safely', async () => {
  for (const [status, code] of [[401, 'authentication_required'], [402, 'payment_required'], [403, 'authentication_required'], [429, 'rate_limited'], [500, 'http_error']] as const) {
    const report = await marketSnapshot({ provider: 'coingecko', ids: ['bitcoin'] }, dependencies(async () => json({ token: 'secret-value' }, status, { 'retry-after': '42' })));
    expect(report.reads[0].observations[0]).toMatchObject({ error: code, status, retryAfterSeconds: 42 });
    expect(JSON.stringify(report)).not.toContain('secret-value');
  }
  const report = await collectHistory({}, dependencies(async () => { throw new Error('https://private.example?token=secret-value'); }));
  expect(report).toEqual({ ok: false, provider: 'coingecko', error: 'network_error' });
});
test('bounds declared and streamed bodies, validates content type and JSON, and times out', async () => {
  for (const response of [json({}, 200, { 'content-length': '131073' }), new Response('x'.repeat(131073), { headers: { 'content-type': 'application/json' } }), new Response('not-json', { headers: { 'content-type': 'application/json' } }), new Response('{}')]) {
    const report = await marketSnapshot({ provider: 'coingecko', ids: ['bitcoin'] }, dependencies(async () => response));
    expect(report.ok).toBe(false);
  }
  const report = await collectHistory({}, { now: () => now, timeoutMs: 1, fetch: async () => new Promise(() => {}) });
  expect(report.error).toBe('timeout');
});
test('history excludes trailing current-day sample, preserves daily identity, source and raw hash', async () => {
  const payload = history(); payload.prices.push([now - 1000, 200]);
  const report = await collectHistory({ id: 'bitcoin', days: 91 }, dependencies(async (url, options) => {
    expect(url).toBe('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=91');
    expect(options.redirect).toBe('error'); return json(payload);
  }));
  expect(report.ok).toBe(true); expect(report.excludedTrailingObservation).toBe(true);
  expect(report.dataset).toMatchObject({ schemaVersion: 1, unit: 'USD', intervalSeconds: 86400, priceType: 'aggregate-snapshot', identity: { namespace: 'coingecko', id: 'bitcoin' } });
  expect(report.dataset.candles).toHaveLength(91);
  expect(report.dataset.candles.at(-1).timestamp).toBe('2026-10-02T00:00:00.000Z');
  expect(report.dataset.provenance.rawSha256).toMatch(/^[a-f0-9]{64}$/);
});
test('history rejects gaps, duplicates, wrong granularity, short series, stale range and future dates', () => {
  const digest = 'a'.repeat(64);
  for (const mutate of [
    (d: any) => { d.prices.splice(10, 1); },
    (d: any) => { d.prices[1][0] = d.prices[0][0]; },
    (d: any) => { d.prices[1][0] += 1000; },
    (d: any) => { d.prices = d.prices.slice(10); },
    (d: any) => { d.prices.forEach((row: number[]) => { row[0]! -= 3 * 86400000; }); },
    (d: any) => { d.prices.at(-1)[0] = now + 1; },
    (d: any) => { d.prices[10][1] = -1; },
  ]) { const data = history(); mutate(data); expect(() => normalizeHistory(data, 'bitcoin', now, 91, digest)).toThrow(MarketDataError); }
});
test('collector dataset is accepted by independently installable strategy engine', async () => {
  const { runBacktest } = await import('../../strategy/skills/galleon-defi-strategy-backtest/scripts/engine.mjs');
  const report = await collectHistory({ days: 91 }, dependencies(async () => json(history())));
  const result = runBacktest(report.dataset, { schemaVersion: 1, initialCashUsd: 100, feeBps: 10, slippageBps: 20, strategy: { type: 'sma', period: 20 } });
  expect(result.ok).toBe(true); expect(result.priceType).toBe('aggregate-snapshot');
});
test('CLI parsing rejects duplicate/unknown/missing parameters and unsupported commands', () => {
  expect(parseArgs(['history', '--id', 'bitcoin', '--days', '180'])).toEqual({ command: 'history', options: { id: 'bitcoin', days: 180 } });
  for (const args of [['snapshot', '--ids'], ['snapshot', '--provider', 'both', '--provider', 'both'], ['history', '--key', 'secret'], ['trade']]) expect(() => parseArgs(args)).toThrow(MarketDataError);
});
