import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SKILL_CATALOG } from "../src/index.ts";
const root = resolve(import.meta.dirname, "..");
test("show returns every exact catalog skill and rejects paths", () => {
 for (const skill of SKILL_CATALOG) {
  const result = spawnSync(process.execPath, ["src/cli.ts", "show", skill.name], {cwd:root, encoding:"utf8"});
  expect(result.status).toBe(0);
  expect(result.stdout).toBe(readFileSync(resolve(root,"skills",skill.name,"SKILL.md"),"utf8"));
 }
 const result = spawnSync(process.execPath, ["src/cli.ts", "show", "../../package.json"], {cwd:root,encoding:"utf8"});
 expect(result.status).toBe(1); expect(result.stdout).not.toContain('"devDependencies"');
});
