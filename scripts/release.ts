import { resolve } from "node:path";
import { packages, root, run } from "./workspaces.ts";
import { preflight } from "./release/preflight.ts";

const selected = process.argv[2];
const pack = (await packages()).find((entry) => entry.id === selected);
if (!pack) throw new Error("Choose an existing package directory: bun run release <package>");
const tag = `${pack.manifest.name}@${pack.manifest.version}`;
const evidence = preflight(root, pack.manifest.name, pack.manifest.version);
if (process.argv.includes("--preflight")) {
  process.stdout.write(`${JSON.stringify(evidence)}\n`);
  process.exit(0);
}
const cwd = resolve(root, pack.directory);
run("bun", ["test", "./test/workspaces.test.ts"]);
run("bun", ["run", "check"], cwd);
// npm handles registry authentication; never read or print credentials here.
run("npm", ["publish", "--access", "public", "--ignore-scripts", "--registry=https://registry.npmjs.org"], cwd);
process.stdout.write(`Published ${tag}. Verify registry contents before tagging this commit and creating the GitHub release.\n`);
