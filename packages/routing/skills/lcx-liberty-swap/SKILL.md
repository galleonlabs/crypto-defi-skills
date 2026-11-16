---
name: lcx-liberty-swap
description: "Use when quoting an LCX Liberty DEX swap on an EVM chain, comparing its after-gas floor with other providers, or building and checking its unsigned same-chain or cross-chain transaction."
license: MIT
compatibility: "Read-only protocol API through existing configured tools. Needs LCX_API_KEY in the environment. No signer included."
metadata:
  author: "LCX"
  version: "0.4.4"
---

# LCX Liberty DEX swap

Return a quote comparison or an exact unsigned LCX Liberty DEX swap plan. LCX Liberty DEX is a non-custodial EVM aggregator that routes through its own pool index and router contract and charges no swap fee of its own. A quote, a build and a fill are different facts.

## Check access first

Every request needs a key, sent as `Authorization: Bearer $LCX_API_KEY`. Before the first request, check that `LCX_API_KEY` is set. If it is missing, stop and report: `LCX_API_KEY is not set. Create a free key at https://dex.lcx.com/dashboard and export LCX_API_KEY before using lcx-liberty-swap.` Do not ask the user to paste the key into the conversation, never put it in a query string or a log, and do not create an account on the user's behalf.

A request without a key returns 401 `API_KEY_REQUIRED`; a present key that does not resolve returns 401 `INVALID_API_KEY` and is never served anonymously. A key pinned to other origins or IPs returns 403. Only `/health` and `/ready` answer without a key.

## Read the exact swap

Collect chain ID, sell and buy token addresses, raw sell amount, taker, recipient and the user's slippage or loss limit. Confirm the chain in `GET /v1/chains`: `available`, `degraded` and `routerDeployed` decide whether a quote can become a transaction. The chain's native coin is the zero address. Price with `POST /v1/quote` as shown in [reads](references/reads.md). `amountIn` is an integer string in the sell token's base units; `slippageBps` defaults to 50 and is capped at 2000.

Inspect `output.amount`, `output.minimumAmount`, `gasEstimateWei`, `gasFeeUSD`, `priceImpactPct`, `routes`, `venues`, `blockNumber`, `expiresAt` and `stale`. Compare providers on `minimumAmount` net of gas for the same amount and block window, not on headline output. A missing `priceImpactPct` means one side cannot be priced from the index: warn instead of proceeding. `stale: true` will not build, and a `degraded` chain quotes but refuses builds. `no_route`, `insufficient_liquidity`, `transfer_tax` and `transfer_blocked` are concrete gaps, not weaker quotes.

## Build and bind

`POST /v1/build` takes the `quoteId`, the `recipient` and the same `slippageBps` the quote used; a different value returns `slippage_mismatch` rather than being clamped. It returns `swap` (`chainId`, `to`, `data`, `value`), `minAmountOut`, `deadline` and a `simulation` block. The floor comes from the output the user was shown, not from a fresh price: if the market has fallen below it the build is refused with `price_moved`. A `quoteId` lives 120 seconds; on `QUOTE_EXPIRED` re-quote and show the new price. Building twice from one `quoteId` is safe.

Approve only the quote's `spender`, for the finite sell amount, after checking `GET /v1/allowance`. For a same-chain swap the spender and `swap.to` are the same router; a mismatch is a stop. Native input needs no approval (`nativeIn: true`). `simulation.status` `ok` with `deliveredVsQuotedBps` near zero supports the plan but is not a fill. An ERC-20 build made before approval returns `status` `skipped` with `why` `awaiting_allowance`: report the simulation as not yet run, and rebuild after the approval receipt. Do not add an integrator fee the user did not ask for.

## Cross chains

Add `toChainId` and `recipient` to the quote. The answer is a journey: read `shape`, `legs`, `endToEndMinOut`, `endToEndOut`, `etaSec` and `expiresAt`. `endToEndMinOut` is the floor for the whole journey; the last leg's `minOut` is not. Each bridge leg is a short-lived offer, so read `expiresAt` instead of assuming 120 seconds. `bridge_too_small` and `bridge_too_large` carry the limit in their message, and refused options come back in `rejected` with a reason.

The build returns one `transactionRequest` on the source chain and an `approval.target` that can differ from the quote's spender: approve the build's target. A confirmed source transaction is not delivery. Poll `tracking.status` (`/v1/bridge/transfers/{transferId}`) and never send a second transfer to repair a pending one.

## Resolve the result

A quote, simulation or broadcast is not a fill. For a submitted swap read the receipt and the buy-token delta at the recipient against `minAmountOut`. On timeout keep the original hash and inspect it before any retry. On 401 report missing or invalid access. On 429 (`RATE_LIMITED`, `QUOTA_EXCEEDED`) wait as instructed rather than switching keys. `store_unavailable` (503) means the chain's index is behind its freshness window: retry later instead of forcing a build.

## Worked result

Synthetic quote sells 0.01 ETH on Base for USDC: `output.amount` 18.226954 USDC, `minimumAmount` 18.135819 at 50 bps, `nativeIn` true, `spender` the router. The build returns `swap.to` equal to that router, `minAmountOut` 18.135819 and `simulation.status` `ok` with delivery 1 bp under quoted. Return an unsigned handoff with no approval step and an 18.135819-USDC floor. If the user confirms after `expiresAt`, the build answers `QUOTE_EXPIRED`: re-quote and show the new price rather than retrying the old one.

## Sources and limits

Primary documentation reviewed 2026-11-16. Response shapes were checked against the live API without a key and a non-production instance; no account authorization, signing or financial action was tested. [Read recipes and current primary sources](references/reads.md) ship with this skill. Recheck supported chains and schemas before a consequential handoff. Research adds no permission to trade, transfer or change account authority.
