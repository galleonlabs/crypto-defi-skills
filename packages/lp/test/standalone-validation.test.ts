import { afterAll, beforeAll, expect, test } from "bun:test";
import { copyFile, mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

let temporary: string;
let cli: string;

beforeAll(async () => {
  temporary = await mkdtemp(resolve(tmpdir(), "lp-corpus-validation-"));
  cli = resolve(temporary, "cli.mjs");
  const built = await Bun.build({
    entrypoints: [resolve(import.meta.dirname, "../src/cli.ts")],
    outdir: temporary,
    naming: "cli.mjs",
    target: "node",
    format: "esm",
  });
  if (!built.success) throw new Error(built.logs.map(String).join("\n"));
});
afterAll(async () => { await rm(temporary, { recursive: true, force: true }); });

async function corpus(label: string): Promise<string> {
  const root = resolve(temporary, label);
  const skill = resolve(root, "skills/fixture");
  await mkdir(resolve(skill, "agents"), { recursive: true });
  await mkdir(resolve(skill, "references"));
  await writeFile(resolve(skill, "SKILL.md"), `---\nname: fixture\ndescription: Use when testing standalone corpus validation.\nlicense: MIT\n---\n\n[Guide](references/guide.md)\n`);
  await writeFile(resolve(skill, "agents/openai.yaml"), `interface:\n  short_description: Validate an independent LP skill corpus\n  default_prompt: Use $fixture for this task.\n`);
  return root;
}

function validate(root: string): { status: number | null; ok: boolean; issues: { message: string }[] } {
  const result = Bun.spawnSync(["node", cli, "validate", root, "--json"], { stdout: "pipe", stderr: "pipe" });
  if (!result.stdout.length) throw new Error(result.stderr.toString());
  const parsed = JSON.parse(result.stdout.toString());
  return { status: result.exitCode, ...parsed };
}

test("bundled CLI accepts a complete independent skill", async () => {
  const root = await corpus("valid");
  await writeFile(resolve(root, "skills/fixture/references/guide.md"), "[Detail](detail.md \"Local detail\")\n");
  await writeFile(resolve(root, "skills/fixture/references/detail.md"), "Observed state.\n");
  expect(validate(root)).toMatchObject({ status: 0, ok: true, issues: [] });
});

test("bundled CLI rejects a broken link inside a nested reference", async () => {
  const root = await corpus("missing");
  await writeFile(resolve(root, "skills/fixture/references/guide.md"), "[Missing][detail]\n\n[detail]: missing.md\n");
  const result = validate(root);
  expect(result.status).toBe(1);
  expect(result.issues.some(issue => issue.message.includes("broken relative link"))).toBe(true);
});

test("bundled CLI rejects a link to a file outside the independently installed skill", async () => {
  const root = await corpus("escape");
  await writeFile(resolve(root, "skills/shared.md"), "This package sibling does not travel with the skill.\n");
  await writeFile(resolve(root, "skills/fixture/references/guide.md"), "[Sibling](../../shared.md)\n");
  const result = validate(root);
  expect(result.status).toBe(1);
  expect(result.issues.some(issue => issue.message.includes("link escapes standalone skill"))).toBe(true);
});

test("bundled CLI rejects a symlink even when its target exists", async () => {
  const root = await corpus("symlink");
  await writeFile(resolve(root, "external.md"), "Not independently packaged.\n");
  await symlink(resolve(root, "external.md"), resolve(root, "skills/fixture/references/guide.md"));
  const result = validate(root);
  expect(result.status).toBe(1);
  expect(result.issues.some(issue => issue.message.includes("must not contain symlinks"))).toBe(true);
});


test("bundled CLI show preserves aliases and rejects symlinked skill paths", async () => {
  for (const mode of ["normal", "file", "folder", "root"] as const) {
    const root = resolve(temporary, `show-${mode}`);
    const dist = resolve(root, "dist");
    const skills = resolve(root, "skills");
    const folder = resolve(skills, "lp-analyze");
    const file = resolve(folder, "SKILL.md");
    await mkdir(dist, { recursive: true });
    await copyFile(cli, resolve(dist, "cli.mjs"));
    await mkdir(folder, { recursive: true });
    await writeFile(file, "Reviewed standalone content.\n");
    if (mode !== "normal") {
      const target = mode === "file" ? file : mode === "folder" ? folder : skills;
      const outside = resolve(temporary, `outside-${mode}`);
      if (mode === "file") await writeFile(outside, "Outside private content.\n");
      else {
        const outsideFile = mode === "folder" ? resolve(outside, "SKILL.md") : resolve(outside, "lp-analyze/SKILL.md");
        await mkdir(resolve(outsideFile, ".."), { recursive: true });
        await writeFile(outsideFile, "Outside private content.\n");
      }
      await rm(target, { recursive: true });
      await symlink(outside, target);
    }
    const result = Bun.spawnSync(["node", resolve(dist, "cli.mjs"), "show", "lp-research"], { stdout: "pipe", stderr: "pipe" });
    if (mode === "normal") {
      expect(result.exitCode).toBe(0);
      expect(result.stdout.toString()).toBe("Reviewed standalone content.\n");
      expect(result.stderr.toString()).toContain("renamed to lp-analyze");
    } else {
      expect(result.exitCode).toBe(1);
      expect(result.stdout.length).toBe(0);
      expect(result.stderr.toString()).toContain("does not follow skill symlinks");
    }
  }
});
