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
  expect(output.range).toEqual(expect.objectContaining({ state: "above-range", inRange: false }));
  expect(output.accounting.lpNetValueUsd).toBe(1000);
});
