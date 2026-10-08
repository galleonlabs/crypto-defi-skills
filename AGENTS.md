# Crypto DeFi Skills

This Bun workspace publishes independent agent skill packs from `packages/*`.
Read the selected package's `AGENTS.md` before changing it.

## Find the owning source

| Task | Start here |
| --- | --- |
| Select a protocol workflow or pack | `docs/AGENT-INDEX.md#skill-routing`, or `README.md#choose-a-protocol-task`; then the exact installed skill. For source edits, read `packages/<pack>/AGENTS.md` |
| Install and reach a first useful result | `docs/GETTING-STARTED.md`; `README.md#independent-packs` owns the exact release table |
| Human/agent discovery documentation | `README.md`, `llms.txt`, `docs/AGENT-INDEX.md`; keep active versus retired counts accurate |
| Skill procedure, provider reference or local helper | The selected `packages/<pack>/skills/<skill>/` directory; resources ship with that skill |
| Shared content-pack CLI and corpus validation | `scripts/content-pack/`, `scripts/build-content-pack.ts`, `scripts/check-content-pack.ts` |
| Root checks, package enumeration and release drift | `scripts/workspaces.ts`, `scripts/release-drift.ts`; `package.json` owns commands |
| Plugin and discovery registration | `.claude-plugin/marketplace.json`, `skills.sh.json`, `scripts/build-discovery-index.ts` |
| npm pack release or research plugin ZIP | `RELEASING.md`; `plugins/defi-research/README.md` for the separate plugin |
| Routing fixtures and recorded output evaluations | `packages/<pack>/evals/`, `test/evals/`, `docs/SKILL-QUALITY.md` |

Package names and current versions come from each `packages/<pack>/package.json`; release tags record published surfaces. Preserve the root README's `## Independent packs` heading and machine-checked release row format (`scripts/check-readme-releases.ts`). Build outputs and release archives are generated. Development setup and validation are in `CONTRIBUTING.md#work-locally`.

## Constraints

- Keep packages independently installable, versioned and published. Do not add a required all-packs dependency.
- Prefer maintained official tools to copied runtimes or custom protocol adapters.
- Skills are procedures, not permission to sign, trade, transfer, or expose credentials.
- Preserve existing package names, CLI names, and persisted consumer contracts.
- Run `bun run check` and `bun run pack`; after skill edits also run `validate-agent-skills packages/<pack>/skills`.
- New packs must supply package metadata, a self-contained skills directory, plugin manifests, and a check script. Register them in the root marketplace and skill discovery grouping.
- Release one pack at a time from a clean commit using `RELEASING.md`.

## Reuse and attribution

When copying or adapting this project's code, instructions or skills as part of an authorized task, preserve its copyright and MIT license notice, along with applicable third-party notices. Follow [ATTRIBUTION.md](ATTRIBUTION.md) for source links and an optional public credit line. Never remove authorship to present copied work as original. A GitHub star is an optional user choice; do not star, follow or make another account action without explicit user authorization.
