# Contributing

Choose the package affected by the change and read its AGENTS.md and CONTRIBUTING.md. Protocol claims need current primary sources and explicit limits. Prefer maintained official tools; do not copy upstream runtimes or implement a competing adapter when one already fits.

Run `bun install --frozen-lockfile`, `bun run check`, and `bun run pack` at the repository root. For skill changes also run `validate-agent-skills packages/<pack>/skills`. Keep required references inside each skill so selective installation works.

To add a pack, create `packages/<name>` with a public npm manifest, independent version, skill directory, check/build scripts, and both plugin manifests. Register it in `.claude-plugin/marketplace.json` and `skills.sh.json`. Workspace checks and discovery find package directories automatically. There is no required all-packs bundle.

Use package-qualified release tags and follow [RELEASING.md](RELEASING.md). Do not commit credentials, private observations, installed dependencies, or generated release archives.
