import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { packages, root } from "../scripts/workspaces.ts";
import { pathToFileURL } from "node:url";

interface RoutingCase {
  prompt: string;
  expected: string;
  mustNotInvoke: string[];
  reason: string;
}

const UNION_CATALOG: { name: string }[] = [];
for (const pack of await packages()) {
  const catalog = await import(pathToFileURL(resolve(root, pack.directory, "src/index.ts")).href);
  UNION_CATALOG.push(...catalog.SKILL_CATALOG);
}
const UNION_NAMES = new Set<string>(UNION_CATALOG.map((skill) => skill.name));

const REQUIRED_BOUNDARIES = [
  { expected: "galleon-defi-infra", competitor: "lp-setup" },
  { expected: "galleon-defi-infra", competitor: "hyperliquid-setup" },
  { expected: "lp-setup", competitor: "galleon-defi-infra" },
  { expected: "lp-setup", competitor: "hyperliquid-setup" },
  { expected: "hyperliquid-setup", competitor: "galleon-defi-infra" },
  { expected: "hyperliquid-setup", competitor: "lp-setup" },
  { expected: "galleon-defi-data", competitor: "lp-analyze" },
  { expected: "lp-analyze", competitor: "galleon-defi-data" },
] as const;

test("cross-pack routing evals cover documented skill overlaps", async () => {
  const cases = JSON.parse(await readFile(resolve(import.meta.dirname, "evals/routing.json"), "utf8")) as RoutingCase[];
  expect(cases.length).toBeGreaterThan(0);
  for (const item of cases) {
    expect(item.prompt.length).toBeGreaterThan(10);
    expect(item.reason.length).toBeGreaterThan(10);
    expect(UNION_NAMES.has(item.expected)).toBe(true);
    expect(item.mustNotInvoke).not.toContain(item.expected);
    for (const forbidden of item.mustNotInvoke) expect(UNION_NAMES.has(forbidden)).toBe(true);
  }
  for (const boundary of REQUIRED_BOUNDARIES) {
    expect(
      cases.some((item) => item.expected === boundary.expected && item.mustNotInvoke.includes(boundary.competitor)),
    ).toBe(true);
  }
});
