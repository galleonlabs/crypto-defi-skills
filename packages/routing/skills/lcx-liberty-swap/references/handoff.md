# Handoff check

Reviewed 2026-11-27. Run every check on each same-chain build before an unsigned handoff, and again after any rebuild. One failure means no handoff: report the failed check and re-quote. Never edit calldata to make it pass.

## Read the live router

Call `GET /v1/chains` at handoff time and take the requested chain's row: `routerDeployed`, `router` and `nativeIsToken`. LCX documents `router` as the address `/v1/quote` returns as `spender` and the one an approval is granted to, and tells integrators to read it rather than pin it. The dated deployment table below is for reference. Bind each handoff to the live chain row and quote.

## Checks

1. `swap.chainId` equals the requested chain; the build's and the chain row's `routerDeployed` are both true.
2. `swap.to`, the quote's `spender` and the chain's `router` are the same address, compared case-insensitively. A `to` equal to `spender` but different from `router` is a stop.
3. `swap.data` starts with the `swapSplit` or `makerSwap` selector and decodes against that signature. Stop on any other selector, a decode error, or a method unavailable on the requested chain.
4. Read `tokenIn`, `tokenOut`, `minAmountOut`, `recipient` and `deadline` from the flat arguments of `swapSplit` or from argument `a` of `makerSwap`. The amount sold is `totalIn` for `swapSplit` and `a.amountIn` for `makerSwap`.
5. `tokenIn` and `tokenOut` are the requested tokens. The native coin appears as the zero address; where `nativeIsToken` is true the gas coin appears as its token contract.
6. The amount sold equals the user's raw amount and the quote's `input.amount` exactly.
7. `recipient` equals the requested recipient, compared case-insensitively.
8. `minAmountOut` is at least the quote's `output.minimumAmount` and at least the user's own minimum. Higher is fine; lower is a stop.
9. `deadline` is later than the current time.
10. `swap.value`, a decimal string, equals the amount sold when `tokenIn` is the zero address and is `0` otherwise.
11. For `makerSwap`, the maker leg `m` is either empty (`m.amountIn` 0, `m.target` and `m.spender` the zero address, `m.data` `0x`) or both `m.target` and `m.spender` are Bebop's RFQ router or settlement contract as [Bebop currently publishes them](https://docs.bebop.xyz/core-concepts/settlement-smart-contracts) for that chain. A non-Bebop target is a stop even when `m.amountIn` is 0. Either way `m.amountIn` is at most the amount sold.

`simulation.status` `ok` adds evidence but replaces none of these checks. Where an `eth_call` from the taker is available, a revert is a stop; for an ERC-20 sell it can only run after the approval.

## Public swap and bridge methods

| Method | Selector |
| --- | --- |
| `swapSplit` | `0xfc54261d` |
| `swapSplitAllowance` | `0xfd0f402c` |
| `permitBatchAndSwap` | `0x6ae1838b` |
| `makerSwap` | `0xa565fdcc` |
| `multiSwap` | `0x91dfd47d` |
| `multiSwapWithPermit2` | `0x752f2816` |
| `swapAndBridge` | `0x5d7b93f5` |
| `swapAndBridgeWithPermit2` | `0x2345a5bc` |
| `bridge` | `0x69a06c54` |
| `bridgeWithPermit2` | `0x553c15ee` |
| `claimRefund` | `0x5e488540` |

Checked 2026-11-27 on [Ethereum](https://eth.blockscout.com/address/0x0000000000b1ae06c96aB73FF4360d7AeAaB56F0) at block 26505809 and [Polygon](https://polygonscan.com/address/0x0000000000654902B6Ed6cC240cc81CB4c4a3dff) at block 98045465. Read the EIP-1967 implementation slot and `crossChainModule()` through the proxy, then checked selector dispatch in the implementation and the module's delegate targets. `swapSplit`, `swapSplitAllowance` and `permitBatchAndSwap` dispatch in the implementation. `makerSwap` dispatches in the maker module. The other seven dispatch in the cross-chain module. On [OP Mainnet](https://optimism.blockscout.com/address/0x0000000000b1ae06c96aB73FF4360d7AeAaB56F0) at block 160087560, the router implementation delegates unmatched calls directly to the cross-chain module and has no maker module. Stop and re-quote if an OP Mainnet build uses `makerSwap`.

[LCX's deployment table](https://dex.lcx.com/docs/introduction) lists the following deployments.

| Router | Chains |
| --- | --- |
| `0x0000000000b1ae06c96aB73FF4360d7AeAaB56F0` | Ethereum, Base, Arbitrum One, OP Mainnet |
| `0x0000000000654902B6Ed6cC240cc81CB4c4a3dff` | BNB Chain, Polygon, Avalanche, Unichain, Robinhood Chain, Monad, Arc, HyperEVM, Plasma, Linea, MegaETH, Ink, World Chain, Soneium, Gnosis, Cronos, Sonic, ZKsync Era |

## Decode a same-chain build

The same-chain checks above cover `swapSplit` and `makerSwap`. Stop and re-quote for any other selector, including a public method in the table. For a deployment you have not checked, verify dispatch through the current implementation and any delegate module. Stop if that evidence is unavailable.

Decode with Foundry's `cast`, choosing the signature whose selector matches the first four bytes of `swap.data`:

```bash
L='(uint256,(uint8,address,address,address,uint256)[])[]'
cast decode-calldata "swapSplit(address,address,uint256,uint256,address,uint256,$L)" "$DATA"
cast decode-calldata "makerSwap((address,address,uint256,uint256,address,uint256),$L,(address,address,uint256,uint256,bytes),$L)" "$DATA"
```

Each leg is `(uint256 amountIn, Hop[] hops)`. Each hop is `(uint8 family, address pool, address tokenIn, address tokenOut, uint256 aux)`.

## Cross-chain builds

Read the build's `approval.target`, then check `transactionRequest.chainId`, `approval.amount`, the priced recipient and `endToEndMinOut` as the skill describes. Describe the target and calldata as unverified. An adapter can use its own contract. On 2026-11-22 a `DIRECT` USDC quote from Base to Arbitrum named Across's Base SpokePool as `approval.target`, matching the SpokePool Across's HubPool records for Base.
