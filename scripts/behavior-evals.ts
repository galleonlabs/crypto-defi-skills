import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { packages, root } from "./workspaces.ts";

export type BehaviorCase = { id: string; skill: string; prompt: string; context: string; expected: string[]; forbidden: string[] };
export function validateCases(value: unknown, skills: readonly string[]): string[] {
  if (!Array.isArray(value)) return ["behavior cases must be an array"];
  const issues: string[] = [];
  const ids = new Set<string>();
  for (const entry of value) {
    if (!entry || typeof entry !== "object") { issues.push("case must be an object"); continue; }
    const item = entry as BehaviorCase;
    if (typeof item.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id)) issues.push("invalid case id");
    if (ids.has(item.id)) issues.push(`duplicate case ${item.id}`);
    ids.add(item.id);
    if (!skills.includes(item.skill)) issues.push(`unknown skill ${item.skill}`);
    for (const key of ["prompt", "context"] as const) if (typeof item[key] !== "string" || item[key].trim().length < 20) issues.push(`${item.id}: missing ${key}`);
    for (const key of ["expected", "forbidden"] as const) if (!Array.isArray(item[key]) || item[key].length === 0 || item[key].some((text: unknown) => typeof text !== "string" || text.trim().length < 5)) issues.push(`${item.id}: invalid ${key}`);
  }
  for (const skill of skills) if (value.filter((item) => item?.skill === skill).length < 2) issues.push(`${skill}: needs at least two cases`);
  return issues;
}
export function neutralPrompt(item: BehaviorCase, skillPath: string): string {
  return `Synthetic skill exercise ${item.id}\nRead the skill at ${skillPath} and relevant local references. Answer the user request using only the supplied synthetic observations. Do not perform network calls, installations, signing or real transactions. If a needed observation is absent, explain the specific next read and give the supported result. Do not read evaluation datasets or grading criteria.\n\nUser request: ${item.prompt}\n\nAvailable observations: ${item.context}\n`;
}
export async function corpus() {
  const output: { item: BehaviorCase; skillPath: string }[] = [];
  const ids = new Set<string>();
  for (const pack of await packages()) {
    const directory = resolve(root, pack.directory);
    const catalog = await import(pathToFileURL(resolve(directory, "src/index.ts")).href);
    const skills = catalog.SKILL_CATALOG.map((skill: { name: string }) => skill.name) as string[];
    const cases: unknown = JSON.parse(await readFile(resolve(directory, "evals/behavior.json"), "utf8"));
    const issues = validateCases(cases, skills);
    if (issues.length) throw new Error(`${pack.id}: ${issues.join("; ")}`);
    for (const item of cases as BehaviorCase[]) {
      if (ids.has(item.id)) throw new Error(`duplicate global case ${item.id}`);
      ids.add(item.id);
      output.push({ item, skillPath: resolve(directory, "skills", item.skill, "SKILL.md") });
    }
  }
  return output;
}
if (import.meta.main) {
  const cases = await corpus();
  const id = process.argv[2];
  if (id) {
    const entry = cases.find((entry) => entry.item.id === id);
    if (!entry) throw new Error(`Unknown case: ${id}`);
    process.stdout.write(neutralPrompt(entry.item, entry.skillPath));
  } else process.stdout.write(`${cases.length} behavioral fixtures validated. No model responses or execution outcomes were graded.\n`);
}
