# Crypto DeFi Skills

[![CI](https://github.com/galleonlabs/crypto-defi-skills/actions/workflows/ci.yml/badge.svg)](https://github.com/galleonlabs/crypto-defi-skills/actions/workflows/ci.yml)

Modular agent skills for DeFi, built around official protocol tools. Install one skill, one pack, or both. Each pack has its own npm release, CLI, plugin manifests, references, and tests.

| Pack | npm package | Workflows |
| --- | --- | --- |
| [LP](packages/lp) | [`galleon-lp-skills`](https://www.npmjs.com/package/galleon-lp-skills) | Uniswap and Aerodrome setup, analysis, planning, execution, monitoring, engineering |
| [Hyperliquid](packages/hyperliquid) | [`galleon-hyperliquid-skills`](https://www.npmjs.com/package/galleon-hyperliquid-skills) | Setup, analysis, planning, execution, monitoring, performance review, engineering |

There are 13 current workflows, plus two LP install-name migration notices.

## Install only what you need

Choose a pack with the upstream Agent Skills installer:

```bash
npx skills add https://github.com/galleonlabs/crypto-defi-skills/tree/main/packages/lp
npx skills add https://github.com/galleonlabs/crypto-defi-skills/tree/main/packages/hyperliquid
```

Or choose a single skill:

```bash
npx skills add galleonlabs/crypto-defi-skills --skill lp-monitor
npx skills add galleonlabs/crypto-defi-skills --skill hyperliquid-setup
```

Each skill carries its required references and scripts. Installing an LP skill does not require the Hyperliquid pack, or vice versa. The installer may ask which agent harness should receive the skills.

For deterministic CLI tools, install either npm package independently:

```bash
npm install --global galleon-lp-skills
lp-skills catalog

npm install --global galleon-hyperliquid-skills
hl-skills catalog
```

Claude Code users can add the marketplace and choose either plugin:

```text
/plugin marketplace add galleonlabs/crypto-defi-skills
/plugin install galleon-lp-skills@galleon-defi
/plugin install galleon-hyperliquid-skills@galleon-defi
```

Codex plugin manifests remain in each package's `.codex-plugin/` directory. For harness setup, selected pack installation, and verified updates, use [Boomkin](https://github.com/galleonlabs/boomkin).

## Use official tools first

The skills help choose and connect the maintained upstream tools for a task: Uniswap's official skills, SDKs and liquidity API; Aerodrome's documented protocol tooling; Hyperliquid's official SDK and public APIs; and optional Revert tools. They explain required access, supported capabilities, and how to verify the result.

Start with `lp-setup` or `hyperliquid-setup`. A skill installation provides guidance and small diagnostics, not a wallet, market-data subscription, signer, or hosted trading service. Tool access and financial authority remain explicit. There are no mandatory partner routes or hidden builder fees.

## One repository, independent releases

```text
packages/
  lp/             galleon-lp-skills
  hyperliquid/    galleon-hyperliquid-skills
scripts/          workspace checks, discovery, selected-package releases
```

The root workspace is private and never published to npm. Shared tooling discovers package directories; versions remain independent. Package-qualified tags such as `galleon-lp-skills@0.4.1` identify releases without forcing another pack to change.

CI validates every package and its npm payload. Discovery releases contain a combined index and a separate archive for each skill. Add a new pack under `packages/`, then register its marketplace entry and discovery grouping. No harness runtime is copied here.

## Development

```bash
bun install --frozen-lockfile
bun run check
bun run pack
```

See [releasing](RELEASING.md), [migration](MIGRATION.md), and [contributing](CONTRIBUTING.md). Protocol-specific evidence lives in each package's `SOURCES.md`.

Built by [Galleon Labs](https://galleonlabs.io). MIT licensed.
