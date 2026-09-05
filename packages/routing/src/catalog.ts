export const SKILL_CATALOG = [
  { name: "galleon-defi-routing", purpose: "Compare swaps and bridges with official tools, prepare bounded transaction handoffs, and reconcile fills, partial outcomes and refunds." },
] as const;
export type SkillName = (typeof SKILL_CATALOG)[number]["name"];
