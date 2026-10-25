# Worked task and changed evidence

Synthetic observations only; descriptive steps refer to discovered provider schemas, not literal API names.

## Worked successful task

**Request:** Check only whether this token has a mutable transfer fee.

**Available evidence:** Synthetic pinned verified source at block 500: transfer calls feeBps, owner-only setter accepts 0 through 1000 basis points; current value 100. Ownership is active. No liquidity or holder data supplied.

**Read sequence:** Trace transfer fee usage to its setter and access control, pin source/deployment/block and distinguish current value from owner capability.

**Completed answer:** Finding FEE-001: transfer fee is currently 1% and the active owner can raise it to 10%, based on the pinned setter bound and transfer usage at block 500. Scope covers fee mutability only; liquidity and holder distribution were not evaluated. No broader token safety verdict.

## Recovery and continuation

**Changed evidence:** Only ABI exposes setFee but implementation and setter bounds are unavailable.

**Useful response:** Report fee mutability as unverified from ABI alone; request verified implementation and control state. Do not infer a 10% cap or malicious behavior from the function name.
