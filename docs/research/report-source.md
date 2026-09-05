# DeFi agent primitives: provider research and implementation decisions

**Reviewed 5 September 2026.** This research expands Crypto DeFi Skills from four to fourteen independently installable packs. It covers the main operational primitives around liquidity, borrowing, staking, yield, routing, derivatives, portfolios, transaction review, payments, governance and tokenized assets. The implementation reuses official provider tools and keeps Hermes as the agent runtime.

This is broad coverage of major providers, not a claim to exhaust every protocol or to have executed every integration. The new packs are operational guidance with source references; they are not a universal transaction adapter.

Follow-up: [Minara workflow review](minara-review.md) records improvements to CLI recovery, controller ownership and recipient verification.

## Method and evidence levels

We read provider documentation, official repositories, machine-readable documentation indexes, SDK guidance and agent-specific surfaces. We followed primary links for consequential mechanics and distinguished current product versions from older examples. Three bounded research lanes covered credit/yield, execution/markets, and security/portfolio; integration research covered Hermes, portable skills, payments and governance.

Each integration can have several different evidence levels:

| Level | What it establishes | What it does not establish |
|---|---|---|
| Official documentation | Provider ownership, described interface and access model | Endpoint availability or compatibility with our runtime |
| Public discovery | A responding server and observed tool schemas at review time | Authenticated account access, reliable data or action authority |
| Bounded read | A specific query returned usable, timestamped data | Every other tool works or a paid tier is available |
| Local package/runtime checks | Corpus installation, metadata, CLI and harness behavior | Financial execution or production provider readiness |
| Simulation | Predicted behavior for a specific payload and state | Future inclusion, economic suitability or guaranteed safety |
| Receipt and resulting state | A particular submitted action's observed outcome | Blanket success for a provider integration |

The expansion research did not create wallets, log in to accounts, make paid data/model calls, transfer funds, cast votes, place trades or start ongoing automation. Public MCP checks used initialize/tool discovery only. Authenticated providers remain documented integrations until tested by their user with the appropriate scope.

## Provider ledger

Primary sources below were accessed on the review date. Detailed mechanics, access boundaries and evaluation cases live inside the linked pack's standalone references.

### Lending, staking, yield and tokenized assets

| Provider | Official evidence | Implementation decision |
|---|---|---|
| Aave | [Documentation index](https://aave.com/docs/llms.txt), [V3 SDK](https://aave.com/docs/aave-v3/getting-started/typescript), [V4 SDK](https://aave.com/docs/aave-v4/getting-started/typescript) | MCP and public GraphQL are documented. Keep V3 Pool and V4 Hub/Spoke identities separate; choose a tested SDK version instead of copying floating tags. |
| Morpho | [MCP](https://docs.morpho.org/developers/agents/mcp/), [official skills](https://docs.morpho.org/developers/agents/skills/) | Reuse upstream Earn/Borrow skills and SDK. MCP is explicitly experimental and not recommended for production; Blue variable and Midnight fixed-term borrowing differ. |
| Compound | [Collateral and borrowing](https://docs.compound.finance/collateral-and-borrowing/), [liquidation](https://docs.compound.finance/liquidation/) | Use Comet interfaces. Base asset and collateral accounting differ; do not carry Compound V2 assumptions into III. No official runtime MCP established. |
| Euler | [Agent guidance](https://docs.euler.finance/llms/), [V2 SDK](https://docs.euler.finance/build/sdk/) | Reuse five official skills and maintained V2 SDK. EVC owner/subaccount, controller, oracle and collateral activation are explicit inputs. |
| Spark / Sky | [Current docs](https://docs.spark.finance/llms.txt), [Savings V2](https://docs.spark.finance/dev/savings/spark-vaults-v2), [intents](https://docs.spark.finance/dev/savings/savings-vault-intents) | Separate SparkLend, savings and isolated markets. Accounting assets are not idle liquidity; request replacement and fulfillment matter for large exits. |
| Lido | [SDK](https://docs.lido.fi/integrations/sdk/), [withdrawal queue](https://docs.lido.fi/contracts/withdrawal-queue-erc721/) | Distinguish stETH rebasing, wstETH conversion and transferable withdrawal claims. Request, finalization and claim are separate. |
| Rocket Pool | [rETH contract](https://raw.githubusercontent.com/rocket-pool/rocketpool/master/contracts/contract/token/RocketTokenRETH.sol), [Smartnode CLI](https://docs.rocketpool.net/node-staking/cli-intro) | Use current deployed contract liquidity and exchange rate. Smartnode is node-operator tooling, not a required retail dependency. Some retail docs did not render beyond a landing page. |
| EigenLayer / EigenCloud | [Developer guide](https://docs.eigencloud.xyz/eigenlayer/restakers/restaking-guides/restaking-developer-guide), [withdrawal delay](https://docs.eigencloud.xyz/eigenlayer/security/withdrawal-delay) | Model slashable exposure, operator allocations and queued withdrawals. Conflicting historical delays make deployed eligibility authoritative. |
| Symbiotic | [Epochs and delays](https://docs.symbiotic.fi/learn/mechanics/epochs-and-delays), [vault accounting](https://docs.symbiotic.fi/modules/vault/accounting) | Read vault/epoch configuration and claim boundary. Relay SDK here is security infrastructure, unrelated to Relay swap routing. |
| Pendle | [Official agent plugins](https://github.com/pendle-finance/pendle-ai), [PT](https://docs.pendle.finance/pendle-v2/ProtocolMechanics/YieldTokenization/PT), [YT](https://docs.pendle.finance/pendle-v2/ProtocolMechanics/YieldTokenization/YT) | V2 MCP is documented; PT redeems in accounting-asset units, and YT future-yield entitlement ends at maturity. Boros belongs to derivatives. |
| Yearn | [Data services](https://docs.yearn.fi/developers/data-services/yearn-data), [legacy yDaemon](https://github.com/yearn/ydaemon), [VaultV3](https://docs.yearn.fi/developers/smart-contracts/V3/VaultV3) | Prefer Kong. Identify legacy fallback explicitly. Set loss tolerance deliberately because withdraw and redeem defaults differ. |
| Ethena | [Staking functions](https://docs.ethena.fi/solution-design/staking-usde/staking-key-functions), [mint/redeem checks](https://docs.ethena.fi/solution-design/minting-usde/order-validity-checks) | Read current cooldown and freeze/eligibility state. Secondary-market token access does not grant issuer RFQ access. |
| Ondo | [API](https://docs.ondo.finance/api-reference/overview), [OUSG redemption](https://docs.ondo.finance/qualified-access-products/ousg/redeeming), [USDY](https://ondo.finance/usdy) | Separate Stocks, OUSG and USDY product, eligibility and settlement rules. API quotes, binding terms and onchain settlement differ. |
| OpenEden | [Onboarding](https://docs.openeden.com/tbill/investor-onboarding), [FAQ](https://docs.openeden.com/tbill/faq), [structure](https://docs.openeden.com/tbill/product-structuring) | Preserve whitelisting, fund/issuer exposure, NAV and queued redemption. Older launch copy does not override current terms. |
| Kamino | [Developer overview](https://kamino.com/docs/build/developers/overview), [agent integration](https://kamino.com/docs/build/agentic-finance/openclaw-agent-integration) | Reuse official SDKs and transaction builders while keeping Hermes. Obligation, reserve freshness, lookup tables and Solana confirmation need explicit handling. |

See [lending](../../packages/lending/skills/galleon-defi-lending/references/providers.md), [staking](../../packages/staking/skills/galleon-defi-staking/references/providers.md), [yield](../../packages/yield/skills/galleon-defi-yield/references/providers.md) and [tokenized assets](../../packages/tokenized-assets/skills/galleon-defi-tokenized-assets/references/providers.md).

### Routing, liquidity and derivatives

| Provider | Official evidence | Implementation decision |
|---|---|---|
| 0x | [Agent skills](https://0x.org/post/0x-agent-skills), [CLI](https://docs.0x.org/docs/introduction/develop-with-ai/0x-cli), [official source](https://github.com/0xProject/0x-ai) | Reuse current beta CLI/SDK capabilities. Documentation MCP is not trading; API and per-request payment access differ. Never approve Settler or silently enable paid requests. |
| 1inch | [Skills](https://business.1inch.com/portal/documentation/ai-integration/ai-skills), [MCP](https://business.1inch.com/portal/documentation/ai-integration/mcp-server) | Live discovery returned ten tools rather than nine documented. Broad product proxies and wallet/order tools are not default read access. |
| CoW | [Official SDK](https://github.com/cowprotocol/cow-sdk) | Use modular SDK and correct wallet adapter. Track order UID to settlement. Community MCP and grant proposals do not establish an official production server. |
| LI.FI | [Agent integration](https://docs.li.fi/agents/overview), [MCP](https://docs.li.fi/mcp-server/overview), [recovery](https://docs.li.fi/agents/workflows/status-recovery) | Official unsigned MCP documented; live probe returned 403 here. Distinguish completed, partial and refunded outcomes and actual received assets. |
| Relay | [AI guidance](https://docs.relay.link/resources/developing-with-ai), [status v3](https://docs.relay.link/references/api/get-intents-status-v3) | Docs MCP supplies references; SDK/API executes the route workflow. Destination submitted, success and refund are separate. |
| Across | [Agent docs](https://docs.across.to/ai-agents), [MCP](https://docs.across.to/ai-agents/mcp-server), [skills](https://github.com/across-protocol/skills) | Live server exposed fourteen tools rather than seven documented, including a wallet swap tool. Use a reviewed allowlist and verify destination fill. |
| Circle CCTP | [Technical guide](https://developers.circle.com/cctp/references/technical-guide), [failed mint recovery](https://developers.circle.com/cctp/howtos/retry-failed-mint) | Burn, attestation and destination mint are separate. Domain IDs differ from chain IDs. Check nonce and receipt before retrying; never repeat burn to repair a missing mint. |
| Uniswap | [AI docs](https://developers.uniswap.org/docs/uniswap-ai/overview), [official skills](https://github.com/Uniswap/uniswap-ai) | Reuse official integration/planning/security references. Distinguish V3 NFT and V4 pool-key/hook models; planning links are not execution. |
| Aerodrome / Velodrome | [Sugar](https://github.com/velodrome-finance/sugar), [SDK](https://github.com/velodrome-finance/docs/blob/main/content/sdk.mdx), [Base integration](https://github.com/base/skills/blob/master/skills/base-mcp/plugins/aerodrome.md) | Paginate and select deployed pool generation. Sugar's unsigned output still needs explicit wallet review and receipt verification. |
| Curve | [Official JS SDK](https://github.com/curvefi/curve-js), [docs](https://docs.curve.finance/) | Discover pool families and underlying/wrapped vectors. SDK slippage uses percent; gauge stake and LP token balance differ. No official runtime MCP established. |
| Balancer | [SDK liquidity tutorial](https://docs.balancer.fi/integration-guides/add-liquidity/sdk-tutorial.html) | Resolve version, type, hooks and boosted assets before query/build. Permit2 and minimum BPT output are explicit. No official runtime MCP established. |
| Revert | [Official agents page](https://revert.finance/agents), [official skill](https://mcp.revert.finance/skill) | Skill 1.9 and server 1.7.0/22 tools observed. Analytics and unsigned planners do not sign or relay. Approval receipts precede rebuild; provider confirmation mutates accounting. |
| VFAT | [Official docs](https://github.com/vfat-io/vfat-docs), [Sickle](https://github.com/vfat-io/vfat-docs/blob/main/sickle.md), [fees](https://github.com/vfat-io/vfat-docs/blob/main/fees.md) | Optional provider-neutral research and custody/automation guidance. No supported public MCP/API contract established; recheck current fee bases and Sickle ownership. |
| Hyperliquid | [API](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api), [nonces](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/nonces-and-api-wallets), [account modes](https://hyperliquid.gitbook.io/hyperliquid-docs/trading/account-abstraction-modes) | Official Python SDK; TS clients are community tools. Resolve asset namespace, actual account mode and signer nonce domain; inspect response-level errors and fills. |
| GMX | [SDK](https://docs.gmx.io/docs/sdk/overview/), [V2 examples](https://docs.gmx.io/docs/sdk/v2/examples/), [V1 caveats](https://docs.gmx.io/docs/sdk/v1/troubleshooting/) | Keep SDK generations separate. V2 request IDs and terminal order states differ from V1; transaction creation is not keeper execution. |
| Derive | [Official TS](https://github.com/derivexyz/derive-ts), [Python](https://github.com/derivexyz/derive-py), [V3 docs](https://v3.docs.derive.xyz/) | Current V3 scopes differ from legacy Lyra hosts and recipes. V3 docs retrieval was restricted here; official SDK source supplied version evidence. Do not invent a production MCP. |
| Jupiter | [Skills](https://developers.jup.ag/docs/ai/skills), [Trading MCP](https://developers.jup.ag/docs/ai/trading-mcp), [Swap](https://developers.jup.ag/docs/swap) | Trading MCP differs from documentation MCP; live discovery failed here. Current Swap API requires key; immutable managed transaction and custom build paths differ. |
| Drift | [Official SDK](https://github.com/drift-labs/protocol-v2/blob/master/sdk/README.md), [SDK API](https://drift-labs.github.io/protocol-v2/sdk/) | Preserve precision helpers, subaccount, oracle and subscription freshness. No official standalone runtime MCP established. |
| Pendle Boros | [Official plugin](https://github.com/pendle-finance/pendle-ai/blob/main/packages/plugins/pendle-boros/README.md), [SDK](https://docs.pendle.finance/boros-dev/Backend/sdk) | Local MCP includes delegated signing; separate advisor, trading and root-sensitive wallet operations. It must not be described as unsigned-only. |

See [routing](../../packages/routing/skills/galleon-defi-routing/references/providers.md), [derivatives](../../packages/derivatives/skills/galleon-defi-derivatives/references/providers.md), [LP](../../packages/lp/SOURCES.md) and [Hyperliquid](../../packages/hyperliquid/SOURCES.md).

### Infrastructure, data, security, payments and governance

| Provider | Primary sources | Integration boundary |
|---|---|---|
| Alchemy | [Agent offering](https://www.alchemy.com/ai-agents), [DeFi agents](https://www.alchemy.com/overviews/defi-ai-agents) | Reuse RPC, native OAuth MCP and CLI; app selection, wallet writes and x402 payments need distinct scope. |
| Coinbase | [Agent accounts](https://docs.cdp.coinbase.com/x402/agentic-accounts/coinbase-for-agents), [Agentic Wallet](https://docs.cdp.coinbase.com/x402/agentic-accounts/agentic-wallet), [x402 buyer](https://docs.cdp.coinbase.com/x402/buyer/quickstart) | Separate account, managed wallet, SDK wallet and payment capabilities. Official examples may provision wallets or automatically pay; do not run them as harmless probes. |
| DeFiLlama | [Official MCP](https://defillama.com/mcp) | Subscription/OAuth MCP is distinct from free public APIs. Discovery and credit availability are separate. |
| CoinGecko | [AI guidance](https://docs.coingecko.com/docs/ai-agents-llm-apps) | Public MCP, account-backed access and docs retrieval differ. Preserve timestamp, token identity and provider methodology. |
| AIXBT | [Official docs](https://docs.aixbt.tech/) | Preserve the existing native MCP/API research workflow, observation timestamps, access tier and corroboration requirements. |
| Tenderly | [MCP](https://docs.tenderly.co/ai-tools/overview), [simulation](https://docs.tenderly.co/simulations/overview) | OAuth/plan/project context matters; simulations can persist data and broader tools mutate infrastructure. No paid simulation was performed. |
| Safe | [SDK](https://docs.safe.global/sdk/overview) | Use Protocol/API Kit for the chosen workflow; threshold signatures or a service record do not prove execution. |
| Blockaid / GoPlus | [Blockaid docs](https://docs.blockaid.io/), [GoPlus docs](https://docs.gopluslabs.io/) | Optional security evidence, with coverage/age/access limits. A clean response is not proof that a transaction or asset is safe. |
| Zerion / DeBank | [Zerion positions](https://developers.zerion.io/api-reference/wallets/get-wallet-fungible-positions), [DeBank API](https://docs.cloud.debank.com/) | Portfolio coverage and grouping must be inspected; do not double-count receipt and underlying assets or replace unknown debt with zero. |
| Sablier | [Official agent skills](https://docs.sablier.com/guides/ai-agents), [Flow](https://docs.sablier.com/concepts/flow/overview), [cancelability](https://docs.sablier.com/concepts/cancelability) | Reuse vesting, streaming and airdrop procedures. Accrued debt, funded amount and received payment differ. |
| Superfluid | [Official skills](https://github.com/superfluid-org/skills) | Reuse current SDK/contract guidance; inspect real-time balances, buffers, outgoing commitments and operator scope. |
| Snapshot | [Official MCP](https://docs.snapshot.box/tools/snapshot-mcp), [Snapshot X](https://docs.snapshot.box/snapshot-x/overview) | Public query/schema access is distinct from an OAuth governance alias. Vote, propose and follow all mutate public state. |
| Cactus / Tally | [Current docs](https://docs.tally.xyz/), [API](https://docs.tally.xyz/set-up-and-technical-documentation/welcome/how-to-use-the-tally-api/) | Current branding is Cactus; API needs a key. Prefer documented GraphQL fields and corroborate consequential Governor state. |
| OpenZeppelin | [Governor lifecycle](https://docs.openzeppelin.com/contracts/5.x/governance) | Resolve deployed extensions and clock. Passed, queued and executed are separate states. |

See each pack's `SOURCES.md` and standalone provider reference for detailed source routes, including exact security/portfolio endpoints.

## Hermes and portable Agent Skills decisions

[Agent Skills](https://agentskills.io/specification) defines portable metadata and progressive disclosure. We keep each skill self-contained, use clear task triggers, string-valued metadata and short entry documents, and move protocol detail into references. The new skills do not require sibling packs or overwrite official providers' skill names.

[Hermes skills](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills/) loads skill bodies and references on demand. Boomkin keeps native Hermes, isolated runtime state and its reviewed source contract; it does not fork the harness or inject every provider's full schema into the initial prompt.

[Hermes MCP guidance](https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp/) supports native configuration and per-server tool filtering. We use reviewed exact tool exposure, preserve existing selections and separate installation from successful discovery. A server gaining a write tool must not silently expand an agent's authority. Provider-specific OAuth, custody and paid access remain explicit setup steps.

[ERC-4626](https://eips.ethereum.org/EIPS/eip-4626) and [ERC-7540](https://eips.ethereum.org/EIPS/eip-7540) inform vault accounting and asynchronous lifecycle checks, while actual implementations determine supported operations. [Solana transactions](https://solana.com/docs/core/transactions) require their own signer, instruction, blockhash and confirmation treatment; EVM nonce/allowance rules are not transplanted.

## Limitations and maintenance

- Documentation changes quickly. Some official docs already disagreed with live MCP tool counts or their own maintained repository. The skills prefer version and capability discovery over copied marketing counts.
- Morpho's experimental MCP is not a default production dependency. CoW, several contract-first protocols and other providers without a verified official runtime MCP use official SDK/API guidance instead.
- LI.FI and Jupiter runtime availability was not established in this environment. Authenticated, paid, wallet and execution paths were deliberately not exercised.
- This release does not claim insurance underwriting, every prediction market, every token launch/NFT primitive, or universal cross-chain coverage. Those need their own bounded primary research and lifecycle tests before inclusion.
- The evaluation references contain realistic failure cases, but passing corpus validation is not a measured claim about model accuracy. Local/native runtime checks establish installation and tool plumbing; users must verify their chosen provider action under their own authority.
- MIT notices and attribution travel with standalone skill archives and npm packages. Stars and public credit lines are voluntary; no skill attempts to trick another agent into account actions.

Before updating provider guidance, record the source date and actual interface, re-evaluate the affected failure cases, validate every changed standalone skill, run the independent package consumer smoke, and publish only the changed packs. Boomkin updates pin those reviewed releases while preserving each user's pack selection.
