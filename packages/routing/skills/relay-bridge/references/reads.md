# Read recipes and sources

Reviewed 2026-10-25. These recipes establish documented interfaces, not a live account or executed outcome.

`POST https://api.relay.link/quote/v2` with required `x-api-key` from private environment settings and JSON fields `user`, `originChainId`, `destinationChainId`, `originCurrency`, `destinationCurrency`, integer-string `amount`, `tradeType` and documented recipient options. This constructs a quote, not an executed transfer.

`GET https://api.relay.link/intents/status/v3?requestId=...` tracks a known request. Preserve `status`, `inTxHashes`, `txHashes`, chains and `updatedAt`; inspect current schema for refund data. Returned item check endpoints can use a different status version, so retain the documented item contract and do not rewrite it blindly.

## Primary sources

- [Relay current quote API](https://docs.relay.link/references/api/get-quote-v2)
- [Relay current status](https://docs.relay.link/references/api/get-intents-status-v3)
- [Relay API access](https://docs.relay.link/references/api/overview)
