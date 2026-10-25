# Read recipes and sources

Reviewed 2026-10-25. These recipes establish documented interfaces, not a live account or executed outcome.

Official SDK README documents `VelocityClient`, `BulkAccountLoader`, `User`, `PerpMarkets`, `PRICE_PRECISION`, `BASE_PRECISION` and `QUOTE_PRECISION`. Reuse an existing read-only client or decode current program accounts with matching verified IDL; do not generate a live signer for a diagnostic.

Check `await client.subscribe()` is true. `getPerpMarketAccountOrThrow(marketIndex)` reads the market; `getMMOracleDataForPerpMarket(marketIndex, slot)` supplies the matching oracle data. Use official `User` risk methods with current types. The SDK is CommonJS/interoperability-oriented; follow its actual build contract. Always unsubscribe after a bounded inspection.

## Primary sources

- [Velocity SDK and read methods](https://github.com/velocity-exchange/velocity-v1/tree/master/packages/sdk)
- [Drift-to-Velocity migration](https://github.com/velocity-exchange/velocity-v1/blob/master/docs/DRIFT-TO-VELOCITY.md)
- [Velocity docs](https://docs.velocity.exchange)
