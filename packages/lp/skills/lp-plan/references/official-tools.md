# Official tools for lp-plan

Provider access is optional. Reuse a suitable tool already configured by the user; installing this skill neither connects a service nor grants wallet authority. Resolve current tool schemas and deployments before use. The linked provider surfaces were reviewed on 2026-09-05; dated versions are evidence, not claims about the latest release.

## Choose an unsigned construction path

For Uniswap, choose an official interface handoff, the `lp-integration` skill and hosted LP API, or the protocol SDK for unsupported local features. The LP API uses `https://liquidity.api.uniswap.org` and a private backend `x-api-key`; absence of access leaves RPC/interface alternatives. Local v4 work uses the selected PoolKey, hook behavior and current deployment, rather than v3 parameters with a new address. This skill's Uniswap handoff and atomic-funding references define the detailed plan contract.

Sugar's `deposit`, `withdraw`, `stake`, `unstake`, `claim_fees` and `claim_emissions` construct unsigned calls. Verify command help at the selected SDK version. `--wallet` is the public sender; preserve integer transaction `value`, inspect stderr, and never pipe stdout to a signer. Resolve factory, position manager and gauge for this actual position because deployment generations coexist.

Optional Revert planning starts with `get_protocol_capabilities` and `get_chain_status`. Select only an advertised `prepare_*` matching chain, protocol, custody and action; read support does not establish builder support. A Revert website handoff is a separate user choice. Disclose provider/routing/automation fees, recipients, approvals, NFT transfers and resulting custody. Rebuild after confirmed approval receipts and retain the exact plan digest. Borrowing against an LP position is a separate financial action.

For Curve, preserve factory family, coin order and wrapped/underlying units; documented SDK slippage is a percentage, not bps or a fraction. For Balancer, query the exact amount vector and sender using the right V2/V3 vault, then bound BPT or exit output and inspect permits, hooks and boosted assets. SDK methods can execute if supplied a signer: use reads/query/unsigned construction only here.

VFAT/Sickle planning must resolve strategy contracts, owner and automation authority. Enrollment changes permissions and is not implied by choosing a farm. Old Aerodrome/Velodrome gauges no longer pay emissions after the 2026-10-22 Aero launch; current gauge and fee rights need independent evidence. Keep missing provider coverage as a specific gap and preserve direct alternatives.

## Official sources

- [Uniswap AI](https://developers.uniswap.org/docs/uniswap-ai/overview) and [LP API integration](https://developers.uniswap.org/docs/liquidity/liquidity-provisioning-api/integration-guide).
- [Aerodrome/Sugar integration](https://github.com/velodrome-finance/docs/blob/main/content/sdk.mdx), [Sugar SDK](https://github.com/velodrome-finance/sugar-sdk) and [Slipstream deployments](https://github.com/aerodrome-finance/slipstream#deployments).
- [Revert agent interface](https://mcp.revert.finance/skill); optional remote MCP at `https://mcp.revert.finance/mcp`.
- [Curve SDK](https://github.com/curvefi/curve-js) and [Balancer liquidity SDK](https://docs.balancer.fi/integration-guides/add-liquidity/sdk-tutorial.html).
- [VFAT documentation](https://github.com/vfat-io/vfat-docs); role-specific [VFAT guidance](vfat.md) covers Sickle permissions and fees.
