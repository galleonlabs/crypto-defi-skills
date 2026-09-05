export const SKILL_CATALOG = [
  { name: "galleon-defi-data", purpose: "Connect official DeFi data tools and assess identity, freshness, methodology, and coverage." },
] as const;
export type SkillName = (typeof SKILL_CATALOG)[number]["name"];
