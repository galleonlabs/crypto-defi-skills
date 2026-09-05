import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { validateCorpus } from "./validation.ts";

const roots: string[] = [];
const skillName = "fixture-skill";
const frontmatter = `---\nname: ${skillName}\ndescription: Use when testing a portable local corpus.\nlicense: MIT\nmetadata:\n  version: "0.1.0"\n---\n\n`;

async function fixture(body: string): Promise<{ root: string; skill: string }> {
  const root = await mkdtemp(resolve(tmpdir(), "content-pack-check-"));
  roots.push(root);
  const skill = resolve(root, "skills", skillName);
  await mkdir(resolve(skill, "agents"), { recursive: true });
  await writeFile(resolve(skill, "SKILL.md"), frontmatter + body);
  await writeFile(resolve(skill, "LICENSE"), "Fixture permission notice\n");
  await writeFile(resolve(skill, "agents/openai.yaml"), `interface:\n  short_description: "Verify a portable local skill corpus"\n  default_prompt: "Use $${skillName} to inspect the fixture."\n`);
  return { root, skill };
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })));
});

describe("standalone content validation", () => {
  test("accepts local inline/reference links with anchors and titles", async () => {
    const { root, skill } = await fixture('[Reference][guide]\n[Notice](LICENSE "Permission")\n[External](<https://example.com/docs>)\n\n[guide]: <references/guide with spaces.md#example> "Guide"\n');
    await mkdir(resolve(skill, "references"));
    await writeFile(resolve(skill, "references/guide with spaces.md"), "# Example\n");
    expect((await validateCorpus(root)).ok).toBe(true);
  });

  test("rejects broken reference-style links", async () => {
    const { root } = await fixture("[Read the guide][guide]\n\n[guide]: references/missing.md\n");
    const result = await validateCorpus(root);
    expect(result.ok).toBe(false);
    expect(result.issues.some(issue => issue.message.includes("broken relative link"))).toBe(true);
  });

  test("rejects reference-style links outside the extracted skill even if they exist", async () => {
    const { root } = await fixture("[Private source][outside]\n\n[outside]: ../../outside.md\n");
    await writeFile(resolve(root, "outside.md"), "Not in the standalone skill\n");
    const result = await validateCorpus(root);
    expect(result.ok).toBe(false);
    expect(result.issues.some(issue => issue.message.includes("escapes standalone skill"))).toBe(true);
  });

  test("rejects percent-encoded traversal in an inline link", async () => {
    const { root } = await fixture("[Outside](%2e%2e/%2e%2e/outside.md)\n");
    await writeFile(resolve(root, "outside.md"), "Outside\n");
    expect((await validateCorpus(root)).ok).toBe(false);
  });

  test("malformed percent encoding produces a structured validation error", async () => {
    const { root } = await fixture("[Invalid](references/%ZZ.md)\n");
    const result = await validateCorpus(root);
    expect(result.ok).toBe(false);
    expect(result.issues.some(issue => issue.message.includes("invalid relative link encoding"))).toBe(true);
  });

  test("valid directory names beginning with two dots do not escape the skill", async () => {
    const { root, skill } = await fixture("[Local](..notes/guide.md)\n");
    await mkdir(resolve(skill, "..notes"));
    await writeFile(resolve(skill, "..notes/guide.md"), "Inside the skill\n");
    expect((await validateCorpus(root)).ok).toBe(true);
  });

  test("does not silently skip a symlink beside a valid skill", async () => {
    const { root, skill } = await fixture("Local content\n");
    await symlink(skill, resolve(root, "skills/linked-skill"));
    const result = await validateCorpus(root);
    expect(result.skillCount).toBe(1);
    expect(result.ok).toBe(false);
    expect(result.issues.some(issue => issue.file === "skills/linked-skill")).toBe(true);
  });

  test("rejects a symlinked skills root", async () => {
    const { root, skill } = await fixture("Local content\n");
    const linkedRoot = resolve(root, "consumer");
    await mkdir(linkedRoot);
    await symlink(resolve(skill, ".."), resolve(linkedRoot, "skills"));
    expect((await validateCorpus(linkedRoot)).ok).toBe(false);
  });
});

async function show(root: string, ...args: string[]) {
  await writeFile(resolve(root, "package.json"), JSON.stringify({ version: "0.1.0", bin: { "fixture-skills": "cli.js" } }));
  const moduleUrl = pathToFileURL(resolve(import.meta.dir, "cli.ts")).href;
  const runner = resolve(root, "run.ts");
  await writeFile(runner, `import { runCli } from ${JSON.stringify(moduleUrl)}; await runCli(${JSON.stringify(root)}, [{ name: ${JSON.stringify(skillName)}, purpose: "Fixture" }]);`);
  const child = Bun.spawn([process.execPath, runner, "show", ...args], { stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr, code] = await Promise.all([new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited]);
  return { stdout, stderr, code };
}

describe("local show command", () => {
  test("prints an exact catalog skill", async () => {
    const { root } = await fixture("Expected local content\n");
    const result = await show(root, skillName);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Expected local content");
  });

  test("rejects traversal without returning outside content", async () => {
    const { root } = await fixture("Local content\n");
    await writeFile(resolve(root, "outside.md"), "OUTSIDE_FIXTURE_CONTENT");
    const result = await show(root, "../../outside.md");
    expect(result.code).toBe(1);
    expect(JSON.parse(result.stdout).ok).toBe(false);
    expect(result.stdout).not.toContain("OUTSIDE_FIXTURE_CONTENT");
  });

  test("does not print a symlink substituted for an allowed SKILL.md", async () => {
    const { root, skill } = await fixture("Local content\n");
    await writeFile(resolve(root, "outside.md"), "OUTSIDE_FIXTURE_CONTENT");
    await rm(resolve(skill, "SKILL.md"));
    await symlink(resolve(root, "outside.md"), resolve(skill, "SKILL.md"));
    const result = await show(root, skillName);
    expect(result.code).toBe(1);
    expect(JSON.parse(result.stdout).ok).toBe(false);
    expect(result.stdout).not.toContain("OUTSIDE_FIXTURE_CONTENT");
  });
});
