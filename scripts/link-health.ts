import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  classifyLink,
  evaluateProbe,
  evaluateRelative,
  extractLinks,
  formatReport,
  mapPool,
  probeHref,
  summarize,
  type EvaluatedLink,
} from "./link-health/links.ts";

const root = resolve(process.argv.includes("--root") ? process.argv[process.argv.indexOf("--root") + 1]! : process.cwd());
const offline = process.argv.includes("--offline");
const json = process.argv.includes("--json");
const summaryFlag = process.argv.indexOf("--summary");
const summaryPath = summaryFlag >= 0 ? process.argv[summaryFlag + 1] : undefined;
const timeoutMs = Number(flagValue("--timeout") ?? 20_000);
const concurrency = Number(flagValue("--concurrency") ?? 8);

function flagValue(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const extracted = await extractLinks(root);
const relative = await Promise.all(extracted.relative.map((link) => evaluateRelative(root, link)));
let external: EvaluatedLink[];
if (offline) {
  external = extracted.external.map((link) => {
    const classified = classifyLink(link);
    return { ...classified, status: "unverifiable" as const, reason: "offline" };
  });
} else {
  const classified = extracted.external.map(classifyLink);
  external = await mapPool(classified, concurrency, async (link) => {
    const probe = await probeHref(link.href, link.kind, { timeoutMs });
    const verdict = evaluateProbe(link.kind, probe);
    return {
      ...link,
      ...verdict,
      statusCode: "statusCode" in probe ? probe.statusCode : undefined,
    };
  });
}

const payload = {
  external: { ...summarize(external), links: external },
  relative: { ...summarize(relative), links: relative },
};
process.stdout.write(json ? `${JSON.stringify(payload, null, 2)}\n` : formatReport(external, relative));
if (summaryPath) {
  const ext = summarize(external);
  const rel = summarize(relative);
  const broken = [...external, ...relative].filter((link) => link.status === "broken");
  const lines = [
    "## Link health",
    "",
    `| Surface | Checked | Ok | Broken | Unverifiable |`,
    `| --- | ---: | ---: | ---: | ---: |`,
    `| External skill URLs | ${ext.checked} | ${ext.ok} | ${ext.broken} | ${ext.unverifiable} |`,
    `| Relative package markdown | ${rel.checked} | ${rel.ok} | ${rel.broken} | ${rel.unverifiable} |`,
    "",
  ];
  if (broken.length > 0) {
    lines.push("Broken:", "");
    for (const link of broken) lines.push(`- \`${link.file}\` ${link.href} (${link.reason})`);
    lines.push("");
  }
  await mkdir(dirname(resolve(summaryPath)), { recursive: true });
  await writeFile(resolve(summaryPath), `${lines.join("\n")}\n`, { flag: "a" });
}

const broken = summarize(relative).broken + (offline ? 0 : summarize(external).broken);
if (broken > 0) process.exitCode = 1;
