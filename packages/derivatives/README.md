# Galleon DeFi Derivatives Skills

[![npm](https://img.shields.io/npm/v/galleon-defi-derivatives-skills?color=0f766e)](https://www.npmjs.com/package/galleon-defi-derivatives-skills)
[![MIT](https://img.shields.io/badge/license-MIT-0f766e)](LICENSE)

**Understand the position behind the trade.**

Review margin, collateral, funding and venue constraints across perpetuals and options, then track execution and the resulting exposure.

[Install one skill](#install-one-skill) · [Try a first task](#try-a-first-task) · [Sources](SOURCES.md) · [All packs](https://github.com/galleonlabs/crypto-defi-skills#independent-packs)

## Install one skill

```bash
npx skills add galleonlabs/crypto-defi-skills --skill galleon-defi-derivatives
```

Choose the receiving agent in the installer. Keep the skill's references and scripts with its `SKILL.md`. Each pack works on its own. For a complete native Hermes desk, use [Boomkin](https://github.com/galleonlabs/boomkin).

## Try a first task

> Use galleon-defi-derivatives to review [position] on [venue]. Show collateral, margin, funding or expiry exposure, liquidation assumptions and the evidence needed before changing it.

Expected result: the workflow's required evidence, explicit gaps and a concrete next step. Supply real task inputs in place of the bracketed placeholders. Provider access is configured in your agent; installation adds the procedures and local resources.

## Install

```bash
npx skills add galleonlabs/crypto-defi-skills --skill galleon-defi-derivatives
npx --package galleon-defi-derivatives-skills@0.1.5 defi-derivatives-skills catalog
```

Start with [the workflow](skills/galleon-defi-derivatives/SKILL.md), then load its provider references when needed. Installation adds guidance; it does not connect accounts or enable transaction signing. No other Galleon pack is required.

## Package interface

`defi-derivatives-skills` provides `catalog --json`, `show galleon-defi-derivatives`, `validate [path] --json`, and `--version`. It reads the packaged corpus and performs no network or wallet operations. The ESM export supplies `SKILL_CATALOG` and the skill document is available through `galleon-defi-derivatives-skills/skills/galleon-defi-derivatives`.

[Boomkin](https://github.com/galleonlabs/boomkin) provides Hermes onboarding and optional pack selection. [Sources](SOURCES.md) record provider provenance and verification limits.

## Contribute

Source-backed corrections and reproducible workflow improvements are welcome. See the [contributor guide](https://github.com/galleonlabs/crypto-defi-skills/blob/main/CONTRIBUTING.md). Maintainers run `bun run check` in the workspace and the clean consumer smoke before publication.

## License and credit

[MIT](LICENSE), copyright Galleon Labs. Preserve the copyright and permission notice in reused copies or substantial portions. [Attribution](ATTRIBUTION.md) includes an optional credit line naming Andrew Wilkinson and Galleon Labs.
