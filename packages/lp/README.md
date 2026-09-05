# LP Skills

[![CI](https://github.com/galleonlabs/crypto-defi-skills/actions/workflows/ci.yml/badge.svg)](https://github.com/galleonlabs/crypto-defi-skills/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/galleon-lp-skills)](https://www.npmjs.com/package/galleon-lp-skills)
[![MIT](https://img.shields.io/badge/license-MIT-0f766e)](LICENSE)

Portable agent workflows for liquidity analysis, planning, execution and monitoring on Uniswap and Aerodrome. Start with verified read access and progress to a reviewed plan; execution requires your own trusted wallet tools.

## Install

Install all skills with the open Agent Skills installer:

```bash
npx skills add https://github.com/galleonlabs/crypto-defi-skills/tree/main/packages/lp
```

Install one skill:

```bash
npx skills add https://github.com/galleonlabs/crypto-defi-skills/tree/main/packages/lp --skill lp-monitor
```

Install the read-only CLI:

```bash
npm install --global galleon-lp-skills
```

The repository also ships Codex and Claude Code plugin manifests. Cursor discovers the same `SKILL.md` files.

## Skills

| Skill | Use it for | Output |
| --- | --- | --- |
| [lp-setup](skills/lp-setup/SKILL.md) | Connect read access and inventory missing tools | Verified chain observation, capability report, next task |
| [lp-analyze](skills/lp-analyze/SKILL.md) | Compare pools before deploying capital | Dated evidence, risk gates, ranked choices |
| [lp-plan](skills/lp-plan/SKILL.md) | Design a position in a chosen pool | Exact unsigned plan, range, budgets, preflight |
| [lp-monitor](skills/lp-monitor/SKILL.md) | Inspect an existing position | P&L versus HOLD, range state, action verdict |
| [lp-execute](skills/lp-execute/SKILL.md) | Carry out an explicit wallet action | Confirmed steps, receipts, state reconciliation |
| [lp-engineer](skills/lp-engineer/SKILL.md) | Build or review LP integrations | Adapter contract, tests, security findings |

Coverage includes Uniswap v2, v3, and v4, plus Aerodrome classic pools and Slipstream concentrated pools.

The corpus also covers atomic one-token funding, range moves, automation and custody, LP backtesting, and v4 hooks that issue fungible shares against their own StableSwap-style reserves.

## From install to first useful result

Ask your agent: **Use lp-setup to check my Base RPC connection, list missing LP tools, then use lp-analyze to inspect the identity and risks of this pool: [pool address].** Supply the actual pool address and intended chain. Configure `LP_RPC_URL` through your harness environment or secret settings, never in chat. No wallet or funds are needed for this first task.

`lp-setup` includes a dependency-free Node diagnostic: from its installed directory, run `node scripts/connection.mjs --chain-id 8453`. It verifies the endpoint's chain and fresh head. It does not verify pool state, signer readiness, or profitability. Without RPC, the agent still reports its available tools and the precise missing connection.

The connected workflow is `lp-setup → lp-analyze → lp-plan → lp-execute → lp-monitor → lp-plan`. Use `lp-engineer` for missing adapters and software changes. Every skill includes explicit input/output handoffs and a standalone fallback when another skill is not installed. Each installed skill contains its own required references and scripts.

For a first position review, ask: **Use lp-monitor to read this public position on [chain]; report current ownership, inventory and range, and mark performance unknown if you cannot establish the opening cash flows.**

An installed skill is a procedure, not an executable trading integration. The CLI provides local tools; setup supplies a narrow RPC diagnostic. Current pool/account reads, historical data, quotes, unsigned transaction construction, simulation, user-controlled wallet tools, receipt lookup and reconciliation must be connected separately. See the [capability map](skills/lp-setup/references/connections.md). Missing tools leave the affected stage unavailable.

## Updates and migration

Version 0.4.0 renames `lp-research` to `lp-analyze` and `lp-operate` to `lp-execute`, and adds `lp-setup`. The explicit names distinguish market/pool analysis from research provenance and execution from general operations. Existing `lp-plan`, `lp-monitor` and `lp-engineer` names remain.

Re-run the install command to install current names. Update saved prompts/configuration that reference the two old names, then remove only the old installed skill directories after verifying they contain no user edits. Do not delete unrelated skills or harness configuration. Existing old installations remain at their installed version until updated.

`lp-research` and `lp-operate` remain as install-compatible rename notices so marketplace listings and saved `npx skills add ... --skill lp-research` or `--skill lp-operate` commands still resolve. They are not a second analysis or execution workflow. Canonical names stay `lp-analyze` and `lp-execute`.

For reproducible npm use, install `galleon-lp-skills@0.4.2`; for a moving npm release use `npm install --global galleon-lp-skills@latest`. Pin a reviewed release when integrating this corpus into a deployer catalog, and validate the installed payload before switching versions.

## CLI

```bash
lp-skills catalog
lp-skills validate .
lp-skills uniswap-link --help
lp-skills range --price 1.25 --width 10 --tick-spacing 60 --json
lp-skills status --tick-current 100 --tick-lower 0 --tick-upper 200 --edge-buffer 20 --json
lp-skills economics --capital 10000 --fees 120 --incentives 40 --costs 25 --days 30 --json
```

The CLI performs local arithmetic, validation, and reviewed Uniswap interface-link construction. It has no RPC, wallet, key, signing, or submission code.

No hosted LP agent service is bundled or required. Official tools are optional integrations selected for the task. See [official tool access](skills/lp-setup/references/official-tools.md) and [SOURCES.md](SOURCES.md) for provenance, access requirements, and limits.

## Uniswap integration paths

- Build locally with the current Uniswap SDKs and verified deployments.
- Use the official Liquidity Provisioning API as an unsigned transaction builder.
- Hand a reviewed plan to the Uniswap interface with a generated create-position link.

The skills preserve the exact API response contract, approval and Permit2 flow, v4 StateView and PositionManager model, and interface-link format. Every returned transaction remains untrusted until it is decoded, independently simulated, confirmed, mined, and reconciled against chain state.

## VFAT discovery and position tooling

Use [VFAT Yield](https://vfat.io/yield) as an optional public screening surface, then verify candidates with chain reads. The skills cover its TVL/APR definitions, route and automation fees, Sickle ownership/permissions, and position reconstruction. The documented rebalance stop-loss stops rebalancing; it does not exit a position.

[Setup](skills/lp-setup/references/vfat.md) gives the available access paths; [engineering](skills/lp-engineer/references/vfat.md) distinguishes official Sickle sources from unverified public SDK/API availability. No VFAT runtime, custody wrapper or fee route is installed by this pack.

## Operating rules

- Bind every plan to chain ID, wallet, protocol, pool address, token order, decimals, and a fresh block.
- Treat chain state as authority. Caches and dashboards are hints.
- Separate swap fees, incentives, divergence from HOLD, gas, slippage, MEV, and tax.
- Treat Aerodrome fee and gauge reward routes as protocol-specific choices. Never add both without proof.
- Treat Uniswap v4 hooks as separate trust domains.
- Detect share-based hook accounting before applying concentrated-liquidity assumptions.
- Separate finite approvals from ready action calldata and rebuild after approval receipts.
- A simulation is preflight. Only a mined receipt plus a state reread proves execution.
- Never retry an ambiguous write.

## Repository checks

From the monorepo root, using Bun 1.3.14:

```bash
bun install --frozen-lockfile
bun run check
bun run pack
```

`bun run check` runs style gates, strict type checks, tests, skill validation, and a production build. CI also checks the npm payload. Package changes on `main` also publish an immutable Agent Skills discovery index and one archive per skill. npm releases are published separately.

## Contributing

Start with [CONTRIBUTING.md](CONTRIBUTING.md). New protocol claims need a primary source, a test or reproducible read, and explicit failure behavior.

Security reports belong in [private vulnerability reporting](https://github.com/galleonlabs/crypto-defi-skills/security/advisories/new), not public issues.

## License and credit

[MIT licensed](LICENSE). Preserve the copyright and permission notice when reusing copies or substantial portions. See [attribution guidance](ATTRIBUTION.md) for an optional credit line naming Andrew Wilkinson and Galleon Labs.

See [SOURCES.md](SOURCES.md) for research and implementation provenance.
