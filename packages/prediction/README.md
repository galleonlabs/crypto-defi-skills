# Galleon DeFi Prediction Skills

[![npm](https://img.shields.io/npm/v/galleon-defi-prediction-skills?color=0f766e)](https://www.npmjs.com/package/galleon-defi-prediction-skills)
[![MIT](https://img.shields.io/badge/license-MIT-0f766e)](LICENSE)

**Read the rules behind the prediction.**

Research Polymarket outcome identity, resolution terms and order-book depth, then reconcile oracle stages, payout fractions and received collateral.

[Install one skill](#install-one-skill) · [Try a first task](#try-a-first-task) · [Sources](SOURCES.md) · [All packs](https://github.com/galleonlabs/crypto-defi-skills#independent-packs)

## Install one skill

```bash
npx skills add galleonlabs/crypto-defi-skills --skill galleon-prediction-market-research
```

Choose the receiving agent in the installer. Keep the skill's references and scripts with its `SKILL.md`. Each pack works on its own. For a complete native Hermes desk, use [Boomkin](https://github.com/galleonlabs/boomkin).

## Try a first task

> Use galleon-prediction-market-research to research [Polymarket market URL]. Resolve the exact outcome and ledger version, explain the resolution rules and summarize timestamped book depth. Use public reads only.

Expected result: the workflow's required evidence, explicit gaps and a concrete next step. Supply real task inputs in place of the bracketed placeholders. Provider access is configured in your agent; installation adds the procedures and local resources.

## Skills and provider access

Research a Polymarket market or explain a resolution using public reads. No wallet, signing key, order placement or redemption is required.

| Task | Skill |
| --- | --- |
| Resolve a market and outcome, inspect its rules and order book | `galleon-prediction-market-research` |
| Reconcile resolution, payout fractions and actual wallet receipt | `galleon-prediction-market-resolution` |

Install the whole pack with `npx skills add https://github.com/galleonlabs/crypto-defi-skills/tree/main/packages/prediction`, or select one skill with `--skill`. The npm CLI `defi-prediction-skills catalog --json` lists the corpus; it does not call Polymarket.

The research skill includes a local book summary helper. It preserves outcome identifiers as strings, finds best prices independently of array ordering, distinguishes absent liquidity and stale timestamps, and estimates gross buy depth for a supplied share count. It produces approximate research arithmetic, with fees, changes to liquidity and execution explicitly outside its model.

Current official documentation supports two position ledgers. Resolve Gamma `version` before using CTF `tokenId` or Protocol V2 `positionId`; the historical CLI's CTF examples do not prove V2 support. See [sources](SOURCES.md). No installed CLI, hypothetical depth or advertised payout establishes a settled trade.
