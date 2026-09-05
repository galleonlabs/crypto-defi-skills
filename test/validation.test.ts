import { expect, test } from "bun:test";
import { resolve } from "node:path";
import { validateCorpus } from "../src/validation.ts";

test("the bundled corpus is valid", async () => {
  const result = await validateCorpus(resolve(import.meta.dirname, ".."));
  expect(result.skillCount).toBe(6);
  expect(result.issues).toEqual([]);
  expect(result.ok).toBe(true);
});

test("every skill's references resolve within its independent installation", async () => {
  const { readdir, readFile, access } = await import("node:fs/promises");
  const { dirname, relative } = await import("node:path");
  const skills = resolve(import.meta.dirname, "../skills");
  for (const entry of await readdir(skills, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const root = resolve(skills, entry.name);
    async function walk(folder: string): Promise<void> {
      for (const item of await readdir(folder, { withFileTypes: true })) {
        const file = resolve(folder, item.name);
        if (item.isDirectory()) { await walk(file); continue; }
        if (!item.name.endsWith(".md")) continue;
        const source = await readFile(file, "utf8");
        for (const match of source.matchAll(/\]\(([^)]+)\)/g)) {
          const target = match[1]!;
          if (/^(https?:|mailto:|#)/.test(target)) continue;
          const resolved = resolve(dirname(file), target.split("#")[0]!);
          expect(relative(root, resolved).startsWith("..")).toBe(false);
          await access(resolved);
        }
      }
    }
    await walk(root);
  }
});
