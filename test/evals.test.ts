import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { SKILL_CATALOG as dataCatalog } from "../packages/data/src/catalog.ts";
import { SKILL_CATALOG as hyperliquidCatalog } from "../packages/hyperliquid/src/catalog.ts";
import { SKILL_CATALOG as infraCatalog } from "../packages/infra/src/index.ts";
import { SKILL_CATALOG as lpCatalog } from "../packages/lp/src/catalog.ts";

interface RoutingCase {
  prompt: string;
  expected: string;
  mustNotInvoke: string[];
  reason: string;
}

const UNION_CATALOG = [...infraCatalog, ...dataCatalog, ...lpCatalog, ...hyperliquidCatalog];
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
