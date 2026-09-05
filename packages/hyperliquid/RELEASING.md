# Releasing

1. Update versions in `package.json`, plugin manifests, skill metadata, and `CHANGELOG.md`.
2. Run `bun install --frozen-lockfile` and `bun run check`.
3. Run the canonical Agent Skills and plugin validators.
4. Inspect `npm pack --dry-run --ignore-scripts` and a clean local install.
5. Commit, push, and wait for CI and discovery publication.
6. Publish the exact packed tarball to npm.
7. Verify the public registry tarball in a clean directory.
8. Tag the verified commit and create the GitHub release.

Never publish from a dirty worktree or from an unverified build artifact.
