import { expect, test } from "bun:test";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse } from "yaml";
import { packages, root } from "../scripts/workspaces.ts";

test("every package is independently releasable with aligned metadata and unique skills", async () => {
  const names = new Set<string>();
  const marketplace = JSON.parse(await readFile(resolve(root, ".claude-plugin/marketplace.json"), "utf8"));
  for (const pack of await packages()) {
    const path = resolve(root, pack.directory);
    expect(pack.manifest.private).not.toBe(true);
    expect(pack.manifest.repository.directory).toBe(pack.directory);
    expect(pack.manifest.repository.url).toBe("git+https://github.com/galleonlabs/crypto-defi-skills.git");
    expect(Object.keys(pack.manifest.dependencies ?? {})).toEqual([]);
    expect(marketplace.plugins.some((plugin: { name: string; source: string }) => plugin.name === pack.manifest.name && plugin.source === `./${pack.directory}`)).toBe(true);
    for (const kind of [".claude-plugin", ".codex-plugin"]) {
      const plugin = JSON.parse(await readFile(resolve(path, kind, "plugin.json"), "utf8"));
      expect(plugin.name).toBe(pack.manifest.name);
      expect(plugin.version).toBe(pack.manifest.version);
    }
    for (const skill of await readdir(resolve(path, "skills"))) {
      const body = await readFile(resolve(path, "skills", skill, "SKILL.md"), "utf8");
      const meta = parse(body.match(/^---\n([\s\S]*?)\n---/)![1]!);
      expect(names.has(meta.name)).toBe(false);
      names.add(meta.name);
      expect(meta.metadata.version).toBe(pack.manifest.version);
    }
  }
  expect(names.size).toBeGreaterThan(0);
});
