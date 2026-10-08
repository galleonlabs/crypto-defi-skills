# Galleon DeFi Agent Skills

[![npm](https://img.shields.io/npm/v/galleon-defi-agent-skills?color=0f766e)](https://www.npmjs.com/package/galleon-defi-agent-skills)
[![MIT](https://img.shields.io/badge/license-MIT-0f766e)](LICENSE)

**Turn a DeFi intent into a plan you can review.**

Build an unsigned action plan with official tools, then inspect the exact payload and simulation evidence before a wallet handoff.

[Install one skill](#install-one-skill) · [Try a first task](#try-a-first-task) · [Sources](SOURCES.md) · [All packs](https://github.com/galleonlabs/crypto-defi-skills#independent-packs)

## Install one skill

```bash
npx skills add galleonlabs/crypto-defi-skills --skill galleon-defi-agent-plan
```

Choose the receiving agent in the installer. Keep the skill's references and scripts with its `SKILL.md`. Each pack works on its own. For a complete native Hermes desk, use [Boomkin](https://github.com/galleonlabs/boomkin).

## Try a first task

> Use galleon-defi-agent-plan to prepare an unsigned plan for [action] on [chain]. Show the official builder, exact asset and amount, permissions, simulation requirements and what still needs review.

Expected result: the workflow's required evidence, explicit gaps and a concrete next step. Supply real task inputs in place of the bracketed placeholders. Provider access is configured in your agent; installation adds the procedures and local resources.

## Install

```bash
npx skills add galleonlabs/crypto-defi-skills --skill galleon-defi-agent-plan --skill galleon-defi-agent-simulate
npx --package galleon-defi-agent-skills@0.1.1 defi-agent-skills catalog --json
```

- [Unsigned planning](skills/galleon-defi-agent-plan/SKILL.md) resolves bounded intent to maintained builders, including Nethermind playbooks and Aave's official MCP.
- [Simulation](skills/galleon-defi-agent-simulate/SKILL.md) binds exact sender, sequence, chain and state to recorded effects; covers Tenderly, Alchemy and Portals Foresight.

Infrastructure onboarding and security review are optional next steps when installed. Neither is a dependency. Installation does not connect a wallet or authorize signing, paid requests, new projects or virtual networks.

## Package interface

`defi-agent-skills` supports `catalog --json`, `show <skill>`, `validate [path] --json` and `--version`. These commands inspect the bundled corpus without network or account operations. The ESM export provides `SKILL_CATALOG`; skill documents are exported through `galleon-defi-agent-skills/skills/<skill>`.

The simulation skill carries an optional offline evidence-record helper and synthetic examples. Its checks establish record consistency only. They cannot authenticate provider results, discover unknown authority changes, grade a model or establish settlement.

[Sources](SOURCES.md) document provenance. [Boomkin](https://github.com/galleonlabs/boomkin) supplies optional Hermes pack selection. Follow the repository [contributor guide](https://github.com/galleonlabs/crypto-defi-skills/blob/main/CONTRIBUTING.md) and run package checks before publication.

## License and credit

[MIT](LICENSE), copyright Andrew Wilkinson and Galleon Labs. Procedures and helper code are independently authored. Provider source/runtime material is linked, not vendored; third-party tools retain their own licenses. Preserve this pack's license and [attribution](ATTRIBUTION.md) in reused copies.
