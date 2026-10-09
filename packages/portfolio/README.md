# Galleon DeFi Portfolio Skills

[![npm](https://img.shields.io/npm/v/galleon-defi-portfolio-skills?color=0f766e)](https://www.npmjs.com/package/galleon-defi-portfolio-skills)
[![MIT](https://img.shields.io/badge/license-MIT-0f766e)](LICENSE)

**See assets, debt and queued exits together.**

Reconcile wallet positions, liabilities, cash flows and performance while keeping unpriced assets and incomplete coverage visible.

[Install one skill](#install-one-skill) · [Try a first task](#try-a-first-task) · [Sources](SOURCES.md) · [All packs](https://github.com/galleonlabs/crypto-defi-skills#independent-packs)

## Install one skill

```bash
npx skills add galleonlabs/crypto-defi-skills --skill galleon-defi-portfolio
```

Choose the receiving agent in the installer. Keep the skill's references and scripts with its `SKILL.md`. Each pack works on its own. For a complete native Hermes desk, use [Boomkin](https://github.com/galleonlabs/boomkin).

## Try a first task

> Use galleon-defi-portfolio to reconcile the DeFi positions for [wallet] on [chains]. Separate assets, debt, queued withdrawals and assets without reliable prices. Show source times and coverage gaps.

Expected result: the workflow's required evidence, explicit gaps and a concrete next step. Supply real task inputs in place of the bracketed placeholders. Provider access is configured in your agent; installation adds the procedures and local resources.

## Install

```bash
npx skills add galleonlabs/crypto-defi-skills --skill galleon-defi-portfolio
npx --package galleon-defi-portfolio-skills@0.2.1 defi-portfolio-skills catalog
```

Start with [the workflow](skills/galleon-defi-portfolio/SKILL.md), then load its provider references when needed. Installation adds guidance; it does not connect accounts or enable transaction signing. No other Galleon pack is required.

## External services

Portfolio reads go directly from your agent to the services you choose: the Zerion API (`api.zerion.io`) and DeBank Pro API (`pro-openapi.debank.com`) with your own keys, plus public RPC endpoints and explorers. Nothing is sent to Galleon Labs; see the [privacy policy](https://github.com/galleonlabs/crypto-defi-skills/blob/main/PRIVACY.md).

## Package interface

`defi-portfolio-skills` provides `catalog --json`, `show galleon-defi-portfolio`, `validate [path] --json`, and `--version`. It reads the packaged corpus and performs no network or wallet operations. The ESM export supplies `SKILL_CATALOG` and the skill document is available through `galleon-defi-portfolio-skills/skills/galleon-defi-portfolio`.

[Boomkin](https://github.com/galleonlabs/boomkin) provides Hermes onboarding and optional pack selection. [Sources](SOURCES.md) record provider provenance and verification limits.

## Contribute

Source-backed corrections and reproducible workflow improvements are welcome. See the [contributor guide](https://github.com/galleonlabs/crypto-defi-skills/blob/main/CONTRIBUTING.md). Maintainers run `bun run check` in the workspace and the clean consumer smoke before publication.

## License and credit

[MIT](LICENSE), copyright Galleon Labs. Preserve the copyright and permission notice in reused copies or substantial portions. [Attribution](ATTRIBUTION.md) includes an optional credit line naming Andrew Wilkinson and Galleon Labs.
