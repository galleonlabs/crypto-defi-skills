import { describe, expect, test } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { stress, type Scenario } from "./stress";
const fixture: Scenario = {
  collateralBase: "10000000000", debtBase: "4000000000", extraDebtBase: "1000000000",
  liquidationThresholdBps: "8000", collateralFactorBps: "8000", debtFactorBps: "10500", minimumHealthFactorWad: "1300000000000000000",
};
describe("fixed-point risk budget", () => {
  test("worked borrow passes current but fails stressed floor", () => {
    const result = stress(fixture);
    expect(result.currentHealthFactorWad).toBe("2000000000000000000");
    expect(result.proposedHealthFactorWad).toBe("1600000000000000000");
    expect(result.stressedHealthFactorWad).toBe("1219047619047619047");
    expect(result.passesStressFloor).toBe(false);
    expect(result.additionalDebtBudgetBase).toBe("688644688");
  });
  test("budget remains within floor after conservative debt rounding", () => {
    for (let amount = 1; amount < 100; amount++) {
      const scenario = { ...fixture, collateralBase: String(amount), debtBase: "0", extraDebtBase: "0" };
      const budget = stress(scenario).additionalDebtBudgetBase;
      expect(stress({ ...scenario, extraDebtBase: budget }).passesStressFloor).toBe(true);
    }
  });
  test("no debt has no finite health factor", () => {
    expect(stress({ ...fixture, debtBase: "0", extraDebtBase: "0" }).stressedHealthFactorWad).toBeNull();
  });
  test("preserves precision above Number.MAX_SAFE_INTEGER", () => {
    const result = stress({ ...fixture, collateralBase: "100000000000000000000000000", debtBase: "40000000000000000000000000", extraDebtBase: "10000000000000000000000000" });
    expect(result.stressedHealthFactorWad).toBe("1219047619047619047");
  });
  test("rejects ambiguous decimals, signed integers and invalid factors", () => {
    for (const debtBase of ["1.1", "-1", "1e6", " 10", "01"]) expect(() => stress({ ...fixture, debtBase })).toThrow();
    expect(() => stress({ ...fixture, debtFactorBps: "0" })).toThrow();
    expect(() => stress({ ...fixture, liquidationThresholdBps: "10001" })).toThrow();
  });
  test("conservative rounding cannot improve health", () => {
    expect(stress({ ...fixture, collateralBase: "3", debtBase: "1", extraDebtBase: "0", liquidationThresholdBps: "5000", collateralFactorBps: "9000" }).passesStressFloor).toBe(false);
  });
  test("half a unit of collateral floors to health factor 1", () => {
    const result = stress({
      ...fixture,
      collateralBase: "3",
      debtBase: "1",
      extraDebtBase: "0",
      liquidationThresholdBps: "5000",
      collateralFactorBps: "10000",
      debtFactorBps: "10000",
      minimumHealthFactorWad: "1000000000000000000",
    });
    expect(result.currentHealthFactorWad).toBe("1000000000000000000");
    expect(result.passesStressFloor).toBe(true);
  });
  test("health factor 1 is the liquidation boundary", () => {
    const boundary = {
      ...fixture,
      extraDebtBase: "0",
      debtFactorBps: "10000",
      minimumHealthFactorWad: "1000000000000000000",
    };
    const solvent = stress({ ...boundary, collateralFactorBps: "5000" });
    expect(solvent.stressedHealthFactorWad).toBe("1000000000000000000");
    expect(solvent.passesStressFloor).toBe(true);
    expect(solvent.additionalDebtBudgetBase).toBe("0");
    const liquidatable = stress({ ...boundary, collateralFactorBps: "4999" });
    expect(liquidatable.stressedHealthFactorWad).toBe("999800000000000000");
    expect(liquidatable.passesStressFloor).toBe(false);
    expect(liquidatable.additionalDebtBudgetBase).toBe("0");
  });
  test("spending the additional debt budget still meets the floor", () => {
    const budget = stress(fixture).additionalDebtBudgetBase;
    expect(stress({ ...fixture, extraDebtBase: budget }).passesStressFloor).toBe(true);
  });
  test("zero collateral and zero debt has no finite health factor", () => {
    const result = stress({ ...fixture, collateralBase: "0", debtBase: "0", extraDebtBase: "0" });
    expect(result.currentHealthFactorWad).toBeNull();
    expect(result.stressedHealthFactorWad).toBeNull();
    expect(result.passesStressFloor).toBe(true);
    expect(result.additionalDebtBudgetBase).toBe("0");
  });
  test("zero liquidation threshold with debt fails the floor", () => {
    const result = stress({
      ...fixture,
      extraDebtBase: "0",
      liquidationThresholdBps: "0",
      collateralFactorBps: "10000",
      debtFactorBps: "10000",
      minimumHealthFactorWad: "1000000000000000000",
    });
    expect(result.currentHealthFactorWad).toBe("0");
    expect(result.passesStressFloor).toBe(false);
    expect(result.additionalDebtBudgetBase).toBe("0");
  });
});

describe("stress command", () => {
  const script = new URL("./stress.ts", import.meta.url).pathname;
  const run = (...args: string[]) => Bun.spawnSync([process.execPath, script, ...args]);
  test("help explains offline inputs without opening a file", () => {
    const result = run("--help");
    expect(result.exitCode).toBe(0);
    expect(result.stdout.toString()).toContain("scenario.json");
    expect(result.stdout.toString()).toContain("no network or wallet calls");
    expect(result.stderr.toString()).toBe("");
  });
  test("missing, unknown and extra arguments fail with usage", () => {
    for (const args of [[], ["--unknown"], ["one.json", "two.json"]]) {
      const result = run(...args);
      expect(result.exitCode).toBe(1);
      expect(result.stdout.toString()).toBe("");
      expect(result.stderr.toString()).toContain("Usage:");
      expect(result.stderr.toString()).not.toContain("ENOENT");
    }
  });
  test("malformed scenario JSON is not echoed", async () => {
    const directory = mkdtempSync(join(tmpdir(), "aave-stress-"));
    const file = join(directory, "scenario.json");
    await Bun.write(file, "sensitiveScenarioSecret");
    const result = run(file);
    expect(result.exitCode).toBe(1);
    const output = result.stdout.toString() + result.stderr.toString();
    expect(output).not.toContain("sensitive");
    expect(result.stderr.toString()).toContain("stress: invalid JSON input");
  });
  test("unreadable file reports one concise error", () => {
    const result = run("/missing/aave-scenario.json");
    expect(result.exitCode).toBe(1);
    expect(result.stderr.toString()).toStartWith("stress:");
    expect(result.stderr.toString()).not.toContain("at ");
  });
});
