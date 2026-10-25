# Galleon DeFi Lending Skills

[![npm](https://img.shields.io/npm/v/galleon-defi-lending-skills?color=0f766e)](https://www.npmjs.com/package/galleon-defi-lending-skills)
[![MIT](https://img.shields.io/badge/license-MIT-0f766e)](LICENSE)

**Understand your borrowing room and your downside.**

Inspect collateral, debt and exit liquidity across Aave V3/V4, Morpho, Compound and other lending markets, with protocol-specific accounting.

[Install one skill](#install-one-skill) · [Try a first task](#try-a-first-task) · [Sources](SOURCES.md) · [All packs](https://github.com/galleonlabs/crypto-defi-skills#independent-packs)

## Install one skill

```bash
npx skills add galleonlabs/crypto-defi-skills --skill galleon-aave-position
```

Choose the receiving agent in the installer. Keep the skill's references and scripts with its `SKILL.md`. Each pack works on its own. For a complete native Hermes desk, use [Boomkin](https://github.com/galleonlabs/boomkin).

## Try a first task

> Use galleon-aave-position to inspect [wallet address] on Aave V3 on [chain]. Show current health factor and a 20% collateral-price shock with 30 days of debt interest. Keep the plan unsigned.

Expected result: the workflow's required evidence, explicit gaps and a concrete next step. Supply real task inputs in place of the bracketed placeholders. Provider access is configured in your agent; installation adds the procedures and local resources.

## Install

```bash
npx skills add galleonlabs/crypto-defi-skills --skill galleon-defi-lending
npx --package galleon-defi-lending-skills@0.4.1 defi-lending-skills catalog
```

Start with [the workflow](skills/galleon-defi-lending/SKILL.md), then load its provider references when needed. Installation adds guidance; it does not connect accounts or enable transaction signing. No other Galleon pack is required.

## Package interface

`defi-lending-skills` provides `catalog --json`, `show galleon-defi-lending`, `validate [path] --json`, and `--version`. It reads the packaged corpus and performs no network or wallet operations. The ESM export supplies `SKILL_CATALOG` and the skill document is available through `galleon-defi-lending-skills/skills/galleon-defi-lending`.

[Boomkin](https://github.com/galleonlabs/boomkin) provides Hermes onboarding and optional pack selection. [Sources](SOURCES.md) record provider provenance and verification limits.

## Contribute

Source-backed corrections and reproducible workflow improvements are welcome. See the [contributor guide](https://github.com/galleonlabs/crypto-defi-skills/blob/main/CONTRIBUTING.md). Maintainers run `bun run check` in the workspace and the clean consumer smoke before publication.

## License and credit

[MIT](LICENSE), copyright Galleon Labs. Preserve the copyright and permission notice in reused copies or substantial portions. [Attribution](ATTRIBUTION.md) includes an optional credit line naming Andrew Wilkinson and Galleon Labs.

## Protocol tasks

| Skill | Use for |
| --- | --- |
| [galleon-aave-position](skills/galleon-aave-position/SKILL.md) | checking an Aave V3 health factor, sizing a borrow, or planning a repay and collateral withdrawal; use for eMode and isolation constraints, not Aave V4 |
| [galleon-morpho-market](skills/galleon-morpho-market/SKILL.md) | evaluating a specific Morpho Blue market or Morpho vault allocation, oracle, LLTV, borrow liquidity or exit risk |
| [galleon-compound-borrow](skills/galleon-compound-borrow/SKILL.md) | planning a Compound III Comet base-asset borrow, repayment or collateral withdrawal and checking baseBorrowMin and collateral factors |
| [galleon-aave-v4](skills/galleon-aave-v4/SKILL.md) | Inspect Aave V4 Hub/Spoke positions, preview exact actions, and reconcile unsigned execution plans |
| [galleon-euler-lending](skills/galleon-euler-lending/SKILL.md) | inspecting an Euler V2 EVK borrow, repay or collateral withdrawal, including EVC subaccounts, collateral enablement and controller risk |
| [galleon-sparklend-position](skills/galleon-sparklend-position/SKILL.md) | reviewing a SparkLend Pool supply, borrow, repay or collateral withdrawal; distinguish Spark Isolated Markets and savings vaults |
| [galleon-kamino-lending](skills/galleon-kamino-lending/SKILL.md) | inspecting a Kamino Borrow obligation on Solana, its market, reserve liquidity, borrow factors, elevation group and post-action risk |
| [galleon-save-lending](skills/galleon-save-lending/SKILL.md) | reviewing a Save (formerly Solend) lending market, reserve or obligation, including WAD debt, collateral exchange rates and split transactions |

Each procedure keeps its own references, agent metadata and notices. No signer or all-packs dependency is included.
