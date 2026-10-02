# Contributing to Crypto DeFi Skills

Help make DeFi workflows easier to use, verify and maintain. Documentation fixes, clearer examples, reproducible bugs and new provider coverage are all welcome.

[Browse the packs](README.md#independent-packs) · [Report an issue](https://github.com/galleonlabs/crypto-defi-skills/issues/new) · [Release a pack](RELEASING.md)

## Choose a starting point

| Contribution | What to include |
| --- | --- |
| Fix unclear documentation | The confusing step and a clearer explanation or example |
| Report a connection or workflow failure | The pack version, harness, expected result and redacted reproduction |
| Improve protocol or provider guidance | Current primary sources, review date and explicit capability limits |
| Add or change a diagnostic | Bounded behavior, redacted errors and tests for meaningful failure cases |
| Add a new pack | A distinct user task and an independently installable skill corpus |

Small fixes can go straight to a pull request. For a new pack or material workflow change, open an issue first so we can agree on the scope.

## Work locally

Use Bun 1.3.14 and Git. Fork the repository, clone your fork, then run these commands from the repository root:

```bash
bun install --frozen-lockfile
bun run check
bun run pack
```

Read the affected package's `AGENTS.md` before editing. LP and Hyperliquid also have [LP-specific](packages/lp/CONTRIBUTING.md) and [Hyperliquid-specific](packages/hyperliquid/CONTRIBUTING.md) contribution guides. Shared instructions here apply to all packs.

After editing skills, run the skill-format validator for the affected pack:

```bash
validate-agent-skills packages/<pack>/skills
```

`validate-agent-skills` is a separate contributor tool, not an npm runtime dependency. The repository's `bun run check` also runs each package's bundled corpus validation and an offline release-drift gate against package-qualified git tags, so clones used for `check` need those tags fetched. The drift gate compares each pack's published surface: a change under `evals/` or `test/` cannot reach an npm consumer, so it is reported as an unpublished change rather than drift and needs no version bump. Run `bun run smoke` when changing package contents, exports, CLIs or installation behavior to verify clean consumer installs. `bun run link-health` probes skill reference URLs; it is scheduled and advisory, not part of `bun run check`.

See [skill quality and verification](docs/SKILL-QUALITY.md) for the authoring contract and the distinction between structural checks and output evaluations.

### Reusable cloud development setup

Use the existing isolated checkout; do not create a Git worktree unless requested. Record `git rev-parse HEAD` and compare it with `git ls-remote origin refs/heads/main` before claiming current-main validation. The procedure below was verified against `6d63df087600c40e39bbf71b9bff0eeb4941f058`; later tasks must record their own exact revision. Preserve local changes, released plugin source pins and Boomkin consumer selections.

Use Git, Bun 1.3.14, Node.js 20+ for installed CLIs, Python 3.11+ and `uv` for independent format validation. Install tools outside the checkout using the environment's supported tool/cache locations; machine-specific paths are not repository requirements. From the repository root:

```bash
git fetch origin --tags
bun install --frozen-lockfile
bun run check
bun run pack
bun run smoke
```

No service startup is needed. `check` includes package tests, type checks, corpus validation and builds. `smoke` creates clean consumers for every pack and verifies standalone installs, Node CLIs and ESM exports. For independent verification of the existing public releases, also run `bun run smoke:registry`: it checks exact registry versions and integrity metadata, installed catalogs, exports and every skill resource against the checkout. It reads the registry and does not publish. Run it before modifying published package content; a difference after editing is not a setup failure.

For a reproducible independent Agent Skills format check, use the official [skills-ref](https://github.com/agentskills/agentskills/tree/69ef37e9424c0a7ea9dd2293b559e43ec8176379/skills-ref) reference implementation pinned to `69ef37e9424c0a7ea9dd2293b559e43ec8176379`. It is a contributor validation tool, not a runtime dependency or the separately named `validate-agent-skills` executable. This example creates a temporary tools directory and leaves repository dependencies unchanged:

```bash
validator_dir=$(mktemp -d)
git clone https://github.com/agentskills/agentskills.git "$validator_dir/agentskills"
git -C "$validator_dir/agentskills" checkout --detach 69ef37e9424c0a7ea9dd2293b559e43ec8176379
uv sync --frozen --project "$validator_dir/agentskills/skills-ref"
for skill in packages/*/skills/*; do
  [ -f "$skill/SKILL.md" ] || continue
  "$validator_dir/agentskills/skills-ref/.venv/bin/skills-ref" validate "$skill" || exit 1
done
uv run --frozen --project "$validator_dir/agentskills/skills-ref" pytest "$validator_dir/agentskills/skills-ref/tests" -q
```

`skills-ref validate` takes one individual skill directory, not a pack parent. All 41 source skill directories and the same resources in clean installations of all 14 released packs passed this validator at the recorded revision; its own 40 tests passed. These checks establish format and installation integrity, not provider access or model performance.

### Public provider readiness and network constraints

After building, exercise the native read-only diagnostic from the repository root:

```bash
node packages/data/dist/cli.js price-check --provider coingecko --id bitcoin --max-age 300
```

This performs one public keyless GET, reads no provider credentials and does not retry or use paid routes. Preserve `provider`, `source`, `identity`, `observedAt` (provider time), `retrievedAt` (local retrieval time), `ageSeconds`, `maxAgeSeconds` and limitations from its JSON. Never substitute retrieval time for a missing provider timestamp or treat an aggregate price as an executable quote. The existing offline diagnostic regression is `bun test packages/data/test/diagnostic.test.ts`; live reads are separate from automated tests.

Restricted cloud environments need `api.coingecko.com` for this REST check and `api.github.com` for GitHub API/PR operations, in addition to existing Git and package-manager destinations. Add required hosts without replacing unrelated allowlist entries. Saving network configuration is not proof it is active: retry the affected operation after applying it. Git access through platform authentication does not prove API or push access; test the required operation before requesting credentials.

Use the environment's supported HTTPS proxy and trust configuration. On Node.js 24.5+ (verified here with Node.js 24.19.0), `NODE_USE_ENV_PROXY=1 node packages/data/dist/cli.js price-check --provider coingecko --id bitcoin --max-age 300` enables native environment-proxy support when required. Preserve configured CA bindings; never disable TLS, signature or checksum verification. A proxy `CONNECT 403`, timeout or authentication/payment error remains a failed check, with provider time unknown if no observation arrived. Keep optional paid/authenticated providers and their existing secret bindings unchanged; do not copy credentials into docs or logs. No transactions, package publication or deployments belong to onboarding.

The separate research plugin release and ZIP installation entrypoint are documented in [RELEASING.md](RELEASING.md#research-plugin-release-and-installation). Development checks, public REST readiness, plugin ZIP integrity, host installation acceptance and connected MCP execution are separate milestones.

## Keep skills portable

Every pack carries `evals/routing.json`: at least five prompts per skill naming the expected skill and the neighbouring skills that must not load. Add cases when you add a skill or move a boundary. `bun run check` validates their structure and coverage only; a passing dataset is not a model score.

Each skill must work when installed on its own. Keep required references and scripts inside its directory; use links to sibling skills only as optional next steps. Put the main decision loop in `SKILL.md`, with detailed mechanics in `references/` and repeatable diagnostics in `scripts/`.

Prefer maintained official tools. Do not copy upstream runtimes or build a competing adapter when an existing one fits the task. Protocol claims need current primary sources, a review date and a reproducible read or test where appropriate. Distinguish documented behavior from behavior actually verified.

Skill instructions do not grant financial authority. Keep research, planning and execution separate, preserve explicit approval requirements, and describe failure and recovery behavior. Never include credentials, private observations, account secrets or generated profiles in a contribution.

## Add a pack

Create `packages/<name>` with:

- A public npm manifest, independent version and self-contained skill directory.
- Package documentation, source provenance and contributor instructions in `AGENTS.md`.
- Check and build scripts, plus tests appropriate to any executable behavior.
- Claude and Codex plugin manifests.

Register the pack in [the Claude marketplace](.claude-plugin/marketplace.json) and [skill discovery groupings](skills.sh.json). Workspace checks and discovery find package directories automatically. Add it to the root README's pack and workflow tables. Do not introduce a required all-packs dependency.

## Open a pull request

Explain the user task, what changes and how you verified it. Link official sources for changed provider or protocol claims, and call out any access or testing limits. Keep unrelated fixes separate so each change is easy to review.

Do not include installed dependencies or generated release archives. Maintainers publish each pack independently from a clean commit using package-qualified tags; follow [RELEASING.md](RELEASING.md). A documentation merge updates GitHub, while an existing npm version retains its published contents.

## Report a security issue

Use [private vulnerability reporting](https://github.com/galleonlabs/crypto-defi-skills/security/advisories/new) for security issues. Share only a redacted reproduction; never post live keys or private account data in an issue or pull request.

## Credit and reuse

Retain existing authorship and license notices in contributions and derived work. [ATTRIBUTION.md](ATTRIBUTION.md) explains MIT notice requirements and offers an optional visible credit line.
