export const SKILL_CATALOG = [
  {
    name: "galleon-defi-tokenized-assets",
    purpose: "Use when researching tokenized Treasury or securities eligibility, custody, subscriptions, transfers and redemption settlement for Ondo and OpenEden.",
  },
] as const;

export type SkillName = (typeof SKILL_CATALOG)[number]["name"];
