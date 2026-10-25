# Historical evidence tools

Use the [official Info endpoint](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint) or SDK history reads for the exact user/subaccount, network, DEX and review window. An API-wallet address is not the account whose fills and balances must be reviewed. No signer, wallet approval or builder registration is needed.

Follow documented pagination and preserve returned identities, timestamps, fee tokens and signed funding. Deduplicate fills by their exchange identity; a truncated history is partial evidence, not a complete return series. The [review evidence contract](review-evidence.md) identifies required records and their limits.

Run `scripts/review.mjs` only on explicit reconciled inputs. Its round-trip arithmetic does not establish that a trade happened, authenticate a source or supply missing history. Current positions, sampled portfolio graphs, fills and ledger transfers answer different questions and must not be added as independent profit.

Official Info guidance checked 2026-10-25. Report historical coverage and unavailable intervals; no private account read or financial action was performed during this documentation review.
