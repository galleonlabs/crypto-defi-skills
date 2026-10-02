import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { packages, root } from "./workspaces.ts";
import { registryMetadata } from "./registry-smoke/metadata.ts";

// Explicit post-release check. Normal automated tests never access the registry.
const ids = process.argv.slice(2);
const all = await packages();
for (const id of ids) if (!all.some(pack => pack.id === id)) throw new Error(`Unknown pack: ${id}`);
const selected = all.filter(pack => !ids.length || ids.includes(pack.id));

function capture(command: string, args: string[], cwd: string): string {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", timeout: 120_000 });
  if (result.error || result.status !== 0) throw new Error(`${command} verification failed (${result.status}); check registry access`);
  return result.stdout;
}

async function compareTree(source: string, installed: string): Promise<void> {
  const expected = (await readdir(source)).sort();
  const actual = (await readdir(installed)).sort();
  if (JSON.stringify(expected) !== JSON.stringify(actual)) throw new Error("Published skill resource list differs from source");
  for (const entry of await readdir(source, { withFileTypes: true })) {
    if (entry.isDirectory()) await compareTree(resolve(source, entry.name), resolve(installed, entry.name));
    else if (!entry.isFile() || !(await readFile(resolve(source, entry.name))).equals(new Uint8Array(await readFile(resolve(installed, entry.name))))) {
      throw new Error(`Published skill resource differs: ${entry.name}`);
    }
  }
}

const temporary = await mkdtemp(resolve(tmpdir(), "galleon-registry-"));
try {
  for (const pack of selected) {
    const release = `${pack.manifest.name}@${pack.manifest.version}`;
    const metadata = registryMetadata(
      JSON.parse(capture("npm", ["view", release, "--json", "--registry=https://registry.npmjs.org"], temporary)),
      { name: pack.manifest.name, version: pack.manifest.version, repository: { directory: pack.directory, url: pack.manifest.repository.url } },
    );
    const consumer = await mkdtemp(resolve(temporary, `${pack.id}-`));
    await writeFile(resolve(consumer, "package.json"), JSON.stringify({ name: `verify-${pack.id}`, private: true }));
    capture("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--package-lock=false", "--registry=https://registry.npmjs.org", release], consumer);
    const installed = resolve(consumer, "node_modules", pack.manifest.name);
    const cli = resolve(installed, "dist/cli.js");
    if (capture("node", [cli, "--version"], consumer).trim() !== pack.manifest.version) throw new Error(`CLI version mismatch: ${release}`);
    const validation = JSON.parse(capture("node", [cli, "validate", "--json"], consumer));
    const catalog = JSON.parse(capture("node", [cli, "catalog", "--json"], consumer));
    const local = await import(resolve(root, pack.directory, "src/index.ts"));
    if (!validation.ok || !catalog.ok || JSON.stringify(catalog.skills) !== JSON.stringify(local.SKILL_CATALOG)) throw new Error(`Published catalog or validation mismatch: ${release}`);
    await compareTree(resolve(root, pack.directory, "skills"), resolve(installed, "skills"));
    capture("node", ["--input-type=module", "-e", `await import(${JSON.stringify(pack.manifest.name)})`], consumer);
    console.log(JSON.stringify({ release, skills: validation.skillCount, integrity: metadata.dist.integrity, result: "registry install, CLI, exports and all skill resources verified" }));
  }
} finally { await rm(temporary, { recursive: true, force: true }); }
