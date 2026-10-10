# Vault read recipes

Use verified `VAULT`, `OWNER`, `CONTROLLER`, `CALLER`, `RPC_URL`, numeric `BLOCK` and raw amounts. Resolve the network and block hash through the selected official RPC tool first; record the hash and recheck it after reads to detect reorganization. These are read-only calls. Cast is optional; an existing official SDK or provider tool with equivalent block-pinned calls is sufficient.

## Interface and token identity

```sh
cast call "$VAULT" 'asset()(address)' --from "$CALLER" --rpc-url "$RPC_URL" --block "$BLOCK"
cast call "$VAULT" 'supportsInterface(bytes4)(bool)' 0x01ffc9a7 --from "$CALLER" --rpc-url "$RPC_URL" --block "$BLOCK"
cast call "$VAULT" 'supportsInterface(bytes4)(bool)' 0xffffffff --from "$CALLER" --rpc-url "$RPC_URL" --block "$BLOCK"
cast call "$VAULT" 'supportsInterface(bytes4)(bool)' 0x620ee8e4 --from "$CALLER" --rpc-url "$RPC_URL" --block "$BLOCK"
cast call "$VAULT" 'supportsInterface(bytes4)(bool)' 0x2f0a18c5 --from "$CALLER" --rpc-url "$RPC_URL" --block "$BLOCK"
```

ERC165 support should identify its own interface and reject the invalid ID. The redemption ID is `0x620ee8e4`; `0x2f0a18c5` is ERC7575. These claims still require implementation verification. Legacy ERC4626 vaults need not implement ERC165; failure is not automatic proof of either mode.

For verified ERC7575/ERC7540, resolve `SHARE` from `share()`. For ordinary ERC4626, use the vault address as `SHARE`. Resolve `ASSET` from `asset()`; do not use a symbol as identity.

```sh
cast call "$VAULT" 'share()(address)' --from "$CALLER" --rpc-url "$RPC_URL" --block "$BLOCK"
cast call "$SHARE" 'decimals()(uint8)' --from "$CALLER" --rpc-url "$RPC_URL" --block "$BLOCK"
cast call "$ASSET" 'decimals()(uint8)' --from "$CALLER" --rpc-url "$RPC_URL" --block "$BLOCK"
cast call "$SHARE" 'balanceOf(address)(uint256)' "$OWNER" --from "$CALLER" --rpc-url "$RPC_URL" --block "$BLOCK"
```

## Synchronous exit

Use the intended vault caller as `CALLER` and record it in `snapshot.caller`. Previews may depend on `msg.sender`, including caller-specific fees. If an authorized route calls the vault through a router, inspect that route and use the router as the vault caller; a direct EOA preview is not its quote. Preserve the user wallet identity separately for the complete route simulation.

```sh
cast call "$VAULT" 'maxWithdraw(address)(uint256)' "$OWNER" --from "$CALLER" --rpc-url "$RPC_URL" --block "$BLOCK"
cast call "$VAULT" 'maxRedeem(address)(uint256)' "$OWNER" --from "$CALLER" --rpc-url "$RPC_URL" --block "$BLOCK"
```

Choose the smaller supported portion in the requested unit. Then use exactly one corresponding preview with raw `ASSETS` or `SHARES` for that portion:

```sh
cast call "$VAULT" 'previewWithdraw(uint256)(uint256)' "$ASSETS" --from "$CALLER" --rpc-url "$RPC_URL" --block "$BLOCK"
cast call "$VAULT" 'previewRedeem(uint256)(uint256)' "$SHARES" --from "$CALLER" --rpc-url "$RPC_URL" --block "$BLOCK"
```

For example, a 1,000-share request with a 400-share limit leaves 600 shares outside the supported portion. A full-size preview of 1,089 assets cannot price the partial exit. A separate `previewRedeem(400)` returning 435.6 assets supports that estimate, subject to the recorded block, simulation and any required slippage guard.

## Asynchronous claim state

Read the actual controller, which may differ from the owner whose shares were requested:

```sh
cast call "$VAULT" 'maxWithdraw(address)(uint256)' "$CONTROLLER" --from "$CALLER" --rpc-url "$RPC_URL" --block "$BLOCK"
cast call "$VAULT" 'maxRedeem(address)(uint256)' "$CONTROLLER" --from "$CALLER" --rpc-url "$RPC_URL" --block "$BLOCK"
cast call "$VAULT" 'pendingRedeemRequest(uint256,address)(uint256)' "$REQUEST_ID" "$CONTROLLER" --from "$CALLER" --rpc-url "$RPC_URL" --block "$BLOCK"
cast call "$VAULT" 'claimableRedeemRequest(uint256,address)(uint256)' "$REQUEST_ID" "$CONTROLLER" --from "$CALLER" --rpc-url "$RPC_URL" --block "$BLOCK"
```

Record raw share units for both request reads. Read ID zero once for aggregate implementations. For nonzero IDs, enumerate the verified inventory and state whether it covers the full controller history. There is no standard request enumeration or generic claim-by-ID signature. A scan of only recent events is partial coverage.

Do not use redemption previews on this branch. Controller-wide maximum assets are a directly observed bound, not a conversion of pending shares. Controller-wide maximum shares are claimable share capacity; wallet balance may be zero because the earlier request removed custody.

For a delegated claim, check the implementation's operator rules; an ERC20 share allowance does not substitute for controller operator approval. ERC7540 supplies `isOperator(controller, caller)` for this read. Request submission from an owner is a distinct authorization path. Keep all transaction preparation unsigned unless actual user authority covers the write.

## Provider-specific limits

Centrifuge documents both fully asynchronous and instant-deposit vaults with request-based redemptions. Follow its current official integration guide for the specific deployment, eligibility and request processing. Other vault queues, cooldowns and cancellation extensions need their own verified interface. Do not label every delayed ERC4626 exit ERC7540.

## Primary sources checked 2026-10-10

- [ERC4626](https://eips.ethereum.org/EIPS/eip-4626): synchronous limits, previews and rounding.
- [ERC7540](https://eips.ethereum.org/EIPS/eip-7540): requests, controllers and asynchronous claims.
- [ERC7575](https://eips.ethereum.org/EIPS/eip-7575): external share token and vault identity.
- [Centrifuge vaults](https://docs.centrifuge.io/user/concepts/vaults/): deposit versus redemption modes.
- [Centrifuge integration](https://docs.centrifuge.io/build/): documented request and withdrawal procedure.

These recipes were reviewed against documentation. No live deployment, authenticated provider, simulation or financial execution is claimed.
