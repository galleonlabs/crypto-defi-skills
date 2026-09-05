import { expect, test } from "bun:test";
import { readdir, readFile } from "node:fs/promises";
import { extname, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const executableExtensions = new Set([".mjs", ".js", ".ts", ".py", ".sh"]);
// Documentation may offer optional official tools. The shipped installer and
// local diagnostics must not silently connect readers to any hosted LP vendor.
const providerRoutes = [
  "mcp.revert.finance",
  "api.revert.finance",
  "liquidity.api.uniswap.org",
];

async function scan(directory: string, findings: string[]): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      await scan(file, findings);
      continue;
    }
    if (!entry.isFile() || !executableExtensions.has(extname(entry.name))) continue;
    const source = (await readFile(file, "utf8")).toLowerCase();
    for (const route of providerRoutes) {
      if (source.includes(route)) findings.push(`${relative(root, file)}: ${route}`);
    }
  }
}

test("installers and bundled diagnostics do not silently adopt hosted providers", async () => {
  const findings: string[] = [];
  await scan(resolve(root, "skills"), findings);
  await scan(resolve(root, "src"), findings);
  expect(findings).toEqual([]);
});
