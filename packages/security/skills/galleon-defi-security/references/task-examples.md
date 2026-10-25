# Worked task and changed evidence

Synthetic observations only; descriptive steps refer to discovered provider schemas, not literal API names.

## Worked successful task

**Request:** Review this finite approval and swap against my exact intent.

**Available evidence:** Synthetic complete decoded batch: approve exactly 100 USDC to the supplied router, swap exactly 100 USDC for minimum 0.04 ETH to the supplied account, matching chain and expiry. Complete simulation shows only that allowance and balance change; all targets resolved and no nested calls omitted.

**Read sequence:** Decode the actual payload and nested calls, resolve targets, compare each authority/value change with intent, inspect simulation coverage and return a bounded verdict.

**Completed answer:** Reviewed within the supplied bounds: chain, spender, finite 100 USDC allowance, recipient, minimum 0.04 ETH and expiry match intent; complete simulation matches those effects. No mismatch found in this payload. This is scoped review evidence, not a universal safety guarantee or signature.

## Recovery and continuation

**Changed evidence:** A nested call grants an additional unlimited allowance to a different spender absent from the intent.

**Useful response:** Return intent mismatch and identify the extra spender/unlimited grant. Require a corrected payload and fresh review of that exact payload; do not approve because the main swap matches.
