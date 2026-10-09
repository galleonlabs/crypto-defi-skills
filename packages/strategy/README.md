# Galleon DeFi Strategy Skills

[![npm](https://img.shields.io/npm/v/galleon-defi-strategy-skills?color=0f766e)](https://www.npmjs.com/package/galleon-defi-strategy-skills)
[![MIT](https://img.shields.io/badge/license-MIT-0f766e)](LICENSE)

**Put an investment rule through its paces.**

Run daily spot simulations with explicit costs, next-observation execution, cash-flow-neutral returns and a same-cost buy-and-hold benchmark. Validate a frozen rule on a later period and under higher costs before drawing conclusions.

[Install one skill](#install-one-skill) · [Try a first task](#try-a-first-task) · [Sources](SOURCES.md) · [All packs](https://github.com/galleonlabs/crypto-defi-skills#independent-packs)

## Install one skill

```bash
npx skills add galleonlabs/crypto-defi-skills --skill galleon-defi-strategy-backtest
```

Choose the receiving agent in the installer. Keep the skill's references and scripts with its `SKILL.md`. Each pack works on its own. For a complete native Hermes desk, use [Boomkin](https://github.com/galleonlabs/boomkin).

## Try a first task

> Use galleon-defi-strategy-backtest to compare a moving-average rule with buy-and-hold on [dated daily dataset]. State fees and slippage, inspect every modeled trade and explain the limits of the result.

Expected result: the workflow's required evidence, explicit gaps and a concrete next step. Supply real task inputs in place of the bracketed placeholders. Provider access is configured in your agent; installation adds the procedures and local resources.

## Browse the npm corpus

```bash
npx skills add galleonlabs/crypto-defi-skills --skill galleon-defi-strategy-backtest
npx --package galleon-defi-strategy-skills@0.2.0 defi-strategy-skills catalog --json
```

The [skill](skills/galleon-defi-strategy-backtest/SKILL.md) turns an idea into a supported strategy specification, validates evidence and reports the limitations of the result. It includes a deterministic executable and a clearly labeled synthetic example.

## Run a reproducible local test

From the independently installed skill directory:

```bash
node scripts/backtest.mjs --data examples/synthetic-daily.json --spec examples/sma.json
```

The npm CLI also accepts `defi-strategy-skills backtest --data <dataset.json> --spec <spec.json>`. Node 20+ is sufficient; no wallet, credentials, network requests or dependencies are needed by the simulator. The corpus CLI provides catalog, show and validation commands.

Supported rules are buy-and-hold, fixed-budget DCA and long/cash simple moving-average timing. Signals execute at the next daily observation with explicit fee and adverse slippage assumptions. The report includes a same-cost, same-contribution buy-and-hold comparison, all trades, the equity curve, cash-flow-neutral time-weighted return and drawdown, and SHA-256 hashes of the exact input files. It retains cash that a rule has not invested and marks open positions without a forced final sale.

## Validate a frozen strategy

```bash
node scripts/validate-strategy.mjs --data examples/synthetic-daily.json --spec examples/sma.json --split 30
# npm CLI: defi-strategy-skills validate-strategy --data <dataset.json> --spec <spec.json> [--split <index>]
```

The split is the zero-based index of the first held-out observation; the default is half the observations, rounded down. The runner tests the supplied rule with baseline costs and higher costs in each chronological period, with the same-cost benchmark in all four runs. Higher fees and slippage each default to the larger of twice baseline or baseline + 10 basis points, capped at 1000. Override them with `--stress-fee-bps` and `--stress-slippage-bps`; neither may decrease, and at least one must increase.

Each period restarts in declared initial cash, with zero asset units, fresh warmup and only its own dated contributions. Reports retain separate balances, trades, curves, costs and sensitivity differences in `periods.reference` and `periods.heldOut`. The reference account's final position and pending decision do not carry over. This is an independent restart comparison; it does not optimize parameters or prove that the user had not already inspected the later data. `ok: true` means the experiment ran, not that a strategy passed an investment or live trading gate.

Minimum observations per period are 3 for buy-and-hold, `max(3, everyBars + 2)` for DCA and `period + 2` for SMA. These permit accounting checks and potential fills, not statistical significance. Short periods and cash-only runs are flagged in the report.

The same browser-safe engine exposes fixed starting templates with explicit data and horizon requirements:

| Template | Rule | Minimum total observations at a half split |
| --- | --- | --- |
| `buy-and-hold` | Next-observation investment of funded cash | 6 |
| `weekly-dca` | Funded purchase every 7 observations; specify `amountUsd` | 18 |
| `sma-10` | Long/cash 10-observation SMA | 24 |
| `sma-30` | Long/cash 30-observation SMA | 64 |

These fixed choices are starting points, not recommended allocations or optimized winners. Each template declares 180 daily observations as a research horizon to request; longer history and multiple regimes may be needed.

```js
import { STRATEGY_TEMPLATES, createStrategySpec, runStrategyValidation } from 'galleon-defi-strategy-skills/engine';
const spec = createStrategySpec('weekly-dca', {
  initialCashUsd: 1000, amountUsd: 100, feeBps: 10, slippageBps: 20,
});
const report = runStrategyValidation(dataset, spec, { splitIndex: 90 });
```

The independently installed skill exposes the same exports from `scripts/engine.mjs`, with no host, wallet or network dependencies. Boomkin can run this exact pinned algorithm in its research lab; historical simulation remains separate from live observations and account state.

[Input and accounting contract](skills/galleon-defi-strategy-backtest/references/model.md) documents contributions, price semantics and timing. [Research workflow](skills/galleon-defi-strategy-backtest/references/research.md) covers data provenance, unseen periods and cost sensitivity.

Daily aggregate prices do not support intraday stops, venue liquidity, derivatives funding, leverage or realistic execution claims. A positive backtest is historical behavior under stated assumptions. The pack does not deploy strategies or trade.

## Development and provenance

Run `bun run check` in this directory, then the repository's check, pack and consumer smoke. Math fixtures test next-bar timing, leakage, costs, budget exhaustion, cash flows, drawdown, split accounting, independent warmup, sensitivity and malformed evidence. Routing/behavior datasets are review cases, not measured model scores. See [SOURCES.md](SOURCES.md) and [CHANGELOG.md](CHANGELOG.md).

[MIT licensed](LICENSE). Preserve the copyright and permission notice when reusing this engine or skill; see [ATTRIBUTION.md](ATTRIBUTION.md).
