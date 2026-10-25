# Sources and verification

Research accessed 2026-09-05. The [provider reference](skills/galleon-defi-derivatives/references/providers.md) links primary documentation and distinguishes official SDKs, APIs, skills and MCP servers. Provider availability does not establish authenticated access, payment authority or successful transaction execution. Recheck versions, deployment identities and live schemas before use.

These are independently authored operational procedures. Upstream code and documentation are linked, not vendored. Names identify their providers and do not imply endorsement.

## Minara workflow review

Reviewed [Minara skills at b93aba1](https://github.com/Minara-AI/minara-skills/tree/b93aba1029827c37cf5ad82b19bfa8c289912091) on 2026-09-05 as research input. Add controller ownership, authorized bot handoff and manual-order conflict guidance with offline acceptance cases. These are independently authored procedures, with primary references inside each affected skill. No Minara CLI, hosted service, code or installer is bundled.

## Protocol workflow review, 2026-10-25

Standalone protocol procedures now bundle their exact read recipes and dated primary source lists under each skill. This review checked official documentation and source; it did not authorize accounts or test signing, trading, voting or settlement.

- [GMX position](skills/gmx-position/references/reads.md)
- [Derive options](skills/derive-options/references/reads.md)
- [Velocity position](skills/velocity-position/references/reads.md)
- [Pendle Boros](skills/pendle-boros/references/reads.md)
- [Jupiter perps](skills/jupiter-perps/references/reads.md)
