# Galleon DeFi Security Skills

[![npm](https://img.shields.io/npm/v/galleon-defi-security-skills?color=0f766e)](https://www.npmjs.com/package/galleon-defi-security-skills)
[![MIT](https://img.shields.io/badge/license-MIT-0f766e)](LICENSE)

**Inspect the token and the permissions you are taking on.**

Investigate token controls and exit depth, decode transaction intent and compare exact simulation effects with the action you intended.

[Install one skill](#install-one-skill) · [Try a first task](#try-a-first-task) · [Sources](SOURCES.md) · [All packs](https://github.com/galleonlabs/crypto-defi-skills#independent-packs)

## Install one skill

```bash
npx skills add galleonlabs/crypto-defi-skills --skill galleon-defi-security-token-diligence
```

Choose the receiving agent in the installer. Keep the skill's references and scripts with its `SKILL.md`. Each pack works on its own. For a complete native Hermes desk, use [Boomkin](https://github.com/galleonlabs/boomkin).

## Try a first task

> Use galleon-defi-security-token-diligence to investigate [token address] on [chain ID]. Show upgrade and transfer controls, holder concentration, executable exit depth and dated primary evidence.

Expected result: the workflow's required evidence, explicit gaps and a concrete next step. Supply real task inputs in place of the bracketed placeholders. Provider access is configured in your agent; installation adds the procedures and local resources.

## Install

```bash
npx skills add galleonlabs/crypto-defi-skills --skill galleon-defi-security
npx --package galleon-defi-security-skills@0.2.3 defi-security-skills catalog
```

Start with [the workflow](skills/galleon-defi-security/SKILL.md), then load its provider references when needed. Installation adds guidance; it does not connect accounts or enable transaction signing. No other Galleon pack is required.

## Token diligence

Install the diligence skill alone:

```bash
npx skills add galleonlabs/crypto-defi-skills --skill galleon-defi-security-token-diligence
```

Ask about an exact chain/address, a specific economic claim, or changes since a previous review. The [diligence workflow](skills/galleon-defi-security-token-diligence/SKILL.md) covers launch allocations, liquidity custody, holder-sized exits, authority and treasury flows. Optional Bun helpers collect a bounded RPC snapshot, validate structured evidence and compare reviews. They do not execute transactions or certify safety. See [the helper contract](skills/galleon-defi-security-token-diligence/references/evidence-format.md) for commands and limitations.

## External services

Token diligence can query the GoPlus Security API (`api.gopluslabs.io`), Tenderly simulation (`mcp.tenderly.co`) and public RPC endpoints for the exact contracts you name. Nothing is sent to Galleon Labs; see the [privacy policy](https://github.com/galleonlabs/crypto-defi-skills/blob/main/PRIVACY.md).

## Package interface

`defi-security-skills` provides `catalog --json`, `show <skill-name>`, `validate [path] --json`, and `--version`. It reads the packaged corpus and performs no network or wallet operations. The ESM export supplies `SKILL_CATALOG` and skill documents are available through `galleon-defi-security-skills/skills/<skill-name>`.

[Boomkin](https://github.com/galleonlabs/boomkin) provides Hermes onboarding and optional pack selection. [Sources](SOURCES.md) record provider provenance and verification limits.

## Contribute

Source-backed corrections and reproducible workflow improvements are welcome. See the [contributor guide](https://github.com/galleonlabs/crypto-defi-skills/blob/main/CONTRIBUTING.md). Maintainers run `bun run check` in the workspace and the clean consumer smoke before publication.

## License and credit

[MIT](LICENSE), copyright Galleon Labs. Preserve the copyright and permission notice in reused copies or substantial portions. [Attribution](ATTRIBUTION.md) includes an optional credit line naming Andrew Wilkinson and Galleon Labs.
