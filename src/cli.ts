#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SKILL_CATALOG, canonicalSkillName } from "./catalog.js";
import { buildRange, evaluateEconomics, evaluatePosition } from "./math.js";
import { validateCorpus } from "./validation.js";

const VERSION = "0.4.0";
type Flags = Map<string, string | true>;

interface ParsedArgs {
  flags: Flags;
  positionals: string[];
}

function parseArgs(args: string[]): ParsedArgs {
  const flags: Flags = new Map();
  const positionals: string[] = [];
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (!token) continue;
    if (!token.startsWith("--")) {
      positionals.push(token);
      continue;
    }
    const equalAt = token.indexOf("=");
    if (equalAt > 2) {
      flags.set(token.slice(2, equalAt), token.slice(equalAt + 1));
      continue;
    }
    const key = token.slice(2);
    const next = args[index + 1];
    if (next !== undefined && !next.startsWith("--")) {
      flags.set(key, next);
      index += 1;
    } else {
      flags.set(key, true);
    }
  }
  return { flags, positionals };
}

function rejectUnknown(flags: Flags, allowed: string[]): void {
  for (const key of flags.keys()) {
    if (!allowed.includes(key)) throw new Error(`unknown option: --${key}`);
  }
}

function numberFlag(flags: Flags, key: string, fallback?: number): number {
  const value = flags.get(key);
  if (value === undefined && fallback !== undefined) return fallback;
  if (typeof value !== "string" || value.length === 0) throw new Error(`--${key} requires a number`);
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`--${key} must be a finite number`);
  return parsed;
}

function packageRoot(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), "..");
}

function printJson(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function printHelp(): void {
  process.stdout.write(`lp-skills ${VERSION}

Usage:
  lp-skills catalog [--json]
  lp-skills show <skill>
  lp-skills validate [path] [--json]
  lp-skills uniswap-link --help
  lp-skills range --price <n> --width <pct> --tick-spacing <n> [--decimals0 <n>] [--decimals1 <n>] [--json]
  lp-skills status --tick-current <n> --tick-lower <n> --tick-upper <n> [--edge-buffer <n>] [--json]
  lp-skills economics --capital <usd> --fees <usd> --days <n> [--incentives <usd>] [--costs <usd>] [--json]

The math commands are read-only. Range prices are token1 per token0.
Verify tick spacing, token order, decimals, and live state onchain.
`);
}

function formatRecord(record: object): void {
  for (const [key, value] of Object.entries(record)) {
    const rendered = typeof value === "number" ? String(Number(value.toPrecision(12))) : String(value);
    process.stdout.write(`${key}: ${rendered}\n`);
  }
}

async function main(): Promise<void> {
  const [command = "help", ...rest] = process.argv.slice(2);
  const parsed = parseArgs(rest);
  const json = parsed.flags.has("json");

  if (command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return;
  }
  if (command === "--version" || command === "version") {
    process.stdout.write(`${VERSION}\n`);
    return;
  }

  if (command === "uniswap-link") {
    const script = resolve(packageRoot(), "skills", "lp-plan", "scripts", "uniswap-link.mjs");
    const result = spawnSync(process.execPath, [script, ...rest], { stdio: "inherit" });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exitCode = result.status ?? 1;
    return;
  }

  if (command === "catalog") {
    rejectUnknown(parsed.flags, ["json"]);
    if (parsed.positionals.length > 0) throw new Error("catalog takes no positional arguments");
    if (json) printJson({ ok: true, skills: SKILL_CATALOG });
    else for (const skill of SKILL_CATALOG) process.stdout.write(`${skill.name}\t${skill.purpose}\n`);
    return;
  }

  if (command === "show") {
    rejectUnknown(parsed.flags, []);
    const [name, ...extra] = parsed.positionals;
    if (!name || extra.length > 0) throw new Error("show requires exactly one skill name");
    const canonical = canonicalSkillName(name);
    if (!SKILL_CATALOG.some((skill) => skill.name === canonical)) throw new Error(`unknown skill: ${name}`);
    if (canonical !== name) process.stderr.write(`note: ${name} was renamed to ${canonical} in 0.4.0\n`);
    process.stdout.write(await readFile(resolve(packageRoot(), "skills", canonical, "SKILL.md"), "utf8"));
    return;
  }

  if (command === "validate") {
    rejectUnknown(parsed.flags, ["json"]);
    if (parsed.positionals.length > 1) throw new Error("validate accepts at most one path");
    const result = await validateCorpus(parsed.positionals[0] ?? packageRoot());
    if (json) printJson(result);
    else {
      process.stdout.write(`${result.ok ? "valid" : "invalid"}: ${result.skillCount} skills\n`);
      for (const item of result.issues) {
        process.stdout.write(`${item.severity}\t${item.file}\t${item.message}\n`);
      }
    }
    if (!result.ok) process.exitCode = 1;
    return;
  }

  if (command === "range") {
    rejectUnknown(parsed.flags, ["price", "width", "tick-spacing", "decimals0", "decimals1", "json"]);
    if (parsed.positionals.length > 0) throw new Error("range takes options only");
    const result = buildRange({
      price: numberFlag(parsed.flags, "price"),
      widthPercent: numberFlag(parsed.flags, "width"),
      tickSpacing: numberFlag(parsed.flags, "tick-spacing"),
      decimals0: numberFlag(parsed.flags, "decimals0", 18),
      decimals1: numberFlag(parsed.flags, "decimals1", 18),
    });
    if (json) printJson({ ok: true, result });
    else formatRecord(result);
    return;
  }

  if (command === "status") {
    rejectUnknown(parsed.flags, ["tick-current", "tick-lower", "tick-upper", "edge-buffer", "json"]);
    if (parsed.positionals.length > 0) throw new Error("status takes options only");
    const result = evaluatePosition({
      tickCurrent: numberFlag(parsed.flags, "tick-current"),
      tickLower: numberFlag(parsed.flags, "tick-lower"),
      tickUpper: numberFlag(parsed.flags, "tick-upper"),
      edgeBufferTicks: numberFlag(parsed.flags, "edge-buffer", 0),
    });
    if (json) printJson({ ok: true, result });
    else formatRecord(result);
    return;
  }

  if (command === "economics") {
    rejectUnknown(parsed.flags, ["capital", "fees", "incentives", "costs", "days", "json"]);
    if (parsed.positionals.length > 0) throw new Error("economics takes options only");
    const result = evaluateEconomics({
      capitalUsd: numberFlag(parsed.flags, "capital"),
      feesUsd: numberFlag(parsed.flags, "fees"),
      incentivesUsd: numberFlag(parsed.flags, "incentives", 0),
      costsUsd: numberFlag(parsed.flags, "costs", 0),
      days: numberFlag(parsed.flags, "days"),
    });
    if (json) printJson({ ok: true, result });
    else formatRecord(result);
    return;
  }

  throw new Error(`unknown command: ${command}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  const wantsJson = process.argv.includes("--json");
  if (wantsJson) printJson({ ok: false, error: { code: "INVALID_INPUT", message } });
  else process.stderr.write(`error: ${message}\n`);
  process.exitCode = 1;
});
