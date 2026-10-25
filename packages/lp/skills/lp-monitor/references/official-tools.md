# Official tools for lp-monitor

Provider access is optional. Reuse a suitable tool already configured by the user; installing this skill neither connects a service nor grants wallet authority. Resolve current tool schemas and deployments before use. The linked provider surfaces were reviewed on 2026-09-05; dated versions are evidence, not claims about the latest release.

## Read the position the user owns

Read actual pool, position manager/LP token, owner and custody through existing RPC or supported official tools. Sugar provides Aerodrome `positions` and pool reads; resolve the position's deployment generation and retain diagnostics. A partial response or RPC chunk error is degraded evidence even if the CLI exits zero.

Optional Revert reads require current capability and chain-freshness checks. Use `get_positions` or `get_position_details` only when advertised for the chain/protocol, with bounded pagination. Distinguish indexed observations from a fresh chain reread. Do not use `confirm_transaction` as a read: it changes provider accounting. A provider's order/plan state alone is not proof of resulting ownership or balances.

Curve LP balances and gauge deposits are separate claims. Balancer BPT, boosted assets, vault generation and hooks affect exit accounting. For both, read the actual withdrawal constraints instead of treating TVL as available exit liquidity. Never apply v3 NFT or range accounting to share-based pools.

For VFAT, verify Sickle beneficial ownership, active strategy/automation and exact fee basis using the local VFAT reference. A rendered farm APR is not the user's realized return. From 2026-10-22 00:00 UTC former Aerodrome/Velodrome gauges pay no emissions; pools still earn fees under their own rules, and no position migrates automatically. Resolve any new Aero gauge separately.

Return fresh value, fees, rewards, costs, versus-HOLD result and missing history with sources and times. Monitoring can propose an action but cannot submit it, enroll automation or switch an approved route. Keep an uncertain prior transaction tied to its original hash while reconciling.

## Official sources

- [Uniswap AI](https://developers.uniswap.org/docs/uniswap-ai/overview) and [LP API integration](https://developers.uniswap.org/docs/liquidity/liquidity-provisioning-api/integration-guide).
- [Aerodrome/Sugar integration](https://github.com/velodrome-finance/docs/blob/main/content/sdk.mdx), [Sugar SDK](https://github.com/velodrome-finance/sugar-sdk) and [Slipstream deployments](https://github.com/aerodrome-finance/slipstream#deployments).
- [Revert agent interface](https://mcp.revert.finance/skill); optional remote MCP at `https://mcp.revert.finance/mcp`.
- [Curve SDK](https://github.com/curvefi/curve-js) and [Balancer liquidity SDK](https://docs.balancer.fi/integration-guides/add-liquidity/sdk-tutorial.html).
- [VFAT documentation](https://github.com/vfat-io/vfat-docs); role-specific [VFAT guidance](vfat.md) covers Sickle permissions and fees.
