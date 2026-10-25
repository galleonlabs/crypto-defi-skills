# Official tools for lp-setup

Provider access is optional. Reuse a suitable tool already configured by the user; installing this skill neither connects a service nor grants wallet authority. Resolve current tool schemas and deployments before use. The linked provider surfaces were reviewed on 2026-09-05; dated versions are evidence, not claims about the latest release.

## Connect only what the first task needs

| Requested result | Optional maintained surface | First useful evidence |
| --- | --- | --- |
| Uniswap interface handoff | Official `liquidity-planner` | Correct pool and review link |
| Uniswap unsigned construction | `lp-integration` and LP API, or protocol SDK | Supported chain/action and decoded unsigned response |
| Aerodrome pools or positions | Sugar CLI/SDK | Bounded read with clean diagnostics |
| Indexed LP analytics or supported plans | Revert MCP | Tools list, capabilities, chain freshness and one read |
| Curve/Balancer liquidity | Official SDK and existing RPC | Exact generation, pool and amount units |
| Public farm screening | VFAT website | Dated filtered view, without wallet connection |

If the user chooses upstream Uniswap skills, select only the needed one through the harness or `npx skills add Uniswap/uniswap-ai --skill liquidity-planner`. Installing it does not supply a wallet or execution service. Hosted LP construction uses `https://liquidity.api.uniswap.org` with `UNISWAP_API_KEY` as a backend `x-api-key` header. An absent key blocks that API, not RPC reads or an interface handoff. Keep keys out of URLs, bundles and evidence; check account terms, quotas and fees.

For user-selected Sugar access, the reviewed invocation is:

```sh
uvx --from git+https://github.com/velodrome-finance/sugar-sdk.git@v0.4.1 sugar pools --help
uvx --from git+https://github.com/velodrome-finance/sugar-sdk.git@v0.4.1 sugar pools --chain=8453 --limit=3
```

Configure `SUGAR_RPC_URI_8453` privately when needed. A prior default-RPC smoke returned one pool and exit zero alongside path-chunk RPC errors: partial output fails complete discovery. Keep stdout and stderr and rerun with a suitable RPC. No signer is needed for help or pool reads.

If Revert is selected, register its URL using the harness's supported remote-MCP settings. Discover tools and read `get_protocol_capabilities` and `get_chain_status` before a relevant query. Reviewed public discovery was keyless (server 1.7.0, served skill 1.9); recheck current access rather than inventing credentials. Provider-side confirmation, unsigned planning and wallet submission are separate capabilities. Never enable every tool as read-only: `confirm_transaction` updates provider accounting.

VFAT public screening requires no wallet. No supported public VFAT MCP/API contract or wrapper-SDK distribution was verified. Record each connection as documented, discovered, read-tested or unavailable, with costs, supported custody and fallback; installing another stack is not required to complete supported reads.

## Official sources

- [Uniswap AI](https://developers.uniswap.org/docs/uniswap-ai/overview) and [LP API integration](https://developers.uniswap.org/docs/liquidity/liquidity-provisioning-api/integration-guide).
- [Aerodrome/Sugar integration](https://github.com/velodrome-finance/docs/blob/main/content/sdk.mdx), [Sugar SDK](https://github.com/velodrome-finance/sugar-sdk) and [Slipstream deployments](https://github.com/aerodrome-finance/slipstream#deployments).
- [Revert agent interface](https://mcp.revert.finance/skill); optional remote MCP at `https://mcp.revert.finance/mcp`.
- [Curve SDK](https://github.com/curvefi/curve-js) and [Balancer liquidity SDK](https://docs.balancer.fi/integration-guides/add-liquidity/sdk-tutorial.html).
- [VFAT documentation](https://github.com/vfat-io/vfat-docs); role-specific [VFAT guidance](vfat.md) covers Sickle permissions and fees.
