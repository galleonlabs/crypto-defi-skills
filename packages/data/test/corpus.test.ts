import { expect, test } from "bun:test";
import { lstat, readdir, readFile, realpath } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { parse } from "yaml";
import { SKILL_CATALOG } from "../src/catalog.ts";
const root = resolve(import.meta.dirname, "..");

test("all skill resources remain inside their independently installable skill", async () => {
  for (const item of SKILL_CATALOG) {
    const skillRoot = resolve(root, "skills", item.name);
    async function walk(folder: string): Promise<void> {
      for (const entry of await readdir(folder, { withFileTypes: true })) {
        const file = resolve(folder, entry.name);
        expect((await lstat(file)).isSymbolicLink()).toBe(false);
        if (entry.isDirectory()) await walk(file);
        else if (file.endsWith(".md")) {
          for (const match of (await readFile(file, "utf8")).matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
            const target = match[1]!;
            if (/^(https?:|mailto:|#)/.test(target)) continue;
            const path = await realpath(resolve(dirname(file), decodeURIComponent(target.split("#")[0]!)));
            const rel = relative(skillRoot, path);
            expect(rel === ".." || rel.startsWith(`..${sep}`)).toBe(false);
          }
        }
      }
    }
    await walk(skillRoot);
  }
});

test("package, manifests, catalog and skill version describe the same independent release", async () => {
  const manifest = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
  expect(manifest.name).toBe("galleon-defi-data-skills");
  expect(manifest.repository.directory).toBe("packages/data");
  expect(Object.keys(manifest.dependencies ?? {})).toHaveLength(0);
  for (const type of [".claude-plugin", ".codex-plugin"]) {
    const plugin = JSON.parse(await readFile(resolve(root, type, "plugin.json"), "utf8"));
    expect(plugin.name).toBe(manifest.name); expect(plugin.version).toBe(manifest.version);
  }
  for (const item of SKILL_CATALOG) {
    const body = await readFile(resolve(root, "skills", item.name, "SKILL.md"), "utf8");
    const metadata = parse(body.match(/^---\n([\s\S]*?)\n---/)![1]!);
    expect(metadata.name).toBe(item.name); expect(metadata.metadata.version).toBe(manifest.version);
  }
});

test("standalone script runs through symlinked install paths and rejects unsupported providers", async () => {
  const { mkdtemp, symlink, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { spawnSync } = await import("node:child_process");
  const temp = await mkdtemp(resolve(tmpdir(), "data-script-entry-"));
  try {
    const path = resolve(temp, "price-check.mjs");
    await symlink(resolve(root, "skills/galleon-defi-data/scripts/price-check.mjs"), path);
    const result = spawnSync("node", [path, "--provider", "paid"], { encoding: "utf8" });
    expect(result.status).toBe(1);
    expect(JSON.parse(result.stdout)).toEqual({ ok: false, error: "invalid_provider" });
  } finally { await rm(temp, { recursive: true, force: true }); }
});
