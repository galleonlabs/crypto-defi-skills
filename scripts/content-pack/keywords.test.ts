import { describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { checkDiscoveryKeywords, keywordIssues } from "./keywords.ts";

describe("discovery keywords", () => {
  test("rejects an internal-only keyword", () => {
    expect(keywordIssues(["agent-skills", "defi", "hermes", "aave"], "Use Aave markets.")).toContain(
      "internal-only keyword hermes",
    );
  });

  test("rejects keywords that omit every named protocol", () => {
    const issues = keywordIssues(["agent-skills", "defi", "lending"], "Use when researching Aave, Morpho and Compound.");
    expect(issues.some((issue) => issue.includes("omits every protocol term"))).toBe(true);
  });

  test("rejects a protocol keyword the pack does not name", () => {
    expect(keywordIssues(["agent-skills", "defi", "uniswap"], "Use when researching Aave markets.")).toContain(
      "keyword uniswap is not named in this pack's SKILL.md or references",
    );
  });

  test("accepts protocol terms the pack names", () => {
    expect(keywordIssues(["agent-skills", "defi", "aave", "morpho"], "Use when researching Aave and Morpho.")).toEqual([]);
  });
});

describe("content-pack discovery keyword check", () => {
  test("fails a pack whose package.json still lists hermes", async () => {
    const root = await mkdtemp(resolve(tmpdir(), "keyword-check-"));
    await mkdir(resolve(root, "skills", "fixture-skill"), { recursive: true });
    await writeFile(
      resolve(root, "package.json"),
      `${JSON.stringify({ keywords: ["agent-skills", "defi", "hermes", "lending"] }, null, 2)}\n`,
    );
    await writeFile(resolve(root, "skills", "fixture-skill", "SKILL.md"), "Use when researching Aave markets.\n");
    const issues = await checkDiscoveryKeywords(root);
    expect(issues.some((issue) => issue.file === "package.json" && issue.message.includes("hermes"))).toBe(true);
  });

  test("passes a pack whose keywords match named protocols", async () => {
    const root = await mkdtemp(resolve(tmpdir(), "keyword-check-"));
    await mkdir(resolve(root, "skills", "fixture-skill"), { recursive: true });
    await writeFile(
      resolve(root, "package.json"),
      `${JSON.stringify({ keywords: ["agent-skills", "defi", "aave", "morpho"] }, null, 2)}\n`,
    );
    await writeFile(resolve(root, "skills", "fixture-skill", "SKILL.md"), "Use when researching Aave and Morpho.\n");
    expect(await checkDiscoveryKeywords(root)).toEqual([]);
  });
});
