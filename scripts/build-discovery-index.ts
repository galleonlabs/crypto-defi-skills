import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";
import { packages } from "./workspaces.ts";

const schema = "https://schemas.agentskills.io/discovery/0.2.0/schema.json";
const root = resolve(import.meta.dirname, "..");
const outputDirectory = resolve(root, "artifacts");
const baseUrl = process.argv[2];

if (!baseUrl) throw new Error("Usage: bun scripts/build-discovery-index.ts <artifact-base-url>");

const archiveEnvironment = {
  ...process.env,
  GIT_AUTHOR_DATE: "2000-01-01T00:00:00Z",
  GIT_AUTHOR_EMAIL: "skills@galleonlabs.xyz",
  GIT_AUTHOR_NAME: "Galleon Labs",
  GIT_COMMITTER_DATE: "2000-01-01T00:00:00Z",
  GIT_COMMITTER_EMAIL: "skills@galleonlabs.xyz",
  GIT_COMMITTER_NAME: "Galleon Labs",
};

function runText(command: string, args: string[], input?: string): string {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    env: archiveEnvironment,
    input,
  });
  if (result.status !== 0) throw new Error(result.stderr || `${command} failed`);
  return result.stdout;
}

function runBuffer(command: string, args: string[], input?: Uint8Array): Uint8Array {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "buffer",
    env: archiveEnvironment,
    input,
  });
  if (result.status !== 0) throw new Error(result.stderr.toString() || `${command} failed`);
  return new Uint8Array(result.stdout);
}

function readMetadata(directory: string): { name: string; description: string } {
  const path = `${directory}/SKILL.md`;
  const source = runText("git", ["show", `HEAD:${path}`]);
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
  if (!frontmatter) throw new Error(`Missing frontmatter in ${path}`);
  const metadata = parse(frontmatter) as { name?: unknown; description?: unknown };
  if (
    typeof metadata.name !== "string" ||
    typeof metadata.description !== "string" ||
    metadata.name.length === 0 ||
    metadata.name.length > 64 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.name) ||
    metadata.description.length === 0 ||
    metadata.description.length > 1024
  ) {
    throw new Error(`Invalid name or description in ${path}`);
  }
  return { name: metadata.name, description: metadata.description };
}

function createArchive(directory: string): Uint8Array {
  const tree = runText("git", ["rev-parse", `HEAD:${directory}`]).trim();
  const commit = runText("git", ["commit-tree", tree], "Agent Skills archive\n").trim();
  const tar = runBuffer("git", ["archive", "--format=tar", commit]);
  return runBuffer("gzip", ["-n", "-9", "-c"], tar);
}

rmSync(outputDirectory, { force: true, recursive: true });
mkdirSync(outputDirectory);

const directories: string[] = [];
for (const pack of await packages()) {
  const prefix = `${pack.directory}/skills`;
  const names = runText("git", ["ls-tree", "-d", "--name-only", `HEAD:${prefix}`]).trim().split("\n").filter(Boolean);
  directories.push(...names.map((name) => `${prefix}/${name}`));
}

const skills = directories
  .map((directory) => {
    const metadata = readMetadata(directory);
    const content = createArchive(directory);
    const filename = `${metadata.name}.tar.gz`;
    writeFileSync(resolve(outputDirectory, filename), content);
    return {
      ...metadata,
      type: "archive",
      url: `${baseUrl.replace(/\/$/, "")}/${filename}`,
      digest: `sha256:${createHash("sha256").update(content).digest("hex")}`,
    };
  })
  .sort((left, right) => left.name.localeCompare(right.name));

if (new Set(skills.map((skill) => skill.name)).size !== skills.length) {
  throw new Error("Skill names must be unique");
}

writeFileSync(
  resolve(outputDirectory, "index.json"),
  `${JSON.stringify({ $schema: schema, skills }, null, 2)}\n`,
);
process.stdout.write(`discovery: ${skills.length} skills\n`);
