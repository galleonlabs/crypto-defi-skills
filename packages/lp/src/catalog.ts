export const SKILL_CATALOG = [
  {
    name: "lp-setup",
    purpose: "Verify chain connectivity and connect the tools required for a first LP task.",
  },
  {
    name: "lp-analyze",
    purpose: "Compare pools, token risk, yield quality, and exits before deployment.",
  },
  {
    name: "lp-plan",
    purpose: "Turn a chosen pool and budget into an exact unsigned plan.",
  },
  {
    name: "lp-monitor",
    purpose: "Measure an existing position and decide whether action is justified.",
  },
  {
    name: "lp-execute",
    purpose: "Execute an explicitly requested LP action through a user-controlled wallet.",
  },
  {
    name: "lp-engineer",
    purpose: "Build and review protocol adapters, automation, and tests.",
  },
  { name: "uniswap-v3-liquidity", purpose: "Manage v3 NFT inventory, usable ticks, fee collection and range changes." },
  { name: "aerodrome-slipstream", purpose: "Resolve Slipstream gauge custody, emissions, staking and exits." },
  {"name": "curve-liquidity", "purpose": "Use when planning a Curve pool deposit or withdrawal, comparing single-coin and balanced exits, or reconciling LP-token and gauge custody."},
  {"name": "balancer-liquidity", "purpose": "Use when adding to or exiting a Balancer V2 or V3 pool, reviewing BPT minima, Permit2, boosted assets or hook-dependent liquidity."},
  {"name": "revert-position", "purpose": "Use when inspecting a Revert-indexed LP position or preparing a Revert unsigned liquidity action, including custody, quote digests and approval-phase rebuilds."},
  {"name": "vfat-sickle", "purpose": "Use when reviewing a VFAT farm or Sickle-held position, comparing harvest, compound and exit costs, or checking automation and strategy permissions."},
] as const;

export type SkillName = (typeof SKILL_CATALOG)[number]["name"];

export const RENAMED_SKILLS = {
  "lp-research": "lp-analyze",
  "lp-operate": "lp-execute",
} as const satisfies Record<string, SkillName>;

export type RenamedSkillName = keyof typeof RENAMED_SKILLS;

export function canonicalSkillName(name: string): string {
  return Object.hasOwn(RENAMED_SKILLS, name) ? RENAMED_SKILLS[name as RenamedSkillName] : name;
}
