export const SKILL_CATALOG = [
  {
    name: "galleon-defi-tokenized-assets",
    purpose: "Use when researching tokenized Treasury or securities eligibility, custody, subscriptions, transfers and redemption settlement for Ondo and OpenEden.",
  },
  {
    name: "galleon-ondo-assets",
    purpose: "Use when reviewing Ondo Stocks, OUSG or USDY access, quotes, token identity or redemption settlement; keep each product and jurisdiction separate.",
  },
  {
    name: "galleon-openeden-tbill",
    purpose: "Use when assessing OpenEden TBILL eligibility, subscriptions, whitelisted transfers or queued USDC redemption and fund settlement evidence.",
  },
] as const;

export type SkillName = (typeof SKILL_CATALOG)[number]["name"];
