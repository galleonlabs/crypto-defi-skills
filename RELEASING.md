# Independent package releases

1. Update the selected package version in `package.json`, both plugin manifests, CLI version (content-only CLIs read the manifest), every skill's metadata, and its changelog. Other packages retain their versions.
2. Run `bun install`, `bun run check`, `bun run pack`, and `validate-agent-skills packages/<pack>/skills` when skills changed.
3. Commit and push the source. Wait for CI and the discovery artifact release for that exact commit.
4. Publish through the `publish.yml` workflow, which authenticates with npm trusted publishing; no npm token is involved. It only runs from `main`, on the exact commit from step 3. Check first with the default dry run, then publish:

   ```bash
   gh workflow run publish.yml -R galleonlabs/crypto-defi-skills -f pack=lp
   gh workflow run publish.yml -R galleonlabs/crypto-defi-skills -f pack=lp -f dry_run=false
   ```

   The workflow requires successful CI and a published discovery index for that exact commit, refuses an existing version, then validates and publishes only the selected package with provenance. `bun run release <pack> --preflight` checks the same gates from a clean checkout and never publishes. `bun run release` refuses to publish outside the workflow.

   **First release of each pack:** the owner creates its trusted publisher with 2FA, then the release must follow within 2 days, because npm expires a configuration that has not completed a publish by then. So create it just before the release rather than for every pack at once. A 2FA-bypass token cannot do this. From the home directory, not the personal workspace, whose `.npmrc` would override the login:

   ```bash
   U=$(mktemp); npm login --userconfig "$U" --auth-type=web && npm trust github <npm-name> --userconfig "$U" --repo galleonlabs/crypto-defi-skills --file publish.yml --env npm-release --allow-publish --yes; rm -f "$U"
   ```

   Once a pack's first trusted publish has landed, set its npm **Settings → Publishing access** to "Require two-factor authentication and disallow tokens".

   If Actions is unavailable, stage from a clean dappnode checkout with `npx -y npm@11.21.1 stage publish --access public --ignore-scripts` in the package directory; it goes live only when the owner approves it with 2FA on npmjs.com. npm removes direct publishing by 2FA-bypass tokens around January 2027.
5. Independently verify `npm view <name>@<version> repository dist` and install that exact version into a clean consumer project. Check CLI version (content-only CLIs read the manifest), catalog, validation, and the expected skills and references.
   Run `bun run smoke:registry <pack>` to check the public registry metadata, install the exact version without lifecycle scripts, verify the Node CLI and exports, and compare every published skill resource byte-for-byte with this checkout. `<pack>` is the workspace id, such as `lp`. A directory path is rejected before any registry request. Omit the pack id to check all packs. This explicit release check accesses the network; ordinary tests do not.
6. Tag the published commit as `<npm-name>@<version>` and create a GitHub release from the package changelog. Use package-qualified tags, not a shared `v<version>`.
7. Consumers such as Boomkin pin the reviewed commit, package subdirectory, version and expected skill list. Update their catalog only after the new source and npm release are available.

Registry publication and visibility can finish at different times. If a publish response is uncertain, inspect the exact version before attempting another publish. Never overwrite or reuse a published version. Discovery releases are immutable per source commit and separate from npm releases.

## Research plugin release and installation

The public plugin [`galleon-defi-research@0.2.2`](https://github.com/galleonlabs/crypto-defi-skills/releases/tag/galleon-defi-research%400.2.2) is distinct from the independently released npm packs listed in [README.md](README.md#independent-packs). The source template is `plugins/defi-research`; it bundles data pack 0.6.2 from `27b7cc4478f68dc988bb129a66f8a8f884b76aca`, as recorded by the build's `integrity.json`. Resource pins change only with an explicitly reviewed plugin release.

Download the exact [galleon-defi-research-0.2.2.zip release asset](https://github.com/galleonlabs/crypto-defi-skills/releases/download/galleon-defi-research%400.2.2/galleon-defi-research-0.2.2.zip), verify SHA-256 `08b0fe52bd3fa255c2ea77ee0a4d6edd14e518191d489a5711125e93ddcd975e`, then upload that ZIP through ChatGPT's plugin installation surface. GitHub's source-code ZIP is not the plugin installation artifact. Release asset downloads may require their redirected GitHub asset host in restricted network settings; retain TLS verification and do not forward credentials to arbitrary redirect destinations.

To verify the packaging locally without publishing, run `bun run plugin:pack` from the repository root. It produces `artifacts/galleon-defi-research-0.2.2.zip` with per-resource SHA-256 provenance. Compare it with the release asset only at the exact released source revision. Validate each generated skill directory with the pinned `skills-ref` procedure in [CONTRIBUTING.md](CONTRIBUTING.md#reusable-cloud-development-setup) and run `bun test test/research-plugin.test.ts` for the public-only connection contract. Previous immutable plugin releases remain available; never overwrite their assets.

A successful build or verified ZIP does not prove host installation acceptance or a connected MCP read. The plugin's CoinGecko MCP destination is `mcp.api.coingecko.com`, separate from the REST diagnostic's `api.coingecko.com`; permit it only when testing that host workflow. Follow the [plugin README](plugins/defi-research/README.md) for installation and publication boundaries.

## Claude plugin directory listings

The Claude plugin directory reads each listed pack from its folder (`packages/<pack>`). It takes the listing icon from `.claude-plugin/icon.png` (512–2048 px PNG) only at the first portal save, and the icon cannot change afterwards. The `claude-directory` branch is `main` plus that icon in every pack, `displayName` and listing links in the submitted packs' `plugin.json`, and an External services section in the portfolio, security, strategy and yield READMEs; the directory submissions track it. Its CI reports `release-drift` because the icons are unreleased published files; that is expected on this branch only.

When a normal pack release first ships these files (cherry-pick the branch-only commits from `claude-directory` into the release; release-drift treats pack READMEs and manifests as published), switch each submission's tracked branch to `main` under the plugin's Settings → Tracked branch or tag in the developer portal, then delete `claude-directory`. Until then, merge `main` into `claude-directory` after each release so listings pick up new versions.
