# Sources and verification

Accounting/data references reviewed 2026-10-02; competitor research updated 2026-10-09. The engine and strategy procedures are independently authored, MIT licensed and ship no provider runtime or historical data corpus.

- [CoinGecko Demo market-chart contract](https://docs.coingecko.com/demo/reference/coins-id-market-chart): array shape, automatic daily 00:00 UTC granularity above 90 days, current Demo historical limit and documented key requirement. Public keyless access is a separate diagnostic result, not guaranteed by the authenticated Demo contract.
- [CoinGecko methodology](https://www.coingecko.com/en/methodology): aggregate market observations differ from venue fills.
- [CFA Institute GIPS handbook](https://www.gipsstandards.org/standards/gips-standards-for-firms/gips-standards-handbook-for-firms/): accounting principle of valuation at external flows and geometric linking. No professional performance-standard compliance is claimed.
- [Minara Strategy Studio](https://minara.ai/product/strategy-studio): reference for a visible specification, equity curve, costs, drawdown and benchmark. The Minara runtime, strategy code and datasets are not copied. Our daily long-only model does not claim its minute-level venue costs, live deployment or engine equivalence.
- [Senpi skill repository at reviewed revision](https://github.com/Senpi-ai/senpi-skills/tree/bb697393ad5f29354c5307c4ac7a33d20d12f141): product comparison for reusable strategy authoring and template discovery. Our fixed spot templates and robustness comparison are independently implemented; Senpi's strategy/runtime code is not copied.
- [Senpi strategy-author shadow-testing reference](https://github.com/Senpi-ai/senpi-skills/blob/bb697393ad5f29354c5307c4ac7a33d20d12f141/senpi-strategy-author/references/shadow-testing.md): comparator for keeping research and actual execution capabilities distinct. Our local historical validation does not claim a paper-trading service or Senpi runtime equivalence.

## What is verified

Offline hand-calculated cases cover next-observation timing, fees, adverse slippage, DCA budget exhaustion, positive deposits without fabricated profit, peak-to-trough drawdown, SMA warmup, future-observation leakage and unsupported/malformed inputs. Additional fixtures check exact chronological splits, independent DCA/SMA restarts, period-specific contributions, cost sensitivity, sample requirements and Node CLI input hashes. The same pure ESM engine serves the CLI and can be imported by a browser. Exact local input bytes are hashed by the CLI wrapper; split and higher-cost assumptions are recorded in the report.

The shipped 60-observation example is synthetic, explicitly identified in its dataset and every output report. It validates installation and helps inspect behavior; it is not evidence about any real token. Automated tests make no network calls and no account actions. Structural routing/behavior cases are not model scores.

The simulator is deliberately limited to daily single-asset fractional spot units and cash. It does not establish venue execution realism, profitability, future performance, a running paper strategy or a live deployment.

Fixed starting templates request 180 daily observations and expose mechanical minimums per period. These are research design defaults, not statistically validated recommendations. Frozen-rule validation runs one supplied rule without optimization; it cannot verify whether its user inspected the later observations before supplying it. Reference and held-out balances remain independent and are never combined with one another or with live account state.
