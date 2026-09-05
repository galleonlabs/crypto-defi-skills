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

- [Revert agent skill](https://mcp.revert.finance/skill), served version 1.8, reviewed 2026-09-04. No license statement was present in the served skill. Its public behavior informed independent approval-phase, freshness, capability, atomic-funding, and receipt-contract analysis. No text or code was copied. Optional official tool access is now documented explicitly; no hosted route is installed, called, or required by the package.
- [v3utils](https://github.com/revert-finance/v3utils/tree/e29e49af36ee05d2c9734fc4cdb1855c929555e9), MIT. Reviewed for stateless NFT transformations, one-token and third-token funding, swap bounds, leftovers, approval cleanup, automation triggers, and position-ID transitions.
- [Compoundor](https://github.com/revert-finance/compoundor/tree/800d0a6462be0bf78a418f3d58dd407eeadef173), MIT. Reviewed for fee compounding, owner and beneficial-owner accounting, TWAP guards, operator rewards, loose balances, and custody risks.
- [Revert backtester](https://github.com/revert-finance/revert-backtester/tree/701dfcdddd742566db90a06c2a50f5f0619b3a3c), MIT. Reviewed for historical position reconstruction, active-liquidity dilution, sparse intervals, time-in-range estimation, benchmark choice, and validation bias. The guidance treats fee dilution, candle paths, and incomplete position histories as estimates.
- [StableSwap Hooks](https://github.com/revert-finance/stableswap-hooks/tree/101ba88167c711a05e32553c0c750eab5694818c), Business Source License 1.1 with a future MIT change license. This is source-available, not treated as MIT. It was used only to identify generic share-model, reserve, rate-source, amplification, convergence, fee, and exit questions. No text or code was copied or adapted.

## Independent implementation

All instructions, schemas, examples, math utilities, tests, and transaction controls in this repository were independently written for this project. Research sources do not imply affiliation, endorsement, or runtime dependence. Protocol addresses are deliberately absent. Integrators must resolve current deployments from official registries and verify bytecode and chain state.

## Official tool reuse (2026-09-05)

- [Uniswap official installation](https://developers.uniswap.org/docs/uniswap-ai/overview), [LP integration skill](https://github.com/Uniswap/uniswap-ai/tree/main/packages/plugins/uniswap-trading/skills/lp-integration), and [v4 SDK skill](https://github.com/Uniswap/uniswap-ai/tree/main/packages/plugins/uniswap-trading/skills/v4-sdk-integration). Verified skill names and selective installation format. The [LP API guide](https://developers.uniswap.org/docs/liquidity/liquidity-provisioning-api/integration-guide) establishes the separate liquidity API host and API-key header. No authenticated LP request or wallet action was performed.
- [Velodrome/Aerodrome SDK guide](https://github.com/velodrome-finance/docs/blob/main/content/sdk.mdx), [Sugar SDK v0.4.1](https://github.com/velodrome-finance/sugar-sdk/tree/54bff249f306abe43f0c75ae4dfb7b2f469ef596), and [Sugar contracts](https://github.com/velodrome-finance/sugar). Verified pinned CLI installation and pool command help. A Base pool smoke returned one pool with exit code 0, but also path-chunk RPC errors; this is documented as degraded coverage requiring a suitable RPC, not clean live readiness. Reuse upstream SDK/CLI and skill rather than copying their runtime. See [Slipstream deployments](https://github.com/aerodrome-finance/slipstream#deployments) for coexisting factories, position managers and gauge generations.
- [Revert agent interface](https://mcp.revert.finance/skill), served skill 1.9. Independently observed a public MCP initialize handshake (server 1.7.0), tools list, `get_protocol_capabilities`, and `get_chain_status` responses without credentials. No transaction planner or wallet action was called. Optional provider selection supersedes the earlier research-only treatment: disclose fees, permissions and custody, keep direct alternatives, and preserve local exact-authorization and receipt checks. No upstream skill text or runtime was copied.

All guides are included inside each independently installable skill. The package neither registers external providers nor configures credentials. Reviewed versions are dated evidence, not timeless latest-version claims.

## VFAT research and optional tool access (2026-09-05)

- [VFAT Yield](https://vfat.io/yield) rendered a populated public farm table without wallet connection. Verified filters, Farms/Pools/Deposits navigation, TVL/rewarded/active TVL, average APR/range fields and disabled wallet actions. No portfolio, quote, approval or transaction was tested. Browser observations are a dated interface check, not independent proof of live pool state.
- [Official documentation](https://github.com/vfat-io/vfat-docs/tree/11cbbd4b25fa240fbad2772c835eba875a1ae5d8): [yield](https://docs.vfat.io/yield/), [APRs](https://docs.vfat.io/aprs/), [fees](https://docs.vfat.io/fees/), [Sickle](https://docs.vfat.io/sickle/), [automation](https://docs.vfat.io/automation/), [rebalance](https://docs.vfat.io/automation/rebalance/), [compound](https://docs.vfat.io/automation/compound/), [harvest](https://docs.vfat.io/automation/harvest/), and [audits](https://docs.vfat.io/audits/). Used to independently explain field definitions, fee bases, control layers and the difference between rebalance suspension and an exit. The launch-era coverage description is not a current chain allowlist; fee rates and automation settings require fresh verification. No documentation text was copied.
- [sickle-public](https://github.com/vfat-io/sickle-public/tree/74dfa3d33ef97b5b69cb91a21558dd53344ed108), MIT. Reviewed SickleStorage, SickleRegistry, position/NFT settings and FeesLib for owner/operator separation, registered multicalls, action settings, fee keys and authority. Source and audit scope do not establish the state of a live deployment.
- [sickle-wrapper](https://github.com/vfat-io/sickle-wrapper/tree/0152727ecd878faee7dcb222b9f88c5126a3a3b8). No root license was present; Solidity files have MIT identifiers and the SDK manifest declares ISC. Reviewed wrapper ownership, reward-router fees and separate withdrawal paths. Its SDK manifest depends on a sibling local package; both documented public npm package endpoints returned 404. No public supported quoting endpoint/auth contract or MCP was verified. No wrapper or fee route was adopted.
- [vfat-tools](https://github.com/vfat-io/vfat-tools/tree/0b0d90c63fd5c6f40ee5789eb50e39992b0cc0ae), MIT notices in LICENSE. Treat this as legacy vfat.tools adapter/calculation research, not the complete source of the current vfat.io/yield application. The VFAT Sugar SDK fork does not supersede its maintained Velodrome upstream.

All additions are independently written guidance. No VFAT code, contract addresses, API credentials or live positions are vendored. Each canonical skill carries its own role-specific reference for standalone installation.
