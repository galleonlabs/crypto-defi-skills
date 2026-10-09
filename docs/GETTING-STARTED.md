# Your first DeFi workflow

Install the procedure for your task, give your agent concrete inputs, and ask for a result you can verify. You can use one skill in an existing agent or let [Boomkin](https://github.com/galleonlabs/boomkin) set up a complete Hermes profile.

[Skill routing](AGENT-INDEX.md#skill-routing) · [Current packs and releases](../README.md#independent-packs) · [Contributor setup](../CONTRIBUTING.md#work-locally)

## Start with one skill

This example installs the Aave V3 position workflow using the [Agent Skills installer](https://github.com/vercel-labs/skills):

```bash
npx skills add galleonlabs/crypto-defi-skills --skill galleon-aave-position
```

Choose your receiving agent when prompted. Keep the skill's references and scripts with its `SKILL.md`; they supply the mechanics and examples the procedure needs. Installing a skill does not connect a wallet or provider.

Then ask your agent:

> Use galleon-aave-position to inspect [Ethereum wallet address]. Show current collateral, debt and health factor, then a scenario with a 20% collateral-price fall and 30 days of debt interest. Name any unavailable observations and keep the plan unsigned.

The first useful answer should identify the exact market and assets, show current versus stressed position figures, explain reserve or liquidity limits, and name the next supported step. If the agent cannot read current state, it should report the missing access or evidence instead of inventing figures. The skill's [read recipe](../packages/lending/skills/galleon-aave-position/references/recipe.md) and [worked decision](../packages/lending/skills/galleon-aave-position/SKILL.md) show the expected structure.

For Aave V4, use [`galleon-aave-v4`](../packages/lending/skills/galleon-aave-v4/SKILL.md): Hub/Spoke identity and position reserve selectors differ from V3.

## Find your next task

Use a named procedure when it fits. Broader primitive skills cover cross-protocol questions and providers without a dedicated workflow; [the agent index](AGENT-INDEX.md#skill-routing) lists all 49 active skills.

### Positions, liquidity and exits

| Task | Skill | Useful result |
| --- | --- | --- |
| Stress-test Aave V3 debt | [`galleon-aave-position`](../packages/lending/skills/galleon-aave-position/SKILL.md) | Current and stressed health factor, reserve restrictions and an unsigned next step |
| Inspect an Aave V4 position | [`galleon-aave-v4`](../packages/lending/skills/galleon-aave-v4/SKILL.md) | Exact Hub/Spoke position, action preview and operation-aware reconciliation |
| Inspect Morpho markets or vaults | [`galleon-morpho-market`](../packages/lending/skills/galleon-morpho-market/SKILL.md) | Oracle, LLTV, liquidity, allocation and exit constraints |
| Check Compound III capacity | [`galleon-compound-borrow`](../packages/lending/skills/galleon-compound-borrow/SKILL.md) | Base debt, collateral limits and an unsigned borrow or repay plan |
| Track Lido withdrawals | [`galleon-lido-withdrawals`](../packages/staking/skills/galleon-lido-withdrawals/SKILL.md) | Request ownership, finalization, claimability and claimed ETH evidence |
| Compare Pendle maturity and early exit | [`galleon-pendle-maturity`](../packages/yield/skills/galleon-pendle-maturity/SKILL.md) | Accounting unit, maturity terms and executable exit comparison |
| Check a vault withdrawal | [`galleon-vault-exit`](../packages/yield/skills/galleon-vault-exit/SKILL.md) | Preview versus owner limits, fees, liquidity and asynchronous exit constraints |
| Inspect a Uniswap V3 NFT | [`uniswap-v3-liquidity`](../packages/lp/skills/uniswap-v3-liquidity/SKILL.md) | Position composition, tick bounds, fees and a bounded liquidity plan |
| Inspect Slipstream and gauge rewards | [`aerodrome-slipstream`](../packages/lp/skills/aerodrome-slipstream/SKILL.md) | Range, custody, fees versus emissions and exit constraints |
| Review a Hyperliquid market idea | [`hyperliquid-analyze`](../packages/hyperliquid/skills/hyperliquid-analyze/SKILL.md) | Market, funding, liquidity and venue evidence before sizing a ticket |

### Plans, transactions and settlement

| Task | Skill | Useful result |
| --- | --- | --- |
| Build unsigned protocol actions | [`galleon-defi-agent-plan`](../packages/agent/skills/galleon-defi-agent-plan/SKILL.md) | Exact identities, units, ordered approvals and calls, limits and prerequisites |
| Inspect simulation evidence | [`galleon-defi-agent-simulate`](../packages/agent/skills/galleon-defi-agent-simulate/SKILL.md) | Payload/sender/state binding, effects, overrides and missing coverage |
| Prepare a Uniswap quote | [`uniswap-swap`](../packages/routing/skills/uniswap-swap/SKILL.md) | Quote identity, route type, approval/Permit2 terms and unsigned payload review |
| Reconcile a bridge arrival | [`lifi-cross-chain`](../packages/routing/skills/lifi-cross-chain/SKILL.md) | Actual recipient, destination asset and amount, or remaining/refunded leg |
| Review a payload or permission | [`galleon-defi-security`](../packages/security/skills/galleon-defi-security/SKILL.md) | Decoded effects, authority changes, simulation limits and unresolved risks |
| Plan a Sablier stream | [`galleon-sablier-streams`](../packages/payments/skills/galleon-sablier-streams/SKILL.md) | Flow versus Lockup, funding/debt, current rights and cancellation consequences |
| Inspect a Superfluid obligation | [`galleon-superfluid-streams`](../packages/payments/skills/galleon-superfluid-streams/SKILL.md) | Flow or distribution state, permissions, buffer and funded runway |

### Research, data and account readiness

| Task | Skill | Useful result |
| --- | --- | --- |
| Resolve a token's market identity | [`galleon-coingecko-token-research`](../packages/data/skills/galleon-coingecko-token-research/SKILL.md) | Exact token identity, provider time and missing/stale fields |
| Screen yields | [`galleon-defillama-yield-screen`](../packages/data/skills/galleon-defillama-yield-screen/SKILL.md) | Reproducible shortlist separating base yield, rewards and exit diligence |
| Collect comparable market marks | [`galleon-defi-market-snapshot`](../packages/data/skills/galleon-defi-market-snapshot/SKILL.md) | Timestamped observations, discrepancies and compatible daily history |
| Test a daily strategy | [`galleon-defi-strategy-backtest`](../packages/strategy/skills/galleon-defi-strategy-backtest/SKILL.md) | Next-observation replay, explicit costs/cash flows and a comparable benchmark |
| Reconcile portfolio exposure | [`galleon-defi-portfolio`](../packages/portfolio/skills/galleon-defi-portfolio/SKILL.md) | Assets, liabilities, queues, net exposure and valuation limits |
| Investigate a token's controls | [`galleon-defi-security-token-diligence`](../packages/security/skills/galleon-defi-security-token-diligence/SKILL.md) | Controls, allocations, custody, sellability and source-backed evidence |
| Check AgentKit readiness | [`galleon-coinbase-agentkit-readiness`](../packages/infra/skills/galleon-coinbase-agentkit-readiness/SKILL.md) | Tested read access, policy/capability gaps and the next setup step |
| Research a prediction market | [`galleon-prediction-market-research`](../packages/prediction/skills/galleon-prediction-market-research/SKILL.md) | Outcome identity, resolution rules and bounded order-book depth |
| Reconcile a prediction payout | [`galleon-prediction-market-resolution`](../packages/prediction/skills/galleon-prediction-market-resolution/SKILL.md) | Oracle stage, payout fraction, claimable amount and received collateral evidence |

## Installation options

### Existing agent: one skill or one pack

List the available skills before installing more, or select a complete pack:

```bash
npx skills add galleonlabs/crypto-defi-skills --list
npx skills add https://github.com/galleonlabs/crypto-defi-skills/tree/main/packages/payments
```

The installer supports clients including Codex, Claude Code and Cursor. These repository URLs follow `main`. For reproducibility, select a reviewed Git revision using the installer's supported source formats, or use a version-pinned package and preserve its resource files. [Boomkin](https://github.com/galleonlabs/boomkin) maintains reviewed source pins for Hermes users.

### npm: inspect a packaged corpus

Every pack exports `SKILL_CATALOG` and supplies a local CLI. For example:

```bash
npx --package galleon-defi-agent-skills defi-agent-skills catalog --json
npx --package galleon-defi-agent-skills defi-agent-skills show galleon-defi-agent-plan
npx --package galleon-defi-agent-skills defi-agent-skills validate --json
```

These commands resolve the published version available to npm. Add `@<version>` to the package name to use the exact release from [the release table](../README.md#independent-packs). Record the resolved version when comparing results. Node 20+ runs the corpus CLIs; provider tools and optional skill helpers may need another runtime.

npm provides the corpus and CLI. It does not install the corpus into your agent's discovery directory; use the skills installer, the pack's plugin manifest, or Boomkin for that step.

### Claude Code and other plugin clients

```text
/plugin marketplace add galleonlabs/crypto-defi-skills
/plugin install galleon-defi-lending-skills@galleon-defi
```

Each pack contains its own Codex plugin manifest. Follow your client's plugin workflow and select the relevant pack. The separate [research plugin](../plugins/defi-research/README.md) uses a release ZIP, with source pins and checksums described in [RELEASING.md](../RELEASING.md#research-plugin-release-and-installation).

### Hermes: a complete profile through Boomkin

[Boomkin](https://github.com/galleonlabs/boomkin) sets up an isolated Hermes DeFi profile with independently pinned packs. Use its pack selection to start small; updates preserve existing selections. Provider connections use native Hermes configuration and the permissions you select.

## Check the first result

Before relying on a result, inspect four things:

1. **Identity:** chain, deployment/version, asset contract, account, recipient and selected market or position.
2. **Evidence:** provider and retrieval times, block/context, units, chain/page coverage and unavailable observations.
3. **Authority:** research, unsigned preparation, paid request, signature or financial execution; the needed permission must match the action.
4. **Completion:** the exact result promised by the skill. A bridge needs destination evidence; a withdrawal needs its receipt and returned assets; a prediction claim needs received collateral.

Skills do not provision wallets or grant financial authority. Use existing authorized tools, keep credentials private, and report unsupported capabilities. An estimate, simulation or source transaction receipt answers a narrower question than settlement.

## If an old LP name appears

`lp-research` redirects to `lp-analyze`; `lp-operate` redirects to `lp-execute`. These are two retired install names, not additional active workflows. If the replacement is missing, install it explicitly; a compatibility notice cannot supply its full procedure. See [migration notes](../MIGRATION.md).

## Help improve the workflow

Report the pack version, client, expected result and a redacted reproduction through [GitHub issues](https://github.com/galleonlabs/crypto-defi-skills/issues). For a source correction or new procedure, read [CONTRIBUTING.md](../CONTRIBUTING.md). [Skill quality](SKILL-QUALITY.md) explains the evidence behind checks and evaluations.
