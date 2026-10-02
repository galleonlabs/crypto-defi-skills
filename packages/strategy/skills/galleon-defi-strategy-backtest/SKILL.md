---
name: galleon-defi-strategy-backtest
description: Test daily long-only buy-and-hold, DCA or simple moving-average strategies against dated price evidence with costs, cash flows, drawdown and a reproducible benchmark. Use when evaluating a crypto investment rule, comparing historical scenarios or checking a backtest for timing and accounting errors.
license: MIT
compatibility: Portable agent instructions. Bundled offline backtest requires Node.js 20+ and local JSON files. The pure ESM engine also runs in browsers. No provider account, wallet, signer, trading engine or scheduler is bundled.
metadata:
  author: Galleon Labs
  version: "0.1.0"
---

# Daily strategy research

Turn a supported rule into a reproducible experiment whose result can be checked. Keep historical fit, unseen-period behavior, paper observation and live trading as separate evidence.

## Define the experiment

Resolve the requested asset to its provider identity, data period and price type. Write entry/exit logic, cash budget, any positive contributions, fees and adverse slippage before evaluating performance. Reuse the user's terms and tools. State assumptions for missing research parameters; do not silently translate unsupported leverage, funding, intraday stops or portfolio rotation into this daily spot model.

The bundled engine supports:

- **Buy-and-hold:** invest available cash at the next observation, including subsequent contributions.
- **DCA:** decide a fixed USD purchase every N observations, fill at the following observation, and stop spending when funded cash runs out. Contributions must be explicitly supplied.
- **SMA:** after N observations of warmup, target the asset when the current observation exceeds its trailing N-observation average, otherwise target cash. Change exposure at the next observation.

Use [the model contract](references/model.md) to prepare JSON. Unknown strategy fields fail validation; a prose thesis is not executable code. If a rule is unsupported, return its precise specification and the required data/engine capabilities instead of claiming it ran.

## Establish the data

Accept a local dataset with exact identity, USD units, daily timestamps, provider/source, retrieval time and aggregate-snapshot versus venue-close semantics. Reject nonpositive prices, duplicate/reversed dates, daily gaps or observations after retrieval. Do not fill gaps, reuse a stale cached value as a new candle or assume an aggregate price was tradeable.

For public historical data, use the user's existing official source or the CoinGecko daily market-chart procedure in [research and source selection](references/research.md). The separately installable `galleon-defi-market-snapshot` can collect compatible history, but this skill also works alone with the documented JSON format. No API key is required by the backtest; provider access is a separate read.

## Run and inspect

From this skill directory:

```bash
node scripts/backtest.mjs --data examples/synthetic-daily.json --spec examples/sma.json
node scripts/backtest.mjs --data <daily-data.json> --spec <strategy.json>
```

The shipped example is synthetic. Use it to verify the installation and accounting, never as evidence about an actual token. The script reads only the two local files and prints JSON; it does not download data, sign, submit, store account state or create jobs. Preserve its input hashes with the report.

Inspect the first trade: `decisionAt` must precede `executedAt` by one day. Check modeled buy/sell price direction, fees, cash and contribution totals, retained uninvested cash and final open exposure. Compare the identical-flow, identical-cost benchmark. Use return index and drawdown to avoid counting a deposit as profit. Total contributed capital and net profit should reconcile to ending marked equity.

## Test the thesis honestly

Apply [the research workflow](references/research.md). Freeze the rule and assumptions before testing an unseen period; report its dates and sample size separately. Repeat a small declared range of costs and parameters to expose sensitivity. Report the attempted variants, including losses. Do not optimize across the full dataset and then label the same history out of sample.

A stop loss needs intraday price paths and a specified fill convention; this engine cannot model one from daily aggregate samples. Small samples, a single surviving asset and limited provider history constrain conclusions. Do not add a Sharpe, win rate or annualized figure whose definition/data have not been established.

## Deliver

Return the written rule, asset/data identity, dates, input hashes, starting/contributed capital, ending marked equity, net profit, time-weighted return, maximum drawdown, modeled fees/slippage and benchmark differences. Include the equity curve and trades when useful, plus the material assumptions and limitations from the report. State whether evidence was synthetic, aggregate market data or venue history.

Completion means the supported specification ran on validated dated inputs, accounting reconciled and the report includes a benchmark and limits. A historical result does not establish future performance, paper deployment, venue fill realism or permission to trade. For a requested next step, prepare the concrete terms and hand off to the user's existing venue/scheduler workflow within their authority.
