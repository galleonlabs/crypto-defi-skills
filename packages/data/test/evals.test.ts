import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { SKILL_CATALOG } from "../src/catalog.ts";

interface RoutingCase {
  prompt: string;
  expected: string;
  mustNotInvoke: string[];
  reason: string;
}

test("routing evals cover every skill", async () => {
  const cases = JSON.parse(await readFile(resolve(import.meta.dirname, "../evals/routing.json"), "utf8")) as RoutingCase[];
  const names = new Set(SKILL_CATALOG.map((skill) => skill.name));
  expect(cases.length).toBeGreaterThanOrEqual(5);
  for (const item of cases) {
    expect(item.prompt.length).toBeGreaterThan(10);
    expect(item.reason.length).toBeGreaterThan(10);
    expect(names.has(item.expected as never)).toBe(true);
    expect(item.mustNotInvoke).not.toContain(item.expected);
    for (const forbidden of item.mustNotInvoke) expect(names.has(forbidden as never)).toBe(true);
  }
  for (const name of names) {
    expect(cases.filter((item) => item.expected === name).length).toBeGreaterThanOrEqual(5);
  }
});

test("standalone output cases carry inputs and concrete assertions", async () => {
  const dataset = JSON.parse(await readFile(resolve(import.meta.dirname, "../skills/galleon-defi-data/evals/evals.json"), "utf8"));
  expect(dataset.skill_name).toBe("galleon-defi-data");
  expect(new Set(dataset.evals.map((item: { id: number }) => item.id)).size).toBe(dataset.evals.length);
  for (const item of dataset.evals) {
    expect(item.prompt.length).toBeGreaterThan(50);
    expect(item.expected_output.length).toBeGreaterThan(50);
    expect(item.assertions.length).toBeGreaterThanOrEqual(3);
    expect(item.files).toEqual([]);
  }
});
