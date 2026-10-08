import { expect, test } from "bun:test";
import { classifyRegistryLookup, requireDiscovery, requireDiscoveryTag, requireSuccessfulRun } from "../scripts/release/preflight.ts";

const revision = "a".repeat(40);
test("a stale success or failed rerun cannot authorize publication", () => {
  expect(() => requireSuccessfulRun([{ headSha: "b".repeat(40), status: "completed", conclusion: "success" }], revision)).toThrow();
  expect(() => requireSuccessfulRun([
    { headSha: revision, status: "completed", conclusion: "failure" },
    { headSha: revision, status: "completed", conclusion: "success" },
  ], revision)).toThrow();
  expect(() => requireSuccessfulRun([{ headSha: revision, status: "in_progress", conclusion: null }], revision)).toThrow();
  requireSuccessfulRun([{ headSha: revision, status: "completed", conclusion: "success" }], revision);
});

test("discovery must be public, exact and complete", () => {
  const release = { isDraft: false, tagName: `agent-skills-${revision}`, assets: [{ name: "index.json" }] };
  requireDiscovery(release, revision);
  expect(() => requireDiscovery({ ...release, isDraft: true }, revision)).toThrow();
  expect(() => requireDiscovery({ ...release, assets: [] }, revision)).toThrow();
  expect(() => requireDiscovery(release, "b".repeat(40))).toThrow();
});

test("a correctly named discovery tag must identify the actual source commit", () => {
  const ref = `refs/tags/agent-skills-${revision}`;
  requireDiscoveryTag(`${revision}\t${ref}\n`, revision);
  requireDiscoveryTag(`${"b".repeat(40)}\t${ref}\n${revision}\t${ref}^{}\n`, revision);
  expect(() => requireDiscoveryTag(`${"b".repeat(40)}\t${ref}\n`, revision)).toThrow();
  expect(() => requireDiscoveryTag(`${revision}\t${ref}\n${"b".repeat(40)}\t${ref}^{}\n`, revision)).toThrow();
  expect(() => requireDiscoveryTag("", revision)).toThrow();
});

test("only explicit registry absence permits a new version", () => {
  expect(classifyRegistryLookup(0, '"0.2.0"', "")).toBe("available");
  expect(classifyRegistryLookup(1, '{"error":{"code":"E404"}}', "")).toBe("missing");
  expect(classifyRegistryLookup(1, "", "npm error code E404\n")).toBe("missing");
  for (const code of ["E401", "E403", "ECONNRESET", "ETIMEDOUT"]) {
    expect(() => classifyRegistryLookup(1, JSON.stringify({ error: { code } }), `npm error code ${code}`)).toThrow();
  }
  expect(() => classifyRegistryLookup(0, "", "")).toThrow();
});
