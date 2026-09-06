export const SKILL_CATALOG = [
  { name: "galleon-defi-security", purpose: "Review DeFi transactions, signatures, approvals, simulations, and account authority before execution." },
  { name: "galleon-defi-security-token-diligence", purpose: "Investigate exact EVM token controls, launch flows, liquidity custody and exits; compare evidence between reviews." },
] as const;
export type SkillName = (typeof SKILL_CATALOG)[number]["name"];
