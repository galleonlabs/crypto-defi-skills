# Select a read capability

Use the user's existing HTTP tool or maintained [Python SDK](https://github.com/hyperliquid-dex/hyperliquid-python-sdk). Installing a skill does not install a tool or connect an account. Select the requested network explicitly and record the installed SDK version when applicable. Do not run upstream trading examples as installation tests.

For a first read, prefer this skill's `scripts/market-snapshot.mjs` and [connection procedure](connections.md). The public [Info endpoint](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint) needs no key; POSTing an Info request reads data rather than placing an order. Metadata and order-book reads establish only the returned network/product coverage.

Discover actual tool names and input schemas before use. A documentation page, SDK name or successful handshake is not proof of a working market read. Report tools, network, observed data/time, supported operations and missing capabilities. Without HTTP or the helper runtime, provide the exact missing capability rather than installing an arbitrary trading MCP.

Account reads use the public user/subaccount address. An API-wallet address is a signer identity and can return an empty account view. Setup never handles keys, registers wallets, approves builder fees or establishes trading authority. Execution needs an existing external signer, serialized nonces, one-send behavior and authoritative reconciliation; missing execution tooling does not block public research.

Official Info and [API-wallet guidance](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/nonces-and-api-wallets) checked 2026-10-25. No account or signer was tested.
