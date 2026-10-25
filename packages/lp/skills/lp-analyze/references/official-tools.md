# Official tools for lp-analyze

Provider access is optional. Reuse a suitable tool already configured by the user; installing this skill neither connects a service nor grants wallet authority. Resolve current tool schemas and deployments before use. The linked provider surfaces were reviewed on 2026-09-05; dated versions are evidence, not claims about the latest release.

## Select a read source

Use existing RPC for exact pool state, the official Sugar CLI for Aerodrome discovery, Curve/Balancer SDK reads for their own pool models, or optional Revert indexed analytics. For Revert, read the current tools list, `get_protocol_capabilities` and `get_chain_status`, then use advertised discovery/position reads with bounded pagination. Indexed coverage is not fresh chain state. Do not call planners or `confirm_transaction` as part of read-only analysis.

Uniswap's `liquidity-planner` can produce an interface handoff; it does not execute. Its LP API is an optional keyed unsigned-construction service, unnecessary for public screening. Sugar help/pool reads need no wallet; RPC chunk errors or an incomplete page make discovery degraded even when its process exits zero.

Curve pools require factory family, ordered coins and wrapped-versus-underlying units. Balancer analysis must distinguish V2, V3, CoW AMM and boosted assets instead of applying concentrated-range math to each. Verify fee rights, custody, hook dependencies and the actual exit claim before comparing yield.

VFAT's populated public farm table proves only a dated UI observation. Separate rewarded from active TVL, fees from incentives, and owner from Sickle custody; use the accompanying VFAT reference. Never turn a farm comparison into automation enrollment. From 2026-10-22 00:00 UTC the former Aerodrome/Velodrome gauges pay no emissions; pools remain live for fees, and positions do not migrate automatically. Resolve any new Aero gauge from [official Aero sources](https://aero.xyz/aero-upgrade/) before including rewards.

Report provider, observation block/time, coverage, rate basis, provider/protocol fees and custody uncertainty. A provider outage can change a read source; it does not justify fabricated zero values or a new transaction route.

## Official sources

- [Uniswap AI](https://developers.uniswap.org/docs/uniswap-ai/overview) and [LP API integration](https://developers.uniswap.org/docs/liquidity/liquidity-provisioning-api/integration-guide).
- [Aerodrome/Sugar integration](https://github.com/velodrome-finance/docs/blob/main/content/sdk.mdx), [Sugar SDK](https://github.com/velodrome-finance/sugar-sdk) and [Slipstream deployments](https://github.com/aerodrome-finance/slipstream#deployments).
- [Revert agent interface](https://mcp.revert.finance/skill); optional remote MCP at `https://mcp.revert.finance/mcp`.
- [Curve SDK](https://github.com/curvefi/curve-js) and [Balancer liquidity SDK](https://docs.balancer.fi/integration-guides/add-liquidity/sdk-tutorial.html).
- [VFAT documentation](https://github.com/vfat-io/vfat-docs); role-specific [VFAT guidance](vfat.md) covers Sickle permissions and fees.
