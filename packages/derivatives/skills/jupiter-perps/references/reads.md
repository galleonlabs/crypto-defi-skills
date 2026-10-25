# Read recipes and sources

Reviewed 2026-10-25. These recipes establish documented interfaces, not a live account or executed outcome.

Official documentation exposes Position, Custody and PositionRequest account structures. Use Solana `getAccountInfo`/`getMultipleAccounts` with matching verified program/IDL and account ownership, plus `getTransaction` for a known request signature.

Read Position `owner`, `pool`, `custody`, `collateralCustody`, `side`, `sizeUsd`, `collateralUsd` and `cumulativeInterestSnapshot`. For PositionRequest read `requestChange`, `requestType`, `sizeUsdDelta`, `collateralDelta`, `priceSlippage`, `jupiterMinimumOut`, `entirePosition` and `executed`. Preserve field-specific scaling from the actual deployed layout. No current first-party Perps REST execution endpoint is assumed.

## Primary sources

- [Jupiter Perps API status](https://developers.jup.ag/docs/perps)
- [Jupiter Position account](https://developers.jup.ag/docs/perps/position-account)
- [Jupiter PositionRequest account](https://developers.jup.ag/docs/perps/position-request-account)
