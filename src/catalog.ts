export const SKILL_CATALOG = [
  {
    name: "hyperliquid-research",
    purpose: "Assess markets, funding, liquidity, catalysts, and strategy evidence.",
  },
  {
    name: "hyperliquid-plan",
    purpose: "Turn one intent and risk budget into an exact unsigned ticket.",
  },
  {
    name: "hyperliquid-monitor",
    purpose: "Reconcile account, position, order, fill, funding, and feed state.",
  },
  {
    name: "hyperliquid-operate",
    purpose: "Execute one explicitly approved trading action and reconcile it.",
  },
  {
    name: "hyperliquid-review",
    purpose: "Journal activity and grade costs, outcomes, controls, and incidents.",
  },
  {
    name: "hyperliquid-engineer",
    purpose: "Build and review API, signing, data, and automation integrations.",
  },
] as const;

export type SkillName = (typeof SKILL_CATALOG)[number]["name"];
