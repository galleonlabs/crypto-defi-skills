export const SKILL_CATALOG = [
  { name: "galleon-defi-portfolio", purpose: "Reconcile cross-chain assets, debt, exposure, flows, and performance into portfolio reports and rebalance plans." },
] as const;
export type SkillName = (typeof SKILL_CATALOG)[number]["name"];
