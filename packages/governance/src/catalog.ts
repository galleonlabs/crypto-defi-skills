export const SKILL_CATALOG = [
  {
    "name": "galleon-defi-governance",
    "purpose": "Research proposals, voting and treasury execution"
  },
  {"name": "snapshot-proposal", "purpose": "Use when researching Snapshot or Snapshot X proposal terms, voting eligibility and tally evidence without granting an alias or casting a vote."},
  {"name": "governor-proposal", "purpose": "Use when reviewing an OpenZeppelin Governor or Cactus-listed proposal, checking clock, quorum, Timelock and exact calldata through execution."},
  {"name": "safe-transaction", "purpose": "Use when reviewing a Safe multisig transaction, threshold and nonce, decoding batched calls, or reconciling proposal, confirmations and onchain execution."},
] as const;
export type SkillName = (typeof SKILL_CATALOG)[number]["name"];
