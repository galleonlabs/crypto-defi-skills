#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SKILL_CATALOG } from "./catalog.js";
import { validateCorpus } from "./validation.js";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const version = "0.3.1";
const print = (value: unknown) => process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
try {
  const [command = "help", ...args] = process.argv.slice(2);
  if (command === "--version" || command === "version") process.stdout.write(`${version}\n`);
  else if (command === "catalog") {
    if (args.some(arg => arg !== "--json")) throw new Error("catalog accepts only --json");
    print({ ok: true, skills: SKILL_CATALOG });
  } else if (command === "show") {
    if (args.length !== 1 || args[0] !== "galleon-defi-data") throw new Error("show requires galleon-defi-data");
    process.stdout.write(await readFile(resolve(root, "skills/galleon-defi-data/SKILL.md"), "utf8"));
  } else if (command === "validate") {
    if (args.filter(arg => arg !== "--json").length > 1 || args.some(arg => arg.startsWith("--") && arg !== "--json")) throw new Error("validate accepts [path] [--json]");
    const result = await validateCorpus(args.find(arg => arg !== "--json") ?? root);
    print(result);
    if (!result.ok) process.exitCode = 1;
  } else if (command === "price-check") {
    const result = spawnSync(process.execPath, [resolve(root, "skills/galleon-defi-data/scripts/price-check.mjs"), ...args], { stdio: "inherit" });
    if (result.error) throw new Error("Unable to start public data diagnostic");
    process.exitCode = result.status ?? 1;
  } else if (["help", "--help", "-h"].includes(command)) {
    process.stdout.write(`defi-data-skills ${version}\n\nCommands:\n  catalog [--json]\n  show galleon-defi-data\n  validate [path] [--json]\n  price-check [--provider coingecko|defillama] [--id bitcoin] [--max-age 300]\n\nprice-check makes one public, keyless GET. It never reads credentials.\n`);
  } else throw new Error("Unknown command; use --help");
} catch (error) {
  print({ ok: false, error: error instanceof Error ? error.message : "Command failed" });
  process.exitCode = 1;
}
