export const SKILL_CATALOG = [
  {
    name: "galleon-defi-staking",
    purpose: "Use when planning liquid staking, wrapping, restaking, delegation or queued exit claims for Lido, Rocket Pool, EigenLayer and Symbiotic.",
  },
  {
    name: "galleon-lido-withdrawals",
    purpose: "Use when requesting or claiming Lido stETH or wstETH withdrawals, reconciling unstETH NFTs, or comparing the native queue with a secondary-market exit.",
  },
] as const;

export type SkillName = (typeof SKILL_CATALOG)[number]["name"];
