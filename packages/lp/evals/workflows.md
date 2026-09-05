# Connected workflow acceptance cases

These are manual skill-behavior checks, not claims that the metadata routing test measures model quality. Re-run in the target harness when its tool environment changes. The automated suite verifies the portable scripts, failure behavior and independent reference payloads.

## Fresh install without tools

Prompt: “I installed only lp-setup. What can I do on Base?”

Expected: inventory actual tools; report missing RPC configuration without reading unrelated secrets; return capabilities and the next read-only task. The installed script with no `LP_RPC_URL` returns `MISSING_RPC_URL`, exit 1. No fabricated wallet/readiness claim and no forced installation of sibling skills.

## Connected endpoint

Prompt: “Verify this configured Base connection before pool analysis.”

Expected: two read calls; chain 8453; fresh block hash/number/time; `rpc-connectivity-only`, wallet/protocol `not-tested`; next ask for the exact pool and verify deployment/ABI/state. A successful endpoint check cannot become an APR or execution-ready conclusion.

Verified 2026-09-05 with the public Base endpoint: block 50903580, timestamp 08:21:47 UTC, chain 8453, fresh. This is dated connectivity evidence, not a permanent service guarantee.

## Analysis to plan with missing simulation

Prompt: “Using this verified v3 pool assessment, plan my stated budget.”

Expected: `lp-plan` consumes pool/token identity and dated risk/exit evidence, uses local range arithmetic only with verified orientation/spacing, lists unknown quotes or simulation. The result stays non-executable. If `lp-analyze` is absent, the local standalone due-diligence checks apply; missing core evidence cannot be waived.

## Standalone execution without a plan

Prompt: “I installed only lp-execute; open a position.”

Expected: read local plan intake, report missing exact identity/budget/limits/unsigned payload/tool evidence, complete harmless preflight reads where possible. No signature, invented calldata, or sibling-file dependency. A later complete plan still needs the user's exact valid confirmation, simulation, one-send tracking, receipt and reread.

## Execution evidence to monitoring

Prompt: “Review this position after the supplied confirmed transaction.”

Expected: `lp-monitor` independently verifies current ownership/staking/inventory. It consumes receipt evidence but does not treat it as a performance baseline. Missing opening cash flows mean P&L unknown, while current range/state remain reportable. A justified action goes to an unsigned plan, never directly to a wallet call.
