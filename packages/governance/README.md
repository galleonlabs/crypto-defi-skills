# Galleon DeFi Governance Skills

[![npm](https://img.shields.io/npm/v/galleon-defi-governance-skills?color=0f766e)](https://www.npmjs.com/package/galleon-defi-governance-skills)
[![MIT](https://img.shields.io/badge/license-MIT-0f766e)](LICENSE)

**Follow a proposal from intent to execution.**

Research proposal terms, voting power, delegation and execution stages with the official tools for each governance system.

[Install one skill](#install-one-skill) · [Try a first task](#try-a-first-task) · [Sources](SOURCES.md) · [All packs](https://github.com/galleonlabs/crypto-defi-skills#independent-packs)

## Install one skill

```bash
npx skills add galleonlabs/crypto-defi-skills --skill galleon-defi-governance
```

Choose the receiving agent in the installer. Keep the skill's references and scripts with its `SKILL.md`. Each pack works on its own. For a complete native Hermes desk, use [Boomkin](https://github.com/galleonlabs/boomkin).

## Try a first task

> Use galleon-defi-governance to review [proposal URL]. Explain the exact proposed changes, voting eligibility, deadline, execution conditions and sources. Keep any vote or transaction unsigned.

Expected result: the workflow's required evidence, explicit gaps and a concrete next step. Supply real task inputs in place of the bracketed placeholders. Provider access is configured in your agent; installation adds the procedures and local resources.

## Protocol tasks

| Skill | Use for |
| --- | --- |
| [snapshot-proposal](skills/snapshot-proposal/SKILL.md) | researching Snapshot or Snapshot X proposal terms, voting eligibility and tally evidence without granting an alias or casting a vote |
| [governor-proposal](skills/governor-proposal/SKILL.md) | reviewing an OpenZeppelin Governor or Cactus-listed proposal, checking clock, quorum, Timelock and exact calldata through execution |
| [safe-transaction](skills/safe-transaction/SKILL.md) | reviewing a Safe multisig transaction, threshold and nonce, decoding batched calls, or reconciling proposal, confirmations and onchain execution |

Each procedure keeps its own references, agent metadata and notices. No signer or all-packs dependency is included.
