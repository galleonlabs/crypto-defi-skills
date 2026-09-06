import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export type RoutingCase = {
  prompt: string;
  expected: string;
  mustNotInvoke: string[];
  reason: string;
};

export const minimumCasesPerSkill = 5;

export async function readRoutingCases(directory: string): Promise<RoutingCase[]> {
  const source = await readFile(resolve(directory, "evals/routing.json"), "utf8");
  const parsed: unknown = JSON.parse(source);
  if (!Array.isArray(parsed)) throw new Error(`${directory}/evals/routing.json must be an array of routing cases`);
  return parsed as RoutingCase[];
}

export function caseIssues(item: RoutingCase, known: ReadonlySet<string>): string[] {
  const issues: string[] = [];
  if (typeof item.prompt !== "string" || item.prompt.length <= 10) issues.push(`prompt too short: ${JSON.stringify(item.prompt)}`);
  if (typeof item.reason !== "string" || item.reason.length <= 10) issues.push(`reason too short for ${item.expected}`);
  if (!known.has(item.expected)) issues.push(`unknown expected skill ${item.expected}`);
  if (!Array.isArray(item.mustNotInvoke)) issues.push(`mustNotInvoke must be an array for ${item.expected}`);
  else {
    if (item.mustNotInvoke.includes(item.expected)) issues.push(`${item.expected} forbids itself`);
    for (const forbidden of item.mustNotInvoke) if (!known.has(forbidden)) issues.push(`unknown forbidden skill ${forbidden}`);
  }
  return issues;
}

export function countIssues(cases: readonly RoutingCase[], skills: readonly string[]): string[] {
  return skills
    .map((skill) => ({ skill, owned: cases.filter((item) => item.expected === skill).length }))
    .filter((entry) => entry.owned < minimumCasesPerSkill)
    .map((entry) => `${entry.skill} has ${entry.owned} cases, needs ${minimumCasesPerSkill}`);
}

export function boundaryIssues(cases: readonly RoutingCase[], skills: readonly string[]): string[] {
  return skills
    .filter((skill) => !cases.some((item) => item.expected === skill && item.mustNotInvoke.length > 0))
    .map((skill) => `${skill} has no case naming a skill that must not load`);
}
