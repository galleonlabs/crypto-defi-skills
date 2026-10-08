export const SKILL_CATALOG = [
  {
    "name": "galleon-prediction-market-research",
    "purpose": "Research market identity, rules and bounded order-book depth"
  },
  {
    "name": "galleon-prediction-market-resolution",
    "purpose": "Reconcile oracle resolution, payout and wallet balance evidence"
  }
] as const;
export type SkillName = (typeof SKILL_CATALOG)[number]["name"];
