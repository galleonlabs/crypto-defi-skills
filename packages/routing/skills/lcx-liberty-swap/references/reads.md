# Read recipes and sources

Reviewed 2026-11-16. These recipes establish documented interfaces, not a live account or executed outcome.

API base `https://swap-api.lcx.com`; every endpoint sits under `/v1`. Header `Authorization: Bearer $LCX_API_KEY` from private configuration. Check the variable before any request:

```bash
test -n "$LCX_API_KEY" || { echo "LCX_API_KEY is not set. Create a free key at https://dex.lcx.com/dashboard and export LCX_API_KEY before using lcx-liberty-swap." >&2; exit 1; }
```

## Chains

`GET /v1/chains` lists supported chains with `available`, `degraded`, `unavailableReason`, `routerDeployed`, `ageSeconds` and `freshnessLimitSeconds`. It needs a key but does not count against the monthly quota. Do not assume a chain list; read it.

## Same-chain quote and build

`POST /v1/quote` body: `chainId`, `tokenIn`, `tokenOut`, `amountIn` (integer string in base units), optional `slippageBps` (default 50, maximum 2000). The native coin is `0x0000000000000000000000000000000000000000`.

```bash
curl -s -X POST https://swap-api.lcx.com/v1/quote \
  -H "Authorization: Bearer $LCX_API_KEY" -H "content-type: application/json" \
  -d '{"chainId":8453,"tokenIn":"0x0000000000000000000000000000000000000000","tokenOut":"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913","amountIn":"10000000000000000","slippageBps":50}'
```

Read `data.quote`: `quoteId`, `input` and `output` (raw amounts with `decimals`; `output.minimumAmount` is the on-chain floor), `priceImpactPct`, `usdValueIn`, `usdValueOut`, `gasEstimateWei` (swap gas only, no approval), `gasFeeUSD`, `spender`, `nativeIn`, `nativeOut`, `routes`, `venues`, `blockNumber`, `expiresAt` and `stale`.

`POST /v1/build` body: `quoteId`, `recipient`, `slippageBps` equal to the quote's, optional `deadlineSecs` (default 300, maximum 3600). Read `data.swap` (`chainId`, `to`, `data`, `value`), `minAmountOut`, `deadline` and `simulation` (`status`, and `delivered` with `deliveredVsQuotedBps` when it ran, or `why` when it was skipped).

`POST /v1/swap` takes the quote body plus `taker` and returns the quote and transaction together; use it only when the user has already accepted the terms.

`GET /v1/allowance?chainId=…&token=…&taker=…&amount=…` returns whether an approval is required, the current allowance and the exact `spender`.

## Cross-chain quote, build and tracking

`POST /v1/quote` with `toChainId` and `recipient` added returns a journey: `shape` (`DIRECT`, `SWAP_BRIDGE`, `BRIDGE_SWAP` or `SWAP_BRIDGE_SWAP`), `legs`, `endToEndOut`, `endToEndMinOut`, `etaSec` and `expiresAt`. `POST /v1/build` with its `quoteId` returns `transactionRequest` for the source chain, `adapter`, `approval.target`, `transferId` and `tracking.status`. Poll `GET /v1/bridge/transfers/{transferId}` until the destination delivery is confirmed or refunded.

## Errors that change the decision

| Code | Status | Meaning |
| --- | --- | --- |
| `API_KEY_REQUIRED`, `INVALID_API_KEY` | 401 | No key, or a key that does not resolve. |
| `ORIGIN_NOT_ALLOWED`, `IP_NOT_ALLOWED` | 403 | The key is pinned elsewhere. |
| `RATE_LIMITED`, `QUOTA_EXCEEDED` | 429 | Wait as instructed. |
| `QUOTE_EXPIRED` | 410 | Re-quote; retrying the build cannot succeed. |
| `price_moved` | 400 | The live route fell below the shown floor. |
| `slippage_mismatch` | 400 | Build slippage differs from the quote's. |
| `no_route`, `insufficient_liquidity` | 400, 422 | No executable route at this size. |
| `transfer_tax`, `transfer_blocked` | 422 | The token taxes or blocks transfers on every clean path. |
| `bridge_too_small`, `bridge_too_large` | 422 | The cross-chain amount is outside the bridge's limits. |
| `store_unavailable` | 503 | The chain's index is behind; builds are refused. |

## Official tools

- TypeScript SDK `lcx-liberty-sdk` on npm (1.8.0 at review).
- Read-only MCP server at `https://swap-api.lcx.com/mcp` (quotes, token search and USD prices; the same Bearer key). It never trades.

## Primary sources

- [Authentication](https://dex.lcx.com/docs/authentication)
- [Quotes and execution, including cross-chain](https://dex.lcx.com/docs/quotes-and-execution)
- [Quote reference](https://dex.lcx.com/docs/api-quote)
- [Build reference](https://dex.lcx.com/docs/api-build)
- [Approvals](https://dex.lcx.com/docs/approvals)
- [Errors](https://dex.lcx.com/docs/errors)
- [Chains and usage](https://dex.lcx.com/docs/api-chains)
- [TypeScript SDK](https://dex.lcx.com/docs/typescript-sdk)
- [MCP server](https://dex.lcx.com/docs/mcp-server)
