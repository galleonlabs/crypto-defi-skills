import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { validateCorpus } from "./content-pack/validation.ts";
import { checkDiscoveryKeywords } from "./content-pack/keywords.ts";
import { buildContentPack } from "./build-content-pack.ts";
const root = process.cwd();
const result = await validateCorpus(root);
const keywordIssues = await checkDiscoveryKeywords(root);
result.issues.push(...keywordIssues);
if (keywordIssues.length > 0) result.ok = false;
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!result.ok) throw new Error("Skill validation failed");
if (!process.argv.includes("--validate-only")) {
  const types = spawnSync("bunx", ["tsc", "--noEmit", "-p", resolve(root, "tsconfig.json")], { cwd: root, stdio: "inherit" });
  if (types.status !== 0) throw new Error("Typecheck failed");
  await buildContentPack(root);
}
