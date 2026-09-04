# Sources and provenance

This corpus was written from primary protocol documentation, public skill repositories, and Galleon Labs' internal LP operating history. It does not vendor wallet code, private keys, addresses, production configuration, or private repository text.

## Standards

- [Agent Skills specification](https://agentskills.io/specification)
- [agentskill.sh](https://agentskill.sh/)
- [Cursor Agent Skills](https://cursor.com/docs/skills)
- [Vercel Labs Agent Skills](https://github.com/vercel-labs/agent-skills), MIT. The deterministic discovery publisher follows its public release pattern.

## Protocols

- [Uniswap liquidity concepts](https://developers.uniswap.org/docs/get-started/concepts/liquidity-providers/concentrated-liquidity)
- [Uniswap liquidity lifecycle](https://developers.uniswap.org/docs/liquidity/overview)
- [Uniswap LP API integration](https://developers.uniswap.org/docs/liquidity/liquidity-provisioning-api/integration-guide)
- [Uniswap v4 hooks](https://developers.uniswap.org/docs/protocols/v4/concepts/hooks)
- [Permit2 overview](https://docs.uniswap.org/contracts/permit2/overview)
- [Aerodrome liquidity documentation](https://github.com/aerodrome-finance/docs/blob/main/content/liquidity.mdx)
- [Aerodrome contracts specification](https://github.com/aerodrome-finance/contracts/blob/main/SPECIFICATION.md)
- [Aerodrome Slipstream](https://github.com/aerodrome-finance/slipstream)

## Skill research

- [Uniswap AI skills](https://github.com/Uniswap/uniswap-ai/tree/936734cdc8e704b1fdcce3211d9e6215cd10da7f), MIT. Used for the official interface handoff, LP API response contract, direct v4 SDK routing, and concrete hook-risk cases. The resulting instructions and link builder were independently written with stricter transaction controls.
- [Minara AI skills](https://github.com/Minara-AI/skills/tree/b93aba1029827c37cf5ad82b19bfa8c289912091), MIT. Used for confirmation and tool-boundary patterns.
- [BankrBot skills](https://github.com/BankrBot/skills/tree/5fa72464c855c49ef3d6d85846424f61b0f50922). No repository license was present at the reviewed commit, so no Bankr text or code was copied.
- [DeFi Native](https://github.com/emlai/defi-native-skill), MIT. Used for fee, incentive, divergence, LVR, and exit-cost decomposition.
- Galleon Labs UnaBot history. Private implementation evidence was used to identify failure modes and tests. No private source is included.

## Independent implementation

All instructions, schemas, examples, math utilities, tests, and transaction controls in this repository were independently written for this project. Protocol addresses are deliberately absent. Integrators must resolve current deployments from official registries and verify bytecode and chain state.
