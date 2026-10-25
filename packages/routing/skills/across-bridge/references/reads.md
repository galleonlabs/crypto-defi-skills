# Read recipes and sources

Reviewed 2026-10-25. These recipes establish documented interfaces, not a live account or executed outcome.

API host `app.across.to` with base path `/api`; the [current API reference](https://docs.across.to/api-reference) requires `Authorization: Bearer` from private config and an `integratorId`.

- `GET /swap/approval`: `originChainId`, `destinationChainId`, `inputToken`, `outputToken`, `amount`, `depositor`, explicit `recipient` and selected `tradeType`.
- `GET /deposit/status`: use `originChainId` + `depositId`, OR `depositTxnRef`, OR `sweepTxnRef` as documented. Do not mix incompatible selectors.
- `GET /deposits`: disambiguate multiple deposits in a funding/sweep transaction.

Keep `actionsSucceeded`, action-target asset/recipient/result and refund hashes separate from `status: filled`. Legacy cURL snippets may omit current auth; follow the current API reference contract.

## Primary sources

- [Across API access](https://docs.across.to/api-reference)
- [Across Swap approval schema](https://docs.across.to/api-reference/swap/approval/get)
- [Across status and action evidence](https://docs.across.to/api-reference/deposit/status/get)
