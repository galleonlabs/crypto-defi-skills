import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

export const root = resolve(import.meta.dirname, "..");
export async function packages() {
  const entries = await readdir(resolve(root, "packages"), { withFileTypes: true });
  return Promise.all(entries.filter((entry) => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name)).map(async (entry) => {
    const directory = `packages/${entry.name}`;
    const manifest = JSON.parse(await readFile(resolve(root, directory, "package.json"), "utf8"));
    return { id: entry.name, directory, manifest };
  }));
}

export function run(command: string, args: string[], cwd = root) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed (${result.status})`);
}

if (import.meta.main) {
  const command = process.argv[2];
  if (command !== "check" && command !== "pack") throw new Error("Usage: bun scripts/workspaces.ts check|pack");
  for (const pack of await packages()) {
    process.stdout.write(`${command}: ${pack.manifest.name}\n`);
    const cwd = resolve(root, pack.directory);
    if (command === "check") run("bun", ["run", "check"], cwd);
    else run("npm", ["pack", "--dry-run", "--ignore-scripts"], cwd);
  }
  if (command === "check") {
    run("bun", ["scripts/check-style.ts"]);
    run("bunx", ["tsc", "--noEmit"]);
    run("bun", ["test", "./test"]);
  }
}
