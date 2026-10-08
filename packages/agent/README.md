# Galleon DeFi Agent Skills

Build unsigned DeFi plans and verify exact simulation evidence before a wallet handoff. Two portable skills, independently installable; no signer, protocol adapter or hosted service is bundled.

## Install

```bash
npx skills add galleonlabs/crypto-defi-skills --skill galleon-defi-agent-plan --skill galleon-defi-agent-simulate
npx --package galleon-defi-agent-skills@0.1.0 defi-agent-skills catalog --json
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
