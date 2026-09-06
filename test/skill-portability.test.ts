import { expect, test } from "bun:test";
import { resolve } from "node:path";
import { packages, root } from "../scripts/workspaces.ts";
import { validateCorpus } from "../scripts/content-pack/validation.ts";

test("every pack satisfies the same standalone format and discovery contract", async () => {
  for (const pack of await packages()) {
    const result = await validateCorpus(resolve(root, pack.directory));
    expect(result.issues.filter(issue => issue.severity === "error"), pack.id).toEqual([]);
    expect(result.skillCount, pack.id).toBeGreaterThan(0);
  }
});
