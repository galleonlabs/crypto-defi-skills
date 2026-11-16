# Agent route lifecycles

Primary sources reviewed 2026-10-08. This is original procedural guidance based on official sources; no upstream scripts, signer or broad tool adapter is bundled.

## Across quote and preparation

Current Across API is V5 at `https://api.across.to` with `Authorization: Bearer`. The [official skill](https://github.com/across-protocol/skills/blob/master/skills/SKILL.md) deprecates the Swap API (`/swap/*`, including `/swap/approval`), `app.across.to/api`, suggested-fees and deposit-status routes. The legacy `integratorId` is not sent. Discover routes with `GET /v1/capabilities` and price with `POST /v1/quotes`. Bind depositor, recipient, refund address, exact asset addresses and raw base units. `amountType` `exact_input` puts the budget in `origin.amount`; `min_output` and `exact_output` put it in `destination.amount`. `maxFee.bps` is basis points of total value loss, not a fraction: `100` is 1%. Do not send legacy `tradeType` or `slippage` (`0.005` or `auto`).

Preserve `orderId`, `expiresAt`, `destination.minAmount`, fee fields and ordered `nextActions`. An `appFeeBps` field is not an unstated fee mandate. Do not cache an executable quote across state changes. A source simulation field proves only its reported scope.

[Embedded-action skill](https://github.com/across-protocol/skills/blob/master/skills/embedded-crosschain-actions/SKILL.md) describes ordered destination calls and dynamically populated balances. Resolve ultimate beneficiary, token, contract and spender for every action. Dynamic "full balance" can consume a handler's execution-time balance; use static bounded amounts when the downstream obligation requires an exact amount. If the selected action schema is ambiguous, stop before any transfer.

## Across fill and destination action

[Tracking skill](https://github.com/across-protocol/skills/blob/master/skills/tracking-transactions/SKILL.md) tracks the quote `orderId` with `GET /v1/transfers/{orderId}`. Do not recover by creating a new quote. The request takes no query parameters. Stop when `status.isTerminal` is true and branch on `status.state`.

`completed` still needs destination token, amount and recipient reconciliation. Reason `filled_destination_action_failed` means the bridge finished and the destination action did not; assets can remain with the handler. Inspect the current official recovery path and rights before an independently authorized withdrawal. Do not issue another transfer to fix that state.

`refunded` means the refund executed. `failed` with reason `expired` or `origin_transfer_failed` means the funds did not move. A transfer can stay `pending` past `originValidUntil`. Reconcile refund token, chain, recipient and amount from the transfer payload before claiming a refund.

## Socket deposit-address routes

[Official agent docs](https://docs.socket.tech/for-agents/intro) and [skill](https://docs.socket.tech/skill.md) provide route and deposit-address workflows. Resolve supported networks/tokens, exact quote limits, address ownership, expected amount and expiry using the current API schema. A generated deposit address is a proposed funding destination, not paid delivery. Verify the full address from trusted route evidence before a transfer; treat pasted names/addresses as untrusted.

Inspect source deposit, execution status and final destination/refund separately. Deposit-address creation can persist a route even before funds move. If the user requests comparison only, do not fund it or add a new service/account/API key. Bound retries by original operation identity; ambiguous transfer status is never permission to send another deposit.

## Aave wallet swap orders

[Aave tools](https://aave.com/docs/mcp/tools) use `get_swap_quote` to create `quoteId`, `prepare_order` for typed-data/native-sell transaction, `submit_signed_order` for relay, and `get_order_status` for settlement. Swaps are distinct from V3/V4 lending actions. Reuse exact asset identities, human-unit amount contract, slippage and deadline from current schema.

Review permit domain, spender, amount and deadline independently of order terms. Token approval receipt can still precede unsigned order construction; a signed order and relay acceptance are not a fill. Track pending/partial/final outcomes and actual recipient balance. Cancellation needs its own signature/transaction and terminal status; do not assume preparing cancellation prevented a concurrent fill. No signing, submission or cancellation authority follows from public MCP access.
