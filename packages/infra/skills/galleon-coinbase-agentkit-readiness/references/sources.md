# Official sources

Reviewed 2026-09-27. Recipes target CDP SDK v2 account APIs and the current AgentKit EVM provider interface. Record the installed exact versions at use time; no unpinned dependency is installed by this skill.

- [Coinbase AgentKit repository](https://github.com/coinbase/agentkit): framework integration and wallet/action provider separation; Node.js 22+ for current TypeScript quickstart.
- [EVM provider implementation](https://github.com/coinbase/agentkit/blob/main/typescript/agentkit/src/wallet-providers/cdpEvmWalletProvider.ts): environment names and initialization lifecycle. Inspect the installed revision before calling it.
- [CDP SDK](https://github.com/coinbase/cdp-sdk): installed types and existing-account retrieval.
- [API Key Wallet quickstart](https://docs.cdp.coinbase.com/wallets/quickstart/api-key-auth): separate creation, funding and transaction operations; none is a readiness test.
- [Wallet MCP installation](https://docs.cdp.coinbase.com/coinbase-for-agents/wallet-mcp/references/install.md): hosted endpoint and OAuth setup by client (reviewed 2026-11-13).
- [Wallet MCP approval mode](https://docs.cdp.coinbase.com/coinbase-for-agents/wallet-mcp/references/approval-mode.md): write request, user approval and terminal status are separate (reviewed 2026-11-13).

The former Agentic Wallet CLI quickstart returned 404 on 2026-11-13. Existing `awal` installations require local version/help inspection; the npm distribution alone does not prove current primary documentation or deprecation.
