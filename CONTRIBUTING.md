# Contributing to Crypto DeFi Skills

Help improve a concrete DeFi task: unclear instructions, incorrect protocol mechanics, missing evidence, a reproducible failure or a useful new procedure. Small fixes can go straight to a pull request; describe the distinct user need before adding a pack.

[Skill index](docs/AGENT-INDEX.md) · [Current releases](README.md#independent-packs) · [Release procedure](RELEASING.md) · [Security reports](SECURITY.md)

## Work locally

Use Git, Bun 1.3.14 and Node.js 20+ for installed corpus CLIs. From the repository root:

```bash
git fetch origin --tags
bun install --frozen-lockfile
bun run check
bun run evals
bun run smoke
bun run pack
```

Read the affected package's `AGENTS.md`. The required CI gate is `bun run check`, `bun run evals` and `bun run smoke`. `check` runs type checks, standalone corpus validation, builds, discovery, package-qualified release drift and only the tests named in `gateTests` in `scripts/workspaces.ts` (release integrity, validation boundaries and security), each with its reason. `evals` validates the offline routing and behavior fixtures. `bun run test` is the optional full suite, and each pack's own `check` still runs its full tests before `npm pack`/publish. Fetch tags before using the drift gate. Preserve unrelated work and record the exact source revision when reporting a result.

After skill edits, run `validate-agent-skills packages/<pack>/skills`. It is a separate contributor tool, not an npm dependency. `bun run smoke` installs every packed tarball in a clean consumer and runs its CLI. `bun run smoke:registry <pack>` compares an already published exact release with source, so run it after publication or against an unchanged release checkout.

`bun run link-health` checks reference URLs separately from ordinary offline tests. A protected or rate-limited URL is not proof of a dead provider; investigate its actual response and owning source.

### Reusable cloud development setup

The commands above also apply in a clean cloud checkout. Keep installed tools outside the repository, use the environment's supported proxy/CA settings and preserve existing network allowlists. Never disable TLS or print credentials to repair a failed check. Record the tested commit; a previously successful setup does not verify today's source.

For an additional format check, use the official [skills-ref validator](https://github.com/agentskills/agentskills/tree/69ef37e9424c0a7ea9dd2293b559e43ec8176379/skills-ref) at the linked immutable revision. Its `validate` command accepts one individual skill directory, not a pack parent. This is contributor tooling, separate from the installed corpus CLI.

### Public provider readiness and network constraints

For a bounded public read after building:

```bash
node packages/data/dist/cli.js price-check --provider coingecko --id bitcoin --max-age 300
```

This makes one keyless GET and uses no provider credentials. Preserve provider time separately from retrieval time, identity, age, units and limitations. An aggregate price is not an executable quote. The offline diagnostic regression is `packages/data/test/diagnostic.test.ts`; live reads are separate from automated tests.

A restricted environment needs the documented destination hosts for its selected task. A timeout, proxy refusal, authentication or payment error remains a failed read. Do not silently switch to paid access. Plugin ZIP integrity, host acceptance and connected MCP execution are also separate results; see [Releasing](RELEASING.md#research-plugin-release-and-installation).

## Keep skills portable

Start with a distinct task and a representative input/result. Put the main decision loop in `SKILL.md`, conditional mechanics in local references and repeatable calculations in bounded helpers. Each skill must work on its own, including referenced resources, license and attribution. Sibling skills are optional handoffs; never assume sibling paths.

Prefer maintained official tools. Protocol claims need current primary sources and explicit version, deployment, units and access limits. Research, unsigned preparation, simulation, signing and settlement require different evidence. Skills do not grant financial authority; preserve the user's exact scope and never include credentials or private account data.

Every active skill needs at least five routing prompts in its pack's `evals/routing.json`, including a named neighboring skill that must not load, and at least two behavioral exercises in `evals/behavior.json`. Cover new behavior with the installed-pack smoke journey, a CLI or fixture contract, or an eval case rather than a new unit test; add to `gateTests` only for release integrity, a validation boundary or security. `bun run evals` validates fixture structure and coverage offline; it does not run a model or establish a quality score. [Skill quality](docs/SKILL-QUALITY.md) describes answer evaluation and completion evidence.

## Add a pack

Supply a public npm manifest, independent version, self-contained skills, local instructions, primary sources, routing and behavior evals, build/check commands, and Claude/Codex plugin manifests. Register it in the root marketplace and discovery groupings, then update the README release table, agent index and getting-started guide. Do not add a required all-packs dependency.

## Open a pull request

Explain the user task, change and actual verification. Link primary sources for changed protocol behavior and state any untested capability. Keep generated archives and dependencies out of commits. A merge changes GitHub source; installed npm contents change only through an independent pack release under [RELEASING.md](RELEASING.md).

## Report a security issue

Use [private vulnerability reporting](https://github.com/galleonlabs/crypto-defi-skills/security/advisories/new) for a redacted reproduction. Never post live keys, private account data or signatures with replay value.

## Credit and reuse

Retain authorship, MIT permission and applicable third-party notices. [Attribution](ATTRIBUTION.md) explains the requirements; [History](docs/HISTORY.md) links the immutable evidence behind earlier reviews.
