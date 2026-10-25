# Sources and verification

Research accessed 2026-09-05. The [provider reference](skills/galleon-defi-staking/references/providers.md) links primary documentation and distinguishes official SDKs, APIs, skills and MCP servers. Provider availability does not establish authenticated access, payment authority or successful transaction execution. Recheck versions, deployment identities and live schemas before use.

These are independently authored operational procedures. Upstream code and documentation are linked, not vendored. Names identify their providers and do not imply endorsement.

## Protocol task expansion, checked 2026-09-27

- `galleon-lido-withdrawals`: source URLs, read recipes and synthetic evidence in `skills/galleon-lido-withdrawals/references/recipe.md`.

Docs were researched; no real lending, redemption or staking transactions were executed. Deployment addresses, risk parameters, live balances and API versions must be read at use time.

## Standalone protocol workflows, reviewed 2026-10-25

- [Rocket Pool rETH entry and exit](skills/galleon-rocket-pool-reth/references/sources.md): official interface sources and verification limits.
- [EigenLayer LST restaking and withdrawal](skills/galleon-eigenlayer-restaking/references/sources.md): official interface sources and verification limits.
- [Symbiotic vault withdrawals](skills/galleon-symbiotic-withdrawals/references/sources.md): official interface sources and verification limits.

Every linked directory contains an operational SKILL.md, not only source links. Documentation and synthetic decisions were checked; no wallet action or live simulation was performed.
