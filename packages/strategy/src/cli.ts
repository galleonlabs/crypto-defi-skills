#!/usr/bin/env node
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { runCli } from "../../../scripts/content-pack/cli.ts";
import { SKILL_CATALOG } from "./catalog.js";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
if (["backtest", "validate-strategy"].includes(process.argv[2] ?? "")) {
  const script = process.argv[2] === "backtest" ? "backtest.mjs" : "validate-strategy.mjs";
  const result = spawnSync(process.execPath, [resolve(root, "skills/galleon-defi-strategy-backtest/scripts", script), ...process.argv.slice(3)], { stdio: "inherit" });
  process.exitCode = result.status ?? 1;
} else if (["help", "--help", "-h"].includes(process.argv[2] ?? "help") && process.argv.length <= 3) {
  const manifest = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
  process.stdout.write(`defi-strategy-skills ${manifest.version}\n\nCommands:\n  catalog [--json]\n  show <skill-name>\n  validate [path] [--json]\n  backtest --data <dataset.json> --spec <spec.json>\n  validate-strategy --data <dataset.json> --spec <spec.json> [--split <first-held-out-index>]\n  --version\n\nSimulation reads local JSON only. It makes no network or wallet calls. Use validate-strategy --help for higher-cost assumptions.\n`);
} else await runCli(root, SKILL_CATALOG);
