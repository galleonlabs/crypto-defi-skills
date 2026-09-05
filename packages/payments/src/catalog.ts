export const SKILL_CATALOG = [
  {
    "name": "galleon-defi-payments",
    "purpose": "Plan payments, x402 requests and token streams"
  }
] as const;
export type SkillName = (typeof SKILL_CATALOG)[number]["name"];
