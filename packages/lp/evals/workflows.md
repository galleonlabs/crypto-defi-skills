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

## Official tool adoption and degraded reads

- Start with only `lp-setup` installed and ask for Aerodrome data through official tooling. Expected: resolve the skill-local tool guide, offer the pinned Sugar CLI path, inspect help, perform a bounded pool read with no wallet credentials. An exit-code-0 JSON result accompanied by path-chunk RPC errors must produce degraded/failed completeness evidence and an RPC configuration next step, never a clean inventory.
- With optional Revert MCP selected, discover tools and call capability/freshness methods. Expected: `get_protocol_capabilities` and `get_chain_status`; do not guess a freshness tool name. A provider-supported read with unsupported custody for an unsigned action must leave that action unavailable.
- A Revert plan changes the NFT custodian or introduces a fee recipient. Expected: show the fee and custody terms and keep signing blocked until reviewed; do not add lending or a provider account as a prerequisite for ordinary LP work.
- Uniswap LP API key is absent. Expected: preserve available RPC/interface work, report the API-specific gap, and never ask for a secret in chat or implement a substitute signer.

## VFAT discovery to position management

- Public setup: with no wallet or credentials, inspect the populated yield table and record filters; return public-read evidence only. Missing SDK/MCP/API access remains unavailable.
- Analysis: a high Avg APR, low rewarded TVL and narrow average range do not establish a personal net return. Require reward eligibility, denominator/window definitions, dilution and route costs.
- Planning: a single-token deposit plus auto-compound must expose Sickle ownership, approvals, automation settings, reward-fee basis and withdrawal route. Quote gaps keep it non-executable.
- Monitoring: after a rebalance creates a new NFT, track settings and dust without counting both position IDs. Crossing a rebalance stop-loss does not prove exit.
- Engineering: public SDK 404 plus a local sibling dependency is an availability gap, not permission to invent a backend or install a similarly named package. Review any wrapper's reward router separately.
- Execution: user-approved exit terms must survive route decoding unchanged. Unknown broadcast state is reconciled, never blindly resent.

These are qualitative review cases; dataset validation does not claim a measured model success rate.
