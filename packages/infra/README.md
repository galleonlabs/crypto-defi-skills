# Galleon DeFi Infrastructure Skills

[![npm](https://img.shields.io/npm/v/galleon-defi-infra-skills?color=0f766e)](https://www.npmjs.com/package/galleon-defi-infra-skills)
[![MIT](https://img.shields.io/badge/license-MIT-0f766e)](LICENSE)

**Give your agent the right tools for the job.**

Check RPC freshness, official Alchemy and Coinbase access, wallet capabilities and native Hermes configuration with bounded read-only diagnostics.

[Install one skill](#install-one-skill) · [Try a first task](#try-a-first-task) · [Sources](SOURCES.md) · [All packs](https://github.com/galleonlabs/crypto-defi-skills#independent-packs)

## Install one skill

```bash
npx skills add galleonlabs/crypto-defi-skills --skill galleon-defi-infra
```

Choose the receiving agent in the installer. Keep the skill's references and scripts with its `SKILL.md`. Each pack works on its own. For a complete native Hermes desk, use [Boomkin](https://github.com/galleonlabs/boomkin).

## Try a first task

> Use galleon-defi-infra to check my existing DeFi tool setup for Base reads. Identify missing capabilities, runtime requirements and the smallest next setup step. Keep credentials private.

Expected result: the workflow's required evidence, explicit gaps and a concrete next step. Supply real task inputs in place of the bracketed placeholders. Provider access is configured in your agent; installation adds the procedures and local resources.

## Install

```bash
npm install -g galleon-defi-infra-skills@0.4.1
npx skills add galleonlabs/crypto-defi-skills --skill galleon-defi-infra
```

The package and skill are independently installable. It does not require the LP, Hyperliquid or data packs. Node 20+ runs the packaged CLI; development and the standalone TypeScript helper use Bun. Alchemy/Coinbase CLIs are optional separate installations with their own Node requirements.

## Use

Load [galleon-defi-infra](skills/galleon-defi-infra/SKILL.md) to select an RPC provider, understand Coinbase account versus agent-wallet access, connect Hermes tools, or diagnose a failed connection.

```bash
defi-infra-skills catalog --json
defi-infra-skills validate --json
defi-infra-skills presence --json
defi-infra-skills doctor --chain-id 8453 --rpc-env DEFI_RPC_URL --json
```

Supply `DEFI_RPC_URL` through your private environment. The doctor checks chain ID and latest-block freshness with two bounded read-only RPC requests. It prints no endpoint, key or provider error body. `presence` checks whether known variables are set; it does not authenticate. A non-ready doctor exits nonzero.

No wallet creation, login, funding, signing or payment occurs when installing or validating this pack. The references explain operator-driven onboarding through upstream tools, including current availability limits. Coinbase for Agents' remote MCP does not currently support arbitrary harnesses such as Hermes; use its official CLI. Coinbase for Agents x402 is coming soon, while Agentic Wallet supports it today.

See [sources and versions](SOURCES.md), [release notes](CHANGELOG.md), and [readiness details](skills/galleon-defi-infra/references/readiness.md). For development run `bun run check`; for the whole monorepo use its root release instructions.

## Contributing

Documentation fixes, reproducible connection failures and source-backed workflow improvements are welcome. Follow the [contributor guide](https://github.com/galleonlabs/crypto-defi-skills/blob/main/CONTRIBUTING.md) for local checks and pull requests. Keep diagnostics read-only and each skill independently installable.

Report security issues through [private vulnerability reporting](https://github.com/galleonlabs/crypto-defi-skills/security/advisories/new).

## License and credit

[MIT licensed](LICENSE). Preserve the copyright and permission notice when reusing copies or substantial portions. See [attribution guidance](ATTRIBUTION.md) for an optional credit line naming Andrew Wilkinson and Galleon Labs.

See [SOURCES.md](SOURCES.md) for provenance and dated verification.

## Protocol workflows

- [Coinbase AgentKit readiness](skills/galleon-coinbase-agentkit-readiness/SKILL.md): Audit CDP accounts and agent action exposure. Install individually with `npx skills add galleonlabs/crypto-defi-skills --skill galleon-coinbase-agentkit-readiness`.
