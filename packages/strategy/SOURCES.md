# Sources and verification

Reviewed 2026-10-02. The engine and strategy procedures are independently authored, MIT licensed and ship no provider runtime or historical data corpus.

- [CoinGecko Demo market-chart contract](https://docs.coingecko.com/demo/reference/coins-id-market-chart): array shape, automatic daily 00:00 UTC granularity above 90 days, current Demo historical limit and documented key requirement. Public keyless access is a separate diagnostic result, not guaranteed by the authenticated Demo contract.
- [CoinGecko methodology](https://www.coingecko.com/en/methodology): aggregate market observations differ from venue fills.
- [CFA Institute GIPS handbook](https://www.gipsstandards.org/standards/gips-standards-for-firms/gips-standards-handbook-for-firms/): accounting principle of valuation at external flows and geometric linking. No professional performance-standard compliance is claimed.
- [Minara Strategy Studio](https://minara.ai/product/strategy-studio): reference for a visible specification, equity curve, costs, drawdown and benchmark. The Minara runtime, strategy code and datasets are not copied. Our daily long-only model does not claim its minute-level venue costs, live deployment or engine equivalence.

## What is verified

Offline hand-calculated cases cover next-observation timing, fees, adverse slippage, DCA budget exhaustion, positive deposits without fabricated profit, peak-to-trough drawdown, SMA warmup, future-observation leakage and unsupported/malformed inputs. The same pure ESM engine serves the CLI and can be imported by a browser. Exact local input bytes are hashed by the CLI wrapper.

The shipped 60-observation example is synthetic, explicitly identified in its dataset and every output report. It validates installation and helps inspect behavior; it is not evidence about any real token. Automated tests make no network calls and no account actions. Structural routing/behavior cases are not model scores.

The simulator is deliberately limited to daily single-asset fractional spot units and cash. It does not establish venue execution realism, profitability, future performance, a running paper strategy or a live deployment.
