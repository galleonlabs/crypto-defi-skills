# Read recipes and sources

Reviewed 2026-10-25. These recipes establish documented interfaces, not a live account or executed outcome.

Official SDK tutorial flow. Balancer deprecated `@balancer/sdk` on 2026-10-28 ([README](https://github.com/balancer/b-sdk#readme)); it is unmaintained, so pin and review any version you use and confirm results with onchain router queries. No successor package was announced.

```ts
const api = new BalancerApi('https://api-v3.balancer.fi/', chainId);
const poolState = await api.pools.fetchPoolState(pool);
const queryOutput = await addLiquidity.query(addLiquidityInput, poolState);
```

`BalancerApi` and `AddLiquidity` come from `@balancer/sdk`; build `addLiquidityInput` from the selected version's typed example, exact token amounts, sender and liquidity kind. Inspect `queryOutput.bptOut`. Use the matching `RemoveLiquidity` workflow for exits. The official tutorial's `Permit2Helper.signAddLiquidityApproval` signs; it is excluded from read-only preparation. Choose `buildCall` or the documented permit path only after inspecting that version's contract requirements.

## Primary sources

- [Balancer add-liquidity SDK tutorial](https://docs.balancer.fi/integration-guides/add-liquidity/sdk-tutorial.html)
- [Balancer removal SDK tutorial](https://docs.balancer.fi/integration-guides/remove-liquidity/sdk-tutorial.html)
- [Official SDK, deprecated 2026-10-28](https://github.com/balancer/b-sdk)
