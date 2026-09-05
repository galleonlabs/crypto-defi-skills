#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SKILL_CATALOG } from "./catalog.js";
import { liquidationDistance, normalizeFunding, reviewTrade, sizeRisk, type PositionSide } from "./math.js";
import { validateCorpus } from "./validation.js";

const VERSION = "0.3.0";
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

function optionalNumberFlag(flags: Flags, key: string): number | undefined {
  return flags.has(key) ? numberFlag(flags, key) : undefined;
}

function sideFlag(flags: Flags): PositionSide {
  const side = flags.get("side");
  if (side !== "long" && side !== "short") throw new Error("--side must be long or short");
  return side;
}

function packageRoot(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), "..");
}

function printJson(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function printRecord(record: object): void {
  for (const [key, value] of Object.entries(record)) {
    const rendered = typeof value === "number" ? String(Number(value.toPrecision(12))) : String(value);
    process.stdout.write(`${key}: ${rendered}\n`);
  }
}

function printHelp(): void {
  process.stdout.write(`hyperliquid-skills ${VERSION}

Usage:
  hl-skills catalog [--json]
  hl-skills show <skill>
  hl-skills validate [path] [--json]
  hl-skills risk --side <long|short> --equity <usd> --risk-percent <pct> --entry <price> --stop <price> --stop-slippage-bps <bps> --entry-fee-bps <bps> --exit-fee-bps <bps> --size-decimals <n> [--leverage <n>] [--json]
  hl-skills funding --side <long|short> --notional <usd> --rate <decimal> --interval-hours <n> --hours <n> [--json]
  hl-skills liquidation --side <long|short> --mark <price> --liquidation <price> [--json]
  hl-skills review --side <long|short> --size <n> --entry <price> --exit <price> --entry-fee <usd> --exit-fee <usd> --funding <signed-usd> [--risk-usd <usd>] [--json]

All calculations are local and read-only. Resolve current market metadata, fees, account mode, and exchange state before using an output.
`);
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
    if (!SKILL_CATALOG.some((skill) => skill.name === name)) throw new Error(`unknown skill: ${name}`);
    process.stdout.write(await readFile(resolve(packageRoot(), "skills", name, "SKILL.md"), "utf8"));
    return;
  }
  if (command === "validate") {
    rejectUnknown(parsed.flags, ["json"]);
    if (parsed.positionals.length > 1) throw new Error("validate accepts at most one path");
    const result = await validateCorpus(parsed.positionals[0] ?? packageRoot());
    if (json) printJson(result);
    else {
      process.stdout.write(`${result.ok ? "valid" : "invalid"}: ${result.skillCount} skills\n`);
      for (const item of result.issues) process.stdout.write(`${item.severity}\t${item.file}\t${item.message}\n`);
    }
    if (!result.ok) process.exitCode = 1;
    return;
  }
  if (parsed.positionals.length > 0) throw new Error(`${command} takes options only`);
  if (command === "risk") {
    rejectUnknown(parsed.flags, ["side", "equity", "risk-percent", "entry", "stop", "stop-slippage-bps", "entry-fee-bps", "exit-fee-bps", "size-decimals", "leverage", "json"]);
    const leverage = optionalNumberFlag(parsed.flags, "leverage");
    const base = {
      side: sideFlag(parsed.flags),
      equityUsd: numberFlag(parsed.flags, "equity"),
      riskPercent: numberFlag(parsed.flags, "risk-percent"),
      entryPrice: numberFlag(parsed.flags, "entry"),
      stopPrice: numberFlag(parsed.flags, "stop"),
      stopSlippageBps: numberFlag(parsed.flags, "stop-slippage-bps"),
      entryFeeBps: numberFlag(parsed.flags, "entry-fee-bps"),
      exitFeeBps: numberFlag(parsed.flags, "exit-fee-bps"),
      sizeDecimals: numberFlag(parsed.flags, "size-decimals"),
    };
    const result = sizeRisk(leverage === undefined ? base : { ...base, leverage });
    if (json) printJson({ ok: true, result }); else printRecord(result);
    return;
  }
  if (command === "funding") {
    rejectUnknown(parsed.flags, ["side", "notional", "rate", "interval-hours", "hours", "json"]);
    const result = normalizeFunding({
      side: sideFlag(parsed.flags),
      notionalUsd: numberFlag(parsed.flags, "notional"),
      rate: numberFlag(parsed.flags, "rate"),
      intervalHours: numberFlag(parsed.flags, "interval-hours"),
      hours: numberFlag(parsed.flags, "hours"),
    });
    if (json) printJson({ ok: true, result }); else printRecord(result);
    return;
  }
  if (command === "liquidation") {
    rejectUnknown(parsed.flags, ["side", "mark", "liquidation", "json"]);
    const result = liquidationDistance({
      side: sideFlag(parsed.flags),
      markPrice: numberFlag(parsed.flags, "mark"),
      liquidationPrice: numberFlag(parsed.flags, "liquidation"),
    });
    if (json) printJson({ ok: true, result }); else printRecord(result);
    return;
  }
  if (command === "review") {
    rejectUnknown(parsed.flags, ["side", "size", "entry", "exit", "entry-fee", "exit-fee", "funding", "risk-usd", "json"]);
    const riskUsd = optionalNumberFlag(parsed.flags, "risk-usd");
    const base = {
      side: sideFlag(parsed.flags),
      size: numberFlag(parsed.flags, "size"),
      entryPrice: numberFlag(parsed.flags, "entry"),
      exitPrice: numberFlag(parsed.flags, "exit"),
      entryFeeUsd: numberFlag(parsed.flags, "entry-fee"),
      exitFeeUsd: numberFlag(parsed.flags, "exit-fee"),
      fundingUsd: numberFlag(parsed.flags, "funding"),
    };
    const result = reviewTrade(riskUsd === undefined ? base : { ...base, riskUsd });
    if (json) printJson({ ok: true, result }); else printRecord(result);
    return;
  }
  throw new Error(`unknown command: ${command}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  if (process.argv.includes("--json")) printJson({ ok: false, error: { code: "INVALID_INPUT", message } });
  else process.stderr.write(`error: ${message}\n`);
  process.exitCode = 1;
});
