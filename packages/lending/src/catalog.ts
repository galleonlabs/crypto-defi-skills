export const SKILL_CATALOG = [
  {
    name: "galleon-defi-lending",
    purpose: "Use when researching lending markets, planning supply, borrow, repay or withdrawals, or monitoring liquidation risk across Aave, Morpho, Compound, Euler and Spark.",
  },
  {
    name: "galleon-aave-position",
    purpose: "Use when checking an Aave V3 health factor, sizing a borrow, or planning a repay and collateral withdrawal; use for eMode and isolation constraints, not Aave V4.",
  },
  {
    name: "galleon-morpho-market",
    purpose: "Use when evaluating a specific Morpho Blue market or Morpho vault allocation, oracle, LLTV, borrow liquidity or exit risk.",
  },
  {
    name: "galleon-compound-borrow",
    purpose: "Use when planning a Compound III Comet base-asset borrow, repayment or collateral withdrawal and checking baseBorrowMin and collateral factors.",
  },
  { name: "galleon-aave-v4", purpose: "Inspect Aave V4 Hub/Spoke positions, preview exact actions, and reconcile unsigned execution plans." },
  {
    name: "galleon-euler-lending",
    purpose: "Use when inspecting an Euler V2 EVK borrow, repay or collateral withdrawal, including EVC subaccounts, collateral enablement and controller risk.",
  },
  {
    name: "galleon-sparklend-position",
    purpose: "Use when reviewing a SparkLend Pool supply, borrow, repay or collateral withdrawal; distinguish Spark Isolated Markets and savings vaults.",
  },
  {
    name: "galleon-kamino-lending",
    purpose: "Use when inspecting a Kamino Borrow obligation on Solana, its market, reserve liquidity, borrow factors, elevation group and post-action risk.",
  },
  {
    name: "galleon-save-lending",
    purpose: "Use when reviewing a Save (formerly Solend) lending market, reserve or obligation, including WAD debt, collateral exchange rates and split transactions.",
  },
] as const;

export type SkillName = (typeof SKILL_CATALOG)[number]["name"];
