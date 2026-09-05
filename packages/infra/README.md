# Galleon DeFi Infrastructure Skills

A standalone skill pack for wiring a DeFi agent's RPC, managed wallets, paid APIs and Hermes runtime. Prefer official Alchemy and Coinbase tooling; keep account authentication and transaction authority explicit.

## Install

```bash
npm install -g galleon-defi-infra-skills@0.1.0
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
