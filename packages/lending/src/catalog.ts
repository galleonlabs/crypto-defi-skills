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
] as const;

export type SkillName = (typeof SKILL_CATALOG)[number]["name"];
