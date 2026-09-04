# Plan contract

Emit this structure in prose, JSON, or both.

```json
{
  "status": "ready | blocked | expired",
  "createdAt": "UTC timestamp",
  "expiresAt": "UTC timestamp",
  "chainId": 0,
  "wallet": "0x...",
  "protocol": "uniswap-v3",
  "pool": {
    "addressOrId": "0x...",
    "token0": "0x...",
    "token1": "0x...",
    "fee": "exact raw value",
    "tickSpacing": "exact value",
    "hook": "0x... or none"
  },
  "observation": {
    "block": "exact block",
    "price": "token1 per token0",
    "tick": "exact tick"
  },
  "handoff": {
    "kind": "direct | uniswap-lp-api | uniswap-interface",
    "sourceVersion": "current verified source or null",
    "requestId": "builder request id or null",
    "builtAt": "UTC timestamp or null",
    "url": "reviewed interface link or null"
  },
  "position": {
    "model": "full-range | concentrated",
    "tickLower": "exact or null",
    "tickUpper": "exact or null",
    "maxSpend0": "integer units",
    "maxSpend1": "integer units",
    "minimumLiquidity": "integer units"
  },
  "steps": [
    {
      "sequence": 1,
      "intent": "approve | mint | add | stake | other",
      "target": "verified address",
      "value": "integer native units",
      "calldataStatus": "complete | deferred",
      "limits": {},
      "simulation": {},
      "expectedStateDiff": [],
      "checkpointReads": [],
      "recovery": "stop and rebuild from chain state"
    }
  ],
  "assumptions": [],
  "blocks": []
}
```

## Ready criteria

A plan is ready only when identity, balances, approvals, quote, gas, deadlines, targets, calldata, simulations, handoff terms, and expected state changes are internally consistent. A deferred downstream step is acceptable only when the plan explains which mined value is required to build it.

Do not include a signature request. Do not represent simulated transaction hashes as receipts.
