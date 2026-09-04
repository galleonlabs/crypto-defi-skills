# Releasing

1. Keep `package.json`, `.codex-plugin/plugin.json`, and `.claude-plugin/plugin.json` on the same version.
2. Update `CHANGELOG.md`.
3. Run `bun run check` and `npm pack --dry-run --ignore-scripts`.
4. Publish the public package.
5. Tag the exact published commit as `v<version>` and create a GitHub release.
6. Verify the npm registry, GitHub tag, release assets, and a clean install in a temporary project.

Never publish from a dirty tree. Never print an npm token in a command, log, issue, or release note.
