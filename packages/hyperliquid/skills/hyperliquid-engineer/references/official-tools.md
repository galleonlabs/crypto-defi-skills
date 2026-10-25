# Integration sources and ownership

Prefer the [official Python SDK](https://github.com/hyperliquid-dex/hyperliquid-python-sdk) for metadata resolution, Info reads, WebSockets and signing inside the existing trusted boundary. Pin the consuming project's reviewed release and test its required products. Community SDKs/MCPs need explicit operator attribution and compatibility evidence. Do not build a Python service solely to wrap a trivial public HTTP read.

Use the [Info API](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint), [asset-ID contract](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/asset-ids) and [account modes](https://hyperliquid.gitbook.io/hyperliquid-docs/trading/account-abstraction-modes) for exact wire identities and balance semantics. Resolve metadata on the chosen network; fail on unknown namespaces instead of matching a similar ticker. User/subaccount reads must not substitute the API-wallet signer address.

[Nonce state](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/nonces-and-api-wallets) belongs to the signer, shared across its subaccounts/processes. Serialize writes, persist client identity before submission and reconcile unknown outcomes. Agent expiry/deregistration can prune replay protection; do not silently reuse a pruned signer. Keep secrets and signing outside the agent's context.

Implement transport, per-action acceptance, fills and account reconciliation separately. Test snapshot/reconnect/backfill behavior through [stream invariants](stream-invariants.md); SDK reconnection alone is insufficient. Preserve fee policy and keep optional [builder attribution](https://hyperliquid.gitbook.io/hyperliquid-docs/trading/builder-codes) absent unless its exact recipient/fee was approved. Main-wallet builder approval is a separate action.

The focused [API invariants](api-invariants.md), [security invariants](security-invariants.md) and [test matrix](test-matrix.md) own implementation acceptance. Official API, nonce, builder and account-mode docs checked 2026-10-25; no signer or live write was tested.
