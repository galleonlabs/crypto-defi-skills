# Planning tool contract

Use current metadata and account reads through the [official API](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint) or [Python SDK](https://github.com/hyperliquid-dex/hyperliquid-python-sdk). Read the actual user/subaccount, never its API-wallet address. Preserve network, DEX, asset namespace, precision and observation time; do not derive an exchange asset ID from a ticker or metadata index alone.

Keep reads and unsigned ticket generation outside a signer. Resolve account mode and balances with [account modes](account-modes.md), and bind the complete action to [the ticket](ticket-contract.md). Mark a missing observation unavailable rather than manufacturing executable fields. Changing account mode, registering an API wallet or approving a fee is outside this trading plan.

A builder parameter is optional. Keep it absent unless the exact builder address and fee were explicitly approved. The [builder-code contract](https://hyperliquid.gitbook.io/hyperliquid-docs/trading/builder-codes) encodes `f` in tenths of a basis point: 10 means one basis point. Read the current approved maximum and protocol eligibility/limits for an actually requested builder route; do not copy a static threshold into unrelated tickets.

The tool must return unsigned action fields, rejection reasons and expected reconciliation reads. It must not sign, broadcast or expand the approved quantity to satisfy an exchange minimum. Official Info and builder documentation checked 2026-10-25; no account or write was tested.
