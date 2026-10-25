# Market evidence tools

Use the public [Info endpoint](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint) or read-only `Info` methods in the [official Python SDK](https://github.com/hyperliquid-dex/hyperliquid-python-sdk). Reuse the existing client; this analysis needs no signer, API wallet or SDK installation. Community TypeScript packages and MCP servers must be identified as community tools.

Resolve the exact network and product from current metadata. Validator perps, HIP-3 markets and spot use distinct identity rules; one successful metadata read does not prove every product is covered. Record response time, request parameters, freshness and visible book reach. Current price, funding and liquidity require reads; a fixture or SDK version is not market evidence.

Use [live evidence](live-evidence.md) for required observations and [market risk](market-risk.md) for interpretation. A market opportunity assessment does not require builder onboarding, nonce management or account permissions. Effective fees and depth matter to costs; read them for the stated size without constructing an order or claiming a fill.

Official Info documentation checked 2026-10-25. Public read access does not authorize financial action.
