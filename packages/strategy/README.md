# Galleon DeFi Strategy Skills

Test a simple investment rule against a dated daily price series and inspect every modeled trade, cost and drawdown. The same pure JavaScript engine runs in Node or a browser. This is a research tool for daily long-only spot rules.

```bash
npx skills add galleonlabs/crypto-defi-skills --skill galleon-defi-strategy-backtest
npx --package galleon-defi-strategy-skills@0.1.0 defi-strategy-skills catalog --json
```

The [skill](skills/galleon-defi-strategy-backtest/SKILL.md) turns an idea into a supported strategy specification, validates evidence and reports the limitations of the result. It includes a deterministic executable and a clearly labeled synthetic example.

## Run a reproducible local test

From the independently installed skill directory:

```bash
node scripts/backtest.mjs --data examples/synthetic-daily.json --spec examples/sma.json
```

The npm CLI also accepts `defi-strategy-skills backtest --data <dataset.json> --spec <spec.json>`. Node 20+ is sufficient; no wallet, credentials, network requests or dependencies are needed by the simulator. The corpus CLI provides catalog, show and validation commands.

Supported rules are buy-and-hold, fixed-budget DCA and long/cash simple moving-average timing. Signals execute at the next daily observation with explicit fee and adverse slippage assumptions. The report includes a same-cost, same-contribution buy-and-hold comparison, all trades, the equity curve, cash-flow-neutral time-weighted return and drawdown, and SHA-256 hashes of the exact input files. It retains cash that a rule has not invested and marks open positions without a forced final sale.

[Input and accounting contract](skills/galleon-defi-strategy-backtest/references/model.md) documents contributions, price semantics and timing. [Research workflow](skills/galleon-defi-strategy-backtest/references/research.md) covers data provenance, unseen periods and cost sensitivity.

Daily aggregate prices do not support intraday stops, venue liquidity, derivatives funding, leverage or realistic execution claims. A positive backtest is historical behavior under stated assumptions. The pack does not deploy strategies or trade.

## Development and provenance

Run `bun run check` in this directory, then the repository's check, pack and consumer smoke. Math fixtures test next-bar timing, leakage, costs, budget exhaustion, cash flows, drawdown and malformed evidence. Routing/behavior datasets are review cases, not measured model scores. See [SOURCES.md](SOURCES.md) and [CHANGELOG.md](CHANGELOG.md).

[MIT licensed](LICENSE). Preserve the copyright and permission notice when reusing this engine or skill; see [ATTRIBUTION.md](ATTRIBUTION.md).
