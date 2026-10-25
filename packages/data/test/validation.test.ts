import {expect, test} from "bun:test";
import {mkdtemp, mkdir, rm, symlink, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {resolve} from "node:path";

const repo = resolve(import.meta.dirname, "../../..");

for (const pack of ["data", "hyperliquid"]) {
  test(`${pack} validate CLI rejects broken nested resources and external dependencies`, async () => {
    const root = await mkdtemp(resolve(tmpdir(), "published-validator-"));
    const skill = resolve(root, "skills/fixture-skill");
    try {
      await mkdir(resolve(skill, "references"), {recursive: true});
      await mkdir(resolve(skill, "agents"));
      await writeFile(resolve(skill, "SKILL.md"), "---\nname: fixture-skill\ndescription: Use when reviewing a standalone fixture.\nlicense: MIT\n---\n\n[Guide](references/guide.md)\n");
      await writeFile(resolve(skill, "agents/openai.yaml"), 'interface:\n  short_description: "Review a standalone package fixture"\n  default_prompt: "Use $fixture-skill for this review."\n');
      const guide = resolve(skill, "references/guide.md");
      await writeFile(guide, "A valid local guide\n");
      const validate = () => {
        const result = Bun.spawnSync([process.execPath, "src/cli.ts", "validate", root, "--json"], {cwd: resolve(repo, "packages", pack)});
        return {code: result.exitCode, report: JSON.parse(result.stdout.toString())};
      };
      expect(validate().report.ok).toBe(true);
      await writeFile(guide, "[Missing](missing.md)\n");
      let result = validate();
      expect(result.code).toBe(1);
      expect(result.report.issues.some((issue: {message: string}) => issue.message.includes("broken relative link"))).toBe(true);
      await writeFile(resolve(root, "outside.md"), "Outside this independently installed skill\n");
      await writeFile(guide, "[Outside](../../../outside.md)\n");
      result = validate();
      expect(result.code).toBe(1);
      expect(result.report.issues.some((issue: {message: string}) => issue.message.includes("escapes standalone skill"))).toBe(true);
      await rm(guide);
      await symlink(resolve(root, "outside.md"), guide);
      result = validate();
      expect(result.code).toBe(1);
      expect(result.report.issues.some((issue: {message: string}) => issue.message.includes("symlink"))).toBe(true);
    } finally {
      await rm(root, {recursive: true, force: true});
    }
  });
}
