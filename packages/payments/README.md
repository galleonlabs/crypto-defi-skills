# Galleon DeFi Payments Skills

[![npm](https://img.shields.io/npm/v/galleon-defi-payments-skills)](https://www.npmjs.com/package/galleon-defi-payments-skills)
[![MIT](https://img.shields.io/badge/license-MIT-0f766e)](LICENSE)

Plan stablecoin payments, x402 purchases and token streams. One portable skill, independently installable in Hermes, Codex, Claude Code and other Agent Skills clients.

## Install

```bash
npx skills add galleonlabs/crypto-defi-skills --skill galleon-defi-payments
npx --package galleon-defi-payments-skills@0.1.0 defi-payments-skills catalog
```

Start with [the workflow](skills/galleon-defi-payments/SKILL.md), then load its provider references when needed. Installation adds guidance; it does not connect accounts or enable transaction signing. No other Galleon pack is required.

## Package interface

`defi-payments-skills` provides `catalog --json`, `show galleon-defi-payments`, `validate [path] --json`, and `--version`. It reads the packaged corpus and performs no network or wallet operations. The ESM export supplies `SKILL_CATALOG` and the skill document is available through `galleon-defi-payments-skills/skills/galleon-defi-payments`.

[Boomkin](https://github.com/galleonlabs/boomkin) provides Hermes onboarding and optional pack selection. [Sources](SOURCES.md) record provider provenance and verification limits.

## Contribute

Source-backed corrections and reproducible workflow improvements are welcome. See the [contributor guide](https://github.com/galleonlabs/crypto-defi-skills/blob/main/CONTRIBUTING.md). Maintainers run `bun run check` in the workspace and the clean consumer smoke before publication.

## License and credit

[MIT](LICENSE), copyright Galleon Labs. Preserve the copyright and permission notice in reused copies or substantial portions. [Attribution](ATTRIBUTION.md) includes an optional credit line naming Andrew Wilkinson and Galleon Labs.
