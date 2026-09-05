# Independent package releases

1. Update the selected package version in `package.json`, both plugin manifests, CLI version (content-only CLIs read the manifest), every skill's metadata, and its changelog. Other packages retain their versions.
2. Run `bun install`, `bun run check`, `bun run pack`, and `validate-agent-skills packages/<pack>/skills` when skills changed.
3. Commit and push the source. Wait for CI and the discovery artifact release for that exact commit.
4. In a clean checkout with npm publishing access, run `bun run release lp` or `bun run release lending` (any package directory is supported). The command validates and publishes only the selected package. Never print or commit registry credentials.
5. Independently verify `npm view <name>@<version> repository dist` and install that exact version into a clean consumer project. Check CLI version (content-only CLIs read the manifest), catalog, validation, and the expected skills and references.
6. Tag the published commit as `<npm-name>@<version>` and create a GitHub release from the package changelog. Use package-qualified tags, not a shared `v<version>`.
7. Consumers such as Boomkin pin the reviewed commit, package subdirectory, version and expected skill list. Update their catalog only after the new source and npm release are available.

Registry publication and visibility can finish at different times. If a publish response is uncertain, inspect the exact version before attempting another publish. Never overwrite or reuse a published version. Discovery releases are immutable per source commit and separate from npm releases.
