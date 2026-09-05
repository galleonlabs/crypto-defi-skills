import { existsSync } from "node:fs";
import { lstat, readdir, readFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";

export type LinkKind = "documentation" | "mcp" | "api" | "install-spec";
export type LinkStatus = "ok" | "broken" | "unverifiable";
export type LinkSurface = "external" | "relative";

export type ExtractedLink = {
  href: string;
  file: string;
  surface: LinkSurface;
};

export type ClassifiedLink = ExtractedLink & {
  kind: LinkKind;
};

export type ProbeResult =
  | { statusCode: number }
  | { error: "timeout" | "network"; message: string };

export type EvaluatedLink = ClassifiedLink & {
  status: LinkStatus;
  reason: string;
  statusCode?: number;
};

const skipped = new Set([".git", "artifacts", "dist", "node_modules"]);
const markdownLink = /!?\[[^\]]*\]\((<)?([^)\s>]+)(?:>)?(?:\s+(?:"[^"]*"|'[^']*'))?\)/g;
const urlLike = /(?:git\+)?https?:\/\/[^\s)<>"'`\\]+/gi;

export function normalizeHref(href: string): string {
  return href.replace(/[.,;:]+$/g, "").replace(/^<|>$/g, "");
}

export function classifyHref(href: string): LinkKind {
  const value = normalizeHref(href);
  if (value.startsWith("git+") || value.includes(".git@") || !/^https?:\/\//i.test(value)) {
    return "install-spec";
  }
  let url: URL;
  try {
    url = new URL(value.replace(/\{[^}]+\}/g, "x"));
  } catch {
    return "install-spec";
  }
  const host = url.hostname.toLowerCase();
  const path = url.pathname.toLowerCase();
  if (host.startsWith("mcp.") || host.includes(".mcp.") || /(?:^|\/)mcp(?:\/|$)/.test(path)) return "mcp";
  if (isDocsHost(host)) return "documentation";
  if (
    /\{[^}]+\}/.test(value) ||
    host.startsWith("api.") ||
    host.includes(".api.") ||
    host.startsWith("pro-api.") ||
    host.startsWith("pro-openapi.") ||
    host === "kong.yearn.fi" ||
    host === "agents.coinbase.com"
  ) {
    return "api";
  }
  return "documentation";
}

function isDocsHost(host: string): boolean {
  return (
    host === "github.com" ||
    host.endsWith(".github.io") ||
    host.startsWith("docs.") ||
    host.includes(".gitbook.io") ||
    host.endsWith(".mintlify.app") ||
    host === "eips.ethereum.org" ||
    host.startsWith("developers.") ||
    host.endsWith(".readme.io")
  );
}

export function evaluateProbe(kind: LinkKind, probe: ProbeResult): { status: LinkStatus; reason: string } {
  if (kind === "install-spec") return { status: "ok", reason: "install specifier, not an HTTP page" };
  if ("error" in probe) {
    return { status: "unverifiable", reason: probe.error === "timeout" ? "timeout" : probe.message };
  }
  const code = probe.statusCode;
  if (kind === "documentation") {
    if (code >= 200 && code < 400) return { status: "ok", reason: `HTTP ${code}` };
    if (code === 404 || code === 410) return { status: "broken", reason: `HTTP ${code}` };
    return { status: "unverifiable", reason: `HTTP ${code}` };
  }
  if (code > 0) return { status: "ok", reason: `HTTP ${code} (endpoint answered)` };
  return { status: "unverifiable", reason: "empty HTTP status" };
}

export async function walkMarkdown(root: string, directory = root): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (skipped.has(entry.name)) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkMarkdown(root, path)));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".md")) files.push(path);
  }
  return files;
}

function isSkillMarkdown(root: string, file: string): boolean {
  return /(?:^|\/)packages\/[^/]+\/skills\//.test(relative(root, file).replaceAll("\\", "/"));
}

function isPackageMarkdown(root: string, file: string): boolean {
  return /(?:^|\/)packages\//.test(relative(root, file).replaceAll("\\", "/"));
}

export async function extractLinks(root: string): Promise<{ external: ExtractedLink[]; relative: ExtractedLink[] }> {
  const files = await walkMarkdown(root);
  const external: ExtractedLink[] = [];
  const relativeLinks: ExtractedLink[] = [];
  const seenExternal = new Set<string>();
  for (const file of files) {
    const source = await readFile(file, "utf8");
    const display = relative(root, file).replaceAll("\\", "/");
    if (isPackageMarkdown(root, file)) {
      for (const href of markdownHrefs(source)) {
        if (href.startsWith("#") || href.startsWith("mailto:")) continue;
        if (/^https?:\/\//i.test(href) || href.startsWith("git+https://")) continue;
        relativeLinks.push({ href, file: display, surface: "relative" });
      }
    }
    if (!isSkillMarkdown(root, file)) continue;
    for (const href of externalHrefs(source)) {
      const key = `${display}::${href}`;
      if (seenExternal.has(key)) continue;
      seenExternal.add(key);
      external.push({ href, file: display, surface: "external" });
    }
  }
  return { external: uniqueByHref(external), relative: relativeLinks };
}

function uniqueByHref(links: ExtractedLink[]): ExtractedLink[] {
  const seen = new Set<string>();
  return links.filter((link) => {
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });
}

export function markdownHrefs(source: string): string[] {
  const hrefs: string[] = [];
  const pattern = new RegExp(markdownLink);
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(source))) {
    hrefs.push(normalizeHref(match[2]!));
  }
  return hrefs;
}

export function externalHrefs(source: string): string[] {
  const hrefs: string[] = [];
  const seen = new Set<string>();
  const pattern = new RegExp(urlLike);
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(source))) {
    const href = normalizeHref(match[0]!);
    if (seen.has(href)) continue;
    seen.add(href);
    hrefs.push(href);
  }
  return hrefs;
}

export function classifyLink(link: ExtractedLink): ClassifiedLink {
  return { ...link, kind: link.surface === "relative" ? "documentation" : classifyHref(link.href) };
}

export async function evaluateRelative(root: string, link: ExtractedLink): Promise<EvaluatedLink> {
  const classified = classifyLink(link);
  const pathPart = link.href.split(/[?#]/, 1)[0] ?? "";
  if (!pathPart) {
    return { ...classified, status: "ok", reason: "in-page anchor" };
  }
  const target = resolve(root, dirname(link.file), pathPart);
  try {
    await lstat(target);
    return { ...classified, status: "ok", reason: "file exists" };
  } catch {
    if (existsSync(target)) return { ...classified, status: "ok", reason: "file exists" };
    return { ...classified, status: "broken", reason: "missing file" };
  }
}

const mcpInitialize = JSON.stringify({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "galleon-link-health", version: "0.1.0" },
  },
});

export async function probeHref(
  href: string,
  kind: LinkKind,
  options: { timeoutMs: number; fetchImpl?: typeof fetch } = { timeoutMs: 20_000 },
): Promise<ProbeResult> {
  if (kind === "install-spec") return { statusCode: 0 };
  const fetchImpl = options.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs);
  try {
    const headers: Record<string, string> = {
      "user-agent": "galleon-link-health/0.1 (+https://github.com/galleonlabs/crypto-defi-skills)",
    };
    const init: RequestInit = { redirect: "follow", signal: controller.signal, headers };
    if (kind === "mcp") {
      headers.accept = "application/json, text/event-stream";
      headers["content-type"] = "application/json";
      init.method = "POST";
      init.body = mcpInitialize;
    }
    const response = await fetchImpl(href.replace(/\{[^}]+\}/g, "x"), init);
    return { statusCode: response.status };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (controller.signal.aborted || /timeout|aborted/i.test(message)) {
      return { error: "timeout", message };
    }
    return { error: "network", message };
  } finally {
    clearTimeout(timer);
  }
}

export async function mapPool<T, R>(items: T[], concurrency: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const index = next++;
      results[index] = await worker(items[index]!);
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, Math.min(concurrency, items.length || 1)) }, () => run()));
  return results;
}

export function summarize(links: EvaluatedLink[]) {
  return {
    checked: links.length,
    ok: links.filter((link) => link.status === "ok").length,
    broken: links.filter((link) => link.status === "broken").length,
    unverifiable: links.filter((link) => link.status === "unverifiable").length,
  };
}

export function formatReport(external: EvaluatedLink[], relativeLinks: EvaluatedLink[]): string {
  const ext = summarize(external);
  const rel = summarize(relativeLinks);
  const lines = [
    `link-health: external ${ext.checked} (ok ${ext.ok}, broken ${ext.broken}, unverifiable ${ext.unverifiable})`,
    `link-health: relative ${rel.checked} (ok ${rel.ok}, broken ${rel.broken}, unverifiable ${rel.unverifiable})`,
  ];
  const broken = [...external, ...relativeLinks].filter((link) => link.status === "broken");
  if (broken.length > 0) {
    lines.push("broken:");
    for (const link of broken) lines.push(`  ${link.file} ${link.href} (${link.reason})`);
  }
  const unverifiable = external.filter((link) => link.status === "unverifiable");
  if (unverifiable.length > 0) {
    lines.push("unverifiable:");
    for (const link of unverifiable) lines.push(`  ${link.file} ${link.href} (${link.reason})`);
  }
  return `${lines.join("\n")}\n`;
}
