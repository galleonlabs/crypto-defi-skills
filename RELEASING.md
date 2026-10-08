# Independent package releases

1. Update the selected package version in `package.json`, both plugin manifests, CLI version (content-only CLIs read the manifest), every skill's metadata, and its changelog. Other packages retain their versions.
2. Run `bun install`, `bun run check`, `bun run pack`, and `validate-agent-skills packages/<pack>/skills` when skills changed.
3. Commit and push the source. Wait for CI and the discovery artifact release for that exact commit.
4. In a clean checkout with npm publishing access and authenticated `gh`, run `bun run release lp` or `bun run release lending` (any package directory is supported). The command requires successful CI and a published discovery index for that exact commit, checks registry authentication and refuses an existing version, then validates and publishes only the selected package to the public npm registry. Use `bun run release <pack> --preflight` to check readiness without publishing. Never print or commit registry credentials.
5. Independently verify `npm view <name>@<version> repository dist` and install that exact version into a clean consumer project. Check CLI version (content-only CLIs read the manifest), catalog, validation, and the expected skills and references.
   Run `bun run smoke:registry <package-directory>` to check the public registry metadata, install the exact version without lifecycle scripts, verify the Node CLI and exports, and compare every published skill resource byte-for-byte with this checkout. Omit the directory arguments to check all packs. This explicit release check accesses the network; ordinary tests do not.
6. Tag the published commit as `<npm-name>@<version>` and create a GitHub release from the package changelog. Use package-qualified tags, not a shared `v<version>`.
7. Consumers such as Boomkin pin the reviewed commit, package subdirectory, version and expected skill list. Update their catalog only after the new source and npm release are available.

Registry publication and visibility can finish at different times. If a publish response is uncertain, inspect the exact version before attempting another publish. Never overwrite or reuse a published version. Discovery releases are immutable per source commit and separate from npm releases.

## Research plugin release and installation

The public plugin [`galleon-defi-research@0.2.1`](https://github.com/galleonlabs/crypto-defi-skills/releases/tag/galleon-defi-research%400.2.1) is distinct from the independently released npm packs listed in [README.md](README.md#independent-packs). The source template is `plugins/defi-research`; it bundles data pack 0.6.0 from `7451b2cb578ce786cbd1e3ee55a4d12ba599739d`, as recorded by the build's `integrity.json`. Resource pins change only with an explicitly reviewed plugin release.

Download the exact [galleon-defi-research-0.2.1.zip release asset](https://github.com/galleonlabs/crypto-defi-skills/releases/download/galleon-defi-research%400.2.1/galleon-defi-research-0.2.1.zip), verify SHA-256 `0c3e23e07407d15c55b3fb3963f37aeb8022f1c5d6f6c6d58e009c9c6a5519d1`, then upload that ZIP through ChatGPT's plugin installation surface. GitHub's source-code ZIP is not the plugin installation artifact. Release asset downloads may require their redirected GitHub asset host in restricted network settings; retain TLS verification and do not forward credentials to arbitrary redirect destinations.

To verify the packaging locally without publishing, run `bun run plugin:pack` from the repository root. It produces `artifacts/galleon-defi-research-0.2.1.zip` with per-resource SHA-256 provenance. Compare it with the release asset only at the exact released source revision. Validate each generated skill directory with the pinned `skills-ref` procedure in [CONTRIBUTING.md](CONTRIBUTING.md#reusable-cloud-development-setup) and run `bun test test/research-plugin.test.ts` for the public-only connection contract. Previous immutable plugin releases remain available; never overwrite their assets.

A successful build or verified ZIP does not prove host installation acceptance or a connected MCP read. The plugin's CoinGecko MCP destination is `mcp.api.coingecko.com`, separate from the REST diagnostic's `api.coingecko.com`; permit it only when testing that host workflow. Follow the [plugin README](plugins/defi-research/README.md) for installation and publication boundaries.
