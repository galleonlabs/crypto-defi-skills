import { expect, test } from "bun:test";
import { readdir, readFile } from "node:fs/promises";
import { extname, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const textExtensions = new Set([".json", ".md", ".mjs", ".ts", ".yaml", ".yml"]);
const forbiddenRuntimeRoutes = ["mcp.revert.finance", "api.revert.finance", "revert.finance/#/agents"];

async function scan(directory: string, findings: string[]): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      await scan(file, findings);
      continue;
    }
    if (!entry.isFile() || !textExtensions.has(extname(entry.name))) continue;
    const source = (await readFile(file, "utf8")).toLowerCase();
    for (const route of forbiddenRuntimeRoutes) {
      if (source.includes(route)) findings.push(`${relative(root, file)}: ${route}`);
    }
  }
}

test("research provenance does not become a Revert runtime route", async () => {
  const findings: string[] = [];
  await scan(resolve(root, "skills"), findings);
  await scan(resolve(root, "src"), findings);
  expect(findings).toEqual([]);
});
