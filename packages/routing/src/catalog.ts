export const SKILL_CATALOG = [
  { name: "galleon-defi-routing", purpose: "Compare swaps and bridges with official tools, prepare bounded transaction handoffs, and reconcile fills, partial outcomes and refunds." },
  { name: "uniswap-swap", purpose: "Quote Uniswap swaps, inspect Permit2 and reconcile AMM or order execution." },
  { name: "lifi-cross-chain", purpose: "Compare LI.FI quotes and reconcile destination delivery, partial fills and refunds." },
] as const;
export type SkillName = (typeof SKILL_CATALOG)[number]["name"];
