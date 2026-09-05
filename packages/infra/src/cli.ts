#!/usr/bin/env node
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { credentialPresence, diagnoseRpc, SKILL_CATALOG } from "./index.js";
import { validate } from "./validate.js";
const VERSION = "0.2.0";
const HELP = `defi-infra-skills ${VERSION}
  catalog [--json]
  validate [directory] [--json]
  doctor --chain-id <decimal> [--rpc-env DEFI_RPC_URL] [--max-age-seconds 120] [--json]
  presence [--json]
The doctor sends at most two read-only JSON-RPC requests, never wallet actions.`;

async function main() {
  const args = process.argv.slice(2);
  const command = args.shift() ?? "--help";
  if (command === "--version" && !args.length) { console.log(VERSION); return; }
  if (["--help", "help"].includes(command) && !args.length) { console.log(HELP); return; }
  const positionals: string[] = [];
  const flags = new Map<string, string>();
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg === "--json") { if (flags.has(arg)) throw new Error(); flags.set(arg, "true"); }
    else if (["--chain-id", "--rpc-env", "--max-age-seconds"].includes(arg)) {
      if (flags.has(arg) || !args[i + 1] || args[i + 1]!.startsWith("--")) throw new Error();
      flags.set(arg, args[++i]!);
    } else if (arg.startsWith("-")) throw new Error();
    else positionals.push(arg);
  }
  if (command !== "doctor" && [...flags.keys()].some((key) => key !== "--json")) throw new Error();
  let result: unknown;
  if (command === "catalog" && !positionals.length) result = { ok: true, skills: SKILL_CATALOG };
  else if (command === "presence" && !positionals.length) result = { ok: true, configured: credentialPresence(process.env), meaning: "Presence only; not authentication or live readiness" };
  else if (command === "validate" && positionals.length <= 1) {
    const root = positionals[0] ? resolve(positionals[0]) : fileURLToPath(new URL("..", import.meta.url));
    const report = await validate(root);
    result = report; if (!report.ok) process.exitCode = 1;
  } else if (command === "doctor" && !positionals.length) {
    const chain = flags.get("--chain-id");
    const age = flags.get("--max-age-seconds") ?? "120";
    const envName = flags.get("--rpc-env") ?? "DEFI_RPC_URL";
    if (!chain || !/^[1-9][0-9]*$/.test(chain) || !/^[1-9][0-9]*$/.test(age) || !/^[A-Z_][A-Z0-9_]{0,63}$/.test(envName)) throw new Error();
    const report = await diagnoseRpc({ chainId: Number(chain), maxAgeSeconds: Number(age), rpcUrl: process.env[envName] });
    result = report; if (!report.ok) process.exitCode = 1;
  } else throw new Error();
  console.log(JSON.stringify(result, null, flags.has("--json") ? undefined : 2));
}
main().catch(() => { console.error(JSON.stringify({ ok: false, code: "invalid_command_or_package", help: "Use defi-infra-skills --help" })); process.exitCode = 1; });
