export const SKILL_CATALOG = [
  { name: "galleon-defi-strategy-backtest", purpose: "Test daily long-only strategies with next-bar decisions, costs, cash flows and a reproducible benchmark." },
] as const;
export type SkillName = (typeof SKILL_CATALOG)[number]["name"];
