import { afterEach, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { checkAttribution } from "../scripts/check-attribution.ts";

const temporary: string[] = [];
const packagePath = "packages/example";
const skillPath = `${packagePath}/skills/example`;
const license = await readFile(resolve(import.meta.dirname, "../LICENSE"), "utf8");
const attribution = "Created by Andrew Wilkinson and Galleon Labs. Distributed under the MIT license. Original source: https://github.com/galleonlabs/crypto-defi-skills. Preserve applicable third-party notices.";

afterEach(async () => {
  await Promise.all(temporary.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function fixture() {
  const root = await mkdtemp(resolve(tmpdir(), "skills-attribution-"));
  temporary.push(root);
  await mkdir(resolve(root, skillPath), { recursive: true });
  for (const directory of ["", packagePath, skillPath]) {
    await writeFile(resolve(root, directory, "LICENSE"), license);
    await writeFile(resolve(root, directory, "ATTRIBUTION.md"), attribution);
  }
  await writeFile(resolve(root, skillPath, "SKILL.md"), "---\nname: example\ndescription: A functional example.\n---\nUse official tools.\n");
  await writeFile(resolve(root, packagePath, "package.json"), JSON.stringify({ name: "example", license: "MIT", files: ["skills", "ATTRIBUTION.md"] }));
  return root;
}

function git(root: string, ...args: string[]) {
  const result = spawnSync("git", ["-c", "user.name=Attribution Test", "-c", "user.email=attribution@example.invalid", "-c", "commit.gpgSign=false", ...args], { cwd: root, encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr);
}

test("standalone distribution cannot lose its license or source attribution", async () => {
  const root = await fixture();
  expect((await checkAttribution({ root })).skillCount).toBe(1);
  await rm(resolve(root, skillPath, "LICENSE"));
  await expect(checkAttribution({ root })).rejects.toThrow(`${skillPath}/LICENSE`);
  await writeFile(resolve(root, skillPath, "LICENSE"), license);
  await writeFile(resolve(root, skillPath, "ATTRIBUTION.md"), "# Attribution\nTODO");
  await expect(checkAttribution({ root })).rejects.toThrow(`${skillPath}/ATTRIBUTION.md`);
});

test("changing all matching copyright copies cannot erase original authorship", async () => {
  const root = await fixture();
  for (const directory of ["", packagePath, skillPath]) {
    await writeFile(resolve(root, directory, "LICENSE"), license.replace("2026 Galleon Labs", "2026 Anonymous"));
  }
  await expect(checkAttribution({ root })).rejects.toThrow("original copyright notices");
});

test("retaining the title and copyright without MIT permission is insufficient", async () => {
  const root = await fixture();
  const shortened = license.replace("copies or substantial portions of the Software.", "copies.");
  await writeFile(resolve(root, packagePath, "LICENSE"), shortened);
  await writeFile(resolve(root, skillPath, "LICENSE"), shortened);
  await expect(checkAttribution({ root })).rejects.toThrow("complete standard MIT");
});

test("npm file allowlist must ship attribution alongside every skill", async () => {
  const root = await fixture();
  await writeFile(resolve(root, packagePath, "package.json"), JSON.stringify({ license: "MIT", files: ["skills"] }));
  await expect(checkAttribution({ root })).rejects.toThrow("include ATTRIBUTION.md");
  await writeFile(resolve(root, packagePath, "package.json"), JSON.stringify({ license: "MIT", files: ["skills", "ATTRIBUTION.md", "!skills/**/LICENSE"] }));
  await expect(checkAttribution({ root })).rejects.toThrow("complete skills directory");
});

test("archive validation uses committed notices even when the working tree disagrees", async () => {
  const root = await fixture();
  git(root, "init", "--quiet");
  git(root, "add", ".");
  git(root, "commit", "--quiet", "-m", "Valid distribution");
  await rm(resolve(root, skillPath, "LICENSE"));
  expect((await checkAttribution({ root, revision: "HEAD" })).skillCount).toBe(1);
  await expect(checkAttribution({ root })).rejects.toThrow(`${skillPath}/LICENSE`);
  git(root, "add", "-u");
  git(root, "commit", "--quiet", "-m", "Missing committed notice");
  await writeFile(resolve(root, skillPath, "LICENSE"), license);
  expect((await checkAttribution({ root })).skillCount).toBe(1);
  await expect(checkAttribution({ root, revision: "HEAD" })).rejects.toThrow(`${skillPath}/LICENSE`);
});
