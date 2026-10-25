# Read recipes and sources

Reviewed 2026-10-25. These recipes establish documented interfaces, not a live account or executed outcome.

Official `pendle-ai` Boros plugin currently documents read tools such as `get_markets`, `get_orderbook`, `get_funding_rate_symbols`, `get_positions`, `get_collateral`, `get_orders` and `get_settlement_summary`. Discover exact schemas before a call.

`@pendle/boros-mcp` is a local stdio server with stored delegated signing and owner-wallet callbacks; it is not an unsigned-only remote data endpoint. Do not launch or provision it merely to validate these instructions. Current SDK is `@pendle/boros-sdk-public`; select current official math and API examples rather than the superseded SDK package name. `place_order`, `cash_transfer`, `pay_gas` and agent setup mutate state.

## Primary sources

- [Official Boros plugin and tool effects](https://github.com/pendle-finance/pendle-ai/tree/main/packages/plugins/pendle-boros)
- [Boros SDK](https://docs.pendle.finance/boros-dev/Backend/sdk)
- [Boros delegated-agent scope](https://docs.pendle.finance/boros-dev/Backend/agent)
