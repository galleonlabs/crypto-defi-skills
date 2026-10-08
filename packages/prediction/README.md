# Galleon DeFi Prediction Skills

Research a Polymarket market or explain a resolution using public reads. No wallet, signing key, order placement or redemption is required.

| Task | Skill |
| --- | --- |
| Resolve a market and outcome, inspect its rules and order book | `galleon-prediction-market-research` |
| Reconcile resolution, payout fractions and actual wallet receipt | `galleon-prediction-market-resolution` |

Install the whole pack with `npx skills add https://github.com/galleonlabs/crypto-defi-skills/tree/main/packages/prediction`, or select one skill with `--skill`. The npm CLI `defi-prediction-skills catalog --json` lists the corpus; it does not call Polymarket.

The research skill includes a local book summary helper. It preserves outcome identifiers as strings, finds best prices independently of array ordering, distinguishes absent liquidity and stale timestamps, and estimates gross buy depth for a supplied share count. It produces approximate research arithmetic, with fees, changes to liquidity and execution explicitly outside its model.

Current official documentation supports two position ledgers. Resolve Gamma `version` before using CTF `tokenId` or Protocol V2 `positionId`; the historical CLI's CTF examples do not prove V2 support. See [sources](SOURCES.md). No installed CLI, hypothetical depth or advertised payout establishes a settled trade.
