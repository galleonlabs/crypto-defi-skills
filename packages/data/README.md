# Galleon DeFi Data Skills

[![CI](https://github.com/galleonlabs/crypto-defi-skills/actions/workflows/ci.yml/badge.svg)](https://github.com/galleonlabs/crypto-defi-skills/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/galleon-defi-data-skills)](https://www.npmjs.com/package/galleon-defi-data-skills)
[![MIT](https://img.shields.io/badge/license-MIT-0f766e)](LICENSE)

One portable skill for connecting official market and DeFi data tools and turning their responses into evidence with known identity, age, units and coverage. It complements the LP, Hyperliquid and infra packs without requiring them.

## Install

```bash
npx skills add galleonlabs/crypto-defi-skills --skill galleon-defi-data
npx --package galleon-defi-data-skills@0.2.0 defi-data-skills catalog
```

The `galleon-defi-data` name avoids colliding with DefiLlama's own `defi-data` skill. Do not overwrite upstream skills when adding its optional research workflows. This pack does not install or authenticate MCP servers just by being installed.

## What it provides

- CoinGecko public keyless MCP, optional account-backed MCP or official local SDK/MCP guidance.
- DefiLlama public APIs and optional subscription-backed OAuth MCP guidance; these are different access tiers.
- AIXBT native MCP and API v3 access, crypto discovery, timestamp semantics and source corroboration.
- Yield decomposition, collateral/oracle and exit diligence, with canonical-block evidence checks.
- Hermes-native configuration and discovery checks, with explicit credential, credit and provider coverage boundaries.
- Research discipline for token identity, TVL, prices, APY, fees, missing data and chain reconciliation.
- One public price diagnostic that checks response shape and age while emitting provider provenance.

Read [the skill](skills/galleon-defi-data/SKILL.md) or its [provider setup](skills/galleon-defi-data/references/providers.md), [AIXBT research](skills/galleon-defi-data/references/aixbt.md), [product diligence](skills/galleon-defi-data/references/diligence.md), [methodology](skills/galleon-defi-data/references/methodology.md), and [diagnostic](skills/galleon-defi-data/references/diagnostic.md) references.

## Verify public data

```bash
npx --package galleon-defi-data-skills@0.2.0 defi-data-skills price-check --provider coingecko --id bitcoin
npx --package galleon-defi-data-skills@0.2.0 defi-data-skills price-check --provider defillama --id bitcoin
```

Node 20+; one keyless public GET per invocation, no environment credentials, no redirects, a 10-second deadline and a 64 KiB response limit. A failed or stale response exits nonzero without exposing provider error bodies. This is a connectivity/freshness check, not an executable quote or production price oracle. The DefiLlama route uses its CoinGecko-ID namespace, so agreement is not necessarily independent corroboration.

## Package interface

`defi-data-skills` supports `--version`, `catalog --json`, `show galleon-defi-data`, `validate [path] --json`, and `price-check`. The ESM export supplies `SKILL_CATALOG`; `galleon-defi-data-skills/skills/galleon-defi-data` resolves the skill document. The npm package, Claude plugin and Codex plugin contain the same standalone corpus.

[Boomkin](https://github.com/galleonlabs/boomkin) consumes this pack as part of its Hermes DeFi onboarding. [Sources and verification limits](SOURCES.md) distinguish documented integrations from live checks. Maintainers run `bun run check` and the root pack/install smoke before release.

## Contributing

Documentation fixes, reproducible connection failures and source-backed workflow improvements are welcome. Follow the [contributor guide](https://github.com/galleonlabs/crypto-defi-skills/blob/main/CONTRIBUTING.md) for local checks and pull requests. Keep diagnostics read-only and each skill independently installable.

Report security issues through [private vulnerability reporting](https://github.com/galleonlabs/crypto-defi-skills/security/advisories/new).

## License

[MIT](LICENSE). See [SOURCES.md](SOURCES.md) for provenance and dated verification.
