import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { checkAttribution } from "./check-attribution.ts";

export const root = resolve(import.meta.dirname, "..");
export async function packages() {
  const entries = await readdir(resolve(root, "packages"), { withFileTypes: true });
  return Promise.all(entries.filter((entry) => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name)).map(async (entry) => {
    const directory = `packages/${entry.name}`;
    const manifest = JSON.parse(await readFile(resolve(root, directory, "package.json"), "utf8"));
    return { id: entry.name, directory, manifest };
  }));
}

export function run(command: string, args: string[], cwd = root) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed (${result.status})`);
}

// Required-gate tests: each guards publishing integrity, a content-pack validation
// boundary or a security boundary. Everything else runs in the optional `test` suite.
export const gateTests: { cwd: string; files: string[]; reason: string }[] = [
  { cwd: ".", files: ["./test/release-preflight.test.ts", "./test/registry-metadata.test.ts", "./scripts/release-drift"], reason: "publication requires exact-commit CI, discovery and registry identity" },
  { cwd: ".", files: ["./test/workspaces.test.ts", "./scripts/check-readme-releases.test.ts"], reason: "each pack stays independently releasable with a machine-checked release row" },
  { cwd: ".", files: ["./scripts/content-pack", "./test/skill-portability.test.ts", "./test/discovery.test.ts"], reason: "content-pack validation and installed-name discovery boundaries" },
  { cwd: ".", files: ["./test/research-plugin.test.ts"], reason: "research plugin exposes only the public data connection, no credentials" },
  { cwd: "packages/lp", files: ["./test/connection.test.ts"], reason: "RPC diagnostic performs only its allowed reads and fails closed" },
  { cwd: "packages/hyperliquid", files: ["./test/wallet-audit.test.ts"], reason: "wallet audit rejects unsafe endpoints, modified bytes and wrong identities" },
  { cwd: "packages/security", files: ["./test/token-diligence.test.ts"], reason: "token diligence never reports fake or unknown evidence as a pass" },
];
// Offline routing and behavior fixture contracts. They need no model or credentials;
// graded model answers stay a separate, manual evaluation (docs/SKILL-QUALITY.md).
export const evalTests: { cwd: string; files: string[] }[] = [
  { cwd: ".", files: ["./test/evals.test.ts", "./test/behavior-evals.test.ts"] },
  ...["data", "hyperliquid", "infra", "lp"].map((id) => ({ cwd: `packages/${id}`, files: ["./test/evals.test.ts"] })),
];

if (import.meta.main) {
  const command = process.argv[2];
  if (command !== "check" && command !== "pack" && command !== "evals" && command !== "test") throw new Error("Usage: bun scripts/workspaces.ts check|evals|test|pack");
  if (command === "evals") {
    for (const entry of evalTests) run("bun", ["test", ...entry.files], resolve(root, entry.cwd));
    run("bun", ["scripts/behavior-evals.ts"]);
    process.exit(0);
  }
  if (command === "test") {
    // Optional full suite: every root and per-pack test.
    run("bun", ["test", "./test", "./scripts/content-pack", "./scripts/link-health", "./scripts/release-drift", "./scripts/check-readme-releases.test.ts"]);
    for (const pack of await packages()) {
      const cwd = resolve(root, pack.directory);
      if (pack.manifest.scripts?.test) run("bun", ["run", "test"], cwd);
      else if (existsSync(resolve(cwd, "test"))) run("bun", ["test", "./test"], cwd);
    }
    process.exit(0);
  }
  await checkAttribution({ root });
  if (command === "check") {
    run("bun", ["scripts/release-drift.ts"]);
    run("bun", ["scripts/check-readme-releases.ts"]);
  }
  for (const pack of await packages()) {
    process.stdout.write(`${command}: ${pack.manifest.name}\n`);
    const cwd = resolve(root, pack.directory);
    // Each pack's own `check` (its prepack release gate) still runs its full tests.
    if (command === "check") {
      run("bun", ["run", "style"], cwd);
      run("bunx", ["tsc", "--noEmit"], cwd);
      run("bun", ["run", "validate"], cwd);
      run("bun", ["run", "build"], cwd);
    }
    else run("npm", ["pack", "--dry-run", "--ignore-scripts"], cwd);
  }
  if (command === "check") {
    run("bun", ["scripts/check-style.ts"]);
    run("bunx", ["tsc", "--noEmit"]);
    for (const entry of gateTests) run("bun", ["test", ...entry.files], resolve(root, entry.cwd));
  }
}
