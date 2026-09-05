# DeFi data pack

Own the read-only data workflow: official provider access, source identity, methodology and freshness. Wallet/RPC provisioning belongs to the infra pack; execution belongs to the relevant LP or trading workflow.

- Keep `galleon-defi-data` self-contained and independently installable. Its prefix avoids colliding with DefiLlama's upstream `defi-data` skill.
- Prefer official MCP/SDK/API access; do not copy provider runtimes or create a general adapter service.
- Check current primary sources before changing endpoints, auth, billing or tool names. Record dated verification in SOURCES.md; discovery does not prove all tools work.
- The public diagnostic uses fixed free endpoints, reads no credentials, follows no redirects and performs one bounded request. Preserve its redacted errors and timestamp checks.
- Run `bun run check` in this package, root checks/pack smoke, and `validate-agent-skills packages/data/skills` from the repository root. No network calls in automated tests.
- Release independently from a clean commit using the root RELEASING.md.
