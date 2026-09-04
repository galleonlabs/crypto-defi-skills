# Strategy evidence

Treat every strategy as a falsifiable rule set, not a story.

## Freeze the claim

Record instrument, DEX, network, bar interval and close rule, data fields, entry, abstention, exit, stop, time exit, sizing, leverage, costs, funding, partial-fill behavior, rejected-order behavior, and the condition that would abandon the idea.

For an imported claim, also record its exact source and retrieval date, every reported parameter set, asset, timeframe, and trial. Missing rules stay missing. Do not supply plausible defaults without labeling them as new assumptions.

## Data record

Save the exact API request, network, fetch time, returned range, gaps, duplicate policy, and any remapped market identity. Keep raw data immutable. Derivations belong in a separate file or step.

## Backtest gates

- Signals at time `t` use only information available at `t`.
- Execution occurs at the stated next observable price.
- Charge effective maker or taker fees, funding at its true interval, spread, size-aware slippage, and borrow interest where relevant.
- Freeze rules before reading the chronological holdout. Looking at a holdout spends it.
- Record every variant and trial, including failed ones and those run by the original source.
- Report trade count, result distribution, expectancy, drawdown, turnover, fees, funding, and dependence on one market or period.
- Resample trades in blocks to preserve streaks. Report a lower confidence bound, not only mean expectancy.

## Falsification

Flip the signal, shuffle entry times, remove the best trades, double costs, split by market and regime, and test sensitivity around each chosen parameter. A result that disappears under a small cost or parameter change is not demonstrated edge.

Use `PASS`, `WEAK`, or `REJECTED`. A profitable in-sample curve with reused holdout data is in-sample evidence only.

## Forward test

Paper signals may create unsigned plans. They must not submit orders. Agree the duration and sample size before the first signal, then compare forward fills and costs with the backtest without changing the rules mid-test.
