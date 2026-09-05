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
