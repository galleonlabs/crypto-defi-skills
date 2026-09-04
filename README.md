# Hyperliquid Skills

[![CI](https://github.com/galleonlabs/hyperliquid-skills/actions/workflows/ci.yml/badge.svg)](https://github.com/galleonlabs/hyperliquid-skills/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/galleon-hyperliquid-skills)](https://www.npmjs.com/package/galleon-hyperliquid-skills)
[![MIT](https://img.shields.io/badge/license-MIT-0f766e)](LICENSE)

Agent skills and read-only tools for Hyperliquid.

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
| `hyperliquid-research` | Assess markets, funding, liquidity, catalysts, and strategies | Dated evidence, risks, testable verdict |
| `hyperliquid-plan` | Size and specify an order or position change | Exact unsigned ticket and preflight |
| `hyperliquid-monitor` | Inspect accounts, positions, orders, fills, and live risk | Reconciled state and alert verdict |
| `hyperliquid-operate` | Carry out an explicitly approved trading action | One send, exchange reconciliation, incident state |
| `hyperliquid-review` | Journal and review completed activity | Cost attribution, process grade, one finding |
| `hyperliquid-engineer` | Build or review Hyperliquid integrations | Typed adapter, tests, security findings |

Coverage includes perps, spot, HIP-3 markets, standard accounts, unified accounts, and portfolio margin. Transfers, withdrawals, bridging, staking, vault deposits, and builder-fee approval are outside the execution skill.

## CLI

```bash
hl-skills catalog
hl-skills validate .
hl-skills risk --side long --equity 10000 --risk-percent 0.5 --entry 3000 --stop 2900 --stop-slippage-bps 10 --entry-fee-bps 1.5 --exit-fee-bps 4.5 --size-decimals 4 --json
hl-skills funding --side short --notional 25000 --rate 0.0000125 --interval-hours 1 --hours 24 --json
hl-skills liquidation --side long --mark 3000 --liquidation 2500 --json
hl-skills review --side long --size 0.5 --entry 3000 --exit 3090 --entry-fee 0.25 --exit-fee 1.2 --funding -0.4 --risk-usd 50 --json
```

The CLI performs local arithmetic and corpus validation. It has no API, wallet, key, signing, or submission code.

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
