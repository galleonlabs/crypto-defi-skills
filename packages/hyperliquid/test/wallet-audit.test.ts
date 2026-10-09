import { expect, test } from "bun:test";
import { cp, mkdtemp, readFile, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
// @ts-expect-error portable installed skills intentionally ship dependency-free JavaScript
import { analyzeCapture, captureWallet, renderReport, sha256 } from "../skills/hyperliquid-wallet-audit/scripts/audit-engine.mjs";
import fixture from "../skills/hyperliquid-wallet-audit/examples/capture.json";

const root = resolve(import.meta.dirname, "..");
function copy(): any { return structuredClone(fixture); }
function change(capture: any, type: string, edit: (value: any) => void): void {
  const entry = capture.evidence.find((e: any) => e.type === type);
  const data = JSON.parse(entry.responseText); edit(data);
  entry.responseText = JSON.stringify(data); entry.responseSha256 = sha256(entry.responseText);
}
function response(type: string): any { return JSON.parse(fixture.evidence.find((e) => e.type === type)!.responseText); }
function manyFills(tied = false): any[] {
  const base = response("userFillsByTime")[0];
  return Array.from({ length: 500 }, (_, i) => ({ ...base, tid: 1000 + i, oid: 2000 + i, time: fixture.scope.startTime + (tied ? 0 : 1000 + i), hash: `0x${String(i + 10).padStart(64, "0")}` }));
}
function mockFetch(fillsPages: any[][], fundingError = false): any {
  let fillIndex = 0;
  return async (url: string, init: any) => {
    expect(url).toBe("https://api.hyperliquid.xyz/info");
    expect(init.method).toBe("POST"); expect(init.redirect).toBe("error");
    const request = JSON.parse(init.body);
    expect(request.user).toBe(fixture.scope.address);
    const data = request.type === "userFillsByTime" ? fillsPages[fillIndex++] : response(request.type);
    return new Response(JSON.stringify(data), { status: request.type === "userFunding" && fundingError ? 429 : 200 });
  };
}
function clock(): () => Date { let n = 0; return () => new Date(Date.UTC(2026, 9, 9) + n++); }

test("hand-computed signed accounting, liquidity shares, fees and exposure", () => {
  const r = analyzeCapture(copy());
  // +50 ETH -10 BTC =40 closedPnL; fees 1-.25+2=2.75; funding -3+.5=-2.5.
  expect(r.outcome.closedPnlUsdc).toBe("40");
  expect(r.outcome.signedFeesByToken.USDC).toBe("2.75");
  expect(r.outcome.fundingUsdc).toBe("-2.5");
  expect(r.outcome.observedNetUsdc).toBe("34.75");
  expect(r.outcome.builderFeesIncludedByToken.USDC).toBe("0.2");
  expect(r.outcome.fillCount).toBe(3);
  expect(r.execution.positiveFeesUsdc).toBe("3"); expect(r.execution.rebatesUsdc).toBe("0.25");
  // 10*100 + 5*110 + 1*200 =1750; maker 550/1750, taker 1200/1750.
  expect(r.outcome.notionalUsdc).toBe("1750");
  expect(r.execution.maker.notionalSharePercent).toBeCloseTo(31.4285, 4);
  expect(r.execution.taker.notionalSharePercent).toBeCloseTo(68.5714, 4);
  expect(r.execution.costConcentration[0].coin).toBe("BTC");
  expect(r.execution.costConcentration[0].positiveFeeSharePercent).toBeCloseTo(66.6666, 4);
  expect(r.coverage.history.userFillsByTime.duplicatesRemoved).toBe(1);
  expect(r.coverage.excluded.fillCount).toBe(2); expect(r.coverage.excluded.fundingCount).toBe(1);
  expect(r.exposure.grossNotionalUsdc).toBe("950"); expect(r.exposure.signedNetNotionalUsdc).toBe("150");
  expect(r.exposure.protectionStatus).toBe("not-assessed"); expect(r.coverage.completeWindow).toBe(false);
  expect(r.outcome.byCoin.find((c: any) => c.coin === "BTC").initialObservedPosition.size).toBe("-3");
});

test("fees in another token block net USDC instead of inventing valuation", () => {
  const c = copy(); change(c, "userFillsByTime", (rows) => { rows[0].feeToken = "HYPE"; });
  const r = analyzeCapture(c);
  expect(r.outcome.observedNetUsdc).toBeNull(); expect(r.outcome.signedFeesByToken.HYPE).toBe("1");
  expect(r.coverage.status).toBe("partial");
});

test("unified balances are not added to perp equity", () => {
  const c = copy(); const e = c.evidence.find((e: any) => e.type === "userAbstraction");
  e.responseText = '"unifiedAccount"'; e.responseSha256 = sha256(e.responseText);
  const r = analyzeCapture(c);
  expect(r.exposure.balanceInterpretation).toContain("do not add perp accountValue");
  expect(r.exposure.spotTokenBalances[0].total).toBe("100");
  expect(r.exposure.reportedMarginSummary.accountValue).toBe("1000");
});

test("malformed amounts, unsafe identifiers, duplicates and out-of-window activity fail closed", () => {
  for (const edit of [
    (rows: any[]) => { rows[0].closedPnl = "0xff"; },
    (rows: any[]) => { rows[0].fee = "NaN"; },
    (rows: any[]) => { rows[0].px = "0"; },
    (rows: any[]) => { rows[0].sz = "-1"; },
    (rows: any[]) => { rows[0].tid = Number.MAX_SAFE_INTEGER + 1; },
    (rows: any[]) => { rows[0].crossed = "true"; },
    (rows: any[]) => { rows[3].fee = "1"; },
    (rows: any[]) => { rows[0].time = fixture.scope.startTime - 1; },
    (rows: any[]) => { rows[0].time = fixture.scope.endTime + 1; },
  ]) { const c = copy(); change(c, "userFillsByTime", edit); expect(() => analyzeCapture(c)).toThrow(); }
  const c = copy(); change(c, "userFunding", (rows) => { rows[0].delta.type = "transfer"; });
  expect(() => analyzeCapture(c)).toThrow();
});

test("modified bytes, wrong identity, unsafe endpoint and nonsequential reads fail closed", () => {
  for (const edit of [
    (c: any) => { c.evidence[0].responseText += " "; },
    (c: any) => { c.scope.address = "0x2222222222222222222222222222222222222222"; },
    (c: any) => { c.scope.address = [fixture.scope.address]; },
    (c: any) => { c.scope.network = ["mainnet"]; },
    (c: any) => { c.evidence[0].endpoint = "https://example.com/info"; },
    (c: any) => { c.evidence[1].startedAt = c.startedAt; },
    (c: any) => { c.history.userFunding.apiExhausted = false; },
    (c: any) => { c.evidence.at(-1).httpStatus = 503; },
    (c: any) => { const e = c.evidence.at(-1); e.responseText = " ".repeat(8388609); e.responseSha256 = sha256(e.responseText); },
  ]) { const c = copy(); edit(c); expect(() => analyzeCapture(c)).toThrow(); }
});

test("empty history has undefined liquidity percentages and explicit retention gaps", () => {
  const c = copy(); change(c, "userFillsByTime", (rows) => rows.splice(0)); change(c, "userFunding", (rows) => rows.splice(0));
  const r = analyzeCapture(c);
  expect(r.outcome.observedNetUsdc).toBe("0"); expect(r.execution.maker.notionalSharePercent).toBeNull();
  expect(r.execution.costConcentration).toEqual([]); expect(r.coverage.completeWindow).toBe(false);
  expect(renderReport(r)).toContain("not defined (zero observed notional)");
  expect(renderReport(r)).not.toContain("undefined%");
});

test("funding-only markets remain in accounting without a misleading fee-concentration table", () => {
  const c = copy(); change(c, "userFillsByTime", (rows) => rows.splice(0));
  const r = analyzeCapture(c);
  expect(r.outcome.fundingUsdc).toBe("-2.5"); expect(r.outcome.byCoin.length).toBe(2);
  expect(r.execution.costConcentration).toEqual([]);
  expect(renderReport(r)).not.toContain("undefined%");
});

test("capture paginates inclusively and removes boundary overlap without dropping tied records", async () => {
  const page = manyFills(); const next = [{ ...page[499], tid: 9999, time: page[499].time + 1 }];
  const c = await captureWallet(fixture.scope, { maxPages: 3, fetchImpl: mockFetch([page, [page[499], ...next]]), now: clock() });
  const reads = c.evidence.filter((e: any) => e.type === "userFillsByTime");
  expect(JSON.parse(reads[1].requestText).startTime).toBe(page[499].time);
  const r = analyzeCapture(c);
  expect(r.outcome.fillCount).toBe(501); expect(r.coverage.history.userFillsByTime.duplicatesRemoved).toBe(1);
  expect(r.coverage.history.userFillsByTime.apiExhausted).toBe(true);
  expect(r.evidence.sha256Verified).toBe(true);
});

test("page budget and saturated single timestamp remain partial", async () => {
  for (const tied of [false, true]) {
    const c = await captureWallet(fixture.scope, { maxPages: 1, fetchImpl: mockFetch([manyFills(tied)]), now: clock() });
    const r = analyzeCapture(c);
    expect(r.coverage.status).toBe("partial");
    expect(r.coverage.history.userFillsByTime.termination).toBe(tied ? "timestamp-stall" : "page-budget");
    expect(r.coverage.completeWindow).toBe(false);
  }
});

test("funding HTTP failure preserves evidence and cannot become zero-cost net", async () => {
  const c = await captureWallet(fixture.scope, { fetchImpl: mockFetch([response("userFillsByTime")], true), now: clock() });
  const r = analyzeCapture(c);
  expect(r.outcome.observedNetUsdc).toBeNull(); expect(r.coverage.status).toBe("partial");
  const e = c.evidence.at(-1); expect(e.httpStatus).toBe(429); expect(e.responseSha256).toBe(sha256(e.responseText));
});

test("pagination cannot skip a timestamp or claim exhaustion for saturated data", async () => {
  const page = manyFills(); const c = await captureWallet(fixture.scope, { maxPages: 1, fetchImpl: mockFetch([page]), now: clock() });
  c.history.userFillsByTime.termination = "api-exhausted"; c.history.userFillsByTime.apiExhausted = true;
  expect(() => analyzeCapture(c)).toThrow();
});

test("wallet audit works from a copied skill with Node and preserves previous output", async () => {
  const directory = await mkdtemp(join(tmpdir(), "hl-wallet-audit-"));
  try {
    await cp(join(root, "skills/hyperliquid-wallet-audit"), join(directory, "skill"), { recursive: true });
    const script = join(directory, "skill/scripts/wallet-audit.mjs"); const out = join(directory, "result");
    const child = spawnSync("node", [script, "example", "--out", out, "--json"], { cwd: directory, encoding: "utf8" });
    expect(child.status).toBe(0); expect(child.stderr).toBe("");
    const result = JSON.parse(child.stdout); expect(result.source).toBe("fixture"); expect(result.observedNetUsdc).toBe("34.75");
    const report = await readFile(join(out, "report.json"), "utf8");
    expect(JSON.parse(report).evidence.sha256Verified).toBe(true);
    const offline = spawnSync("node", [script, "analyze", "--input", join(out, "capture.json"), "--out", join(directory, "offline"), "--json"], { encoding: "utf8" });
    expect(offline.status).toBe(0); expect(await readFile(join(directory, "offline/report.json"), "utf8")).toBe(report);
    const again = spawnSync("node", [script, "example", "--out", out, "--json"], { encoding: "utf8" });
    expect(again.status).toBe(1); expect(await readFile(join(out, "report.json"), "utf8")).toBe(report);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test("standalone options reject missing network, duplicate flags and non-zoned times", async () => {
  const script = join(root, "skills/hyperliquid-wallet-audit/scripts/wallet-audit.mjs");
  for (const args of [
    ["capture", "--address", fixture.scope.address, "--start", "2026-10-01", "--end", "2026-10-02", "--out", "/tmp/unused"],
    ["example", "--out", "/tmp/unused", "--out", "/tmp/unused2"],
    ["example", "--private-key", "not-a-key", "--out", "/tmp/unused"],
  ]) { const r = spawnSync("node", [script, ...args, "--json"], { encoding: "utf8" }); expect(r.status).toBe(1); expect(JSON.parse(r.stdout).ok).toBe(false); }
});
