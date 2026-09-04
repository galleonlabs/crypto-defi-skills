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

## Revert Finance research

- [Revert agent skill](https://mcp.revert.finance/skill), served version 1.8, reviewed 2026-09-04. No license statement was present in the served skill. Its public behavior informed independent approval-phase, freshness, capability, atomic-funding, and receipt-contract analysis. No text, code, endpoint dependency, transaction route, or fee path was copied.
- [v3utils](https://github.com/revert-finance/v3utils/tree/e29e49af36ee05d2c9734fc4cdb1855c929555e9), MIT. Reviewed for stateless NFT transformations, one-token and third-token funding, swap bounds, leftovers, approval cleanup, automation triggers, and position-ID transitions.
- [Compoundor](https://github.com/revert-finance/compoundor/tree/800d0a6462be0bf78a418f3d58dd407eeadef173), MIT. Reviewed for fee compounding, owner and beneficial-owner accounting, TWAP guards, operator rewards, loose balances, and custody risks.
- [Revert backtester](https://github.com/revert-finance/revert-backtester/tree/701dfcdddd742566db90a06c2a50f5f0619b3a3c), MIT. Reviewed for historical position reconstruction, active-liquidity dilution, sparse intervals, time-in-range estimation, benchmark choice, and validation bias. The guidance treats fee dilution, candle paths, and incomplete position histories as estimates.
- [StableSwap Hooks](https://github.com/revert-finance/stableswap-hooks/tree/101ba88167c711a05e32553c0c750eab5694818c), Business Source License 1.1 with a future MIT change license. This is source-available, not treated as MIT. It was used only to identify generic share-model, reserve, rate-source, amplification, convergence, fee, and exit questions. No text or code was copied or adapted.

## Independent implementation

All instructions, schemas, examples, math utilities, tests, and transaction controls in this repository were independently written for this project. Research sources do not imply affiliation, endorsement, or runtime dependence. Protocol addresses are deliberately absent. Integrators must resolve current deployments from official registries and verify bytecode and chain state.
