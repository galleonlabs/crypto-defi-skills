# Changelog

## 0.5.0 - 2026-11-17

- Add the standalone `lcx-liberty-swap` procedure for LCX Liberty DEX quotes and unsigned same-chain or cross-chain builds. It stops before any request when `LCX_API_KEY` is unset, names the gas coin by its token contract where `/v1/chains` reports `nativeIsToken`, compares guaranteed minimum output in the output token's own units net of separately paid swap and approval gas without subtracting fees the output already carries, and hands off only when the build matches the live `/v1/chains` router, chain, native value and decoded tokens, amount, recipient, minimum and deadline.

## 0.4.5 - 2026-11-17

- 0x: in the AllowanceHolder flow the spender and `transaction.to` are both AllowanceHolder; Settler is the target only in the Permit2 flow.
- Relay: replace the nonexistent `delayed` status with the status v3 values and say which are final.
- CCTP: only the 1000 and 2000 finality thresholds exist; other values are mapped to them.
- Drop the Uniswap swap compatibility claim about offline helpers the skill does not ship.

## 0.4.4 - 2026-11-15

- Note that the CoW SDK adapter requirement applies from v7 onward; the current major is v9.

## 0.4.3 - 2026-11-12

- Name CCTP Fast and Standard Transfer `minFinalityThreshold` values. 1000 and 2000 are finality thresholds, not request counts.
- Point Across reads at API V5 on `api.across.to`. Swap API paths, `integratorId`, `tradeType` and fractional `slippage` are legacy.

## 0.4.2 - 2026-11-11

- Point the CoW SDK documentation link at docs.cow.fi; the old Mintlify host returns 404.
- Point the LI.FI quote docs at the current API reference.
- Replace the dead Across swap-skill path with the current skill, which deprecates `/swap/*`.

## 0.4.1 - 2026-10-25

- Inline the domain-specific worked comparison and recovery case; remove the repeated intake/preferences wrapper.
- Consolidate current protocol routing and package documentation while preserving standalone skill resources and public names.
- Correct the older Jupiter fixture to match current keyless quote-only v2 access and bounded rate-limit recovery.

## 0.4.0

- Add standalone 0x swap, 1inch swap, CoW order, Jupiter swap, Relay bridge, Across bridge, Circle CCTP procedures with concrete reads, worked outcomes and failure handling.
- Bundle source records, portable resources and routing/behavior exercises for independent installs.

## 0.3.2 · 2026-10-19

- Correct the CCTP API limit to 40 requests per second and the Uniswap quote field to `txFailureReasons`.

## 0.3.1 · 2026-10-08

- Clarify the pack's purpose, single-skill installation and a first prompt with expected evidence.
- Align current npm examples and discovery metadata with this release; preserve protocol procedures and standalone package interfaces.

## 0.3.0 - 2026-10-08

- Add Across embedded-route/refund and Socket deposit-address lifecycle references.
- Distinguish signed Aave orders, route submission and actual destination settlement.

## 0.2.0 - 2026-09-27

- Add `uniswap-swap`: Quote Uniswap swaps, inspect Permit2 and reconcile AMM or order execution.
- Add `lifi-cross-chain`: Compare LI.FI quotes and reconcile destination delivery, partial fills and refunds.
- Add standalone read recipes, offline helper tests, worked outputs and protocol behavioral fixtures.


## 0.1.3 - 2026-09-09

Add task-specific intake, configurable provider and user preferences, calculated successful examples and recovery paths. Preserve standalone installation and existing authorization boundaries.

## 0.1.2 - 2026-09-07

Treat capital on another supported chain as deployable through a quoted bridge, add bridge fee accounting and bridge-verify-trade sequencing, and compare executable routes rather than preferred quote currencies.

## 0.1.1 - 2026-09-06

Replace internal keywords with named protocol terms from this pack's own skill guidance.

## 0.1.0 - 2026-09-05

Initial independent routing pack with official provider references, operational workflows, evidence requirements and portable Agent Skills metadata.
