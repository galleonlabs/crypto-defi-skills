export const SKILL_CATALOG = [
  {
    "name": "galleon-defi-payments",
    "purpose": "Plan payments, x402 requests and token streams"
  },
  { name: "galleon-sablier-streams", purpose: "Plan and reconcile Sablier Flow debt, Lockup vesting and current withdrawal/cancellation rights." },
  { name: "galleon-superfluid-streams", purpose: "Plan and reconcile Superfluid CFA flows, GDA pools, funding buffers and operator permissions." },
] as const;
export type SkillName = (typeof SKILL_CATALOG)[number]["name"];
