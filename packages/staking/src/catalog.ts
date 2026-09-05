export const SKILL_CATALOG = [
  {
    name: "galleon-defi-staking",
    purpose: "Use when planning liquid staking, wrapping, restaking, delegation or queued exit claims for Lido, Rocket Pool, EigenLayer and Symbiotic.",
  },
] as const;

export type SkillName = (typeof SKILL_CATALOG)[number]["name"];
