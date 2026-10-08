import { spawnSync } from "node:child_process";

export type ReleaseRun = { headSha: string; status: string; conclusion: string | null };

export function requireSuccessfulRun(runs: readonly ReleaseRun[], revision: string): void {
  const current = runs.filter((run) => run.headSha === revision);
  // gh returns newest first. A previous success cannot authorize a failing rerun.
  const latest = current[0];
  if (!latest || latest.status !== "completed" || latest.conclusion !== "success") {
    throw new Error(`Release requires successful CI for ${revision}; wait for the latest exact-commit run`);
  }
}

export function requireDiscovery(release: { isDraft: boolean; tagName: string; assets: { name: string }[] }, revision: string): void {
  if (release.isDraft || release.tagName !== `agent-skills-${revision}` || !release.assets.some((asset) => asset.name === "index.json")) {
    throw new Error(`Release requires published discovery artifacts for ${revision}`);
  }
}

export function requireDiscoveryTag(remoteRefs: string, revision: string): void {
  const ref = `refs/tags/agent-skills-${revision}`;
  const entries = remoteRefs.trim().split("\n").filter(Boolean).map(line => line.split(/\s+/));
  // Annotated tags identify their tag object on the first line; use the peeled commit.
  const commit = entries.find(([, name]) => name === `${ref}^{}`)?.[0]
    ?? entries.find(([, name]) => name === ref)?.[0];
  if (commit !== revision) throw new Error(`Discovery tag does not resolve to ${revision}`);
}

export function classifyRegistryLookup(status: number, stdout: string, stderr: string): "available" | "missing" {
  if (status === 0) {
    if (!stdout.trim()) throw new Error("Registry lookup returned an empty response");
    return "available";
  }
  // Never interpret expired authentication, network failures or invalid responses as absence.
  let body: { error?: { code?: string } };
  try { body = JSON.parse(stdout); } catch { body = {}; }
  if (body.error?.code === "E404" || /\bnpm (?:ERR!|error) code E404\b/.test(stderr)) return "missing";
  throw new Error("Registry version lookup failed; check registry access before publishing");
}

export function capture(command: string, args: string[], cwd: string): string {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", timeout: 120_000 });
  if (result.error || result.status !== 0) {
    // npm/gh output can include credentials from external configuration; keep errors bounded.
    throw new Error(`${command} release preflight failed (${result.status}); check authentication and exact-commit release evidence`);
  }
  return result.stdout.trim();
}

export function preflight(root: string, name: string, version: string): { revision: string; release: string } {
  if (capture("git", ["status", "--porcelain"], root)) throw new Error("Release requires a clean Git checkout");
  const revision = capture("git", ["rev-parse", "HEAD"], root);
  const release = `${name}@${version}`;
  capture("npm", ["whoami", "--registry=https://registry.npmjs.org"], root);
  requireSuccessfulRun(JSON.parse(capture("gh", ["run", "list", "--workflow", "ci.yml", "--commit", revision, "--limit", "10", "--json", "headSha,status,conclusion"], root)), revision);
  requireSuccessfulRun(JSON.parse(capture("gh", ["run", "list", "--workflow", "discovery.yml", "--commit", revision, "--limit", "10", "--json", "headSha,status,conclusion"], root)), revision);
  requireDiscovery(JSON.parse(capture("gh", ["release", "view", `agent-skills-${revision}`, "--json", "isDraft,tagName,assets"], root)), revision);
  requireDiscoveryTag(capture("git", ["ls-remote", "--tags", "origin", `refs/tags/agent-skills-${revision}`, `refs/tags/agent-skills-${revision}^{}`], root), revision);
  const lookup = spawnSync("npm", ["view", release, "version", "--json", "--registry=https://registry.npmjs.org"], { cwd: root, encoding: "utf8", timeout: 120_000 });
  if (lookup.error) throw new Error("Registry version lookup failed; check network access");
  if (classifyRegistryLookup(lookup.status ?? 1, lookup.stdout, lookup.stderr) === "available") {
    throw new Error(`${release} already exists; verify it instead of republishing`);
  }
  return { revision, release };
}
