import { expect, test } from "bun:test";
import { corpus, neutralPrompt, validateCases, type BehaviorCase } from "../scripts/behavior-evals.ts";
import { packages, root } from "../scripts/workspaces.ts";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const example: BehaviorCase = { id: "sample-case", skill: "example", prompt: "Compare these supplied observations.", context: "Synthetic current observations only.", expected: ["Private success criterion"], forbidden: ["Private failure criterion"] };
test("every active skill has at least two behavioral exercise inputs", async () => {
  const cases = await corpus();
  const expected: string[] = [];
  for (const pack of await packages()) {
    const { SKILL_CATALOG } = await import(pathToFileURL(resolve(root, pack.directory, "src/index.ts")).href);
    expected.push(...SKILL_CATALOG.map((skill: { name: string }) => skill.name));
  }
  expect([...new Set(cases.map(({ item }) => item.skill))].sort()).toEqual(expected.sort());
  expect(cases.length).toBeGreaterThanOrEqual(expected.length * 2);
});
test("rejects malformed, duplicate and unknown behavioral fixtures", () => {
  expect(validateCases(null, []).length).toBeGreaterThan(0);
  expect(validateCases([null], []).length).toBeGreaterThan(0);
  expect(validateCases([example, example], ["example"])).toContain("duplicate case sample-case");
  expect(validateCases([{ ...example, skill: "../outside", expected: [] }], ["example"]).length).toBeGreaterThan(1);
});
test("neutral exercise packet does not disclose grading fields", () => {
  const prompt = neutralPrompt(example, "/fixture/SKILL.md");
  expect(prompt).toContain(example.prompt);
  expect(prompt).toContain(example.context);
  expect(prompt).not.toContain(example.expected[0]!);
  expect(prompt).not.toContain(example.forbidden[0]!);
});
