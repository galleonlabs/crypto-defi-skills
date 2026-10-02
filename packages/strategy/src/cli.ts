#!/usr/bin/env node
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { runCli } from "../../../scripts/content-pack/cli.ts";
import { SKILL_CATALOG } from "./catalog.js";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
if (process.argv[2] === "backtest") {
  const result = spawnSync(process.execPath, [resolve(root, "skills/galleon-defi-strategy-backtest/scripts/backtest.mjs"), ...process.argv.slice(3)], { stdio: "inherit" });
  process.exitCode = result.status ?? 1;
} else if (["help", "--help", "-h"].includes(process.argv[2] ?? "help")) {
  process.stdout.write("defi-strategy-skills 0.1.0\n\nCommands:\n  catalog [--json]\n  show <skill-name>\n  validate [path] [--json]\n  backtest --data <dataset.json> --spec <spec.json>\n\nBacktest reads local JSON only. It makes no network or wallet calls.\n");
} else await runCli(root, SKILL_CATALOG);
