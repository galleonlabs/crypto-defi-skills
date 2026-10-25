# Read recipes and sources

Reviewed 2026-10-25. These recipes establish documented interfaces, not a live account or executed outcome.

Current HTTP base `https://api.derive.xyz/v3`, with documented JSON-RPC/HTTP POST method schemas:

- `public/get_ticker`: exact `instrument_name`; returns mark/index/book/Greeks.
- `public/order_quote`: unsigned prospective-order estimate; no account authentication required by the documented public path.
- `public/get_margin`: fully simulated portfolio with chosen margin manager/type; excludes open-order margin.
- Existing scoped `private/get_subaccount`, `private/get_order`, positions and history corroborate account outcomes.

Load exact parameter schemas from the linked current references before making a call. Option names use `<CURRENCY>-<YYYYMMDD>-<STRIKE>-<C|P>`; decimals in strikes use underscores. Do not synthesize an instrument without discovery.

## Primary sources

- [Derive instrument names](https://docs.derive.xyz/trading/instrument-names.md)
- [Derive public ticker](https://docs.derive.xyz/api-reference/market-data/publicget_ticker.md)
- [Derive net-margin simulation](https://docs.derive.xyz/api-reference/subaccounts/publicget_margin.md)
- [Derive order dry run](https://docs.derive.xyz/api-reference/orderbook/publicorder_quote.md)
