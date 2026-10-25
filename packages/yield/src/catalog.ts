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
    purpose: "Use when checking how much can leave an ERC4626 vault, reconciling pending and claimable ERC7540 redemptions, or choosing withdraw versus redeem under liquidity and fee constraints.",
  },
  {
    name: "galleon-yearn-vault",
    purpose: "Use when reviewing a Yearn V2 or V3 vault, strategy allocation, share value, withdrawal queue or explicit loss tolerance before an entry or exit.",
  },
  {
    name: "galleon-spark-savings",
    purpose: "Use when reviewing sUSDS or Spark Savings Vaults V2 shares, idle liquidity, PSM conversion or request-based large exits; exclude SparkLend borrowing.",
  },
  {
    name: "galleon-euler-earn",
    purpose: "Use when evaluating an EulerEarn strategy vault, curator allocation, fees, share position or withdrawal queue; distinguish direct EVK borrowing vaults.",
  },
  {
    name: "galleon-ethena-susde",
    purpose: "Use when reviewing Ethena sUSDe share value, USDe unstaking cooldown, silo claim or restrictions; distinguish issuer mint/redeem and campaign locks.",
  },
] as const;

export type SkillName = (typeof SKILL_CATALOG)[number]["name"];
