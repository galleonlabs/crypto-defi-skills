import { lstat, readdir, readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import type { ValidationIssue } from "./validation.ts";

export const INTERNAL_ONLY_KEYWORDS = ["hermes", "boomkin", "wizzy", "wizzybot"] as const;

const GENERIC_KEYWORDS = new Set([
  "agent-skills",
  "ai-agents",
  "amm",
  "defi",
  "derivatives",
  "governance",
  "infrastructure",
  "lending",
  "liquidity",
  "mcp",
  "payments",
  "perpetuals",
  "portfolio",
  "rpc",
  "routing",
  "security",
  "staking",
  "tokenized-assets",
  "trading",
  "wallet",
  "yield",
]);

const PROTOCOL_TERMS: { keyword: string; pattern: RegExp }[] = [
  { keyword: "1inch", pattern: /\b1inch\b/i },
  { keyword: "aave", pattern: /\baave\b/i },
  { keyword: "across", pattern: /\bAcross\b/ },
  { keyword: "aerodrome", pattern: /\baerodrome\b/i },
  { keyword: "aixbt", pattern: /\baixbt\b/i },
  { keyword: "alchemy", pattern: /\balchemy\b/i },
  { keyword: "balancer", pattern: /\bBalancer\b/ },
  { keyword: "blockaid", pattern: /\bblockaid\b/i },
  { keyword: "boros", pattern: /\bboros\b/i },
  { keyword: "cactus", pattern: /\bcactus\b/i },
  { keyword: "cctp", pattern: /\bcctp\b/i },
  { keyword: "coinbase", pattern: /\bcoinbase\b/i },
  { keyword: "coingecko", pattern: /\bcoingecko\b/i },
  { keyword: "compound", pattern: /\bCompound\b/ },
  { keyword: "cow-protocol", pattern: /\bCoW(?:\s+Protocol)?\b/ },
  { keyword: "curve", pattern: /\bCurve\b/ },
  { keyword: "debank", pattern: /\bdebank\b/i },
  { keyword: "defillama", pattern: /\bdefillama\b/i },
  { keyword: "derive", pattern: /\bDerive\b/ },
  { keyword: "drift", pattern: /\bDrift\b/ },
  { keyword: "eigenlayer", pattern: /\beigen[\s-]?layer\b/i },
  { keyword: "ethena", pattern: /\bethena\b/i },
  { keyword: "euler", pattern: /\beuler\b/i },
  { keyword: "gmx", pattern: /\bgmx\b/i },
  { keyword: "goplus", pattern: /\bgoplus\b/i },
  { keyword: "governor", pattern: /\bGovernor\b/ },
  { keyword: "hyperliquid", pattern: /\bhyperliquid\b/i },
  { keyword: "jupiter", pattern: /\bjupiter\b/i },
  { keyword: "lido", pattern: /\blido\b/i },
  { keyword: "lifi", pattern: /\bli\.fi\b/i },
  { keyword: "morpho", pattern: /\bmorpho\b/i },
  { keyword: "ondo", pattern: /\bondo\b/i },
  { keyword: "openeden", pattern: /\bopeneden\b/i },
  { keyword: "pendle", pattern: /\bpendle\b/i },
  { keyword: "relay", pattern: /\bRelay\b/ },
  { keyword: "revert", pattern: /\bRevert\b/ },
  { keyword: "rocket-pool", pattern: /\brocket[\s-]?pool\b/i },
  { keyword: "sablier", pattern: /\bsablier\b/i },
  { keyword: "safe", pattern: /\bSafe\b/ },
  { keyword: "slipstream", pattern: /\bslipstream\b/i },
  { keyword: "snapshot", pattern: /\bsnapshot\b/i },
  { keyword: "spark", pattern: /\bSpark\b/ },
  { keyword: "superfluid", pattern: /\bsuperfluid\b/i },
  { keyword: "symbiotic", pattern: /\bsymbiotic\b/i },
  { keyword: "tenderly", pattern: /\btenderly\b/i },
  { keyword: "uniswap", pattern: /\buniswap\b/i },
  { keyword: "vfat", pattern: /\bvfat\b/i },
  { keyword: "x402", pattern: /\bx402\b/i },
  { keyword: "yearn", pattern: /\byearn\b/i },
  { keyword: "zerion", pattern: /\bzerion\b/i },
];

export function namedProtocolKeywords(corpus: string): string[] {
  return PROTOCOL_TERMS.filter((term) => term.pattern.test(corpus)).map((term) => term.keyword);
}

export function keywordIssues(keywords: string[], corpus: string): string[] {
  const issues: string[] = [];
  const values = keywords.map((keyword) => keyword.trim().toLowerCase());
  for (const keyword of values) {
    if ((INTERNAL_ONLY_KEYWORDS as readonly string[]).includes(keyword)) {
      issues.push(`internal-only keyword ${keyword}`);
    }
  }
  const named = namedProtocolKeywords(corpus);
  if (named.length > 0 && !named.some((keyword) => values.includes(keyword))) {
    issues.push(`omits every protocol term named in SKILL.md or references (${named.join(", ")})`);
  }
  for (const keyword of values) {
    if (GENERIC_KEYWORDS.has(keyword) || (INTERNAL_ONLY_KEYWORDS as readonly string[]).includes(keyword)) continue;
    if (!named.includes(keyword)) {
      issues.push(`keyword ${keyword} is not named in this pack's SKILL.md or references`);
    }
  }
  return issues;
}

async function markdownCorpus(root: string): Promise<string> {
  const chunks: string[] = [];
  async function walk(directory: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const file = resolve(directory, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (entry.isFile() && entry.name.endsWith(".md")) chunks.push(await readFile(file, "utf8"));
    }
  }
  await walk(resolve(root, "skills"));
  return chunks.join("\n");
}

async function readKeywordList(file: string): Promise<string[] | undefined> {
  try {
    const parsed = JSON.parse(await readFile(file, "utf8")) as { keywords?: unknown };
    if (!Array.isArray(parsed.keywords)) return undefined;
    return parsed.keywords.map((keyword) => String(keyword));
  } catch {
    return undefined;
  }
}

function relativeFile(root: string, file: string): string {
  return relative(root, file).replaceAll("\\", "/");
}

export async function checkDiscoveryKeywords(root: string): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];
  const packageFile = resolve(root, "package.json");
  try {
    await lstat(packageFile);
  } catch {
    return issues;
  }
  const corpus = await markdownCorpus(root);
  const packKeywords = await readKeywordList(packageFile);
  if (!packKeywords) {
    issues.push({ severity: "error", file: "package.json", message: "keywords must be a string array" });
    return issues;
  }
  for (const message of keywordIssues(packKeywords, corpus)) {
    issues.push({ severity: "error", file: "package.json", message });
  }
  for (const kind of [".claude-plugin", ".codex-plugin"] as const) {
    const file = resolve(root, kind, "plugin.json");
    const pluginKeywords = await readKeywordList(file);
    if (!pluginKeywords) continue;
    for (const keyword of pluginKeywords.map((value) => value.trim().toLowerCase())) {
      if ((INTERNAL_ONLY_KEYWORDS as readonly string[]).includes(keyword)) {
        issues.push({
          severity: "error",
          file: relativeFile(root, file),
          message: `internal-only keyword ${keyword}`,
        });
      }
    }
  }
  return issues;
}
