export const SKILL_CATALOG = [
  { name: "galleon-defi-strategy-backtest", purpose: "Test frozen daily spot rules across chronological periods and higher costs with next-observation decisions, cash flows and a reproducible benchmark." },
] as const;
export type SkillName = (typeof SKILL_CATALOG)[number]["name"];
