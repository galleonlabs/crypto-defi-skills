import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { canonicalSkillName, RENAMED_SKILLS, SKILL_CATALOG } from "../src/catalog.ts";

const cli = resolve(import.meta.dirname, "../src/cli.ts");

function run(args: string[]) {
  return spawnSync("bun", [cli, ...args], { encoding: "utf8" });
}

test("canonical catalog excludes renamed install names", () => {
  const names = SKILL_CATALOG.map((skill) => skill.name);
  expect(names).toEqual(["lp-setup", "lp-analyze", "lp-plan", "lp-monitor", "lp-execute", "lp-engineer"]);
  expect(RENAMED_SKILLS).toEqual({ "lp-research": "lp-analyze", "lp-operate": "lp-execute" });
  expect(canonicalSkillName("lp-research")).toBe("lp-analyze");
  expect(canonicalSkillName("lp-operate")).toBe("lp-execute");
  expect(canonicalSkillName("lp-analyze")).toBe("lp-analyze");
});

test("CLI catalog lists only canonical skills", () => {
  const result = run(["catalog"]);
  expect(result.status).toBe(0);
  expect(result.stdout).toContain("lp-analyze");
  expect(result.stdout).toContain("lp-execute");
  expect(result.stdout).not.toContain("lp-research");
  expect(result.stdout).not.toContain("lp-operate");
});

test("renamed skill directories are install notices, not duplicate workflows", async () => {
  const research = await readFile(resolve(import.meta.dirname, "../skills/lp-research/SKILL.md"), "utf8");
  expect(research).toContain("name: lp-research");
  expect(research).toContain("Deprecated install name for lp-analyze");
  expect(research).toContain("renamed to `lp-analyze`");
  expect(research).not.toContain("Produce a decision-grade pool comparison");
  expect(research).not.toContain("## Workflow");

  const operate = await readFile(resolve(import.meta.dirname, "../skills/lp-operate/SKILL.md"), "utf8");
  expect(operate).toContain("name: lp-operate");
  expect(operate).toContain("Deprecated install name for lp-execute");
  expect(operate).toContain("renamed to `lp-execute`");
  expect(operate).not.toContain("Execute one explicit, reviewed LP intent");
  expect(operate).not.toContain("## Workflow");
});

test("CLI show maps renamed install names to the current skill", () => {
  const research = run(["show", "lp-research"]);
  expect(research.status).toBe(0);
  expect(research.stderr).toContain("lp-research was renamed to lp-analyze in 0.4.0");
  expect(research.stdout).toContain("name: lp-analyze");
  expect(research.stdout).not.toContain("Deprecated install name");

  const operate = run(["show", "lp-operate"]);
  expect(operate.status).toBe(0);
  expect(operate.stderr).toContain("lp-operate was renamed to lp-execute in 0.4.0");
  expect(operate.stdout).toContain("name: lp-execute");
});
