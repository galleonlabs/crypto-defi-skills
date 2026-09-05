export const SKILL_CATALOG = [
  { name: "galleon-defi-security", purpose: "Review DeFi transactions, signatures, approvals, simulations, and account authority before execution." },
] as const;
export type SkillName = (typeof SKILL_CATALOG)[number]["name"];
