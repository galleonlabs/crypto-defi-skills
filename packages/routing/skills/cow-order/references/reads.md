# Read recipes and sources

Reviewed 2026-10-25. These recipes establish documented interfaces, not a live account or executed outcome.

Official SDK packages expose `TradingSdk.getQuoteOnly` (owner address, no signer) and `OrderBookApi.getQuote`, `getOrder` and `getTrades`; verify signatures in the installed version's types. Direct REST uses the chain-specific official base, for example `https://api.cow.fi/mainnet/api/v1`.

`GET /orders/{uid}` and `GET /trades?orderUid={uid}` inspect an existing Ethereum order. Other chains use their own documented bases. Use `POST /quote` for the exact typed quote request, not `POST /orders`, which submits a signed intent. API-indexed trade data still needs receipt corroboration for settlement claims.

## Primary sources

- [Official SDK trading package](https://github.com/cowprotocol/cow-sdk/tree/main/packages/trading)
- [Official SDK order-book package](https://github.com/cowprotocol/cow-sdk/tree/main/packages/order-book)
- [Order Book API](https://api.cow.fi/docs/)
