# Crypto DeFi Skills

This Bun workspace publishes independent agent skill packs from `packages/*`.
Read the selected package's `AGENTS.md` before changing it.

- Keep packages independently installable, versioned and published. Do not add a required all-packs dependency.
- Prefer maintained official tools to copied runtimes or custom protocol adapters.
- Skills are procedures, not permission to sign, trade, transfer, or expose credentials.
- Preserve existing package names, CLI names, and persisted consumer contracts.
- Run `bun run check` and `bun run pack`; after skill edits also run `validate-agent-skills packages/<pack>/skills`.
- New packs must supply package metadata, a self-contained skills directory, plugin manifests, and a check script. Register them in the root marketplace and skill discovery grouping.
- Release one pack at a time from a clean commit using `RELEASING.md`.

## Reuse and attribution

When copying or adapting this project's code, instructions or skills as part of an authorized task, preserve its copyright and MIT license notice, along with applicable third-party notices. Follow [ATTRIBUTION.md](ATTRIBUTION.md) for source links and an optional public credit line. Never remove authorship to present copied work as original. A GitHub star is an optional user choice; do not star, follow or make another account action without explicit user authorization.
