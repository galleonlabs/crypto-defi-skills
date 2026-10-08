# Galleon DeFi Tokenized Assets Skills

[![npm](https://img.shields.io/npm/v/galleon-defi-tokenized-assets-skills?color=0f766e)](https://www.npmjs.com/package/galleon-defi-tokenized-assets-skills)
[![MIT](https://img.shields.io/badge/license-MIT-0f766e)](LICENSE)

**Understand the claim behind the token.**

Research tokenized assets with issuer evidence, investor eligibility, transfer restrictions and redemption or settlement requirements.

[Install one skill](#install-one-skill) · [Try a first task](#try-a-first-task) · [Sources](SOURCES.md) · [All packs](https://github.com/galleonlabs/crypto-defi-skills#independent-packs)

## Install one skill

```bash
npx skills add galleonlabs/crypto-defi-skills --skill galleon-defi-tokenized-assets
```

Choose the receiving agent in the installer. Keep the skill's references and scripts with its `SKILL.md`. Each pack works on its own. For a complete native Hermes desk, use [Boomkin](https://github.com/galleonlabs/boomkin).

## Try a first task

> Use galleon-defi-tokenized-assets to review [tokenized asset]. Explain the issuer, legal claim, eligibility, transfer restrictions, redemption terms and the sources or checks still missing.

Expected result: the workflow's required evidence, explicit gaps and a concrete next step. Supply real task inputs in place of the bracketed placeholders. Provider access is configured in your agent; installation adds the procedures and local resources.

## Install

```bash
npx skills add galleonlabs/crypto-defi-skills --skill galleon-defi-tokenized-assets
npx --package galleon-defi-tokenized-assets-skills@0.1.3 defi-tokenized-assets-skills catalog
```

Start with [the workflow](skills/galleon-defi-tokenized-assets/SKILL.md), then load its provider references when needed. Installation adds guidance; it does not connect accounts or enable transaction signing. No other Galleon pack is required.

## Package interface

`defi-tokenized-assets-skills` provides `catalog --json`, `show galleon-defi-tokenized-assets`, `validate [path] --json`, and `--version`. It reads the packaged corpus and performs no network or wallet operations. The ESM export supplies `SKILL_CATALOG` and the skill document is available through `galleon-defi-tokenized-assets-skills/skills/galleon-defi-tokenized-assets`.

[Boomkin](https://github.com/galleonlabs/boomkin) provides Hermes onboarding and optional pack selection. [Sources](SOURCES.md) record provider provenance and verification limits.

## Contribute

Source-backed corrections and reproducible workflow improvements are welcome. See the [contributor guide](https://github.com/galleonlabs/crypto-defi-skills/blob/main/CONTRIBUTING.md). Maintainers run `bun run check` in the workspace and the clean consumer smoke before publication.

## License and credit

[MIT](LICENSE), copyright Galleon Labs. Preserve the copyright and permission notice in reused copies or substantial portions. [Attribution](ATTRIBUTION.md) includes an optional credit line naming Andrew Wilkinson and Galleon Labs.
