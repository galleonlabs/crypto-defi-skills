# Trusted execution contract

Use the user's existing signer boundary and maintained [official SDK](https://github.com/hyperliquid-dex/hyperliquid-python-sdk) signing implementation. The skill never imports keys, registers a wallet or installs a signer. Verify supported action/product, exact account/network and the complete approved ticket before selecting a method. A community implementation needs independently verified signing parity; a repository label is not evidence of that parity.

The [nonce and API-wallet contract](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/nonces-and-api-wallets) scopes nonces to the signing identity. All writers sharing it must serialize allocation. Deregistered or expired agent-wallet nonce state can be pruned; do not silently reuse that identity or repair an unknown action with a newer nonce. Preserve durable client-order ID, request digest, nonce and expiry before one send.

Use [account control](account-control.md), [pre-send checks](pre-send-checks.md) and [the action state machine](action-state-machine.md) for live gates. Read-only Info calls use the user/subaccount address, not the API wallet. Transport success, action acceptance, per-order errors, fills and resulting state are separate facts.

[Builder attribution](https://hyperliquid.gitbook.io/hyperliquid-docs/trading/builder-codes) stays absent unless approved for the exact address and fee. Its `f` field is tenths of a basis point. The main wallet's separate builder approval, current maximum and eligibility must already be evidenced; this trading skill does not create that approval. Do not add attribution for credit.

Official nonce, Info and builder documentation checked 2026-10-25. No signer or financial action was tested.
