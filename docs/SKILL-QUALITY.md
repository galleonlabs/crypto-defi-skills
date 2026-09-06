# Skill quality and verification

The [Agent Skills specification](https://agentskills.io/specification) defines our portable contract. The [authoring guidance](https://agentskills.io/skill-creation/best-practices), [evaluation guide](https://agentskills.io/skill-creation/evaluating-skills) and [agentskill.sh overview](https://agentskill.sh/readme) informed this review on 2026-09-06. These are documentation sources, not runtime dependencies or endorsements.

## Author a usable workflow

Start with a real task or failure. Put the distinct trigger in the description and the normal decision loop in SKILL.md. Keep existing public names stable; changing to a different naming style alone does not justify breaking saved prompts. Put conditional provider mechanics in self-contained references and explain when to load each one. Give a default route, a representative input/output and observable completion evidence. Use scripts for repeatable calculations or bounded diagnostics, with help and explicit failure behavior.

Use the user's existing provider tools and authority. In this corpus, setup, discovery, authenticated reads, simulation, signing and reconciliation are distinct results. Retain license and attribution files in each independently installed skill. A reference to another skill is an optional handoff, never an assumed sibling path.

## Check different things separately

| Check | Evidence it supplies |
| --- | --- |
| `bun run check` | Package checks plus a common standalone corpus validator for all 14 packs: metadata, directory names, line budget, local reference boundaries, symlinks and discovery metadata |
| `validate-agent-skills packages/<pack>/skills` | Independent contributor validation of skill structure |
| `bun run pack` and `bun run smoke` | Packaging boundaries, fresh independent installs, ESM imports and actual Node CLI behavior |
| `packages/*/evals/routing.json` | Structure and coverage of the routing prompt sets: every skill carries at least five cases and names at least one skill that must not load. Structure only, never a pass rate |
| Installed output-quality cases | Whether an agent follows the workflow and reaches the promised decision on realistic inputs |
| Native Hermes smoke in Boomkin | Runtime profile, skill discovery and on-demand loading, MCP configuration and filtering |

The first four rows do not establish model quality. Start output evaluation with a few varied tasks including a failure or routing boundary. Compare the installed skill with the previous version in separate clean contexts. Record prompt, model/client, tool trace, answer and assertion evidence. Report unrun cases as unrun; do not publish a score from fixture shape or keyword matching. The data skill includes three credential-free synthetic cases inside its archive.

## 2026-09-06 review

Routing coverage was levelled across the collection. Ten content packs previously carried no routing dataset, leaving eleven skills with one or two assertions against the six to eleven the LP, Hyperliquid, data and infrastructure skills already had; each now ships at least five cases with named negative boundaries. The release-drift gate was scoped to each pack's published surface at the same time, because source-only `evals/` and `test/` changes cannot reach an npm consumer and should never require a republish.

All 28 installed directories, including two functional LP rename notices, were checked for portability. The infrastructure pack was missing its optional Codex presentation file; it now follows the same discovery contract as the others. Data now supplies worked freshness, shared-feed and missing-yield examples plus standalone evaluation fixtures and diagnostic help.

Boomkin verifies copied supporting files before recording success and records file digests for subsequent local drift checks. This catches missing references and edited scripts without treating a version header as complete installation evidence. Local digests are an installation diagnostic, not a signature or a defense against someone replacing both files and the local record.

Release checks compare npm contents, source pins and clean consumer installs. Provider endpoints can change after review; a mock, configuration or handshake must never be described as a successful authenticated read or financial outcome.
