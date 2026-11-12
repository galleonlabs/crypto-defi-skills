# Read recipes and sources

Reviewed 2026-11-11. These recipes establish documented interfaces, not a live account or executed outcome.

Host `https://api.across.to`. Every request uses `Authorization: Bearer` from private config. Unauthenticated `GET /v1/capabilities` returned HTTP 401 `unauthenticated` on 2026-11-11. The legacy `integratorId` does not identify a V5 integration. Across V4 and the Swap API family are deprecated, including `app.across.to/api`, `GET /swap/approval`, `GET /suggested-fees`, `GET /deposit/status` and `GET /deposits`.

- `GET /v1/capabilities`: chains, tokens, route availability and limits. Query names are `originChainId`, `destinationChainId`, `originToken` and `destinationToken`.
- `POST /v1/quotes`: price one transfer. `amountType` is `exact_input` (default), `exact_output` or `min_output`. Input amount is `origin.amount`; output amount is `destination.amount`. Tokens are `{ chainId, address }`. `origin.depositor` funds the transfer and `destination.recipient` receives output. `maxFee` is `{ bps, fixedUsd }`. Do not send legacy `tradeType`, `slippage` or `integratorId`.
- `GET /v1/transfers/{orderId}`: track the quote's `orderId`. The path id is case-sensitive and the request takes no query parameters. Stop when `status.isTerminal` is true. Branch on `status.state` (`pending`, `completed`, `refunded`, `failed`) and read `status.reason`.

`POST /v1/quotes/{orderId}/executions` submits execution results only when `nextActions` ends with `submit_execution`. That call is not a read.

## Primary sources

- [Across API skill](https://github.com/across-protocol/skills/blob/master/skills/SKILL.md)
- [Quote and execute](https://github.com/across-protocol/skills/blob/master/skills/quote-and-execute/SKILL.md)
- [Tracking](https://github.com/across-protocol/skills/blob/master/skills/tracking-transactions/SKILL.md)
- [Migration from the Swap API](https://github.com/across-protocol/skills/blob/master/skills/migration/SKILL.md)
