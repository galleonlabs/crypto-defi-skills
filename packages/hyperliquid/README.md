# Hyperliquid Skills

[![npm](https://img.shields.io/npm/v/galleon-hyperliquid-skills?color=0f766e)](https://www.npmjs.com/package/galleon-hyperliquid-skills)
[![MIT](https://img.shields.io/badge/license-MIT-0f766e)](LICENSE)

**See the account before taking a position.**

Inspect spot, perpetuals and HIP-3 exposure with explicit account modes, margin and funding. Separate research, plans, authorized execution and review.

[Install one skill](#install-one-skill) · [Try a first task](#try-a-first-task) · [Sources](SOURCES.md) · [All packs](https://github.com/galleonlabs/crypto-defi-skills#independent-packs)

## Install one skill

```bash
npx skills add galleonlabs/crypto-defi-skills --skill hyperliquid-wallet-audit
```

Choose the receiving agent in the installer. Keep the skill's references and scripts with its `SKILL.md`. Each pack works on its own. For a complete native Hermes desk, use [Boomkin](https://github.com/galleonlabs/boomkin).

## Try a first task

> Use hyperliquid-wallet-audit to inspect [public account address] on mainnet for [start] through [end]. Capture raw evidence and explain observed realized PnL, signed fees, funding, maker/taker activity, current default-perp exposure and completeness gaps.

Expected result: the workflow's required evidence, explicit gaps and a concrete next step. Supply real task inputs in place of the bracketed placeholders. Provider access is configured in your agent; installation adds the procedures and local resources.

## Install

Install every skill:

```bash
npx skills add https://github.com/galleonlabs/crypto-defi-skills/tree/main/packages/hyperliquid
```

Install one skill:

```bash
npx skills add https://github.com/galleonlabs/crypto-defi-skills/tree/main/packages/hyperliquid --skill hyperliquid-monitor
```

Install the CLI:

```bash
npm install --global galleon-hyperliquid-skills
```

The repository also ships Codex and Claude Code plugin manifests. Cursor discovers the same `SKILL.md` files.

## Skills

| Skill | Use it for | Output |
| --- | --- | --- |
| [hyperliquid-setup](skills/hyperliquid-setup/SKILL.md) | Discover tools and verify a first public read | Capability report, dated market snapshot, next task |
| [hyperliquid-wallet-audit](skills/hyperliquid-wallet-audit/SKILL.md) | Audit a public account without wallet connection | Reproducible capture, signed cost accounting, current default-perp exposure and coverage gaps |
| [hyperliquid-analyze](skills/hyperliquid-analyze/SKILL.md) | Assess markets, funding, liquidity, catalysts, and strategies | Dated evidence, risks, testable verdict |
| [hyperliquid-plan](skills/hyperliquid-plan/SKILL.md) | Size and specify an order or position change | Exact unsigned ticket and preflight |
| [hyperliquid-monitor](skills/hyperliquid-monitor/SKILL.md) | Inspect accounts, positions, orders, fills, and live risk | Reconciled state and alert verdict |
| [hyperliquid-execute](skills/hyperliquid-execute/SKILL.md) | Carry out an explicitly approved trading action | One send, exchange reconciliation, incident state |
| [hyperliquid-review](skills/hyperliquid-review/SKILL.md) | Journal and review completed activity | Cost attribution, process grade, one finding |
| [hyperliquid-engineer](skills/hyperliquid-engineer/SKILL.md) | Build or review Hyperliquid integrations | Typed adapter, tests, security findings |

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

## Public wallet diagnostics

Try `hl-skills audit example --out ./wallet-audit-example --json` after installing the CLI. The synthetic fixture produces an observed net of 34.75 USDC: 40 closed PnL minus 2.75 signed fees plus -2.5 funding. A copied `hyperliquid-wallet-audit` skill can run the same workflow with `node scripts/wallet-audit.mjs`, without installing this package or another skill.

Live capture needs only a public account, network and inclusive window. Read `report.md` alongside `coverage` in `report.json`: an exhausted API page does not establish complete history, and a finite budget or failed read stays partial. Snapshots describe sequential capture time, not historical state at window end.

## Updates and migration

Version 0.2.0 renames `hyperliquid-research` to `hyperliquid-analyze` and `hyperliquid-operate` to `hyperliquid-execute`, and adds `hyperliquid-setup`. `hyperliquid-review` specifically means performance and process analysis after activity; `hyperliquid-analyze` handles markets and strategies beforehand.

Reinstall to get the current names. Update saved prompts and harness configuration, then remove the old installed directories only after checking for local edits. No alias skills are retained. Other skills and credentials are unaffected by the repository rename.

Pin `galleon-hyperliquid-skills@0.4.0` for a reproducible npm release, or use `@latest` for the current published package. Skill installers and deployers should pin a reviewed source revision and inspect changes before upgrading.

## CLI

```bash
hl-skills catalog
hl-skills validate .
hl-skills audit example --out ./wallet-audit-example --json
hl-skills audit capture --address <public-account> --network mainnet --start 2026-10-01T00:00:00Z --end 2026-10-02T00:00:00Z --out ./wallet-audit-live --json
hl-skills audit analyze --input ./wallet-audit-live/capture.json --out ./wallet-audit-reproduced --json
hl-skills risk --side long --equity 10000 --risk-percent 0.5 --entry 3000 --stop 2900 --stop-slippage-bps 10 --entry-fee-bps 1.5 --exit-fee-bps 4.5 --size-decimals 4 --json
hl-skills funding --side short --notional 25000 --rate 0.0000125 --interval-hours 1 --hours 24 --json
hl-skills liquidation --side long --mark 3000 --liquidation 2500 --json
hl-skills review --side long --size 0.5 --entry 3000 --exit 3090 --entry-fee 0.25 --exit-fee 1.2 --funding -0.4 --risk-usd 50 --json
```

The package CLI performs local arithmetic, corpus validation and public-wallet audits. `audit example` and `audit analyze` are offline; `audit capture` uses bounded sequential public Info reads without keys. It writes a human report, decimal-string JSON accounting and raw evidence with SHA256. The wallet audit covers validator-operated perpetual accounting and current exposure, reports spot balances separately, and excludes spot/HIP-3 activity from its outcome. It preserves pagination, history-retention, initial-inventory and denomination gaps; it does not produce a complete portfolio return, copy ranking or stop-protection verdict. See the [wallet-audit contract](skills/hyperliquid-wallet-audit/references/output-contract.md). The separate setup helper performs narrow public market reads. Neither provides key handling, signing or trading submission.

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

From the monorepo root, using Bun 1.3.14:

```bash
bun install --frozen-lockfile
bun run check
bun run pack
```

CI checks style, strict types, tests, skill metadata, links, and the npm payload. Package changes on `main` also publish an immutable Agent Skills discovery index and one archive per skill. npm releases are published separately.

## Contributing

Start with [CONTRIBUTING.md](CONTRIBUTING.md). Protocol claims need a current primary source, a test or reproducible read, and explicit failure behavior.

Report vulnerabilities through [private vulnerability reporting](https://github.com/galleonlabs/crypto-defi-skills/security/advisories/new).

## License and credit

[MIT licensed](LICENSE). Preserve the copyright and permission notice when reusing copies or substantial portions. See [attribution guidance](ATTRIBUTION.md) for an optional credit line naming Andrew Wilkinson and Galleon Labs.

See [SOURCES.md](SOURCES.md) for provenance.
