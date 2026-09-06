import { spawnSync } from "node:child_process";

export type PackState = "drift" | "clean" | "unreleased";

export type PackIdentity = {
  id: string;
  directory: string;
  name: string;
  version: string;
  files: readonly string[];
};

export type PackDrift = {
  id: string;
  name: string;
  version: string;
  tag: string;
  state: PackState;
  changed: string[];
  unpublished: string[];
};

export type DriftReport = {
  packs: PackDrift[];
  drift: number;
  clean: number;
  unreleased: number;
};

export const packageVersionTag = /^[^/]+@\d+\.\d+\.\d+$/;
export const unpublishedDirectories = ["evals", "test"] as const;
export const missingTagsCause = "no package-qualified version tags in this clone; fetch tags before running the release-drift gate";

export function isPackageVersionTag(tag: string): boolean {
  return packageVersionTag.test(tag);
}

export function unpublishedPrefixes(directory: string, files: readonly string[]): string[] {
  const published = new Set(files.map((entry) => entry.replace(/^\.\//, "").replace(/\/+$/, "")));
  return unpublishedDirectories.filter((name) => !published.has(name)).map((name) => `${directory}/${name}/`);
}

export function partitionChanges(changed: readonly string[], prefixes: readonly string[]): { published: string[]; unpublished: string[] } {
  const published: string[] = [];
  const unpublished: string[] = [];
  for (const path of changed) (prefixes.some((prefix) => path.startsWith(prefix)) ? unpublished : published).push(path);
  return { published, unpublished };
}

export function classifyPack(tags: ReadonlySet<string>, name: string, version: string, changed: readonly string[]): PackState {
  if (!tags.has(`${name}@${version}`)) return "unreleased";
  return changed.length > 0 ? "drift" : "clean";
}

export function countStates(packs: readonly PackDrift[]): Pick<DriftReport, "drift" | "clean" | "unreleased"> {
  return {
    drift: packs.filter((pack) => pack.state === "drift").length,
    clean: packs.filter((pack) => pack.state === "clean").length,
    unreleased: packs.filter((pack) => pack.state === "unreleased").length,
  };
}

export function git(cwd: string, args: string[]): { status: number; stdout: string; stderr: string } {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (result.error) throw result.error;
  return { status: result.status ?? 1, stdout: result.stdout.trim(), stderr: result.stderr.trim() };
}

export function listPackageVersionTags(cwd: string): string[] {
  const listed = git(cwd, ["tag", "-l"]);
  if (listed.status !== 0) throw new Error(listed.stderr || "git tag -l failed");
  return listed.stdout.split("\n").map((tag) => tag.trim()).filter(isPackageVersionTag);
}

export function assertPackageVersionTags(tags: readonly string[]): void {
  if (tags.length === 0) throw new Error(missingTagsCause);
}

export function changedPaths(cwd: string, tag: string, directory: string): string[] {
  const verify = git(cwd, ["rev-parse", "--verify", `refs/tags/${tag}`]);
  if (verify.status !== 0) throw new Error(verify.stderr || `missing git tag ${tag}`);
  const diff = git(cwd, ["diff", "--name-only", tag, "HEAD", "--", directory]);
  if (diff.status !== 0) throw new Error(diff.stderr || `git diff ${tag} HEAD -- ${directory} failed`);
  return diff.stdout === "" ? [] : diff.stdout.split("\n");
}

export function inspectPacks(cwd: string, packs: readonly PackIdentity[]): DriftReport {
  const tags = listPackageVersionTags(cwd);
  assertPackageVersionTags(tags);
  const tagSet = new Set(tags);
  const inspected = packs.map((pack) => {
    const tag = `${pack.name}@${pack.version}`;
    const diffed = tagSet.has(tag) ? changedPaths(cwd, tag, pack.directory) : [];
    const { published, unpublished } = partitionChanges(diffed, unpublishedPrefixes(pack.directory, pack.files));
    return {
      id: pack.id,
      name: pack.name,
      version: pack.version,
      tag,
      state: classifyPack(tagSet, pack.name, pack.version, published),
      changed: published,
      unpublished,
    };
  });
  return { packs: inspected, ...countStates(inspected) };
}

export function formatReport(report: DriftReport): string {
  const carrying = report.packs.filter((pack) => pack.unpublished.length > 0).length;
  const summary = `release-drift: ${report.drift} drift, ${report.clean} clean, ${report.unreleased} unreleased`;
  const lines = [carrying === 0 ? summary : `${summary} (${carrying} carrying unpublished-only changes)`];
  for (const pack of report.packs) {
    lines.push(`  ${pack.state.padEnd(11)} ${pack.tag}`);
    if (pack.state === "drift") for (const file of pack.changed) lines.push(`    ${file}`);
    for (const file of pack.unpublished) lines.push(`    unpublished ${file}`);
  }
  return `${lines.join("\n")}\n`;
}
