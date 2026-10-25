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

## Protocol tasks

| Skill | Use for |
| --- | --- |
| [gmx-position](skills/gmx-position/SKILL.md) | reviewing a GMX perpetual position or order through SDK v2, including market capacity, fees, keeper execution and request-id reconciliation |
| [derive-options](skills/derive-options/SKILL.md) | reviewing Derive v3 option instruments, premium and margin scenarios, or reconciling subaccount orders, fills and session scope |
| [velocity-position](skills/velocity-position/SKILL.md) | inspecting Velocity Exchange Solana positions and margin or distinguishing paused legacy Drift accounts from the new Velocity deployment |
| [pendle-boros](skills/pendle-boros/SKILL.md) | reviewing Boros funding-rate derivatives, implied versus realized rates, margin and delegated-agent scope before any trading action |
| [jupiter-perps](skills/jupiter-perps/SKILL.md) | inspecting Jupiter Perpetuals position and PositionRequest accounts, borrowing fees, triggers or pending close evidence on Solana |

Each procedure keeps its own references, agent metadata and notices. No signer or all-packs dependency is included.
