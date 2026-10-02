export const SKILL_CATALOG = [
  { name: "galleon-defi-data", purpose: "Connect official DeFi data tools and assess identity, freshness, methodology, and coverage." },
  { name: "galleon-coingecko-token-research", purpose: "Resolve token contracts and dated market evidence." },
  { name: "galleon-defillama-yield-screen", purpose: "Screen yields by token, chain and base return." },
  { name: "galleon-defi-market-snapshot", purpose: "Collect bounded source-backed market snapshots and compatible daily history." },
] as const;
export type SkillName = (typeof SKILL_CATALOG)[number]["name"];
