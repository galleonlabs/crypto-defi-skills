import { expect, test } from "bun:test";
import { corpus, neutralPrompt, validateCases, type BehaviorCase } from "../scripts/behavior-evals.ts";
const example: BehaviorCase = { id: "sample-case", skill: "example", prompt: "Compare these supplied observations.", context: "Synthetic current observations only.", expected: ["Private success criterion"], forbidden: ["Private failure criterion"] };
test("every active skill has at least two behavioral exercise inputs", async () => {
  const cases = await corpus();
  expect(new Set(cases.map(({ item }) => item.skill)).size).toBe(26);
  expect(cases.length).toBeGreaterThanOrEqual(52);
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
