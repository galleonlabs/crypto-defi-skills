export const SKILL_CATALOG = [
  { name: "galleon-defi-derivatives", purpose: "Assess perpetuals, options and funding-rate derivatives using official tools, bounded risk plans and venue-specific settlement evidence." },
  {"name": "gmx-position", "purpose": "Use when reviewing a GMX perpetual position or order through SDK v2, including market capacity, fees, keeper execution and request-id reconciliation."},
  {"name": "derive-options", "purpose": "Use when reviewing Derive v3 option instruments, premium and margin scenarios, or reconciling subaccount orders, fills and session scope."},
  {"name": "velocity-position", "purpose": "Use when inspecting Velocity Exchange Solana positions and margin or distinguishing paused legacy Drift accounts from the new Velocity deployment."},
  {"name": "pendle-boros", "purpose": "Use when reviewing Boros funding-rate derivatives, implied versus realized rates, margin and delegated-agent scope before any trading action."},
  {"name": "jupiter-perps", "purpose": "Use when inspecting Jupiter Perpetuals position and PositionRequest accounts, borrowing fees, triggers or pending close evidence on Solana."},
] as const;
export type SkillName = (typeof SKILL_CATALOG)[number]["name"];
