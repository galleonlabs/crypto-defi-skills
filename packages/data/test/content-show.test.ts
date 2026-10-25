import {expect, test} from "bun:test";
import {mkdtemp, mkdir, readFile, rm, symlink, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {resolve} from "node:path";

const repo = resolve(import.meta.dirname, "../../..");
const selections = [
  ["data", "galleon-defi-data"],
  ["hyperliquid", "hyperliquid-analyze"],
  ["infra", "galleon-defi-infra"],
] as const;

for (const [pack, name] of selections) {
  test(`${pack} built Node show rejects symlinked roots, directories and files`, async () => {
    const root = await mkdtemp(resolve(tmpdir(), "standalone-show-"));
    try {
      const built = await Bun.build({entrypoints: [resolve(repo, "packages", pack, "src/cli.ts")], outdir: resolve(root, "dist"), target: "node", format: "esm"});
      expect(built.success).toBe(true);
      await writeFile(resolve(root, "package.json"), '{"type":"module"}\n');
      const source = await readFile(resolve(repo, "packages", pack, "skills", name, "SKILL.md"), "utf8");
      const skills = resolve(root, "skills"), directory = resolve(skills, name), file = resolve(directory, "SKILL.md");
      await mkdir(directory, {recursive: true});
      await writeFile(file, source);
      const show = () => {
        const child = Bun.spawnSync(["node", resolve(root, "dist/cli.js"), "show", name]);
        return {code: child.exitCode, output: child.stdout.toString(), errors: child.stderr.toString()};
      };
      expect(show()).toEqual({code: 0, output: source, errors: ""});
      const external = resolve(root, "external.md");
      await writeFile(external, "UNEXPECTED_OUTSIDE_SKILL_CONTENT\n");
      await rm(file);
      await symlink(external, file);
      let result = show();
      expect(result.code).toBe(1);
      expect(result.output + result.errors).not.toContain("UNEXPECTED_OUTSIDE_SKILL_CONTENT");
      await rm(directory, {recursive: true});
      const externalDirectory = resolve(root, "external-directory");
      await mkdir(externalDirectory);
      await writeFile(resolve(externalDirectory, "SKILL.md"), "UNEXPECTED_OUTSIDE_SKILL_CONTENT\n");
      await symlink(externalDirectory, directory);
      result = show();
      expect(result.code).toBe(1);
      expect(result.output + result.errors).not.toContain("UNEXPECTED_OUTSIDE_SKILL_CONTENT");
      await rm(skills, {recursive: true});
      const externalRoot = resolve(root, "external-skills");
      await mkdir(resolve(externalRoot, name), {recursive: true});
      await writeFile(resolve(externalRoot, name, "SKILL.md"), "UNEXPECTED_OUTSIDE_SKILL_CONTENT\n");
      await symlink(externalRoot, skills);
      result = show();
      expect(result.code).toBe(1);
      expect(result.output + result.errors).not.toContain("UNEXPECTED_OUTSIDE_SKILL_CONTENT");
    } finally {
      await rm(root, {recursive: true, force: true});
    }
  });
}
