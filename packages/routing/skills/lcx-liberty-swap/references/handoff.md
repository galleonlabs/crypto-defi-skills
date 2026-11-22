# Handoff check

Reviewed 2026-11-17. Run every check on each same-chain build before an unsigned handoff, and again after any rebuild. One failure means no handoff: report the failed check and re-quote. Never edit calldata to make it pass.

## Read the live router

Call `GET /v1/chains` at handoff time and take the requested chain's row: `routerDeployed`, `router` and `nativeIsToken`. LCX documents `router` as the address `/v1/quote` returns as `spender` and the one an approval is granted to, and tells integrators to read it rather than pin it. Keep no address list of your own.

## Checks

1. `swap.chainId` equals the requested chain; the build's and the chain row's `routerDeployed` are both true.
2. `swap.to`, the quote's `spender` and the chain's `router` are the same address, compared case-insensitively. A `to` equal to `spender` but different from `router` is a stop.
3. `swap.data` starts with one of the five selectors below and decodes against that signature. Any other selector, or a decode error, is a stop.
4. Read `tokenIn`, `tokenOut`, amount sold, `minAmountOut`, `recipient` and `deadline`: the flat arguments of `swapSplit`; argument `a` of the three wrappers, where `totalIn` is the amount sold; argument `a` of `makerSwap`, where `amountIn` is the amount sold.
5. `tokenIn` and `tokenOut` are the requested tokens. The native coin appears as the zero address; where `nativeIsToken` is true the gas coin appears as its token contract.
6. The amount sold equals the user's raw amount and the quote's `input.amount` exactly.
7. `recipient` equals the requested recipient, compared case-insensitively.
8. `minAmountOut` is at least the quote's `output.minimumAmount` and at least the user's own minimum. Higher is fine; lower is a stop.
9. `deadline` is later than the current time.
10. `swap.value`, a decimal string, equals the amount sold when `tokenIn` is the zero address and is `0` otherwise.
11. For `swapSplitWithFee`, `swapSplitViaPropAMM` and `swapSplitWithPropAMMSplit`, `a.integrator` is the zero address: this skill never requests an integrator, so none may take a fee. For `swapSplitWithPropAMMSplit`, `s.venueIn` is at most the amount sold. A prop-AMM `venue` needs no allowlist, because the router's final `minAmountOut` check reverts the whole transaction unless the recipient receives the floor checked in 8.
12. For `makerSwap`, the maker leg `m` is either empty (`m.amountIn` 0, `m.target` and `m.spender` the zero address, `m.data` `0x`) or both `m.target` and `m.spender` are Bebop's RFQ router or settlement contract as [Bebop currently publishes them](https://docs.bebop.xyz/core-concepts/settlement-smart-contracts) for that chain. A non-Bebop target is a stop even when `m.amountIn` is 0. Either way `m.amountIn` is at most the amount sold.

`simulation.status` `ok` adds evidence but replaces none of these checks. Where an `eth_call` from the taker is available, a revert is a stop; for an ERC-20 sell it can only run after the approval.

## Router entrypoints

All five are payable and return `uint256 amountOut`. Selectors were recomputed from these signatures with `cast sig`.

| Selector | Function |
| --- | --- |
| `0xfc54261d` | `swapSplit(address tokenIn, address tokenOut, uint256 totalIn, uint256 minAmountOut, address recipient, uint256 deadline, Leg[] legs)` |
| `0x5e98574a` | `swapSplitWithFee(FeeSwapArgs a, Leg[] legs)` |
| `0x195e648e` | `swapSplitViaPropAMM(FeeSwapArgs a, Leg[] legs, address venue, uint256 coreNetOut)` |
| `0x31ab353b` | `swapSplitWithPropAMMSplit(FeeSwapArgs a, Leg[] splitLegs, Leg[] fullLegs, (address venue, uint256 venueIn, uint256 venueMinOut) s)` |
| `0xa565fdcc` | `makerSwap((address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut, address recipient, uint256 deadline) a, Leg[] poolLegs, (address target, address spender, uint256 amountIn, uint256 minOut, bytes data) m, Leg[] fallbackLegs)` |

- `Leg` is `(uint256 amountIn, Hop[] hops)`.
- `Hop` is `(uint8 family, address pool, address tokenIn, address tokenOut, uint256 aux)`.
- `FeeSwapArgs` is `(address tokenIn, address tokenOut, uint256 totalIn, uint256 minAmountOut, address recipient, uint256 deadline, address integrator)`.

Live check, 2026-11-22: the `/v1/chains` routers on Ethereum, Base, Arbitrum and Polygon implement `swapSplit` and `makerSwap`, and recent Ethereum swaps used `swapSplit`. `swapSplitWithFee`, `swapSplitViaPropAMM` and `swapSplitWithPropAMMSplit` reverted there as unknown selectors in an `eth_call`, so a build carrying one would revert onchain. The routers also implement `swapSplitAllowance` and `permitBatchAndSwap`, which this check does not cover; under check 3 a build with either is a stop.

Decode with Foundry's `cast`, choosing the signature whose selector matches the first four bytes of `swap.data`:

```bash
L='(uint256,(uint8,address,address,address,uint256)[])[]'
F='(address,address,uint256,uint256,address,uint256,address)'
cast decode-calldata "swapSplit(address,address,uint256,uint256,address,uint256,$L)" "$DATA"
cast decode-calldata "swapSplitWithFee($F,$L)" "$DATA"
cast decode-calldata "swapSplitViaPropAMM($F,$L,address,uint256)" "$DATA"
cast decode-calldata "swapSplitWithPropAMMSplit($F,$L,$L,(address,uint256,uint256))" "$DATA"
cast decode-calldata "makerSwap((address,address,uint256,uint256,address,uint256),$L,(address,address,uint256,uint256,bytes),$L)" "$DATA"
```

## Cross-chain builds

A cross-chain `transactionRequest` targets the cross router named by the build's `approval.target`, not one of the entrypoints above, and no published ABI or live address source covers it. Check `transactionRequest.chainId`, `approval.amount`, the priced recipient and `endToEndMinOut` as the skill describes, and report the target and calldata as not independently decoded. The target is not always an LCX contract: on 2026-11-22 a `DIRECT` USDC quote from Base to Arbitrum named Across's Base SpokePool as `approval.target`, matching the SpokePool Across's HubPool records for Base.
