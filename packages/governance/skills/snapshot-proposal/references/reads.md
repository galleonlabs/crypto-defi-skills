# Read recipes and sources

Reviewed 2026-10-25. These recipes establish documented interfaces, not a live account or executed outcome.

Hub GraphQL endpoint: `https://hub.snapshot.org/graphql`. Use a variables-bound query for the exact proposal, for example:

```graphql
query Proposal($id: String!) {
  proposal(id: $id) { id title body choices type start end snapshot state space { id } }
}
```

Load strategy and vote fields from the current documented schema and paginate. For an existing MCP at `https://mcp.snapshot.box`, discover `snapshot-query` and `snapshot-schema` arguments. Do not assume current no-auth access from documentation or enable write tools. Snapshot X uses its distinct onchain data/execution model.

## Primary sources

- [Snapshot Hub API](https://docs.snapshot.box/tools/api.md)
- [Snapshot MCP access and tools](https://docs.snapshot.box/tools/snapshot-mcp)
- [Snapshot voting rules](https://docs.snapshot.box/user-guides/voting/vote.md)
- [Snapshot X model](https://docs.snapshot.box/snapshot-x/overview)
