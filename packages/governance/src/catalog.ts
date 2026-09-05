export const SKILL_CATALOG = [
  {
    "name": "galleon-defi-governance",
    "purpose": "Research proposals, voting and treasury execution"
  }
] as const;
export type SkillName = (typeof SKILL_CATALOG)[number]["name"];
