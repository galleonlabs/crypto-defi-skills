import { expect, test } from "bun:test";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { packages, root } from "../scripts/workspaces.ts";

test("every standalone skill is discoverable by its exact installed name", async () => {
  const grouping = JSON.parse(await readFile(resolve(root, "skills.sh.json"), "utf8"));
  const grouped: string[] = grouping.groupings.flatMap((group: { skills: string[] }) => group.skills);
  const index = await readFile(resolve(root, "docs/AGENT-INDEX.md"), "utf8");
  const actual: string[] = [];
  for (const pack of await packages()) {
    for (const skill of await readdir(resolve(root, pack.directory, "skills"))) {
      actual.push(skill);
      expect(index, skill).toContain(`../${pack.directory}/skills/${skill}/SKILL.md`);
    }
  }
  expect([...grouped].sort()).toEqual([...actual].sort());
  expect(new Set(grouped).size).toBe(grouped.length);
});

test("public skill counts include active procedures and exclude retired LP names", async () => {
  let total = 0;
  for (const pack of await packages()) total += (await readdir(resolve(root, pack.directory, "skills"))).length;
  const active = total - 2;
  for (const path of ["README.md", "docs/AGENT-INDEX.md", "docs/GETTING-STARTED.md", "llms.txt", "docs/assets/skills-hero.svg"]) {
    expect(await readFile(resolve(root, path), "utf8"), path).toContain(`${active} active skills`);
  }
});
