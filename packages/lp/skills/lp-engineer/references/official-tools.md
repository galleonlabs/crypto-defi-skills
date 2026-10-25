# Official tools for lp-engineer

Provider access is optional. Reuse a suitable tool already configured by the user; installing this skill neither connects a service nor grants wallet authority. Resolve current tool schemas and deployments before use. The linked provider surfaces were reviewed on 2026-09-05; dated versions are evidence, not claims about the latest release.

## Reuse maintained construction

Choose the smallest supported upstream surface and pin its actual version in the integration. Uniswap's official `lp-integration`, `v4-sdk-integration` and `v4-security-foundations` skills cover hosted unsigned LP construction and local v4 work. The LP API uses `https://liquidity.api.uniswap.org` with private backend `x-api-key`; keep secrets out of client bundles, URLs and diagnostics. API support does not prove coverage for every hook or PoolKey.

Sugar SDK/CLI covers Aerodrome discovery and unsigned lifecycle calls; use official Sugar datasets/ABIs instead of another crawler or signer. The reviewed v0.4.1 pin is historical, not latest. Test deployment generations, stdout integer values, stderr RPC errors, bounded pagination and unsupported custody. An exit-zero partial read is not complete discovery.

For optional Revert MCP integration, discover capabilities and chain freshness; reads, `prepare_*`, website handoffs and `confirm_transaction` have different effects. The last updates provider accounting and is not a read-only diagnostic. Support for reading a venue does not establish construction support. Preserve exact-plan/digest checks, approval-phase rebuilds, disclosed fees and custody, one send and independent receipt/state reconciliation. Do not reproduce its hosted runtime or assume its schema remains unchanged.

Curve's `@curvefi/api` requires factory, ordered coin and wrapped/underlying distinctions; slippage arguments documented as percentages must not be treated as bps. Balancer's SDK uses state/query/build with generation-specific vaults, token order, permits, hooks and boosted assets. Keep SDK methods that can execute behind a signer boundary separate from reads and unsigned construction.

VFAT source can inform Sickle ownership, strategy permissions, automation and fees. No supported public VFAT MCP/API or wrapper distribution was verified; do not invent one. Automation enrollment is a separate permission change. Keep only application policy and thin mapping around upstream tools; test stale data, changed schemas, wrong custody, hidden fees, partial discovery, outage and ambiguous submission.

Record required capability, upstream pin, live read evidence, missing coverage and validation. Bundled deterministic math and diagnostics remain optional local checks, not a competing transaction runtime. Engineering work does not authorize a user's wallet action.

## Official sources

- [Uniswap AI](https://developers.uniswap.org/docs/uniswap-ai/overview) and [LP API integration](https://developers.uniswap.org/docs/liquidity/liquidity-provisioning-api/integration-guide).
- [Aerodrome/Sugar integration](https://github.com/velodrome-finance/docs/blob/main/content/sdk.mdx), [Sugar SDK](https://github.com/velodrome-finance/sugar-sdk) and [Slipstream deployments](https://github.com/aerodrome-finance/slipstream#deployments).
- [Revert agent interface](https://mcp.revert.finance/skill); optional remote MCP at `https://mcp.revert.finance/mcp`.
- [Curve SDK](https://github.com/curvefi/curve-js) and [Balancer liquidity SDK](https://docs.balancer.fi/integration-guides/add-liquidity/sdk-tutorial.html).
- [VFAT documentation](https://github.com/vfat-io/vfat-docs); role-specific [VFAT guidance](vfat.md) covers Sickle permissions and fees.
