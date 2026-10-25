# Account and stream read tools

Query the requested user/subaccount through the [Info endpoint](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint) or official SDK. API-wallet addresses are signing identities, not the account to monitor. Discover the actual tool schemas and supported product/account modes before interpreting an empty result.

Use [authoritative state](authoritative-state.md) for snapshot fields. Under unified or portfolio margin, balances/holds come from the documented spot state; do not sum overlapping views. Keep network, DEX, account mode, timestamps and coverage in every result.

For continuous observations, use the SDK's [WebSocket subscriptions](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket) with [stream discipline](stream-discipline.md): initial snapshot, deduplication, heartbeat, gap detection, backfill and account reread. A library reconnect does not establish continuity. Detailed orders are needed to inspect trigger/reduce-only properties; a short order summary cannot prove protection.

No signing library, nonce allocation, builder onboarding or wallet approval is needed for monitoring. An alert reports observations and may request a plan; it never submits one. Official Info/account-mode documentation checked 2026-10-25; no account was queried.
