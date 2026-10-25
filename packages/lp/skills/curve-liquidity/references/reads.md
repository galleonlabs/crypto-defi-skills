# Read recipes and sources

Reviewed 2026-10-25. These recipes establish documented interfaces, not a live account or executed outcome.

Use `@curvefi/api` with a read-only provider and no private key. Discover the selected factory, for example `await curve.stableNgFactory.fetchPools()`, then `const pool = curve.getPool(poolId)`.

| Read | Use |
| --- | --- |
| `pool.wallet.balances(owner)` | Wallet claim, ordered coin balances |
| `pool.depositExpected(amounts)` | Expected LP from decimal-string coin vector |
| `pool.withdrawExpected(lpAmount)` | Proportional output vector |
| `pool.withdrawOneCoinExpected(lpAmount, coinAddress)` | One-coin output |

For integer inputs the current SDK also documents `depositExpectedBigInt`, `withdrawExpectedBigInt` and `withdrawOneCoinExpectedBigInt`. Keep raw integers and returned coin identities together. Read the actual gauge's deployed ABI for `balanceOf(owner)`; wrappers require their own ownership evidence. Quote methods do not establish an executable minimum or a mined result.

## Primary sources

- [Curve JS read and expected-amount methods](https://github.com/curvefi/curve-js)
- [Curve pool contracts](https://docs.curve.finance/developer/amm/curve-amm-overview/)
