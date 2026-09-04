# Pool assessment

Run gates before ranking. An unknown hard gate is a failed gate for deployment purposes.

## Identity gate

- Chain ID and finality model
- Protocol version and official factory
- Pool address, or v4 PoolId plus full PoolKey
- Token addresses, order, symbols, names, and decimals
- Fee, tick spacing, invariant, hook, NFT manager, gauge, and reward contracts
- Verified bytecode or verified source, proxy implementation, owners, admins, pausers, and upgrade delays

## Token gate

Test both assets for transfer restrictions, taxes, rebases, blacklists, pausing, mint authority, upgradeability, wrapper or bridge dependence, redemption terms, holder concentration, and counterfeit identity. Simulate buy, transfer, approve, add, remove, and sell paths where lawful and possible. A successful buy does not prove a successful sell or liquidity removal.

## Pool gate

- Pool age and observation history
- Total liquidity and active liquidity near the current price
- Depth at the user's entry and exit size, not headline TVL
- Volume by consistent windows, unique flow where available, and wash or self-trade signs
- Fee switches, dynamic fee control, hook permissions, gauge state, reward budget, and epoch end
- Oracle or TWAP availability and manipulation cost
- Liquidity and ownership concentration
- Pauses, incidents, migrations, and prior range or reward discontinuities

## Return decomposition

Report each component separately:

1. Swap fees actually earned over a stated window.
2. Incentives at current token price, remaining budget, end time, eligibility, and dilution assumptions.
3. Inventory value relative to the original HOLD quantities at current prices.
4. Entry, rebalancing, claim, exit, conversion, bridge, gas, slippage, MEV, and tax costs.
5. Opportunity cost of the user's chosen benchmark.

A concentrated LP is short path volatility. Narrower ranges increase capital efficiency and gamma exposure. Fee APR is compensation from realized flow; it is not evidence that fees exceed divergence or loss versus rebalancing.

Choose one accounting convention for divergence, LVR, and execution loss. Explain it. Do not subtract overlapping estimates twice.

For Aerodrome and Slipstream, prove whether a position receives fees, emissions, or both. Do not sum mutually exclusive routes.

## Exit gate

Quote the full unwind at the user's size. Verify unstake delays, reward claims, liquidity removal, collect semantics, token taxes, price impact, native wrapping, bridges, approval cleanup, and whether the position remains manageable if a pool leaves the curated list.

## Ranking

Remove gate failures first. Rank the remainder on dated evidence:

- executable depth and exit quality
- organic fee pace and persistence
- reward quality and remaining runway
- active-liquidity fit for the intended range
- contract, token, hook, admin, and bridge risk
- operational load and expected action cost

Show raw measures beside any score. Avoid universal weights or fixed thresholds. Use the user's capital, horizon, and loss constraints.
