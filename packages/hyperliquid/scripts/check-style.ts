import { readdir, readFile } from "node:fs/promises";
import { extname, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const textExtensions = new Set([".json", ".md", ".mjs", ".ts", ".yaml", ".yml"]);
const skipped = new Set([".git", "artifacts", "dist", "node_modules"]);
const slopTerms = [
  ["cutting", "edge"].join("-"),
  ["game", "changing"].join("-"),
  ["in", "today's", "fast-paced"].join(" "),
  "revolution" + "ary",
  "seamless" + "ly",
  ["unlock", "the", "power"].join(" "),
];
const slop = slopTerms.map((term) => new RegExp(`\\b${term}\\b`, "i"));
const placeholder = new RegExp(`\\b(?:${["TO" + "DO", "T" + "BD", "FIX" + "ME"].join("|")})\\b`);
const failures: string[] = [];

async function walk(directory: string): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (skipped.has(entry.name) || entry.name === "bun.lock") continue;
    const file = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(file);
      continue;
    }
    if (!entry.isFile() || !textExtensions.has(extname(entry.name))) continue;
    const source = await readFile(file, "utf8");
    const display = relative(root, file);
    if (source.includes("\u2014")) failures.push(`${display}: em dash`);
    if (placeholder.test(source)) failures.push(`${display}: placeholder marker`);
    for (const pattern of slop) if (pattern.test(source)) failures.push(`${display}: banned filler ${pattern.source}`);
    if (!source.endsWith("\n")) failures.push(`${display}: missing final newline`);
    source.split(/\r?\n/).forEach((line, index) => {
      if (/\s+$/.test(line)) failures.push(`${display}:${index + 1}: trailing whitespace`);
    });
  }
}

await walk(root);
if (failures.length > 0) {
  for (const failure of failures) process.stderr.write(`${failure}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write("style: clean\n");
}
