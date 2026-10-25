// MIT, copyright Galleon Labs. Offline scenario arithmetic, not protocol simulation.
export interface Scenario {
  collateralBase: string;
  debtBase: string;
  extraDebtBase: string;
  liquidationThresholdBps: string;
  collateralFactorBps: string;
  debtFactorBps: string;
  minimumHealthFactorWad: string;
}
const BPS = 10_000n;
const WAD = 10n ** 18n;
function integer(value: unknown, key: string): bigint {
  if (typeof value !== "string" || !/^(0|[1-9][0-9]*)$/.test(value)) throw new Error(`${key} must be a nonnegative integer string`);
  return BigInt(value);
}
export function stress(input: Scenario) {
  if (!input || typeof input !== "object") throw new Error("scenario must be an object");
  const read = (key: keyof Scenario) => integer(input[key], key);
  const collateral = read("collateralBase");
  const debt = read("debtBase");
  const extra = read("extraDebtBase");
  const lt = read("liquidationThresholdBps");
  const collateralFactor = read("collateralFactorBps");
  const debtFactor = read("debtFactorBps");
  const floor = read("minimumHealthFactorWad");
  if (lt > BPS) throw new Error("liquidationThresholdBps cannot exceed 10000");
  if (debtFactor === 0n || floor < WAD) throw new Error("debtFactorBps must be positive and minimumHealthFactorWad at least 1e18");
  const weighted = collateral * lt / BPS;
  const stressedWeighted = weighted * collateralFactor / BPS;
  // Round debt up and collateral down so integer rounding does not improve health.
  const stressedDebt = ((debt + extra) * debtFactor + BPS - 1n) / BPS;
  const hf = (c: bigint, d: bigint) => d === 0n ? null : (c * WAD / d).toString();
  const maxStressedDebt = stressedWeighted * WAD / floor;
  const maxTotalDebt = maxStressedDebt * BPS / debtFactor;
  const additionalBudget = maxTotalDebt > debt ? maxTotalDebt - debt : 0n;
  return {
    currentHealthFactorWad: hf(weighted, debt),
    proposedHealthFactorWad: hf(weighted, debt + extra),
    stressedHealthFactorWad: hf(stressedWeighted, stressedDebt),
    passesStressFloor: stressedDebt === 0n || stressedWeighted * WAD >= stressedDebt * floor,
    additionalDebtBudgetBase: additionalBudget.toString(),
    note: "Offline common-base scenario only; excludes interest, per-reserve mode changes, liquidity and protocol permission. Null HF means zero debt.",
  };
}
const usage = "Usage: bun scripts/stress.ts <scenario.json>\nOffline common-base Aave stress arithmetic; no network or wallet calls.\n";
if (import.meta.main) {
  const args = process.argv.slice(2);
  if (args.length === 1 && (args[0] === "--help" || args[0] === "-h")) {
    process.stdout.write(usage);
  } else if (args.length !== 1 || args[0]!.startsWith("-")) {
    process.stderr.write(usage);
    process.exitCode = 1;
  } else {
    try {
      process.stdout.write(`${JSON.stringify(stress(await Bun.file(args[0]!).json()), null, 2)}\n`);
    } catch (error) {
      process.stderr.write(`stress: ${error instanceof Error ? error.message : String(error)}\n`);
      process.exitCode = 1;
    }
  }
}
