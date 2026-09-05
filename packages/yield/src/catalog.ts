export const SKILL_CATALOG = [
  {
    name: "galleon-defi-yield",
    purpose: "Use when comparing savings and strategy vaults, planning deposits or exits, or evaluating principal/yield tokens and maturity across Pendle, Yearn, Spark, Morpho, Euler and Ethena.",
  },
] as const;

export type SkillName = (typeof SKILL_CATALOG)[number]["name"];
