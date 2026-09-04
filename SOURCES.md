# Sources and provenance

This corpus reorganizes public Galleon Labs operating knowledge around portable user intents. It contains no private keys, addresses, accounts, strategies, production configuration, or transaction history.

## Standards

- [Agent Skills specification](https://agentskills.io/specification)
- [agentskill.sh](https://agentskill.sh/)
- [Cursor Agent Skills](https://cursor.com/docs/skills)
- [Vercel Labs Agent Skills](https://github.com/vercel-labs/agent-skills), MIT. The discovery publisher follows its public release pattern.

## Hyperliquid

- [Hyperliquid documentation](https://hyperliquid.gitbook.io/hyperliquid-docs), checked 2026-09-04. Current API, account abstraction, portfolio margin, funding, margin, liquidation, order, and WebSocket behavior.
- [Hyperliquid Python SDK](https://github.com/hyperliquid-dex/hyperliquid-python-sdk/tree/2fdb18f9517675ea03695a0962bd19eece9c83f0) 0.24.0, MIT. Used to verify request construction and signing boundaries.
- [HyperGrok Trading Desk](https://github.com/galleonlabs/hypergrok-trading-desk/tree/c256af8d45fa6acf02e42268440391c7df448030) 1.4.2, MIT. Source for stressed-stop sizing, ticketing, client order IDs, unknown-result recovery, partial-fill protection, monitoring, and review controls.
- [DeFi Native](https://github.com/emlai/defi-native-skill), MIT. Used for funding, balance-sheet, liquidation, and market-structure decomposition.

## Prior skill research

- [Minara AI skills](https://github.com/Minara-AI/skills/tree/b93aba1029827c37cf5ad82b19bfa8c289912091), MIT. Used for confirmation and tool-boundary patterns.
- [BankrBot skills](https://github.com/BankrBot/skills/tree/5fa72464c855c49ef3d6d85846424f61b0f50922). No repository license was present at the reviewed commit, so no Bankr text or code was copied.

## Implementation

The skill routing, references, evaluation cases, TypeScript tools, tests, and package are maintained here. Mutable constants are deliberately absent from executable code. Agents must query current metadata, account state, and official documentation before acting.
