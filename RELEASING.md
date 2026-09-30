# Independent package releases

1. Update the selected package version in `package.json`, both plugin manifests, CLI version (content-only CLIs read the manifest), every skill's metadata, and its changelog. Other packages retain their versions.
2. Run `bun install`, `bun run check`, `bun run pack`, and `validate-agent-skills packages/<pack>/skills` when skills changed.
3. Commit and push the source. Wait for CI and the discovery artifact release for that exact commit.
4. In a clean checkout with npm publishing access, run `bun run release lp` or `bun run release lending` (any package directory is supported). The command validates and publishes only the selected package. Never print or commit registry credentials.
5. Independently verify `npm view <name>@<version> repository dist` and install that exact version into a clean consumer project. Check CLI version (content-only CLIs read the manifest), catalog, validation, and the expected skills and references.
   Run `bun run smoke:registry <package-directory>` to check the public registry metadata, install the exact version without lifecycle scripts, verify the Node CLI and exports, and compare every published skill resource byte-for-byte with this checkout. Omit the directory arguments to check all packs. This explicit release check accesses the network; ordinary tests do not.
6. Tag the published commit as `<npm-name>@<version>` and create a GitHub release from the package changelog. Use package-qualified tags, not a shared `v<version>`.
7. Consumers such as Boomkin pin the reviewed commit, package subdirectory, version and expected skill list. Update their catalog only after the new source and npm release are available.

Registry publication and visibility can finish at different times. If a publish response is uncertain, inspect the exact version before attempting another publish. Never overwrite or reuse a published version. Discovery releases are immutable per source commit and separate from npm releases.

## Research plugin release and installation

The public plugin [`galleon-defi-research@0.1.1`](https://github.com/galleonlabs/crypto-defi-skills/releases/tag/galleon-defi-research%400.1.1) is distinct from the 14 independently released npm packs. Its release tag resolves to `6d63df087600c40e39bbf71b9bff0eeb4941f058`. The source template is `plugins/defi-research`; it bundles data pack 0.4.0 from `8609564d3a79883ebf515fec201240e90fb271b2`, as recorded by the build's `integrity.json`. Keep that reviewed resource pin and existing Boomkin pins unchanged during development setup.

Download the exact [galleon-defi-research-0.1.1.zip release asset](https://github.com/galleonlabs/crypto-defi-skills/releases/download/galleon-defi-research%400.1.1/galleon-defi-research-0.1.1.zip), verify SHA-256 `0c62f109f2323f7dd80efab788381f7f9dd0af676d6c81ce9e50da0116f43c89`, then upload that ZIP through ChatGPT's plugin installation surface. GitHub's source-code ZIP is not the plugin installation artifact. Release asset downloads may require their redirected GitHub asset host in restricted network settings; retain TLS verification and do not forward credentials to arbitrary redirect destinations.

To verify the packaging locally without publishing, run `bun run plugin:pack` from the repository root. It produces `artifacts/galleon-defi-research-0.1.1.zip` with per-resource SHA-256 provenance. Compare it with the release asset only at the exact released source revision; later template changes require their own reviewed plugin release rather than overwriting 0.1.1. Validate each generated skill directory with the pinned `skills-ref` procedure in [CONTRIBUTING.md](CONTRIBUTING.md#reusable-cloud-development-setup) and run `bun test test/research-plugin.test.ts` for the public-only connection contract.

A successful build or verified ZIP does not prove host installation acceptance or a connected MCP read. The plugin's CoinGecko MCP destination is `mcp.api.coingecko.com`, separate from the REST diagnostic's `api.coingecko.com`; permit it only when testing that host workflow. Follow the existing [plugin README](plugins/defi-research/README.md) for installation and publication boundaries. A scoped documentation PR follows normal CI and independent review; the owner handles merge and publication separately.
