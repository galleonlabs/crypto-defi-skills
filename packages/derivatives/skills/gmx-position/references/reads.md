# Read recipes and sources

Reviewed 2026-10-25. These recipes establish documented interfaces, not a live account or executed outcome.

Official package `@gmx-io/sdk`, v2 import `@gmx-io/sdk/v2`:

```ts
const sdk = new GmxApiSdk({ chainId });
const markets = await sdk.fetchMarkets();
```

Use current typed read methods `fetchMarketsInfo`, `fetchPositionsInfo`, `fetchOrders`, `fetchRates` and `getTradingCapacity` with their version-matched argument objects. Inspect installed types for request status lookup rather than guessing an endpoint. The official order examples show prepare/sign/submit and status via `requestId`; signing/submission are excluded from readiness checks. SDK v1 needs separately checked receipt waiting and duplicate protection.

## Primary sources

- [GMX SDK generations](https://docs.gmx.io/docs/sdk/overview/)
- [GMX v2 order lifecycle](https://docs.gmx.io/docs/sdk/v2/examples/)
- [GMX exchange router](https://docs.gmx.io/docs/api/contracts/exchange-router/)
