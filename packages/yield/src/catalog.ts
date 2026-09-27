export const SKILL_CATALOG = [
  {
    name: "galleon-defi-yield",
    purpose: "Use when comparing savings and strategy vaults, planning deposits or exits, or evaluating principal/yield tokens and maturity across Pendle, Yearn, Spark, Morpho, Euler and Ethena.",
  },
  {
    name: "galleon-pendle-maturity",
    purpose: "Use when evaluating a Pendle PT or YT trade, comparing hold-to-maturity with an early exit, or redeeming a matured position.",
  },
  {
    name: "galleon-vault-exit",
    purpose: "Use when checking how much can leave an ERC4626 vault now, choosing withdraw versus redeem, or diagnosing preview, liquidity, fees and asynchronous exit constraints.",
  },
] as const;

export type SkillName = (typeof SKILL_CATALOG)[number]["name"];
