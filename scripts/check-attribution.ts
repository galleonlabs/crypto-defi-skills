import { spawnSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const permission = `Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;
const requiredCopyright = "Copyright (c) 2026 Galleon Labs";
const normalize = (text: string) => text.replace(/\s+/g, " ").trim();

/** Use revision for release archives: their notices must come from the same Git snapshot. */
export async function checkAttribution(options: { root: string; revision?: string }) {
  const { root, revision } = options;
  const git = (args: string[]) => {
    const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
    if (result.status !== 0) throw new Error(`Attribution: cannot read ${revision} source (${args[0]})`);
    return result.stdout;
  };
  // Resolve once so concurrent commits cannot mix the checked source revisions.
  const commit = revision ? git(["rev-parse", "--verify", `${revision}^{commit}`]).trim() : undefined;
  const read = async (path: string) => {
    try {
      return commit ? git(["show", `${commit}:${path}`]) : await readFile(resolve(root, path), "utf8");
    } catch {
      throw new Error(`Attribution: missing or unreadable ${path}${commit ? ` in ${commit}` : ""}`);
    }
  };
  const directories = async (path: string) => commit
    ? git(["ls-tree", "-d", "--name-only", `${commit}:${path}`]).trim().split("\n").filter(Boolean)
    : (await readdir(resolve(root, path), { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();

  const license = async (path: string, retainedNotices: string[] = []) => {
    const text = await read(path);
    const lines = text.split(/\r?\n/);
    const notices = lines.filter((line) => line.startsWith("Copyright "));
    if (!notices.includes(requiredCopyright) || retainedNotices.some((notice) => !notices.includes(notice))) {
      throw new Error(`Attribution: ${path} must retain the original copyright notices`);
    }
    const terms = lines.filter((line) => !line.startsWith("Copyright ")).join("\n");
    if (normalize(terms) !== normalize(`MIT License\n${permission}`)) {
      throw new Error(`Attribution: ${path} must retain the complete standard MIT permission and warranty notice`);
    }
    return { text, notices };
  };
  const attribution = async (path: string) => {
    const text = await read(path);
    if (text.trim().length < 100 || !/Andrew Wilkinson/i.test(text) || !/Galleon Labs/i.test(text)
      || !/https:\/\/github\.com\/galleonlabs\/crypto-defi-skills(?:[\s/)#.,\]>]|$)/i.test(text) || !/\bMIT\b/.test(text)) {
      throw new Error(`Attribution: ${path} must identify the authors, MIT license, and original repository source`);
    }
  };

  const original = await license("LICENSE");
  await attribution("ATTRIBUTION.md");
  const packageDirectories: string[] = [];
  let skillCount = 0;
  for (const name of await directories("packages")) {
    const directory = `packages/${name}`;
    const manifest = JSON.parse(await read(`${directory}/package.json`));
    const files = Array.isArray(manifest.files) ? manifest.files : [];
    if (manifest.license !== "MIT" || !files.some((entry: unknown) => typeof entry === "string" && /^(?:\.\/)?ATTRIBUTION\.md$/.test(entry))
      || !files.some((entry: unknown) => typeof entry === "string" && /^(?:\.\/)?skills(?:\/(?:\*\*)?)?$/.test(entry))
      || files.some((entry: unknown) => typeof entry === "string" && /^!(?:\.\/)?(?:skills(?:\/|$)|ATTRIBUTION\.md$)/.test(entry))) {
      throw new Error(`Attribution: ${directory}/package.json must declare MIT and include ATTRIBUTION.md and the complete skills directory in npm files`);
    }
    const pack = await license(`${directory}/LICENSE`, original.notices);
    await attribution(`${directory}/ATTRIBUTION.md`);
    const skills = await directories(`${directory}/skills`);
    if (skills.length === 0) throw new Error(`Attribution: ${directory} has no standalone skills to validate`);
    for (const skill of skills) {
      const path = `${directory}/skills/${skill}`;
      await read(`${path}/SKILL.md`);
      const standalone = await read(`${path}/LICENSE`);
      if (standalone.replace(/\r\n/g, "\n").trim() !== pack.text.replace(/\r\n/g, "\n").trim()) {
        throw new Error(`Attribution: ${path}/LICENSE must match its package LICENSE`);
      }
      await attribution(`${path}/ATTRIBUTION.md`);
      skillCount++;
    }
    packageDirectories.push(directory);
  }
  if (packageDirectories.length === 0) throw new Error("Attribution: no packages found");
  return { packageDirectories, skillCount, commit };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length === 1 && args[0] !== "--head")) throw new Error("Usage: bun scripts/check-attribution.ts [--head]");
  const result = await checkAttribution({ root: resolve(import.meta.dirname, ".."), revision: args[0] ? "HEAD" : undefined });
  process.stdout.write(`attribution: ${result.packageDirectories.length} packages, ${result.skillCount} standalone skills${result.commit ? ` at ${result.commit}` : ""}\n`);
}
