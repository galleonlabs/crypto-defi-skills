# Galleon DeFi Staking Skills

[![npm](https://img.shields.io/npm/v/galleon-defi-staking-skills?color=0f766e)](https://www.npmjs.com/package/galleon-defi-staking-skills)
[![MIT](https://img.shields.io/badge/license-MIT-0f766e)](LICENSE)

**Track a staking exit to what you can claim.**

Inspect liquid staking, restaking, receipt assets and withdrawal queues with concrete ownership, finalization and claimability checks.

[Install one skill](#install-one-skill) · [Try a first task](#try-a-first-task) · [Sources](SOURCES.md) · [All packs](https://github.com/galleonlabs/crypto-defi-skills#independent-packs)

## Install one skill

```bash
npx skills add galleonlabs/crypto-defi-skills --skill galleon-lido-withdrawals
```

Choose the receiving agent in the installer. Keep the skill's references and scripts with its `SKILL.md`. Each pack works on its own. For a complete native Hermes desk, use [Boomkin](https://github.com/galleonlabs/boomkin).

## Try a first task

> Use galleon-lido-withdrawals to check Lido withdrawal request [request ID]. Verify ownership, finalized and claimed status, claimable ETH and the next supported step.

Expected result: the workflow's required evidence, explicit gaps and a concrete next step. Supply real task inputs in place of the bracketed placeholders. Provider access is configured in your agent; installation adds the procedures and local resources.

## Install

```bash
npx skills add galleonlabs/crypto-defi-skills --skill galleon-defi-staking
npx --package galleon-defi-staking-skills@0.2.1 defi-staking-skills catalog
```

Start with [the workflow](skills/galleon-defi-staking/SKILL.md), then load its provider references when needed. Installation adds guidance; it does not connect accounts or enable transaction signing. No other Galleon pack is required.

## Package interface

`defi-staking-skills` provides `catalog --json`, `show galleon-defi-staking`, `validate [path] --json`, and `--version`. It reads the packaged corpus and performs no network or wallet operations. The ESM export supplies `SKILL_CATALOG` and the skill document is available through `galleon-defi-staking-skills/skills/galleon-defi-staking`.

[Boomkin](https://github.com/galleonlabs/boomkin) provides Hermes onboarding and optional pack selection. [Sources](SOURCES.md) record provider provenance and verification limits.

## Contribute

Source-backed corrections and reproducible workflow improvements are welcome. See the [contributor guide](https://github.com/galleonlabs/crypto-defi-skills/blob/main/CONTRIBUTING.md). Maintainers run `bun run check` in the workspace and the clean consumer smoke before publication.

## License and credit

[MIT](LICENSE), copyright Galleon Labs. Preserve the copyright and permission notice in reused copies or substantial portions. [Attribution](ATTRIBUTION.md) includes an optional credit line naming Andrew Wilkinson and Galleon Labs.

## Protocol tasks

- [galleon-lido-withdrawals](skills/galleon-lido-withdrawals/SKILL.md)

Each procedure includes concrete read calls, protocol-specific failure branches, a synthetic worked decision and dated official sources. No signer or all-packs dependency is included. Behavioral fixtures are review rubrics, not evidence of executed transactions.
