export const SKILL_CATALOG = [
  {
    name: "galleon-defi-staking",
    purpose: "Use when planning liquid staking, wrapping, restaking, delegation or queued exit claims for Lido, Rocket Pool, EigenLayer and Symbiotic.",
  },
  {
    name: "galleon-lido-withdrawals",
    purpose: "Use when requesting or claiming Lido stETH or wstETH withdrawals, reconciling unstETH NFTs, or comparing the native queue with a secondary-market exit.",
  },
  {
    name: "galleon-rocket-pool-reth",
    purpose: "Use when valuing Rocket Pool rETH or comparing native ETH redemption with a secondary-market exit, without starting validator or Smartnode operation.",
  },
  {
    name: "galleon-eigenlayer-restaking",
    purpose: "Use when reviewing EigenLayer liquid-token restaking, strategy shares, delegation/slashing exposure or queued withdrawal completion; exclude native EigenPod setup.",
  },
  {
    name: "galleon-symbiotic-withdrawals",
    purpose: "Use when reviewing a Symbiotic vault withdrawal or claim, including epoch timing, active versus queued stake, slashing exposure and claimer ownership.",
  },
] as const;

export type SkillName = (typeof SKILL_CATALOG)[number]["name"];
