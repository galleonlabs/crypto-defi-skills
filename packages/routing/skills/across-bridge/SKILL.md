---
name: across-bridge
description: "Use when comparing Across Swap API routes, inspecting exactInput versus minOutput, or reconciling deposit fills, embedded actions and refunds."
license: MIT
compatibility: "Read-only protocol APIs or RPC through existing configured tools. No signer included."
metadata:
  author: "Galleon Labs"
  version: "0.4.1"
---

# Across bridge

Return an exact Across route plan or a deposit-specific settlement ledger. Current API access requires configured Bearer credentials and an integrator ID; installing a skill supplies neither.

## Quote the requested amount semantics

Collect origin/destination chains, input/output addresses, decimals, depositor, recipient, amount and objective. Current Swap API in [reads](references/reads.md) supersedes legacy suggested-fees for new swap flows. Discover supported chains/tokens rather than assuming old routes remain active.

For `exactInput`, amount is the input-token budget. For `minOutput` or `exactOutput`, amount refers to the output token; compare the returned required input with the user's budget. Preserve `strictTradeType`, quoted amount bounds, fees, approvalTxns, swapTxn, refundAddress and refund chain. Explicit fractional slippage `0.005` means 0.5%; do not silently select automatic slippage or append an app fee.

## Inspect source and destination effects

Decode approval spenders separately from the source transaction target. For embedded actions inspect ultimate recipient, target, token amount, downstream calldata and fallback/refund behavior. A fill to a MulticallHandler does not prove the final beneficiary received the requested asset or shares. Inspect dynamic-balance actions against the actual destination inventory instead of using a stale estimated amount.

Return unsigned source prerequisites and destination expectations. A wallet-capable MCP tool is not a read merely because the server also has quote tools; inspect the tool's effects and preserve the user's existing signing boundary.

## Track one deposit

Persist source hash and emitted deposit identity. Query status by one supported selector, retain fill and refund references and inspect destination actions separately from bridge status. Indexed absence shortly after deposit is not proof of failure. A batched sweep can contain multiple transfers; list and disambiguate rather than selecting the first.

A completed source receipt is incomplete delivery. Completion needs correct destination token/recipient/amount and, if requested, successful downstream action. On pending, failed action, refund or timeout retain the same deposit and avoid duplicate deposits.

## Worked result

Synthetic minOutput request asks for 1,000 USDC on Base; returned source requirement is 1,004 USDC and budget is 1,002. Report route over budget and leave it unsigned. Separately, a filled bridge whose embedded vault deposit failed is `bridge filled; vault objective unmet`; reconcile fallback tokens/refund before proposing any remedy.

## Sources and limits

Primary documentation and source reviewed 2026-10-25; no account authorization, signing or financial action was tested. [Read recipes and current primary sources](references/reads.md) ship with this skill. Recheck supported deployments and schemas before a consequential handoff. Research adds no permission to trade, transfer, vote or change account authority.
