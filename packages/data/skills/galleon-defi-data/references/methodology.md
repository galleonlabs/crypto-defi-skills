# Data interpretation and provenance

## Identity and freshness

Resolve a token to its provider ID; confirm chain and contract for protocol use. CoinGecko IDs, DefiLlama slugs, EVM chain IDs, GeckoTerminal network IDs and ticker symbols are different namespaces. Do not derive one from another without a verified mapping. Pool addresses additionally require token order, fee tier and deployment identity when used for LP decisions.

Keep `retrievedAt` (your UTC request completion) distinct from `observedAt` (the provider's timestamp). A timestamped price can be fresh while other metrics in the same response are delayed. When no source timestamp is supplied, report unknown age rather than relabeling retrieval time as observation time. Use an age budget suitable for the task: a daily ecosystem report and a near-term execution plan have different needs. The diagnostic's 300-second default is a connectivity check policy, not a universal trading tolerance.

Keep raw units and definitions, including currency, token decimals, percentage versus fraction, seconds versus milliseconds, UTC day/epoch boundaries and whether values are instantaneous, trailing or cumulative. Missing, null, unavailable and zero are distinct. Pagination, chain filters and limited permissions can exclude results even when a request succeeds.

## Prices and liquidity

A CoinGecko aggregate price combines markets according to its [methodology](https://www.coingecko.com/en/methodology). It is not an onchain oracle or an executable bid/ask for a given size. Thin or manipulated pools, stale venues, bridge variants and unverified supply can make price, volume, FDV or market cap misleading. FDV uses a different supply basis from circulating market cap; a null market cap is not zero.

For actionable comparisons, inspect pool reserves/active liquidity, recent swaps, price impact, gas, fees and slippage using the protocol's maintained tooling. Corroborate token identity and onchain state at a recorded block. Do not treat two aggregators as independent merely because their domains differ: DefiLlama's `coingecko:` namespace can share CoinGecko input with the other observation.

## TVL, fees and revenue

TVL is a provider-defined valuation of included locked assets, not deposits attributable to a particular user or available withdrawal liquidity. Inspect the protocol adapter and category treatment for borrowed assets, staking, pool2, double-counting, bridged assets and chain aggregation. A USD TVL move can be repricing without net deposits; measure token flows separately when the question is about inflows.

Protocol fees, protocol revenue and holder revenue are not interchangeable. Compare the same accounting definition and trailing period. Do not annualize one exceptional day without labeling the extrapolation. Historical revisions and adapter changes can alter the time series.

## Yield

[DefiLlama yield methodology and adapters](https://github.com/DefiLlama/yield-server) distinguish base yield, reward emissions and their aggregation. Carry the returned pool ID, project, chain, tokens, TVL, APY components, reward tokens and source time. Inspect the actual adapter for a shortlisted pool's compounding, reward eligibility, forecast/historical mix and update cadence. A scalar APY is neither a promised return nor necessarily the realized fee APR for the user's chosen concentrated-liquidity range.

Compare the same capital basis and time horizon. Separate reward-token price exposure, compounding assumptions, out-of-range time, impermanent loss, lending utilization, debt/liquidation exposure and incentive expiry. Subtract expected gas, swaps, automation/provider charges, borrowing and exit costs without double-counting charges already netted in the source. Highest displayed APY can reflect temporary incentives, thin capacity or a failed/empty-data assumption; validate before ranking it as best.

For product assessments, extend these metric checks with [yield, collateral, oracle and exit diligence](diligence.md). Preserve canonical block hashes and finality when conclusions depend on chain state.

## Evidence record

A concise record can be embedded in an analysis or saved as a local artifact:

```json
{
  "provider": "coingecko",
  "access": "public-keyless",
  "source": "https://api.coingecko.com/api/v3/simple/price",
  "parameters": {"ids": "bitcoin", "vs_currencies": "usd"},
  "identity": {"namespace": "coingecko", "id": "bitcoin"},
  "metric": "price",
  "unit": "USD",
  "observedAt": "provider timestamp in UTC",
  "retrievedAt": "request completion in UTC",
  "chainId": null,
  "block": null,
  "limitations": ["aggregate observation; no executable size quote"]
}
```

Use actual timestamps in output; the strings above describe fields, not a sample live observation. Record methodology URLs and assumptions alongside comparative metrics. Never include secret headers, private account identifiers, user portfolio addresses unless needed, or authenticated API paths in public artifacts.
