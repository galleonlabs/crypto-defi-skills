# Galleon DeFi Yield Skills

[![npm](https://img.shields.io/npm/v/galleon-defi-yield-skills?color=0f766e)](https://www.npmjs.com/package/galleon-defi-yield-skills)
[![MIT](https://img.shields.io/badge/license-MIT-0f766e)](LICENSE)

**Understand what the yield pays and how you exit.**

Inspect vault share accounting, Pendle maturity terms, underlying assets and actual withdrawal constraints before comparing returns.

[Install one skill](#install-one-skill) · [Try a first task](#try-a-first-task) · [Sources](SOURCES.md) · [All packs](https://github.com/galleonlabs/crypto-defi-skills#independent-packs)

## Install one skill

```bash
npx skills add galleonlabs/crypto-defi-skills --skill galleon-vault-exit
```

Choose the receiving agent in the installer. Keep the skill's references and scripts with its `SKILL.md`. Each pack works on its own. For a complete native Hermes desk, use [Boomkin](https://github.com/galleonlabs/boomkin).

## Try a first task

> Use galleon-vault-exit to inspect [vault address] on [chain] for [owner]. Compare redeem previews with owner limits, liquidity, rounding and any asynchronous exit steps.

Expected result: the workflow's required evidence, explicit gaps and a concrete next step. Supply real task inputs in place of the bracketed placeholders. Provider access is configured in your agent; installation adds the procedures and local resources.

## Install

```bash
npx skills add galleonlabs/crypto-defi-skills --skill galleon-defi-yield
npx --package galleon-defi-yield-skills@0.2.1 defi-yield-skills catalog
```

Start with [the workflow](skills/galleon-defi-yield/SKILL.md), then load its provider references when needed. Installation adds guidance; it does not connect accounts or enable transaction signing. No other Galleon pack is required.

## External services

Pendle research reads the Pendle API (`api-v2.pendle.finance`), and vault checks use public RPC reads of the contracts you name. Nothing is sent to Galleon Labs; see the [privacy policy](https://github.com/galleonlabs/crypto-defi-skills/blob/main/PRIVACY.md).

## Package interface

`defi-yield-skills` provides `catalog --json`, `show galleon-defi-yield`, `validate [path] --json`, and `--version`. It reads the packaged corpus and performs no network or wallet operations. The ESM export supplies `SKILL_CATALOG` and the skill document is available through `galleon-defi-yield-skills/skills/galleon-defi-yield`.

[Boomkin](https://github.com/galleonlabs/boomkin) provides Hermes onboarding and optional pack selection. [Sources](SOURCES.md) record provider provenance and verification limits.

## Contribute

Source-backed corrections and reproducible workflow improvements are welcome. See the [contributor guide](https://github.com/galleonlabs/crypto-defi-skills/blob/main/CONTRIBUTING.md). Maintainers run `bun run check` in the workspace and the clean consumer smoke before publication.

## License and credit

[MIT](LICENSE), copyright Galleon Labs. Preserve the copyright and permission notice in reused copies or substantial portions. [Attribution](ATTRIBUTION.md) includes an optional credit line naming Andrew Wilkinson and Galleon Labs.

## Protocol tasks

- [galleon-pendle-maturity](skills/galleon-pendle-maturity/SKILL.md)
- [galleon-vault-exit](skills/galleon-vault-exit/SKILL.md)

Each procedure includes concrete read calls, protocol-specific failure branches, a synthetic worked decision and dated official sources. No signer or all-packs dependency is included. Behavioral fixtures are review rubrics, not evidence of executed transactions.
