# Venue skill synthetic exercises

Date: 2026-09-09. These are model answers to 26 neutral packets exported using `bun scripts/behavior-evals.ts <id>`. No network, installation, signing, scheduler creation or exchange/chain writes occurred. Supplied observations are synthetic, not independently acquired tool results. Skill files and relevant local references were read. This author also authored the fixtures and had previously seen their grading criteria; these answers are not independent grading or a blind benchmark. A separate reviewer should assess them.

The collection and cancel inputs were varied before answering to avoid copying worked identifiers from the new references. The two engineering implementation exercises do not include actual source files or exact interface schemas; their implementation outcome is explicitly incomplete.

## lp-setup-custom-rpc

### Answer

Your existing `chain.read` tool reports Base, chain 8453, at synthetic block 100 with an observation time of 2026-09-09 12:00 UTC and no timestamp lag. `contract.read` is available, so pool analysis can proceed once the exact pool identity and methods are verified.

The supplied hash `0xabc` is a mock identifier, not a valid full Ethereum block hash. This exercise establishes the intended connectivity flow, not a production-ready endpoint validation. Quote access is missing; simulation and wallet capabilities are unverified or absent. No replacement provider is required.

Next: obtain a full valid block response and use the existing contract reader to verify the selected pool's deployment, tokens and state.

Evidence supplied: two read results and tool inventory. Needed: full block hash, exact pool identity/ABI, protocol reads and analysis data coverage. No real tools called.

## lp-setup-wrong-chain

### Answer

The connection fails your Base check: expected chain **8453**, received **1 (Ethereum)**. A fresh block does not resolve the network mismatch. Configure the existing reader for Base, then repeat `eth_chainId` before reading its latest block. I cannot assess Base pool readiness from this endpoint.

Evidence supplied: expected chain, returned chain and freshness. Needed: a Base endpoint configuration and subsequent matching read. No real tools called.

## lp-analyze-user-objective

### Answer

**Pool B fits your no-emissions fee-income objective better on the supplied 30-day model.** At the stated $10,000 size, A produces $80 of modeled organic fees after costs ($100 minus $20); B produces $140 ($160 minus $20). B is $60 ahead on that measure. A's $300 emissions are excluded from your comparison.

Both satisfy the supplied maintenance, custody and exit checks. This is a fee-income comparison using your existing provider's synthetic block-100 observation; it is not total investment profit. Inventory value changes and future fee variation can change the eventual result.

Evidence supplied: same-window modeled fee attribution, costs, eligibility and exits. Needed for total-return comparison: starting inventory and inventory-value changes; no wallet needed for this question.

## lp-analyze-missing-hook

### Answer

**This pool is not assessable for a deposit yet.** The 300% advertised APR does not establish safe withdrawals or explain the hook's authority. Verify the full PoolKey and hook permissions, deployed hook code/admin controls and exact withdrawal path before judging whether capital can be deployed.

Also separate actual swap fees from projected rewards, including their denominator, window and eligibility. The supplied figure does not provide that breakdown, so it cannot support a personal net-return claim.

Evidence supplied: pool identity, price and advertised APR only. Needed: hook behavior, exit evidence and yield composition. No calldata prepared.

## lp-plan-collect-specific-intake

### Answer

**Unsigned collection draft for NFT 73; not executable yet.** Collect the supplied 9 raw token0 units and 4 raw token1 units to owner `0x1111111111111111111111111111111111111111` on Base. Preserve liquidity **8000** and range **[-240, 360)**. No swap, new deposit or compounding is included.

The final plan still needs exact token/pool/manager identities, an observation block, fresh claimability and ownership checks, decoded collect calldata, gas/cost limits, deadline and simulation from the owner. Decimal amounts cannot be displayed without token decimals. A new capital budget and a replacement range are not relevant to this collection.

Evidence supplied: synthetic ownership, raw fee quantities, range and liquidity. Needed: executable construction and live preflight fields above. No approval requested.

## lp-plan-in-kind-exit

### Answer

**Draft: withdraw the entire existing position into its two pool tokens, with no swaps.** Your USD reporting currency does not change the withdrawal assets.

Use the verified full liquidity/share amount, return both assets to the intended recipient, and include any required unstaking and separate collection steps dictated by the actual protocol. This remains non-executable: the packet does not include the exact protocol/position fields, numeric amounts, recipient, per-token minima, gas limits, deadline, target/calldata or simulation. The next step is a full withdrawal quote and current staking/ownership read, followed by construction of the exact next transaction.

Evidence supplied: assertion of verified owner/network/liquidity and explicit in-kind intent. Needed: concrete identity/amount payload and withdrawal quote/simulation. No conversion inferred.

## lp-monitor-known-range-unknown-pnl

### Answer

**The position is active in the supplied block-100 snapshot:** -120 <= 0 < 120. Liquidity is 1000, ownership matches and it is unstaked.

Its earnings and performance versus HOLD are **unknown**. Opening quantities and subsequent cash flows are missing, and the packet supplies no complete fees/rewards history. Recover deposit, withdrawal and claim receipts plus current attributable inventory before calculating PnL; today's balance cannot become the opening basis.

Evidence supplied: fresh range, tick, liquidity and custody observation. Needed: opening baseline, cash flows and income/valuation records. No action recommended.

## lp-monitor-stale-not-hold

### Answer

**Current state is unknown, so I cannot justify hold versus recenter.** Yesterday's in-range observation remains useful history, but it does not prove today's range or custody state.

Recover the current position and pool reads, then quote the full recenter cost before comparing it with expected incremental fees. No current quote is available, so neither the action nor its economic hurdle has been established.

Evidence supplied: failed current RPC, yesterday's last-good snapshot. Needed: current position/pool state and a quote. No healthy HOLD claim or transaction.

## lp-execute-preserve-confirmation

### Answer

**The supplied simulation records collection P1 as complete.** Its final receipt succeeds at synthetic block 101, and the reread agrees with collected balances and unchanged liquidity. Hash `H` is a synthetic identifier, not a real transaction link.

The immutable, unexpired and unsent P1 confirmation can be reused after matching preflight; there is no reason to restart that same confirmation. The modeled flow submits only P1 once through the trusted tool's own confirmation boundary, then checks receipt and state. No compound, sweep or additional transaction is included.

Evidence supplied: summarized exact confirmation/preflight and simulated receipt plus reread. Needed for real proof: actual full transaction/receipt/state records and identifiers. No real submission occurred in this exercise.

## lp-execute-unknown-write

### Answer

**P1's submission state is unknown; sending again could duplicate it.** The timeout does not prove failure, and the original nonce may still be pending.

Continue read-only recovery through the wallet/tool request record and sender/nonce, checking pending or replaced transactions and current fee/balance/liquidity state. If a hash is recovered, inspect its receipt on the bound chain. Until those observations establish what happened, the request cannot be reported complete or safely resent.

Evidence supplied: one send, no hash, unexpired action and inconclusive reads. Needed: sender/nonce resolution and matching receipt/state evidence. No retry performed.

## lp-engineer-custom-adapter

### Answer

**The adapter can use your existing provider, but this packet lacks the source and exact method schemas needed to implement and test the integration.** I would keep `readPool` and `quotePosition` behind an injected read-only interface and return separate `fresh`, `stale`, `unavailable` and identity-mismatch results, preserving decimal strings and quote time.

The smallest next step is inspecting those two method definitions, the quote result shape and one existing Bun fixture. Then implementation can validate chain/pool identity, integer amount fields and quote age, with fixtures for fresh, stale, malformed and failed reads. No signer or provider migration is needed.

Evidence supplied: method names and general TypeScript/Bun conventions only. Needed: actual project/source files, parameter/result schemas and test fixtures. **Implementation incomplete; no files edited or tests claimed.**

## lp-engineer-review-only

### Answer

Two accounting defects follow from the supplied code description:

1. Returning zero fees on an RPC exception turns missing evidence into measured zero. Preserve an unavailable/error state and retain any last-good value as dated history.
2. Overwriting original deposited quantities with current balances destroys the HOLD baseline and can hide inventory loss. Preserve opening cash flows; append subsequent deposits/withdrawals independently.

A focused regression test should make the RPC throw and ensure no fresh zero is emitted; another should update current balances and verify that original basis remains unchanged. This is review feedback only; I made no edits.

Evidence supplied: behavior of the two code paths. Needed for line-specific review: actual source locations and surrounding accounting contract.

## hl-setup-existing-http

### Answer

**Your existing HTTP tool supports the supplied ETH mainnet public-read workflow.** The synthetic metadata/book responses give mark **3000.1**, oracle **3000**, bid **3000**, ask **3000.2**, and spread **0.2**. Reported funding is **0.00001**, with no interval supplied. Size precision is four decimals.

The fixture says book time matches observation time, although it supplies no numeric timestamp for the report. This establishes public analysis access within the exercise. Account reads and execution remain unverified; no account address, login or private key is needed for this public check.

Evidence supplied: matching metadata, book and `http.post` capability. Needed: concrete UTC observation time for a complete record; public user account only for subsequent account work. No real HTTP call performed.

## hl-setup-network-not-auth

### Answer

**This is rate limiting: HTTP 429.** There is no evidence of an authentication problem, so a login or key change is not indicated.

Inspect `Retry-After` if returned and reduce read frequency. If it is absent, use a bounded backoff policy appropriate to the existing client; do not increase concurrency. Preserve the original public read and report it unavailable until a later successful response. No retry was performed in this synthetic exercise.

Evidence supplied: HTTP 429. Needed: response retry headers and a later bounded read result. No credentials needed.

## hl-analyze-funding-question

### Answer

**B is twice as high per hour:** A is **0.01%/hour** (0.0008 / 8); B is **0.02%/hour** (0.0002). These are floating funding quotes, not guaranteed profit.

Evidence supplied: rates and explicit intervals. Needed: nothing else for this arithmetic comparison. No account or trade plan needed.

## hl-analyze-user-rule-gaps

### Answer

**I can preserve your rule, but the supplied data cannot support a completed net-performance backtest.** Keep the closed 1-hour crossing of a 20-period average and four-bar exit as the proposed rule; do not replace it.

The experiment record needs the exact average definition and crossing direction, market, dataset window, entry-fill timing, sizing and cost assumptions. Keep the two-day candle gap explicit; do not trade through it with invented prices. Use your existing provider to recover missing candles and historical funding, then model size-aware fills and fees. Freeze those choices as a rule revision before evaluating a holdout.

No return, win rate or Sharpe can be calculated from the packet. Historical simulation, forward paper observations and actual fills must remain separate records.

Evidence supplied: partial verbal rule and dataset gaps. Needed: actual dataset, missing rules, historical funding and fill/cost model. No backtest claimed.

## hl-plan-cancel-specific-intake

### Answer

**Unsigned draft: cancel ETH order 789** on mainnet account `0x1111111111111111111111111111111111111111`. The supplied observation identifies an unfilled resting entry, with no current position or protective orders. Entry sizing, a new stop and risk-per-trade percentage are not applicable to this cancellation.

Before the draft is executable, retain exact market/DEX mapping, observation time, account mode, ticket revision and expiry, and reread order status to handle a fill racing the cancel. Reconciliation must check canceled status, detailed open orders, fills since send and resulting exposure. This document requests no approval and performs no cancellation.

Evidence supplied: account, network, order classification and asserted market mapping. Needed: concrete timestamps, final ticket/expiry and fresh reconciliation inputs. No new order client ID invented for the existing cancel target.

## hl-plan-close-not-entry

### Answer

**Draft a reduce-only sell of 1 ETH**, leaving 1 ETH of the supplied 2-ETH long. If your 1% bound is measured from the supplied 3000 mark, the illustrative worst sell price is **2970**. A final ticket needs that reference-price convention confirmed and a fresh executable quote.

Book depth and fees are missing, so this is not ready for execution. Reconcile the existing 2-ETH protection against the 1-ETH remainder and preserve effective protection throughout; do not cancel it before replacement coverage is proven if resizing is needed. No new entry signal or risk-per-trade percentage is needed for this reduction.

Evidence supplied: side/size, size precision, mark and existing coverage. Needed: account/network identity, fresh book/fees, exact protection semantics and final ticket fields. No order submitted.

## hl-monitor-no-scheduler

### Answer

**The supplied observation shows the 1-ETH long covered by a reduce-only sell stop for 1 ETH.** A continuing watch is not running: this harness has no scheduler or persistent stream.

The unscheduled watch should check the same account/ETH position and detailed stop state, alert on a change in coverage or unavailable reads, and stay quiet for unchanged observations. To activate it later, a real scheduler must return an active job identifier, with cadence/freshness and stop rules recorded. Ending that watch would not cancel the exchange stop.

Evidence supplied: current position and detailed order coverage. Needed: scheduler capability, exact account scope and cadence/freshness/expiry settings. No scheduled job or exchange write claimed.

## hl-monitor-gap-not-healthy

### Answer

**Current protection is unavailable to verify.** The old snapshot showed a stop, but the ten-minute stream gap was not backfilled and current detailed-order reads fail. A reconnect alone does not prove coverage.

Recover detailed open orders and current positions, then backfill order/fill history over the gap. Keep that interval unknown if history cannot cover it. Existing exchange orders may still work, but the supplied evidence cannot establish that this stop still protects the position.

Evidence supplied: old stop snapshot, reconnect without backfill and failed current read. Needed: order/position reconciliation and gap history. No safe/not-triggered claim.

## hl-execute-approved-once

### Answer

**The supplied simulation reconciles HL-1 as canceled, with unchanged exposure.** The exchange status is canceled, detailed open orders omit the target, and there are no new fills or position changes.

The unchanged, unexpired ticket approval is reusable after the specified preflight. The modeled action is one submission of that cancel through the trusted boundary, followed by those reconciliation reads; no extra approval loop or account-wide cancel is needed. This exercise performed no real submission.

Evidence supplied: approval/preflight assertions and simulated response plus exchange/account records. Needed for actual execution proof: concrete ticket digest, exact order/account/network identifiers, timestamps and raw tool records.

## hl-execute-timeout-no-retry

### Answer

**Do not resend C1 yet: its original action can still arrive.** A current “not found” result and no visible fills do not establish failure before its signed expiry.

Keep the send record and reconcile C1, detailed open orders, fills and account state. After expiry makes late acceptance impossible, reconcile again; only then can a replacement be considered under a fresh ticket and approval. The present result is unknown, not failed or complete.

Evidence supplied: one send, future expiry and negative current lookup. Needed: post-expiry reconciliation or a positive record of the original action. No retry performed.

## hl-review-round-trip-accounting

### Answer

**Net result: $15, or 1.5R.** Gross PnL is 2 x (110 - 100) = $20. Subtract $2 of fees and $3 funding paid: $20 - $2 - $3 = $15. Original ticket risk was $10.

The supplied process record is clean: exact actions were approved, protection remained correct, and final state is flat with no orphan orders. Slippage against the ticket and holding duration are not supplied, so those remain unknown. The useful accounting check is that paid funding reduced the result rather than increasing it.

Evidence supplied: complete round-trip arithmetic inputs and summarized controls. Needed for a fuller journal: timestamps, ticket prices and raw fill identifiers. No new trade proposed.

## hl-review-mixed-simulation-live

### Answer

**The strategy is not validated by these records.** Keep v1's $100 paper profit separate from v2's $20 reported across two live winners. They use different rule revisions and evidence classes, so $120 is not a verified live result.

Funding history is incomplete, so v2's complete net performance is unknown. R is also unknown because the original risk budgets are missing. Recover those records and include all trades over a defined window; two selected winners do not establish repeatable performance.

Evidence supplied: separate paper/live summaries, revision labels and known gaps. Needed: full live funding/trade history and original risk records. No blended total or validation claim.

## hl-engineer-custom-provider

### Answer

**Your existing SDK and scheduler are sufficient in principle; implementation cannot be completed from method names alone.** Keep `sdk.accountSnapshot` read-only and run a deterministic age check in the scheduled job. Return fresh, stale or unavailable separately; a failed read must not produce an empty healthy account.

To implement this in your project, inspect the snapshot timestamp/account/network schema, `jobs.schedule` registration and returned job identity, and existing Bun fixtures. Test recent timestamps, expired timestamps and rejected reads. Record the scheduled identifier before claiming a running monitor. No model-provider migration or signer integration is needed.

Evidence supplied: interface names and desired stale-snapshot behavior. Needed: actual source/schema and test files. **Implementation incomplete; no repo edits, job creation or test success claimed.**

## hl-engineer-unknown-state-review

### Answer

**The timeout handler can create duplicate exposure.** The first order may have arrived; generating a new client ID and resubmitting creates a second independently acceptable order. An empty open-order response cannot rule out a delayed action or a fill.

Persist the original intent, client ID and expiry before send. On timeout, reconcile its status, fills and account state without a second submission; after the original cannot arrive, any replacement gets a new approved ticket. A regression fixture should combine timeout with an initially empty lookup and a later fill, asserting only one send. No code was edited.

Evidence supplied: retry behavior and negative-lookup assumption. Needed for line-specific review or patch: source and client tests.

## Author self-review and practical limits

- These 26 responses were actually produced from neutral packets and skill instructions; they are not an automated result derived from schema checks. They are also not blind because I authored the fixtures and knew the intended outcomes beforehand.
- Both engineering implementation cases are incomplete in this exercise. They lack actual source/interfaces, and the task disallows repository edits. Claiming implementation or passing tests would be fabricated. A real benchmark should supply a temporary mini-project with exact interfaces and permit local fixture edits/tests.
- The execution happy paths are evidence-interpretation exercises only. Their supplied results are synthetic summaries, not a callable mock signer/chain or proof that the model followed a one-send trace. The fixture mixes pre-send state and supplied post-send results; that should be split into staged mock-tool responses for stronger validation.
- The LP setup fixture uses `0xabc` as a block hash. It is explicitly synthetic, but cannot pass real Ethereum block-shape validation. The answer preserves that limitation rather than claiming real readiness.
- Several packets omit exact dates, full identity fields or raw datasets. Useful summaries remain possible, but these are not complete executable plans or independently reproduced backtests.
- Numerical answers were derived from supplied values: LP A80/B140, funding0.01%/0.02%, close1ETH at an illustrative2970 bound, and net15/1.5R. No current market data or broad trading-quality claim follows from them.
- The two new plan examples were varied before answering (NFT73 with range[-240,360), liquidity8000 and fees9/4; cancel order789). Neutral packets were regenerated for those variants.
