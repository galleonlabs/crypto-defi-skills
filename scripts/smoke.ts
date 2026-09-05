import { spawnSync } from "node:child_process";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { packages, root } from "./workspaces.ts";

function capture(command: string, args: string[], cwd: string) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command}: ${result.stderr}`);
  return result.stdout;
}

const temporary = await mkdtemp(resolve(tmpdir(), "crypto-defi-pack-smoke-"));
try {
  const all = await packages();
  for (const pack of all) {
    const cwd = resolve(root, pack.directory);
    const result = JSON.parse(capture("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", temporary], cwd));
    // npm 12 returns workspace results keyed by package name; earlier npm returns an array.
    const packed = Array.isArray(result) ? result.find((item) => item.name === pack.manifest.name) : result[pack.manifest.name];
    if (!packed || packed.name !== pack.manifest.name || packed.version !== pack.manifest.version) throw new Error("Packed identity mismatch");
    for (const other of all.filter((item) => item.id !== pack.id)) {
      if (packed.files.some((file: { path: string }) => file.path.startsWith(`packages/${other.id}/`) || file.path.startsWith(`skills/${other.id}-`))) throw new Error("Tarball contains another pack");
    }
    const consumer = await mkdtemp(resolve(temporary, `${pack.id}-`));
    capture("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--package-lock=false", resolve(temporary, packed.filename)], consumer);
    const installed = resolve(consumer, "node_modules", pack.manifest.name);
    const cli = resolve(installed, "dist/cli.js");
    if (capture("node", [cli, "--version"], consumer).trim() !== pack.manifest.version) throw new Error("Installed CLI version mismatch");
    const validated = JSON.parse(capture("node", [cli, "validate", "--json"], consumer));
    const expected = await readdir(resolve(cwd, "skills"));
    if (!validated.ok || validated.skillCount !== expected.length) throw new Error("Installed skill validation failed");
    const catalog = JSON.parse(capture("node", [cli, "catalog", "--json"], consumer));
    if (!catalog.ok || catalog.skills.length === 0) throw new Error("Empty installed catalog");
    capture("node", ["--input-type=module", "-e", `await import(${JSON.stringify(pack.manifest.name)})`], consumer);
    process.stdout.write(`smoke: ${packed.name}@${packed.version}, ${validated.skillCount} skills, standalone npm install and Node CLI passed\n`);
  }
} finally {
  await rm(temporary, { recursive: true, force: true });
}
