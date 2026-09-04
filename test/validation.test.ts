import { expect, test } from "bun:test";
import { resolve } from "node:path";
import { validateCorpus } from "../src/validation.ts";

test("the bundled corpus is valid", async () => {
  const result = await validateCorpus(resolve(import.meta.dirname, ".."));
  expect(result.skillCount).toBe(5);
  expect(result.issues).toEqual([]);
  expect(result.ok).toBe(true);
});
