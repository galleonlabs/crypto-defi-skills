import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
test("research plugin exposes only the official public data connection", async () => {
  const plugin = JSON.parse(await readFile(resolve(root, "plugins/defi-research/plugin.json"), "utf8"));
  const mcp = JSON.parse(await readFile(resolve(root, "plugins/defi-research/mcp.json"), "utf8"));
  expect(plugin.$schema).toBe("https://agent-plugins.org/schemas/1.0.0/plugin.schema.json");
  expect(plugin.extensions["com.openai"].interface.privacyPolicyURL).toContain("PRIVACY.md");
  expect(Object.keys(mcp.mcpServers)).toEqual(["coingecko"]);
  expect(mcp.mcpServers.coingecko).toEqual({ type: "streamable-http", url: "https://mcp.api.coingecko.com/mcp" });
  expect(JSON.stringify(mcp)).not.toMatch(/Authorization|api.key|wallet|coinbase/i);
});
