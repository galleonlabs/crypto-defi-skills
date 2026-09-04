import { spawnSync } from "node:child_process";
import { chmod, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist");

function run(command: string, args: string[]): void {
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit" });
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} failed`);
}

await rm(output, { recursive: true, force: true });
run(process.execPath, [
  "build",
  "src/index.ts",
  "src/cli.ts",
  "--target=node",
  "--format=esm",
  "--outdir=dist",
  "--sourcemap=external",
]);
run("bunx", ["tsc", "-p", "tsconfig.build.json"]);

const cliFile = resolve(output, "cli.js");
const cli = await readFile(cliFile, "utf8");
if (!cli.startsWith("#!")) await writeFile(cliFile, `#!/usr/bin/env node\n${cli}`);
await chmod(cliFile, 0o755);
