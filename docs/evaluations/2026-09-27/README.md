# Protocol workflow forward checks

Five synthetic requests were answered by independent in-session agents after reading the new skill and its references, without the expected/forbidden fixture fields. Agents evaluated work outside their authored packages. No signing, transactions or authenticated provider calls occurred in these exercises. The coordinating agent checked the responses against the supplied inputs.

| Request | Observed result | Evidence |
| --- | --- | --- |
| Aave proposed 1,000 borrow; collateral -20%, debt price +5%, HF floor 1.3 | Rejects proposal; stressed HF 1.21905, additional debt ceiling about 688.64 before other constraints | [Response](aave-lido.md) |
| Lido finalized withdrawal owned by a different address | Does not prepare caller as authorized claimant; requests owner and claimable-amount evidence | [Response](aave-lido.md) |
| Uniswap quote-only request; DUTCH_V2 with 1% slippage against a 0.5% limit | Rejects quote, keeps authorization unsigned, routes any future execution to order flow | [Response](uniswap-lifi.md) |
| LI.FI DONE/PARTIAL with destination WETH instead of intended USDC | Returns partial/unreconciled; requires recipient, asset and destination receipt proof | [Response](uniswap-lifi.md) |
| DefiLlama base-APY ranking with missing metrics and multi-asset pools | Returns B then A; excludes missing base and mixed exposure; preserves null rewards | [Response and helper result](yield-boomkin.md) |

These are qualitative forward checks, not a benchmark score, before/after model comparison or proof of live protocol execution. Automated behavioral fixtures separately check corpus structure. Live read-only CoinGecko and DefiLlama observations are recorded in the data package's SOURCES.md; no live wallet operations were needed.

The release pipeline also checks standalone package installs, CLI versions, exported catalogs and all skill resources. `bun run smoke:registry` repeats those checks against exact public npm versions after publication. Boomkin's workflow integrity test must pass after its catalog is pinned to those published versions.
