# LP Skills

[![CI](https://github.com/galleonlabs/lp-skills/actions/workflows/ci.yml/badge.svg)](https://github.com/galleonlabs/lp-skills/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/galleon-lp-skills)](https://www.npmjs.com/package/galleon-lp-skills)
[![MIT](https://img.shields.io/badge/license-MIT-0f766e)](LICENSE)

Agent skills and deterministic tools for liquidity provision on Uniswap and Aerodrome.

## Install

Install all skills with the open Agent Skills installer:

```bash
npx skills add galleonlabs/lp-skills
```

Install one skill:

```bash
npx skills add galleonlabs/lp-skills --skill lp-monitor
```

Install the read-only CLI:

```bash
npm install --global galleon-lp-skills
```

The repository also ships Codex and Claude Code plugin manifests. Cursor discovers the same `SKILL.md` files.

## Skills

| Skill | Use it for | Output |
|---|---|---|
| `lp-research` | Compare pools before deploying capital | Dated evidence, risk gates, ranked choices |
| `lp-plan` | Design a position in a chosen pool | Exact unsigned plan, range, budgets, preflight |
| `lp-monitor` | Inspect an existing position | P&L versus HOLD, range state, action verdict |
| `lp-operate` | Carry out an explicit wallet action | Confirmed steps, receipts, state reconciliation |
| `lp-engineer` | Build or review LP integrations | Adapter contract, tests, security findings |

Coverage includes Uniswap v2, v3, and v4, plus Aerodrome classic pools and Slipstream concentrated pools.

## CLI

```bash
lp-skills catalog
lp-skills validate .
lp-skills range --price 1.25 --width 10 --tick-spacing 60 --json
lp-skills status --tick-current 100 --tick-lower 0 --tick-upper 200 --edge-buffer 20 --json
lp-skills economics --capital 10000 --fees 120 --incentives 40 --costs 25 --days 30 --json
```

The CLI performs local arithmetic and validation. It has no RPC, wallet, key, signing, or submission code.

## Operating rules

- Bind every plan to chain ID, wallet, protocol, pool address, token order, decimals, and a fresh block.
- Treat chain state as authority. Caches and dashboards are hints.
- Separate swap fees, incentives, divergence from HOLD, gas, slippage, MEV, and tax.
- Treat Aerodrome fee and gauge reward routes as protocol-specific choices. Never add both without proof.
- Treat Uniswap v4 hooks as separate trust domains.
- A simulation is preflight. Only a mined receipt plus a state reread proves execution.
- Never retry an ambiguous write.

## Repository checks

```bash
bun install
bun run check
```

`bun run check` runs style gates, strict type checks, tests, skill validation, and a production build. CI also checks the npm payload. Every change to `skills/` on `main` publishes an immutable Agent Skills discovery index and one archive per skill.

## Contributing

Start with [CONTRIBUTING.md](CONTRIBUTING.md). New protocol claims need a primary source, a test or reproducible read, and explicit failure behavior.

Security reports belong in [private vulnerability reporting](https://github.com/galleonlabs/lp-skills/security/advisories/new), not public issues.

## License

MIT. See [SOURCES.md](SOURCES.md) for research and implementation provenance.
