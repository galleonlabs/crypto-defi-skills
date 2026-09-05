# Crypto DeFi Skills

[![CI](https://github.com/galleonlabs/crypto-defi-skills/actions/workflows/ci.yml/badge.svg)](https://github.com/galleonlabs/crypto-defi-skills/actions/workflows/ci.yml)
[![LP npm](https://img.shields.io/npm/v/galleon-lp-skills?label=LP)](https://www.npmjs.com/package/galleon-lp-skills)
[![Hyperliquid npm](https://img.shields.io/npm/v/galleon-hyperliquid-skills?label=Hyperliquid)](https://www.npmjs.com/package/galleon-hyperliquid-skills)
[![Infrastructure npm](https://img.shields.io/npm/v/galleon-defi-infra-skills?label=Infrastructure)](https://www.npmjs.com/package/galleon-defi-infra-skills)
[![Data npm](https://img.shields.io/npm/v/galleon-defi-data-skills?label=Data)](https://www.npmjs.com/package/galleon-defi-data-skills)
[![MIT](https://img.shields.io/badge/license-MIT-0f766e)](LICENSE)

Open-source agent skills for DeFi, built around maintained official tools. Install one skill, one pack, or any combination of the four packs. Each pack has its own npm release, CLI, plugin manifests, references and tests.

[Get started](#get-started) · [Install a pack](#install-only-what-you-need) · [Explore workflows](#choose-a-workflow) · [Contribute](CONTRIBUTING.md)

## Four independent packs

| Pack | Published version | npm package | Coverage |
| --- | --- | --- | --- |
| [LP](packages/lp) | [0.4.2](https://github.com/galleonlabs/crypto-defi-skills/releases/tag/galleon-lp-skills%400.4.2) | [`galleon-lp-skills`](https://www.npmjs.com/package/galleon-lp-skills) | Uniswap v2/v3/v4 and Aerodrome classic/Slipstream, with optional Revert and VFAT guidance |
| [Hyperliquid](packages/hyperliquid) | [0.2.1](https://github.com/galleonlabs/crypto-defi-skills/releases/tag/galleon-hyperliquid-skills%400.2.1) | [`galleon-hyperliquid-skills`](https://www.npmjs.com/package/galleon-hyperliquid-skills) | Perps, spot, HIP-3 markets, account modes, trade planning and performance review |
| [Infrastructure](packages/infra) | [0.1.0](https://github.com/galleonlabs/crypto-defi-skills/releases/tag/galleon-defi-infra-skills%400.1.0) | [`galleon-defi-infra-skills`](https://www.npmjs.com/package/galleon-defi-infra-skills) | RPC, Alchemy, Coinbase account and Agentic Wallet access, permissions and readiness |
| [Data](packages/data) | [0.1.0](https://github.com/galleonlabs/crypto-defi-skills/releases/tag/galleon-defi-data-skills%400.1.0) | [`galleon-defi-data-skills`](https://www.npmjs.com/package/galleon-defi-data-skills) | DeFiLlama and CoinGecko access, market observations, identity, freshness and methodology |

There are **15 current skills**: six LP skills, seven Hyperliquid skills, one infrastructure skill and one data skill. Two additional LP directories preserve previous install names as migration notices.

## Get started

For a complete Hermes agent, start with [Boomkin](https://github.com/galleonlabs/boomkin). Its onboarding installs the native Hermes runtime when needed, configures an isolated DeFi profile and public CoinGecko access, and installs all four packs. Model login and optional provider or wallet access use their native setup flows.

Already have an agent? Install a pack below, then try one of the [read-only workflows](#choose-a-workflow). Start with infrastructure for connections, data for research, or a protocol pack for a specific task.

## Install only what you need

Choose a pack with the upstream [Agent Skills installer](https://github.com/vercel-labs/skills):

```bash
npx skills add https://github.com/galleonlabs/crypto-defi-skills/tree/main/packages/infra
npx skills add https://github.com/galleonlabs/crypto-defi-skills/tree/main/packages/data
npx skills add https://github.com/galleonlabs/crypto-defi-skills/tree/main/packages/lp
npx skills add https://github.com/galleonlabs/crypto-defi-skills/tree/main/packages/hyperliquid
```

Or choose a single skill:

```bash
npx skills add galleonlabs/crypto-defi-skills --skill galleon-defi-infra
npx skills add galleonlabs/crypto-defi-skills --skill galleon-defi-data
npx skills add galleonlabs/crypto-defi-skills --skill lp-monitor
npx skills add galleonlabs/crypto-defi-skills --skill hyperliquid-setup
```

Append `--list` to inspect available skills before installing. The installer may ask which skills and agent harness should receive the installation. Prefer the current names listed below over the LP migration notices.

Each skill carries its required references and scripts. No pack requires another pack as a runtime dependency. These source commands follow `main`; use a reviewed source revision or Boomkin's pinned catalog when you need reproducible installs.

### npm CLIs

For local arithmetic, corpus validation and skill discovery, install each npm package independently. Node.js 20 or newer is required; Bun is only needed for repository development.

```bash
npm install --global galleon-defi-infra-skills@0.1.0
defi-infra-skills catalog

npm install --global galleon-defi-data-skills@0.1.0
defi-data-skills catalog

npm install --global galleon-lp-skills@0.4.2
lp-skills catalog
lp-skills --version

npm install --global galleon-hyperliquid-skills@0.2.1
hl-skills catalog
hl-skills --version
```

Use `@latest` instead of a version for the current published package. An npm installation supplies the CLI and bundled corpus; use the Agent Skills installer or Boomkin to place skills in your harness's discovery directory. The CLIs do not sign or submit transactions.

### Plugins and Boomkin

Claude Code users can add the marketplace and choose individual plugins:

```text
/plugin marketplace add galleonlabs/crypto-defi-skills
/plugin install galleon-defi-infra-skills@galleon-defi
/plugin install galleon-defi-data-skills@galleon-defi
/plugin install galleon-lp-skills@galleon-defi
/plugin install galleon-hyperliquid-skills@galleon-defi
```

Each package carries its own `.codex-plugin/` manifest.

[Boomkin](https://github.com/galleonlabs/boomkin) is the Hermes-first DeFi agent product. Its catalog pins each pack's version, source commit, package path and expected skills independently. Use `--pack defi-infra-skills`, `--pack defi-data-skills`, `--pack lp-skills` or `--pack hyperliquid-skills` to select packs; updates preserve that selection and future packs remain opt-in. Fresh onboarding includes all four. Skill-only compatibility remains available for other harnesses. Follow [Boomkin's onboarding guide](https://github.com/galleonlabs/boomkin#get-started).

## Choose a workflow

Start with the foundations, then use the protocol workflows below:

| Skill | Use it for |
| --- | --- |
| [galleon-defi-infra](packages/infra/skills/galleon-defi-infra) | RPC identity and freshness, official tool access, wallet/account setup choices, secret handling and permission boundaries |
| [galleon-defi-data](packages/data/skills/galleon-defi-data) | DeFiLlama and CoinGecko access, bounded public reads, asset identity, source timestamps and comparable metrics |

The Galleon prefix avoids collisions with upstream skills using the same generic names. These packs coordinate official tools and include small read-only diagnostics; they do not bundle a wallet runtime or replace provider SDKs.

| Task | LP skill | Hyperliquid skill |
| --- | --- | --- |
| Discover tools and verify read access | [lp-setup](packages/lp/skills/lp-setup) | [hyperliquid-setup](packages/hyperliquid/skills/hyperliquid-setup) |
| Assess pools, markets and evidence | [lp-analyze](packages/lp/skills/lp-analyze) | [hyperliquid-analyze](packages/hyperliquid/skills/hyperliquid-analyze) |
| Prepare an exact unsigned plan | [lp-plan](packages/lp/skills/lp-plan) | [hyperliquid-plan](packages/hyperliquid/skills/hyperliquid-plan) |
| Carry out an explicitly approved action | [lp-execute](packages/lp/skills/lp-execute) | [hyperliquid-execute](packages/hyperliquid/skills/hyperliquid-execute) |
| Reconcile positions and monitor risk | [lp-monitor](packages/lp/skills/lp-monitor) | [hyperliquid-monitor](packages/hyperliquid/skills/hyperliquid-monitor) |
| Review completed trading activity | Included in LP position monitoring | [hyperliquid-review](packages/hyperliquid/skills/hyperliquid-review) |
| Build or review integrations | [lp-engineer](packages/lp/skills/lp-engineer) | [hyperliquid-engineer](packages/hyperliquid/skills/hyperliquid-engineer) |

Start with a read-only task:

> Use lp-setup to check my Base RPC connection and list missing tools. Then use lp-analyze to inspect this pool's identity and risks: [pool address].

> Use hyperliquid-setup to read the ETH perpetual market on mainnet without connecting an account. Explain the observed spread, funding and missing data.

Supply the actual pool address and configure RPC credentials through your harness's environment or secret settings. The LP setup helper verifies chain identity and freshness; the Hyperliquid setup helper reads public market data. Neither first-read check needs wallet authority. Each skill documents its required inputs, outputs and fallback when another skill is absent.

## Use official tools first

Reuse a suitable existing tool before building another SDK, signer, indexer or transaction encoder. The packs describe access requirements, supported capabilities, fees, custody and verification for these optional paths:

| Tool source | Covered use | Guide |
| --- | --- | --- |
| Alchemy / Coinbase | RPC, OAuth MCP, official local account MCP, wallet CLI and custody/permission choices | [Infrastructure guide](packages/infra/README.md) |
| DeFiLlama / CoinGecko | Public and authenticated data paths, provenance, freshness and methodology | [Data guide](packages/data/README.md) |
| Uniswap | Official agent skills, protocol SDKs, Liquidity Provisioning API and reviewed interface links | [LP tool access](packages/lp/skills/lp-setup/references/official-tools.md#uniswap) |
| Aerodrome / Velodrome | Sugar SDK and its skill for pool/position reads, quotes and unsigned LP calls | [Sugar access and limits](packages/lp/skills/lp-setup/references/official-tools.md#aerodrome-and-slipstream) |
| Hyperliquid | Official Python SDK, public Info API and WebSocket interfaces | [Hyperliquid tools](packages/hyperliquid/skills/hyperliquid-setup/references/official-tools.md) |
| Revert | Optional MCP discovery, indexed position analytics and supported unsigned plans | [Revert access and permissions](packages/lp/skills/lp-setup/references/official-tools.md#revert-explicitly-optional) |
| VFAT | Public yield screening, Sickle position management and automation, and official integration sources | [VFAT access](packages/lp/skills/lp-setup/references/vfat.md) and [engineering](packages/lp/skills/lp-engineer/references/vfat.md) |

Installing a pack does not register an external provider or supply a wallet, signer, market-data subscription or hosted trading service. Connect tools through your harness. Financial actions require explicit authority, reviewed terms and reconciliation against chain or exchange records. There are no mandatory partner routes or hidden builder fees.

Protocol-specific evidence and reviewed upstream revisions live in [LP sources](packages/lp/SOURCES.md), [Hyperliquid sources](packages/hyperliquid/SOURCES.md), [infrastructure sources](packages/infra/SOURCES.md) and [data sources](packages/data/SOURCES.md). Dated reviews are not guarantees about current provider capabilities or deployed contracts.

## One repository, independent releases

```text
packages/
  infra/          galleon-defi-infra-skills
  data/           galleon-defi-data-skills
  lp/             galleon-lp-skills
  hyperliquid/    galleon-hyperliquid-skills
scripts/          workspace checks, discovery, selected-package releases
```

The root workspace is private and never published to npm. Each pack has an independent version and package-qualified tag, such as `galleon-lp-skills@0.4.2` or `galleon-hyperliquid-skills@0.2.1`. Releasing one pack does not require releasing the others.

CI checks every package, builds its npm payload and tests a clean consumer install. [Discovery releases](https://github.com/galleonlabs/crypto-defi-skills/releases) use `agent-skills-<commit>` tags and contain `index.json` plus a separate archive and SHA-256 digest for each skill. The current corpus produces 17 archives, including the two LP migration notices. Discovery artifacts and npm releases are separate publication paths.

Add a pack under `packages/` with its own npm manifest, version, skill directory, checks, build and plugin manifests. Register it in [the Claude marketplace](.claude-plugin/marketplace.json) and [skill discovery groupings](skills.sh.json). Shared tooling discovers the package directories automatically. Follow [contributing](CONTRIBUTING.md) and [releasing](RELEASING.md).

## Updates and migration

The former `galleonlabs/lp-skills` and `galleonlabs/hyperliquid-skills` repositories have been consolidated here. Update saved Git URLs to this monorepo; the npm package and CLI names remain unchanged. Original Git histories and historical release archives were preserved. See [migration details](MIGRATION.md).

Use `lp-analyze` instead of `lp-research`, and `lp-execute` instead of `lp-operate`. The old LP names resolve to install notices. Hyperliquid uses `hyperliquid-analyze` and `hyperliquid-execute` with no legacy alias skills. Review local edits before removing old installed directories, and preserve your harness configuration and credentials.

For updates, rerun the selected install command or use Boomkin's explicit update command. Updating this repository does not automatically update an existing harness installation.

## Contribute

Help improve a workflow, fix unclear documentation, reproduce an integration issue, or add a self-contained pack. Start with the [contributor guide](CONTRIBUTING.md); small documentation fixes are welcome as pull requests. For a new provider or workflow, [open an issue](https://github.com/galleonlabs/crypto-defi-skills/issues/new) with the intended task and official sources.

### Local checks

Use Bun 1.3.14 and Git from the repository root:

```bash
bun install --frozen-lockfile
bun run check
bun run pack
bun run smoke
```

After changing skills, also run `validate-agent-skills packages/<pack>/skills`. Keep all required references and scripts inside the individual skill. Follow [RELEASING.md](RELEASING.md) to publish one selected package from a clean, verified commit.

Report security issues through [private vulnerability reporting](https://github.com/galleonlabs/crypto-defi-skills/security/advisories/new).

## License and credit

[MIT licensed](LICENSE), with the copyright and permission notice retained when reusing copies or substantial portions. Created by [Andrew Wilkinson](https://andrewwilkinson.io) and [Galleon Labs](https://github.com/galleonlabs).

See [reuse and attribution](ATTRIBUTION.md) for a ready-to-copy credit line. If Crypto DeFi Skills helps your work, [a star on the original repository](https://github.com/galleonlabs/crypto-defi-skills) is appreciated and entirely optional.
