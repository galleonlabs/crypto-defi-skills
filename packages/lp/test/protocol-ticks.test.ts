import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
const script = `${import.meta.dirname}/../skills/uniswap-v3-liquidity/scripts/ticks.mjs`;
const run = (input: object) => spawnSync(process.execPath, [script, JSON.stringify(input)], { encoding: "utf8" });
test("negative ranges snap outward and upper bound is exclusive", () => {
  const result = run({ lower: -121, upper: 119, spacing: 60, current: 120 });
  expect(result.status).toBe(0);
  expect(JSON.parse(result.stdout)).toMatchObject({ tickLower: -180, tickUpper: 120, active: false, principal: "token1" });
});
test("reject impossible ticks and malformed spacing", () => {
  for (const input of [{ lower: -887272, upper: 100, spacing: 60, current: 0 }, { lower: 0, upper: 60, spacing: 0, current: 1 }, { lower: 0.5, upper: 60, spacing: 1, current: 1 }]) expect(run(input).status).not.toBe(0);
});

test("standalone tick CLI accepts a relative path and help", () => {
  const help = spawnSync("node", ["scripts/ticks.mjs", "--help"], { cwd: `${import.meta.dirname}/../skills/uniswap-v3-liquidity`, encoding: "utf8" });
  expect(help.status).toBe(0);
  expect(help.stdout).toContain("Usage:");
});
