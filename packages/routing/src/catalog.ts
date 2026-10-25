export const SKILL_CATALOG = [
  { name: "galleon-defi-routing", purpose: "Compare swaps and bridges with official tools, prepare bounded transaction handoffs, and reconcile fills, partial outcomes and refunds." },
  { name: "uniswap-swap", purpose: "Quote Uniswap swaps, inspect Permit2 and reconcile AMM or order execution." },
  { name: "lifi-cross-chain", purpose: "Compare LI.FI quotes and reconcile destination delivery, partial fills and refunds." },
  {"name": "zerox-swap", "purpose": "Use when quoting a 0x API v2 swap or inspecting AllowanceHolder, Permit2, issues and minimum-output evidence before an unsigned handoff."},
  {"name": "oneinch-swap", "purpose": "Use when quoting a 1inch Classic Swap v6.1 or distinguishing direct calldata, Fusion intents and protected API access."},
  {"name": "cow-order", "purpose": "Use when comparing a CoW Protocol quote, reviewing a signed-intent boundary, or reconciling order UID, partial fills, expiry and cancellation."},
  {"name": "jupiter-swap", "purpose": "Use when quoting Jupiter Swap v2 on Solana, inspecting immutable order transactions, or reconciling managed execution and token-account deltas."},
  {"name": "relay-bridge", "purpose": "Use when preparing a Relay quote or tracking a cross-chain request through source confirmation, destination execution, delay or refund."},
  {"name": "across-bridge", "purpose": "Use when comparing Across Swap API routes, inspecting exactInput versus minOutput, or reconciling deposit fills, embedded actions and refunds."},
  {"name": "circle-cctp", "purpose": "Use when tracking a Circle CCTP USDC burn, attestation and destination mint, including domain IDs, finality and failed-mint recovery."},
] as const;
export type SkillName = (typeof SKILL_CATALOG)[number]["name"];
