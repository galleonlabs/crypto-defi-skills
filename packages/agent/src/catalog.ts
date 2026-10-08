export const SKILL_CATALOG = [
  {
    "name": "galleon-defi-agent-plan",
    "purpose": "Build bounded unsigned plans with official tools and deployment-specific parameters."
  },
  {
    "name": "galleon-defi-agent-simulate",
    "purpose": "Verify exact stateful preflight, fork experiments and transaction replay evidence."
  }
] as const;
export type SkillName = (typeof SKILL_CATALOG)[number]["name"];
