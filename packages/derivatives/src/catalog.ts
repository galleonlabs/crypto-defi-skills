export const SKILL_CATALOG = [
  { name: "galleon-defi-derivatives", purpose: "Assess perpetuals, options and funding-rate derivatives using official tools, bounded risk plans and venue-specific settlement evidence." },
] as const;
export type SkillName = (typeof SKILL_CATALOG)[number]["name"];
