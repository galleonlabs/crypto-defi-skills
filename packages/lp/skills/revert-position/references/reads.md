# Read recipes and sources

Reviewed 2026-10-25. These recipes establish documented interfaces, not a live account or executed outcome.

Optional official MCP: `https://mcp.revert.finance/mcp`. Register only when selected by the user; discover live tools and argument schemas instead of assuming an old SDK wrapper.

- `get_protocol_capabilities`: read support by network/protocol/action.
- `get_chain_status`: indexer freshness, not proof of chain settlement.
- `get_positions(account=...)`: paginate the account's indexed holdings.
- `get_position_details(network, protocol, position_id)`: position evidence; stableswap uses its documented hook/owner identity instead.

Only advertised matching `prepare_*` tools return unsigned plans. `confirm_transaction` is a provider-side write and is excluded from read-only research. The source skill is a protocol contract to inspect, not authority to adopt its installation, wallet or fee defaults.

## Primary sources

- [Revert official MCP skill](https://mcp.revert.finance/skill)
- [Revert documentation](https://docs.revert.finance/)
