---
name: hyperliquid-plan
description: "Build an exact unsigned Hyperliquid ticket for an entry, exit, reduction, cancel, modify, trigger order, TWAP, leverage change, or isolated-margin change. Use when the user has chosen an intent and asks for size, limits, order fields, risk checks, or a preflight plan. Planning only; not for market selection, live monitoring, signing, or submission."
license: MIT
compatibility: "Requires read-only market and account access for executable plans. The bundled risk script needs Node.js 20 or newer."
metadata:
  version: "0.1.0"
  protocol: "hyperliquid"
---

# Hyperliquid plan

Turn one user intent into an unsigned ticket that can be reviewed, expired, and reconciled.

## Inputs

Require the network, user account address, target market and DEX, side, action, order type, entry or limit, invalidation or stop, risk budget, slippage policy, time horizon, and account-mode assumptions. Missing risk inputs stop an exposure-increasing plan.

## Workflow

1. Rebind live identity and state: network, account, account abstraction mode, DEX, coin name, asset ID, `szDecimals`, price rules, margin table, mark, oracle, mid, depth, effective fees, positions, open orders, balances, available-to-trade, and current leverage.
2. Read [account modes](references/account-modes.md). Standard, unified, and portfolio-margin accounts expose balances and liquidation risk differently.
3. Size with [risk sizing](references/risk-sizing.md). Use `node scripts/risk.mjs --help` for deterministic arithmetic. The stop fill must include adverse slippage and both entry and exit fees.
4. Construct the action with [order semantics](references/order-semantics.md). Resolve all IDs and precision from the target network now.
5. Model the full result set: rejection, resting, full fill, partial fill, trigger wait, margin cancel, unknown response, and account-state mismatch.
6. Assign one fresh 128-bit client order ID per order leg. Add `expiresAfter` when the signing scheme supports it. Record both before execution.
7. Check exchange constraints, user limits, rate-limit budget, current price tolerance, free margin, margin tier at post-trade notional, total open risk, correlated exposure, and protection for the resulting position.
8. Emit [the ticket contract](references/ticket-contract.md). Do not request a signature.

## Invariants

- A market-style order is an IOC limit with a worst acceptable price. There is no unbounded market order in the API.
- Size rounds down to current `szDecimals`. Price follows current tick and significant-figure rules. Never round size up to meet a minimum.
- Every exit, stop, and take-profit is reduce-only.
- TP/SL trigger on mark price. Their executable bound is separate from the trigger.
- A fixed-size trigger does not resize with the position.
- A partial IOC entry can leave the filled remainder unprotected. Plan the containment path.
- Changes to network, account, account mode, DEX, market, side, size, price, trigger, leverage, margin mode, slippage, fees, client IDs, expiry, or protection invalidate approval.

## Boundary

Do not construct a signature, expose a key, submit an action, or claim that a plan or simulation changed exchange state. Route explicit execution to `hyperliquid-operate` only after the ticket is complete.
