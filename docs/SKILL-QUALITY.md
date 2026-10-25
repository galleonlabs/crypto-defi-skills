# Skill quality and verification

Each skill must complete a distinct task when installed on its own. Put its trigger in the description, the decision loop in `SKILL.md`, conditional mechanics in local references and repeatable calculations in bounded helpers. Use the [Agent Skills specification](https://agentskills.io/specification) for the portable format and [Contributing](../CONTRIBUTING.md) for commands.

## Author the procedure

- Name the exact inputs, deployment/version, units and observations needed for the task.
- Give a default route, a worked result, failure handling and observable completion evidence.
- Use current primary sources for protocol mechanics and record review dates. Documentation is not proof of a live deployment or connected provider.
- Keep references, scripts, license and attribution inside the independently installed skill. Sibling skills are optional handoffs, never assumed relative paths.
- Preserve the user's selected tools and authority. Research, unsigned preparation, simulation, signing and settlement require different evidence.

Prefer a focused protocol procedure for a named venue. Broad skills serve comparison or work spanning protocols. Read only the resources needed for the selected task.

## What the checks establish

| Check | Evidence |
| --- | --- |
| `bun run check` | Package tests, type checks, metadata, local resource boundaries, discovery and release drift |
| `validate-agent-skills packages/<pack>/skills` | Independent Agent Skills format validation |
| `bun run pack` and `bun run smoke` | Package contents, clean independent installs, Node CLIs and ESM exports |
| `bun run smoke:registry <pack>` | Public exact-version identity/integrity and every installed skill resource compared with source |
| `packages/<pack>/evals/routing.json` | At least five routing prompts per active skill, including a named neighboring skill that must not load |
| `packages/<pack>/evals/behavior.json` | At least two synthetic useful-completion and changed/missing-evidence cases per active skill |
| Boomkin native compatibility smoke | Actual native skill/reference loading, isolated profile, configuration, project preview and tool filters |

Fixture validation checks coverage and shape. It does not run a model, produce a quality score or prove a financial outcome. Local arithmetic and simulation likewise need their own stated assumptions and coverage.

## Evaluate an answer

Run `bun run eval:behavior -- <case-id>` to export a neutral exercise without its grading criteria. In a clean agent context, supply the observations, load the installed skill progressively and record the answer and tool reads. Have a separate reviewer compare it with every expected and forbidden criterion, preserving unresolved assertions.

A measured improvement requires comparable before/after model runs and retained evidence. Report unrun cases as unrun. Historical exercises and the limited with/without benchmark are indexed in [History](HISTORY.md); they are not current coverage or compatibility claims.

## Verify an outcome

Retain provider/retrieval time, block/context, exact chain/account/asset identity, units and page coverage. Separate unavailable observations from zero values. Bind simulation to the exact payload, sender and state, including overrides. For a completed economic action, require its transaction/order record and matching terminal balance, position or destination evidence. Never retry an ambiguous write merely because a response timed out.
