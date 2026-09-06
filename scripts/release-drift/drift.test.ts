import { afterEach, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import {
  classifyPack,
  inspectPacks,
  isPackageVersionTag,
  missingTagsCause,
  partitionChanges,
  unpublishedDirectories,
  unpublishedPrefixes,
} from "./drift.ts";
import { packages } from "../workspaces.ts";

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("package-qualified tags", () => {
  test("accepts npm name@version and ignores discovery and legacy tags", () => {
    expect(isPackageVersionTag("galleon-defi-yield-skills@0.1.0")).toBe(true);
    expect(isPackageVersionTag("galleon-lp-skills@0.5.0")).toBe(true);
    expect(isPackageVersionTag("agent-skills-7a91b02645eaa4e351191ae31575b0f396ba1f5d")).toBe(false);
    expect(isPackageVersionTag("legacy-lp/v0.4.0")).toBe(false);
    expect(isPackageVersionTag("migration-2026-09-05")).toBe(false);
  });
});

describe("classification", () => {
  test("reports unreleased when the current version has no tag", () => {
    expect(classifyPack(new Set(["galleon-lp-skills@0.5.0"]), "galleon-defi-yield-skills", "0.1.1", ["packages/yield/package.json"])).toBe("unreleased");
  });

  test("reports drift when the tagged tree differs and clean when it does not", () => {
    const tags = new Set(["galleon-defi-yield-skills@0.1.0"]);
    expect(classifyPack(tags, "galleon-defi-yield-skills", "0.1.0", ["packages/yield/package.json"])).toBe("drift");
    expect(classifyPack(tags, "galleon-defi-yield-skills", "0.1.0", [])).toBe("clean");
  });
});

describe("published surface", () => {
  test("treats evals and test as unpublished unless the pack lists them in files", () => {
    expect(unpublishedPrefixes("packages/yield", ["dist", "skills", "llms.txt"])).toEqual([
      "packages/yield/evals/",
      "packages/yield/test/",
    ]);
    expect(unpublishedPrefixes("packages/yield", ["dist", "skills", "evals/"])).toEqual(["packages/yield/test/"]);
  });

  test("splits a diff into published and unpublished paths", () => {
    const split = partitionChanges(
      [
        "packages/yield/evals/routing.json",
        "packages/yield/skills/galleon-defi-yield/SKILL.md",
        "packages/yield/test/evals.test.ts",
        "packages/yield/package.json",
      ],
      unpublishedPrefixes("packages/yield", ["dist", "skills"]),
    );
    expect(split.published).toEqual(["packages/yield/skills/galleon-defi-yield/SKILL.md", "packages/yield/package.json"]);
    expect(split.unpublished).toEqual(["packages/yield/evals/routing.json", "packages/yield/test/evals.test.ts"]);
  });

  test("no pack publishes a directory this gate treats as unpublished", async () => {
    for (const pack of await packages()) {
      const files: string[] = pack.manifest.files ?? [];
      for (const name of unpublishedDirectories) {
        expect(files.map((entry) => entry.replace(/\/+$/, "")), pack.id).not.toContain(name);
      }
    }
  });
});

describe("git inspection", () => {
  test("fails when the clone has no package-qualified version tags", async () => {
    const root = await repo();
    await commit(root, "packages/demo/package.json", { name: "demo-skills", version: "0.1.0" }, "init");
    expect(() => inspectPacks(root, [pack("demo", "demo-skills", "0.1.0")])).toThrow(missingTagsCause);
  });

  test("reports clean, drift and unreleased from HEAD versus package tags", async () => {
    const root = await repo();
    await writePack(root, "clean", "clean-skills", "0.1.0", "stable");
    await writePack(root, "drift", "drift-skills", "0.1.0", "old keywords");
    await writePack(root, "next", "next-skills", "0.1.0", "first cut");
    commitAll(root, "release");
    tag(root, "clean-skills@0.1.0");
    tag(root, "drift-skills@0.1.0");
    tag(root, "next-skills@0.1.0");
    await writePack(root, "drift", "drift-skills", "0.1.0", "named protocol terms");
    await writePack(root, "next", "next-skills", "0.1.1", "named protocol terms");
    commitAll(root, "source fixes");
    const report = inspectPacks(root, [
      pack("clean", "clean-skills", "0.1.0"),
      pack("drift", "drift-skills", "0.1.0"),
      pack("next", "next-skills", "0.1.1"),
    ]);
    expect(report).toMatchObject({ drift: 1, clean: 1, unreleased: 1 });
    expect(report.packs.map((entry) => [entry.id, entry.state])).toEqual([
      ["clean", "clean"],
      ["drift", "drift"],
      ["next", "unreleased"],
    ]);
    expect(report.packs[1]?.changed).toContain("packages/drift/package.json");
  });

  test("source-only eval and test changes stay clean and are reported separately", async () => {
    const root = await repo();
    await writePack(root, "quiet", "quiet-skills", "0.1.0", "stable");
    commitAll(root, "release");
    tag(root, "quiet-skills@0.1.0");
    await writeFileIn(root, "packages/quiet/evals/routing.json", "[]\n");
    await writeFileIn(root, "packages/quiet/test/evals.test.ts", "// coverage\n");
    commitAll(root, "add routing coverage");
    const report = inspectPacks(root, [pack("quiet", "quiet-skills", "0.1.0")]);
    expect(report).toMatchObject({ drift: 0, clean: 1, unreleased: 0 });
    expect(report.packs[0]?.changed).toEqual([]);
    expect(report.packs[0]?.unpublished).toEqual([
      "packages/quiet/evals/routing.json",
      "packages/quiet/test/evals.test.ts",
    ]);
  });

  test("still reports drift when a published skill file changes alongside an eval file", async () => {
    const root = await repo();
    await writePack(root, "loud", "loud-skills", "0.1.0", "stable");
    await writeFileIn(root, "packages/loud/skills/demo/SKILL.md", "# demo\n");
    commitAll(root, "release");
    tag(root, "loud-skills@0.1.0");
    await writeFileIn(root, "packages/loud/evals/routing.json", "[]\n");
    await writeFileIn(root, "packages/loud/skills/demo/SKILL.md", "# demo revised\n");
    commitAll(root, "revise skill and add coverage");
    const report = inspectPacks(root, [pack("loud", "loud-skills", "0.1.0")]);
    expect(report).toMatchObject({ drift: 1 });
    expect(report.packs[0]?.changed).toEqual(["packages/loud/skills/demo/SKILL.md"]);
    expect(report.packs[0]?.unpublished).toEqual(["packages/loud/evals/routing.json"]);
  });
});

function pack(id: string, name: string, version: string) {
  return { id, directory: `packages/${id}`, name, version, files: ["dist", "skills"] };
}

async function repo(): Promise<string> {
  const root = await mkdtemp(resolve(tmpdir(), "release-drift-"));
  roots.push(root);
  run(root, ["git", "init", "-b", "main"]);
  run(root, ["git", "config", "user.email", "drift@example.test"]);
  run(root, ["git", "config", "user.name", "Drift Fixture"]);
  return root;
}

async function writePack(root: string, id: string, name: string, version: string, keywords: string): Promise<void> {
  const directory = resolve(root, "packages", id);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, "package.json"), `${JSON.stringify({ name, version, keywords: [keywords], files: ["dist", "skills"] }, null, 2)}\n`);
}

async function writeFileIn(root: string, file: string, body: string): Promise<void> {
  const path = resolve(root, file);
  await mkdir(resolve(path, ".."), { recursive: true });
  await writeFile(path, body);
}

async function commit(root: string, file: string, value: unknown, message: string): Promise<void> {
  const path = resolve(root, file);
  await mkdir(resolve(path, ".."), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
  commitAll(root, message);
}

function commitAll(root: string, message: string): void {
  run(root, ["git", "add", "."]);
  run(root, ["git", "commit", "-m", message]);
}

function tag(root: string, name: string): void {
  run(root, ["git", "tag", name]);
}

function run(cwd: string, args: string[]): void {
  const result = spawnSync(args[0]!, args.slice(1), { cwd, encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || args.join(" "));
}
