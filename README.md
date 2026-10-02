# Crypto DeFi Skills

[![CI](https://github.com/galleonlabs/crypto-defi-skills/actions/workflows/ci.yml/badge.svg)](https://github.com/galleonlabs/crypto-defi-skills/actions/workflows/ci.yml)
[![MIT](https://img.shields.io/badge/license-MIT-0f766e)](LICENSE)

**Protocol-specific procedures your agent can use to finish a DeFi task.** Inspect Aave debt, assess a Uniswap position, check Aerodrome gauge custody, claim a Lido withdrawal, screen yields or reconcile a bridge. Concrete reads, local calculations and verifiable outcomes, packaged independently.

Start with [Boomkin](https://github.com/galleonlabs/boomkin) for a complete Hermes agent, or install only the skills your existing agent needs.

[Explore packs](#independent-packs) · [Install](#install-only-what-you-need) · [Research](docs/research/report-source.md) · [Quality](docs/SKILL-QUALITY.md) · [Contribute](CONTRIBUTING.md)

## Choose a protocol task

Install a skill that names the job. Each new workflow includes the concrete reads or official tool recipe, protocol-specific accounting and failure handling, a worked decision, and an explicit completion condition. Local helpers handle repeatable calculations; they never sign or submit transactions.

| Job | Skill | Result |
| --- | --- | --- |
| Stress-test an Aave V3 position | [`galleon-aave-position`](packages/lending/skills/galleon-aave-position/SKILL.md) | Current and stressed health factor, debt capacity, reserve restrictions and an unsigned action plan. |
| Inspect a Morpho market or vault | [`galleon-morpho-market`](packages/lending/skills/galleon-morpho-market/SKILL.md) | Market identity, oracle/IRM/LLTV, liquidity and vault allocation or exit constraints. |
| Check Compound III borrowing capacity | [`galleon-compound-borrow`](packages/lending/skills/galleon-compound-borrow/SKILL.md) | Base debt, collateral limits, interest exposure and an unsigned borrow or repay plan. |
| Track a Lido withdrawal to claimability | [`galleon-lido-withdrawals`](packages/staking/skills/galleon-lido-withdrawals/SKILL.md) | Request ownership, finalized/claimed status, claimable ETH and the next supported step. |
| Compare holding PT to maturity with exiting | [`galleon-pendle-maturity`](packages/yield/skills/galleon-pendle-maturity/SKILL.md) | Maturity terms, underlying accounting unit, executable exit comparison and post-expiry route. |
| Check what a vault withdrawal can return now | [`galleon-vault-exit`](packages/yield/skills/galleon-vault-exit/SKILL.md) | Preview versus owner limits, rounding, liquidity and asynchronous exit constraints. |
| Inspect a Uniswap V3 liquidity position | [`uniswap-v3-liquidity`](packages/lp/skills/uniswap-v3-liquidity/SKILL.md) | Position composition, tick bounds, fee state and a bounded liquidity plan. |
| Inspect Slipstream liquidity and gauge rewards | [`aerodrome-slipstream`](packages/lp/skills/aerodrome-slipstream/SKILL.md) | Range status, gauge custody, fees versus emissions, and exit constraints. |
| Prepare a Uniswap quote for review | [`uniswap-swap`](packages/routing/skills/uniswap-swap/SKILL.md) | Quote identity, route type, approval/Permit2 requirements and unsigned transaction review. |
| Compare a bridge route and reconcile arrival | [`lifi-cross-chain`](packages/routing/skills/lifi-cross-chain/SKILL.md) | Net destination amount, gas needs, route limits and destination settlement evidence. |
| Resolve a token before trusting its price | [`galleon-coingecko-token-research`](packages/data/skills/galleon-coingecko-token-research/SKILL.md) | Resolved token identity, timestamped market evidence and unsupported or stale fields. |
| Screen yields without mistaking emissions for income | [`galleon-defillama-yield-screen`](packages/data/skills/galleon-defillama-yield-screen/SKILL.md) | A reproducible shortlist separating base yield, rewards, missing fields and exit diligence. |
| Collect a source-backed market snapshot | [`galleon-defi-market-snapshot`](packages/data/skills/galleon-defi-market-snapshot/SKILL.md) | Bounded price observations, timestamp alignment, discrepancies and compatible daily history. |
| Test a daily strategy before discussing deployment | [`galleon-defi-strategy-backtest`](packages/strategy/skills/galleon-defi-strategy-backtest/SKILL.md) | Next-observation replay, modeled costs, flow-neutral return/drawdown and a same-cost benchmark. |
| Check AgentKit wallet capabilities | [`galleon-coinbase-agentkit-readiness`](packages/infra/skills/galleon-coinbase-agentkit-readiness/SKILL.md) | Capability and policy gaps, tested read access and the next required setup step. |
| Review a Hyperliquid account before trading | [`hyperliquid-analyze`](packages/hyperliquid/skills/hyperliquid-analyze/SKILL.md) | Account mode, margin exposure, funding and market evidence for a trade decision. |

These skills are independently installable. Protocol identities, market parameters and deployments are resolved at use time. The existing primitive skills remain available for cross-protocol research and venues without a dedicated procedure.

## Independent packs

Fifteen packs, 41 current skills. Each pack has its own npm release, CLI, plugin manifests and self-contained references. Two additional LP directories preserve previous install names as notices.

| Pack | npm release | Coverage |
| --- | --- | --- |
| [Infra](packages/infra) | [`galleon-defi-infra-skills@0.3.0`](https://www.npmjs.com/package/galleon-defi-infra-skills/v/0.3.0) | RPC, wallet access, Alchemy, Coinbase and Hermes tool configuration |
| [Data](packages/data) | [`galleon-defi-data-skills@0.5.0`](https://www.npmjs.com/package/galleon-defi-data-skills/v/0.5.0) | CoinGecko, DeFiLlama, AIXBT and source-aware cross-protocol evidence |
| [Lp](packages/lp) | [`galleon-lp-skills@0.6.0`](https://www.npmjs.com/package/galleon-lp-skills/v/0.6.0) | Uniswap, Aerodrome, Curve, Balancer, Revert and VFAT liquidity workflows |
| [Hyperliquid](packages/hyperliquid) | [`galleon-hyperliquid-skills@0.3.4`](https://www.npmjs.com/package/galleon-hyperliquid-skills/v/0.3.4) | Spot, perps, HIP-3, account modes, execution and review |
| [Lending](packages/lending) | [`galleon-defi-lending-skills@0.2.0`](https://www.npmjs.com/package/galleon-defi-lending-skills/v/0.2.0) | Aave, Morpho, Compound, Euler, Spark and Solana lending |
| [Staking](packages/staking) | [`galleon-defi-staking-skills@0.2.0`](https://www.npmjs.com/package/galleon-defi-staking-skills/v/0.2.0) | Lido, Rocket Pool, EigenLayer and Symbiotic staking and exits |
| [Yield](packages/yield) | [`galleon-defi-yield-skills@0.2.0`](https://www.npmjs.com/package/galleon-defi-yield-skills/v/0.2.0) | Vaults, Pendle PT/YT, Yearn, Spark savings and Ethena |
| [Tokenized Assets](packages/tokenized-assets) | [`galleon-defi-tokenized-assets-skills@0.1.2`](https://www.npmjs.com/package/galleon-defi-tokenized-assets-skills/v/0.1.2) | Ondo and OpenEden eligibility, issuer risk and settlement |
| [Routing](packages/routing) | [`galleon-defi-routing-skills@0.2.0`](https://www.npmjs.com/package/galleon-defi-routing-skills/v/0.2.0) | 0x, 1inch, CoW, Jupiter, LI.FI, Relay, Across and CCTP |
| [Derivatives](packages/derivatives) | [`galleon-defi-derivatives-skills@0.1.4`](https://www.npmjs.com/package/galleon-defi-derivatives-skills/v/0.1.4) | GMX, Derive, Drift and Pendle Boros trading lifecycles |
| [Strategy](packages/strategy) | [`galleon-defi-strategy-skills@0.1.0`](https://www.npmjs.com/package/galleon-defi-strategy-skills/v/0.1.0) | Daily spot backtests, costs, cash flows, drawdown and reproducible benchmarks |
| [Portfolio](packages/portfolio) | [`galleon-defi-portfolio-skills@0.1.3`](https://www.npmjs.com/package/galleon-defi-portfolio-skills/v/0.1.3) | Positions, liabilities, net exposure, cash flows and performance |
| [Security](packages/security) | [`galleon-defi-security-skills@0.2.2`](https://www.npmjs.com/package/galleon-defi-security-skills/v/0.2.2) | Token diligence, transaction decoding, permissions and simulation review |
| [Payments](packages/payments) | [`galleon-defi-payments-skills@0.1.3`](https://www.npmjs.com/package/galleon-defi-payments-skills/v/0.1.3) | Stablecoin transfers, x402, Sablier and Superfluid |
| [Governance](packages/governance) | [`galleon-defi-governance-skills@0.1.2`](https://www.npmjs.com/package/galleon-defi-governance-skills/v/0.1.2) | Snapshot, Cactus, Governor, voting and Safe execution |

Coverage means operational guidance and reviewed official interfaces. It does not imply that every provider has an MCP server, every account can access it, or every action was executed in testing. [The research report](docs/research/report-source.md) records those distinctions and the remaining gaps. The [Minara workflow review](docs/research/minara-review.md) documents subsequent CLI recovery, automation ownership and recipient-verification improvements.

## Install only what you need

Choose a single skill with the upstream [Agent Skills installer](https://github.com/vercel-labs/skills):

```bash
npx skills add galleonlabs/crypto-defi-skills --skill galleon-aave-position
npx skills add galleonlabs/crypto-defi-skills --skill galleon-defillama-yield-screen
npx skills add galleonlabs/crypto-defi-skills --skill aerodrome-slipstream
```

Or select a complete pack:

```bash
npx skills add https://github.com/galleonlabs/crypto-defi-skills/tree/main/packages/lp
npx skills add https://github.com/galleonlabs/crypto-defi-skills/tree/main/packages/routing
```

Append `--list` to inspect available skills. The installer lets you choose the receiving harness. Keep each skill's references and scripts with its `SKILL.md`; no pack requires another Galleon pack at runtime. Source commands follow `main`; use a reviewed revision or Boomkin's pinned catalog for reproducibility.

### npm

Every package supplies a local corpus CLI and an ESM `SKILL_CATALOG` export:

```bash
npx --package galleon-defi-lending-skills@0.2.0 defi-lending-skills catalog --json
npx --package galleon-defi-lending-skills@0.2.0 defi-lending-skills show galleon-aave-position
npx --package galleon-defi-lending-skills@0.2.0 defi-lending-skills validate --json
```

Node 20+ is sufficient for the published CLIs. Provider tools may require newer runtimes; check their reference before installation. npm supplies the CLI and corpus; the skills installer or Boomkin places the corpus in your agent's discovery directory. The CLIs never sign or submit transactions. LP and Hyperliquid also include local calculations, while infrastructure and data include bounded read-only diagnostics.

### Plugins

Claude Code users can select individual plugins:

```text
/plugin marketplace add galleonlabs/crypto-defi-skills
/plugin install galleon-defi-lending-skills@galleon-defi
/plugin install galleon-lp-skills@galleon-defi
```

Every pack also contains its own Codex plugin manifest. Neither plugin installation nor skill installation authenticates a provider or provisions a wallet.

### Boomkin and Hermes

[Boomkin](https://github.com/galleonlabs/boomkin) onboards native Hermes with an isolated DeFi profile and independently pinned skill packs. Fresh onboarding includes the current collection; use `--pack defi-lending-skills` or another pack ID to select a subset. Updates preserve existing selections; adding future packs is explicit.

Keep Hermes as the runtime. Load the relevant skill and then its references on demand. Connect only the providers needed for the task, using native MCP/CLI configuration and narrow tool exposure. A working connection, authenticated read, unsigned plan, signature and confirmed outcome are separate milestones.

## Try a workflow

> Use galleon-aave-position to inspect this Aave V3 wallet and show health factor after a 20% collateral-price fall and 30 days of debt interest. Keep the plan unsigned.

> Use lifi-cross-chain to check whether this Base-to-Arbitrum USDC transfer arrived. Verify the recipient, destination asset and actual amount rather than relying on the source receipt.

> Use galleon-defi-portfolio to reconcile these wallet positions, separating debt, queued withdrawals and assets without reliable prices.

> Use galleon-defi-security-token-diligence to investigate [token address] on [chain ID] and compare its controls, exit depth and evidence with a prior review.

> Use galleon-defi-security to decode this unsigned transaction and compare its permissions and simulated effects with my intended action.

Supply actual addresses and amounts for position-specific tasks. Provider credentials belong in the harness's private environment or secret settings.

LP and Hyperliquid have separate skills for each stage:

| Stage | LP | Hyperliquid |
| --- | --- | --- |
| Tool access | `lp-setup` | `hyperliquid-setup` |
| Research | `lp-analyze` | `hyperliquid-analyze` |
| Plan | `lp-plan` | `hyperliquid-plan` |
| Authorized action | `lp-execute` | `hyperliquid-execute` |
| Monitor | `lp-monitor` | `hyperliquid-monitor` |
| Review | Included in monitoring | `hyperliquid-review` |
| Integrate | `lp-engineer` | `hyperliquid-engineer` |

The other packs each provide one `galleon-defi-<pack>` workflow with provider and operation references. Their Galleon prefix avoids collisions with upstream skills.

## Official tools, explicit evidence

We reuse official SDKs, APIs, CLIs, agent skills and MCP servers. The packs add operational judgment: identity, units, access, economic terms, permissions, failure recovery and receipts. They do not introduce a custom signer or required partner route.

The [2026-09-05 research](docs/research/report-source.md) covers major providers across these primitives and highlights changes such as Aave V4, Morpho's experimental MCP, current Yearn data, new official agent surfaces and mismatches between advertised and discovered tools. Every provider reference identifies primary sources and review limits.

A skill is guidance, not financial authority. Preserve the user's existing authorization within its scope; obtain missing terms before signing, paying, voting or changing permissions. There are no hidden builder fees or mandatory referral routes. An unsigned plan or successful simulation is not a settlement receipt.

## Develop and release

```bash
bun install --frozen-lockfile
bun run check
bun run pack
bun run smoke
```

Use Bun 1.3.14 for repository development. After skill edits, also run `validate-agent-skills packages/<pack>/skills`. Root checks enforce metadata, independent packaging and MIT/attribution retention. Clean consumer tests exercise each published-format CLI and corpus.

Add a pack under `packages/`, register its plugin and discovery grouping, and follow [CONTRIBUTING.md](CONTRIBUTING.md). Content-only packs share build-time tooling that is bundled into their standalone CLIs; installed packages never need the monorepo.

The private root workspace is not published to npm. [RELEASING.md](RELEASING.md) publishes one selected pack from a clean commit. Tags use `<npm-name>@<version>`. Separate `agent-skills-<commit>` releases provide individual skill archives, including the two LP notices, with SHA-256 digests. Their source is the exact committed tree.

For older LP installation names and repository URLs, see [migration notes](MIGRATION.md). Existing npm and CLI names remain supported.

## Contribute and reuse

Source-backed corrections, reproducible integration failures and new self-contained workflows are welcome. Start with the [contributor guide](CONTRIBUTING.md). Report security issues through [private vulnerability reporting](https://github.com/galleonlabs/crypto-defi-skills/security/advisories/new).

[MIT licensed](LICENSE), created by [Andrew Wilkinson](https://andrewwilkinson.io) and [Galleon Labs](https://github.com/galleonlabs). Preserve the copyright and permission notice when reusing copies or substantial portions. [Attribution guidance](ATTRIBUTION.md) includes an optional public credit line. A [GitHub star](https://github.com/galleonlabs/crypto-defi-skills) is appreciated and entirely optional.
