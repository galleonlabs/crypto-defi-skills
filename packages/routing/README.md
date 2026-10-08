# Galleon DeFi Routing Skills

[![npm](https://img.shields.io/npm/v/galleon-defi-routing-skills?color=0f766e)](https://www.npmjs.com/package/galleon-defi-routing-skills)
[![MIT](https://img.shields.io/badge/license-MIT-0f766e)](LICENSE)

**Follow a route all the way to its result.**

Compare swap and bridge quotes, inspect approval requirements and reconcile destination delivery, partial fills and refunds.

[Install one skill](#install-one-skill) · [Try a first task](#try-a-first-task) · [Sources](SOURCES.md) · [All packs](https://github.com/galleonlabs/crypto-defi-skills#independent-packs)

## Install one skill

```bash
npx skills add galleonlabs/crypto-defi-skills --skill lifi-cross-chain
```

Choose the receiving agent in the installer. Keep the skill's references and scripts with its `SKILL.md`. Each pack works on its own. For a complete native Hermes desk, use [Boomkin](https://github.com/galleonlabs/boomkin).

## Try a first task

> Use lifi-cross-chain to check whether [source transaction] delivered USDC from Base to Arbitrum. Verify the recipient, destination asset, amount and any partial delivery or refund.

Expected result: the workflow's required evidence, explicit gaps and a concrete next step. Supply real task inputs in place of the bracketed placeholders. Provider access is configured in your agent; installation adds the procedures and local resources.

## Protocol workflows

- [uniswap-swap](skills/uniswap-swap/SKILL.md): Quote Uniswap swaps, inspect Permit2 and reconcile AMM or order execution.
- [lifi-cross-chain](skills/lifi-cross-chain/SKILL.md): Compare LI.FI quotes and reconcile destination delivery, partial fills and refunds.

These independently installable skills include current primary-source recipes, worked outcomes and behavioral fixtures. Read-only helpers perform offline arithmetic; they do not supply wallet authority.

## Install

```bash
npx skills add galleonlabs/crypto-defi-skills --skill galleon-defi-routing
npx --package galleon-defi-routing-skills@0.3.1 defi-routing-skills catalog
```

Start with [the workflow](skills/galleon-defi-routing/SKILL.md), then load its provider references when needed. Installation adds guidance; it does not connect accounts or enable transaction signing. No other Galleon pack is required.

## Package interface

`defi-routing-skills` provides `catalog --json`, `show galleon-defi-routing`, `validate [path] --json`, and `--version`. It reads the packaged corpus and performs no network or wallet operations. The ESM export supplies `SKILL_CATALOG` and the skill document is available through `galleon-defi-routing-skills/skills/galleon-defi-routing`.

[Boomkin](https://github.com/galleonlabs/boomkin) provides Hermes onboarding and optional pack selection. [Sources](SOURCES.md) record provider provenance and verification limits.

## Contribute

Source-backed corrections and reproducible workflow improvements are welcome. See the [contributor guide](https://github.com/galleonlabs/crypto-defi-skills/blob/main/CONTRIBUTING.md). Maintainers run `bun run check` in the workspace and the clean consumer smoke before publication.

## License and credit

[MIT](LICENSE), copyright Galleon Labs. Preserve the copyright and permission notice in reused copies or substantial portions. [Attribution](ATTRIBUTION.md) includes an optional credit line naming Andrew Wilkinson and Galleon Labs.
