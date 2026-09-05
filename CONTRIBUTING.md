# Contributing to Crypto DeFi Skills

Help make DeFi workflows easier to use, verify and maintain. Documentation fixes, clearer examples, reproducible bugs and new provider coverage are all welcome.

[Browse the packs](README.md#four-independent-packs) · [Report an issue](https://github.com/galleonlabs/crypto-defi-skills/issues/new) · [Release a pack](RELEASING.md)

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

Read the affected package's `AGENTS.md` before editing. LP and Hyperliquid also have [LP-specific](packages/lp/CONTRIBUTING.md) and [Hyperliquid-specific](packages/hyperliquid/CONTRIBUTING.md) contribution guides. Shared instructions here apply to all four packs.

After editing skills, run the skill-format validator for the affected pack:

```bash
validate-agent-skills packages/<pack>/skills
```

`validate-agent-skills` is a separate contributor tool, not an npm runtime dependency. The repository's `bun run check` also runs each package's bundled corpus validation. Run `bun run smoke` when changing package contents, exports, CLIs or installation behavior to verify clean consumer installs.

## Keep skills portable

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
