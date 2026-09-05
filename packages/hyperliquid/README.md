# Hyperliquid Skills

[![CI](https://github.com/galleonlabs/hyperliquid-skills/actions/workflows/ci.yml/badge.svg)](https://github.com/galleonlabs/hyperliquid-skills/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/galleon-hyperliquid-skills)](https://www.npmjs.com/package/galleon-hyperliquid-skills)
[![MIT](https://img.shields.io/badge/license-MIT-0f766e)](LICENSE)

Agent workflows for Hyperliquid market analysis, trade planning and execution, position monitoring, and performance review. Start with public data; connect your own trusted tools for account work and execution.

## Install

Install every skill:

```bash
npx skills add galleonlabs/hyperliquid-skills
```

Install one skill:

```bash
npx skills add galleonlabs/hyperliquid-skills --skill hyperliquid-monitor
```

Install the CLI:

```bash
npm install --global galleon-hyperliquid-skills
```

The repository also ships Codex and Claude Code plugin manifests. Cursor discovers the same `SKILL.md` files.

## Skills

| Skill | Use it for | Output |
|---|---|---|
| `hyperliquid-setup` | Discover tools and verify a first public read | Capability report, dated market snapshot, next task |
| `hyperliquid-analyze` | Assess markets, funding, liquidity, catalysts, and strategies | Dated evidence, risks, testable verdict |
| `hyperliquid-plan` | Size and specify an order or position change | Exact unsigned ticket and preflight |
| `hyperliquid-monitor` | Inspect accounts, positions, orders, fills, and live risk | Reconciled state and alert verdict |
| `hyperliquid-execute` | Carry out an explicitly approved trading action | One send, exchange reconciliation, incident state |
| `hyperliquid-review` | Journal and review completed activity | Cost attribution, process grade, one finding |
| `hyperliquid-engineer` | Build or review Hyperliquid integrations | Typed adapter, tests, security findings |

Coverage includes perps, spot, HIP-3 markets, standard accounts, unified accounts, and portfolio margin. Transfers, withdrawals, bridging, staking, vault deposits, and builder-fee approval are outside the execution skill.

## From install to first useful result

Ask your agent: **Use hyperliquid-setup to list the tools you have and read the ETH perpetual market on mainnet, without connecting an account. Then use hyperliquid-analyze to explain the observed spread, funding and data gaps.**

The setup skill includes a standalone helper. From its installed directory:

```bash
node scripts/market-snapshot.mjs --coin ETH --network mainnet
```

It reads the public `/info` API and returns metadata, mark/oracle price, reported funding, book spread, observation time and coverage limits. It accepts no keys or account credentials. Its first-read helper covers validator-operated perpetual markets; HIP-3 and spot analysis need the appropriate read adapter. With an HTTP tool and no shell, the skill includes the exact request bodies.

Follow `setup → analyze → plan → execute → monitor → review`. Use `hyperliquid-engineer` when a capability needs implementation. Every skill explains its first task, required tools, input/output handoff and fallback when another skill is not installed. Each skill carries its own required references, so single-skill installs work.

Installing the pack does not create a signer, account connection, strategy service or trading bot. The [connection guide](skills/hyperliquid-setup/references/connections.md) maps actual harness tools to each capability. Missing execution tools leave execution unavailable while public analysis can continue.

## Updates and migration

Version 0.2.0 renames `hyperliquid-research` to `hyperliquid-analyze` and `hyperliquid-operate` to `hyperliquid-execute`, and adds `hyperliquid-setup`. `hyperliquid-review` specifically means performance and process analysis after activity; `hyperliquid-analyze` handles markets and strategies beforehand.

Reinstall to get the current names. Update saved prompts and harness configuration, then remove the old installed directories only after checking for local edits. No alias skills are retained. Other skills and credentials are unaffected by the repository rename.

Pin `galleon-hyperliquid-skills@0.2.0` for a reproducible npm release, or use `@latest` for the current published package. Skill installers and deployers should pin a reviewed source revision and inspect changes before upgrading.

## CLI

```bash
hl-skills catalog
hl-skills validate .
hl-skills risk --side long --equity 10000 --risk-percent 0.5 --entry 3000 --stop 2900 --stop-slippage-bps 10 --entry-fee-bps 1.5 --exit-fee-bps 4.5 --size-decimals 4 --json
hl-skills funding --side short --notional 25000 --rate 0.0000125 --interval-hours 1 --hours 24 --json
hl-skills liquidation --side long --mark 3000 --liquidation 2500 --json
hl-skills review --side long --size 0.5 --entry 3000 --exit 3090 --entry-fee 0.25 --exit-fee 1.2 --funding -0.4 --risk-usd 50 --json
```

The package CLI performs local arithmetic and corpus validation. The separate setup helper performs narrow public market reads. Neither provides key handling, signing, or trading submission.

## Operating rules

- Resolve network, account mode, user address, market name, DEX, asset ID, precision, margin table, fees, and limits from fresh official sources.
- Treat the exchange record as authority. Chat, screenshots, local files, and API responses alone do not prove final state.
- Size from a stressed stop that includes exit slippage and both entry and exit fees.
- Give every order a unique client order ID. Use an expiry when the action supports it.
- Send once. Never retry an unknown result while the first action could still arrive.
- Treat missing, stale, partial, or gapped data as unavailable, never as a clean result.
- Separate process quality from profit or loss.

Perpetual futures can lose the full margin balance. This repository is software and operational documentation, not financial advice.

## Repository checks

```bash
bun install
bun run check
```

CI checks style, strict types, tests, skill metadata, links, and the npm payload. Every change to `skills/` on `main` publishes an immutable Agent Skills discovery index and one archive per skill.

## Contributing

Start with [CONTRIBUTING.md](CONTRIBUTING.md). Protocol claims need a current primary source, a test or reproducible read, and explicit failure behavior.

Report vulnerabilities through [private vulnerability reporting](https://github.com/galleonlabs/hyperliquid-skills/security/advisories/new).

## License

MIT. See [SOURCES.md](SOURCES.md) for provenance.
