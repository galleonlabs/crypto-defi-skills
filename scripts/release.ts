import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { packages, root, run } from "./workspaces.ts";

const selected = process.argv[2];
const pack = (await packages()).find((entry) => entry.id === selected);
if (!pack) throw new Error("Choose an existing package directory: bun run release <package>");
const status = spawnSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" });
if (status.status !== 0 || status.stdout.trim()) throw new Error("Release requires a clean Git checkout");
const tag = `${pack.manifest.name}@${pack.manifest.version}`;
const cwd = resolve(root, pack.directory);
run("bun", ["run", "check"], cwd);
// npm handles registry authentication; never read or print credentials here.
run("npm", ["publish", "--access", "public", "--ignore-scripts"], cwd);
process.stdout.write(`Published ${tag}. Verify registry contents before tagging this commit and creating the GitHub release.\n`);
