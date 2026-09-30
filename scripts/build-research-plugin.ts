import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile, cp } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const revision = "8609564d3a79883ebf515fec201240e90fb271b2";
const template = join(root, "plugins/defi-research");
const manifest = JSON.parse(await readFile(join(template, "plugin.json"), "utf8"));
const directory = join(root, "dist", "plugins", manifest.name);
await rm(directory, { force: true, recursive: true });
await mkdir(directory, { recursive: true });
await cp(template, directory, { recursive: true });
for (const name of ["LICENSE", "ATTRIBUTION.md"]) await cp(join(root, name), join(directory, name));
const files: Record<string, string> = {};
const listing = spawnSync("git", ["ls-tree", "-r", "--name-only", revision, "packages/data/skills"], { cwd: root, encoding: "utf8" });
if (listing.status !== 0) throw new Error("Reviewed data-pack revision is unavailable");
for (const path of listing.stdout.trim().split("\n")) {
  const relative = path.replace("packages/data/", "");
  const blob = spawnSync("git", ["show", `${revision}:${path}`], { cwd: root, encoding: "buffer" });
  if (blob.status !== 0) throw new Error(`Cannot read reviewed resource ${relative}`);
  const target = join(directory, relative);
  await mkdir(resolve(target, ".."), { recursive: true });
  await writeFile(target, new Uint8Array(blob.stdout));
  files[relative] = createHash("sha256").update(new Uint8Array(blob.stdout)).digest("hex");
}
await writeFile(join(directory, "integrity.json"), JSON.stringify({ schemaVersion: 1, source: "https://github.com/galleonlabs/crypto-defi-skills", revision, package: "galleon-defi-data-skills", version: "0.4.0", files }, null, 2) + "\n");
const archive = join(root, "artifacts", `${manifest.name}-${manifest.version}.zip`);
await mkdir(join(root, "artifacts"), { recursive: true });
await rm(archive, { force: true });
const zip = spawnSync("zip", ["-q", "-r", archive, "."], { cwd: directory });
if (zip.status !== 0) throw new Error("Plugin ZIP failed");
console.log(JSON.stringify({ archive, sha256: createHash("sha256").update(new Uint8Array(await readFile(archive))).digest("hex"), resources: Object.keys(files).length, revision }, null, 2));
