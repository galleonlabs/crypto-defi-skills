import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { packages, root } from "../scripts/workspaces.ts";
import { pathToFileURL } from "node:url";
import { boundaryIssues, caseIssues, countIssues, readRoutingCases, type RoutingCase } from "../scripts/routing-evals.ts";

const PACKS: { id: string; directory: string; skills: string[] }[] = [];
for (const pack of await packages()) {
  const catalog = await import(pathToFileURL(resolve(root, pack.directory, "src/index.ts")).href);
  PACKS.push({ id: pack.id, directory: resolve(root, pack.directory), skills: catalog.SKILL_CATALOG.map((skill: { name: string }) => skill.name) });
}
const UNION_NAMES = new Set<string>(PACKS.flatMap((pack) => pack.skills));

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

const CROSS_PACK_CASES = JSON.parse(await readFile(resolve(import.meta.dirname, "evals/routing.json"), "utf8")) as RoutingCase[];

test("cross-pack routing evals cover documented skill overlaps", () => {
  expect(CROSS_PACK_CASES.length).toBeGreaterThan(0);
  for (const item of CROSS_PACK_CASES) expect(caseIssues(item, UNION_NAMES)).toEqual([]);
  for (const boundary of REQUIRED_BOUNDARIES) {
    expect(
      CROSS_PACK_CASES.some((item) => item.expected === boundary.expected && item.mustNotInvoke.includes(boundary.competitor)),
    ).toBe(true);
  }
});

test("every pack ships a routing dataset covering each of its skills", async () => {
  for (const pack of PACKS) {
    const cases = await readRoutingCases(pack.directory);
    for (const item of cases) expect(caseIssues(item, UNION_NAMES), pack.id).toEqual([]);
    expect(cases.filter((item) => !pack.skills.includes(item.expected)), pack.id).toEqual([]);
    expect(countIssues(cases, pack.skills), pack.id).toEqual([]);
  }
});

test("every skill names at least one skill that must not load instead", async () => {
  const corpus = [...CROSS_PACK_CASES];
  for (const pack of PACKS) corpus.push(...(await readRoutingCases(pack.directory)));
  expect(boundaryIssues(corpus, [...UNION_NAMES])).toEqual([]);
});
