import { spawnSync } from "node:child_process";

export type PackState = "drift" | "clean" | "unreleased";

export type PackIdentity = {
  id: string;
  directory: string;
  name: string;
  version: string;
};

export type PackDrift = {
  id: string;
  name: string;
  version: string;
  tag: string;
  state: PackState;
  changed: string[];
};

export type DriftReport = {
  packs: PackDrift[];
  drift: number;
  clean: number;
  unreleased: number;
};

export const packageVersionTag = /^[^/]+@\d+\.\d+\.\d+$/;
export const missingTagsCause = "no package-qualified version tags in this clone; fetch tags before running the release-drift gate";

export function isPackageVersionTag(tag: string): boolean {
  return packageVersionTag.test(tag);
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
    const changed = tagSet.has(tag) ? changedPaths(cwd, tag, pack.directory) : [];
    return {
      id: pack.id,
      name: pack.name,
      version: pack.version,
      tag,
      state: classifyPack(tagSet, pack.name, pack.version, changed),
      changed,
    };
  });
  return { packs: inspected, ...countStates(inspected) };
}

export function formatReport(report: DriftReport): string {
  const lines = [`release-drift: ${report.drift} drift, ${report.clean} clean, ${report.unreleased} unreleased`];
  for (const pack of report.packs) {
    lines.push(`  ${pack.state.padEnd(11)} ${pack.tag}`);
    if (pack.state === "drift") for (const file of pack.changed) lines.push(`    ${file}`);
  }
  return `${lines.join("\n")}\n`;
}
