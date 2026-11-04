import { resolve } from "node:path";
import { packages, root, run } from "./workspaces.ts";
import { preflight } from "./release/preflight.ts";

const selected = process.argv[2];
const pack = (await packages()).find((entry) => entry.id === selected);
if (!pack) throw new Error("Choose an existing package directory: bun run release <package>");
const tag = `${pack.manifest.name}@${pack.manifest.version}`;
const dryRun = process.argv.includes("--dry-run");
const preflightOnly = process.argv.includes("--preflight");
if (!dryRun && !preflightOnly && !process.env.ACTIONS_ID_TOKEN_REQUEST_URL) {
  throw new Error("Publish through .github/workflows/publish.yml; RELEASING.md has the command");
}
const evidence = preflight(root, pack.manifest.name, pack.manifest.version, { allowExisting: dryRun });
if (preflightOnly) {
  process.stdout.write(`${JSON.stringify(evidence)}\n`);
  process.exit(0);
}
const cwd = resolve(root, pack.directory);
run("bun", ["test", "./test/workspaces.test.ts"]);
run("bun", ["run", "check"], cwd);
if (dryRun) {
  // npm refuses a dry run over an existing version, so review the archive contents instead.
  if (evidence.exists) run("npm", ["pack", "--dry-run", "--ignore-scripts"], cwd);
  else run("npm", ["publish", "--dry-run", "--access", "public", "--ignore-scripts", "--registry=https://registry.npmjs.org"], cwd);
  process.stdout.write(`Dry run passed for ${tag}; nothing was published.\n`);
  process.exit(0);
}
// npm authenticates through the workflow's OIDC identity; no registry credential exists here.
run("npm", ["publish", "--access", "public", "--ignore-scripts", "--registry=https://registry.npmjs.org"], cwd);
process.stdout.write(`Published ${tag}. Verify registry contents before tagging this commit and creating the GitHub release.\n`);
