import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { packages, root } from "./workspaces.ts";

type PackRelease = { id: string; name: string; version: string };

export function checkReadmeReleases(readme: string, packs: readonly PackRelease[]): string[] {
  const section = readme.split("## Independent packs\n")[1]?.split("\n## ")[0];
  if (!section) return ["README: Independent packs section missing"];

  const expected = new Map(packs.map((pack) => [pack.id, pack]));
  const seen = new Set<string>();
  const errors: string[] = [];
  for (const line of section.split("\n")) {
    if (!line.startsWith("| [") || !line.includes("(packages/")) continue;
    const match = line.match(/^\| \[[^\]]+\]\(packages\/([^/)]+)\) \| \[`([^`]+)`\]\(https:\/\/www\.npmjs\.com\/package\/([^/)]+)\/v\/([^/)]+)\) \|/);
    if (!match) {
      errors.push(`README: malformed pack release row: ${line}`);
      continue;
    }
    const [, id, displayed, urlName, urlVersion] = match;
    if (!id || !displayed || !urlName || !urlVersion) continue;
    if (seen.has(id)) errors.push(`README: duplicate pack row ${id}`);
    seen.add(id);
    const pack = expected.get(id);
    if (!pack) {
      errors.push(`README: unknown pack row ${id}`);
      continue;
    }
    const current = `${pack.name}@${pack.version}`;
    if (displayed !== current) errors.push(`README: ${id} displays ${displayed}; manifest is ${current}`);
    if (urlName !== pack.name || urlVersion !== pack.version) errors.push(`README: ${id} URL points to ${urlName}@${urlVersion}; manifest is ${current}`);
  }
  for (const pack of packs) if (!seen.has(pack.id)) errors.push(`README: missing pack row ${pack.id}`);
  return errors;
}

if (import.meta.main) {
  const readme = await readFile(resolve(root, "README.md"), "utf8");
  const errors = checkReadmeReleases(readme, (await packages()).map((pack) => ({
    id: pack.id,
    name: pack.manifest.name,
    version: pack.manifest.version,
  })));
  if (errors.length) {
    for (const error of errors) process.stderr.write(`${error}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write("README release table: all pack rows match source manifests\n");
  }
}
