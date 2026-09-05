export const SKILL_CATALOG = [
  {
    name: "galleon-defi-lending",
    purpose: "Use when researching lending markets, planning supply, borrow, repay or withdrawals, or monitoring liquidation risk across Aave, Morpho, Compound, Euler and Spark.",
  },
] as const;

export type SkillName = (typeof SKILL_CATALOG)[number]["name"];
