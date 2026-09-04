# Security invariants

## Identity

- Bind numeric chain ID and wallet address at every write boundary.
- Resolve deployments from current official records; verify code and proxy implementation.
- Bind ordered token addresses and decimals. Symbols are display fields.
- For v4, bind currencies, fee, tick spacing, hook, PoolKey, and PoolId together.
- For Aerodrome, bind factory, stable flag or tick spacing, router, position manager, gauge, voter, and reward token as applicable.

## Arithmetic

- Use exact integers through protocol math and serialization.
- Test decimal asymmetry, zero amounts, maximum values, rounding direction, negative ticks, boundary ticks, and upper-tick exclusivity.
- Use floor division for negative compressed ticks. Language truncation toward zero is wrong.
- Bound tick bitmap and log scans. Mark incomplete results.

## Tokens and approvals

- Test nonstandard return values, transfer taxes, rebases, pausing, blacklist rules, allowance reset, callbacks, and upgradeable behavior.
- Verify spender and approval mechanism. Bound amount and expiry where possible.
- Separate Permit2 token approval from application authorization and one-time signature transfer.
- Track residual approvals after partial failure.

## Transactions

- Allowlist target roles, selectors, nested calls, native value, recipients, and refund recipients.
- Reject empty calldata, placeholder calldata, unknown multicalls, unexpected delegatecall, and opaque arbitrary execution.
- Enforce max spend, minimum receive or liquidity, price bounds, price impact, gas bounds, deadlines, and plan age.
- Simulate with the exact sender and native value.
- Serialize dependent writes by wallet and nonce.
- Never retry an ambiguous submission.

## Hooks and callbacks

Treat each v4 hook as an independent application. Decode permissions from its address, inspect every enabled callback, admin and upgrade control, external calls, dynamic fees, deltas, and reentrancy assumptions. Fuzz hook data and callback ordering. A verified PoolManager does not make a hook safe.

## Reporting

A plan, quote, simulation, signature request, or submitted hash must have a distinct type from a mined receipt. Completion requires receipt status and a matching state reread.
