import { lstat, readdir, readFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { parse } from "yaml";

export interface ValidationIssue {
  severity: "error" | "warning";
  file: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  root: string;
  skillCount: number;
  issues: ValidationIssue[];
}

interface SkillMetadata {
  name?: unknown;
  description?: unknown;
  license?: unknown;
  compatibility?: unknown;
  metadata?: unknown;
}

const SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function issue(
  issues: ValidationIssue[],
  severity: ValidationIssue["severity"],
  file: string,
  message: string,
): void {
  issues.push({ severity, file, message });
}

function parseFrontmatter(source: string): SkillMetadata {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match?.[1]) throw new Error("missing YAML frontmatter");
  const parsed: unknown = parse(match[1]);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("frontmatter must be a mapping");
  }
  return parsed as SkillMetadata;
}

function relativeFile(root: string, file: string): string {
  return relative(root, file).replaceAll("\\", "/");
}

async function checkMarkdownLinks(
  root: string,
  file: string,
  source: string,
  issues: ValidationIssue[],
): Promise<void> {
  const targets = [
    ...source.matchAll(/\[[^\]]*\]\(\s*(<[^>]*>|[^\s)]+)(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\s*\)/g),
    ...source.matchAll(/^\s{0,3}\[[^\]]+\]:\s*(<[^>]*>|[^\s]+)(?:\s+.*)?$/gm),
  ].map(match => match[1]?.trim());
  for (const rawTarget of targets) {
    if (!rawTarget) continue;
    const unwrapped = rawTarget.replace(/^<|>$/g, "");
    if (/^(?:https?:|mailto:|#)/i.test(unwrapped)) continue;
    const target = unwrapped.split("#", 1)[0];
    if (!target) continue;
    let decoded: string;
    try {
      decoded = decodeURIComponent(target);
    } catch {
      issue(issues, "error", relativeFile(root, file), `invalid relative link encoding: ${rawTarget}`);
      continue;
    }
    const resolved = resolve(dirname(file), decoded);
    const relativeTarget = relative(root, resolved);
    if (relativeTarget === ".." || relativeTarget.startsWith(`..${sep}`) || isAbsolute(relativeTarget)) {
      issue(issues, "error", relativeFile(root, file), `link escapes standalone skill: ${rawTarget}`);
      continue;
    }
    try {
      await lstat(resolved);
    } catch {
      issue(issues, "error", relativeFile(root, file), `broken relative link: ${rawTarget}`);
    }
  }
}

async function checkSkill(
  root: string,
  folder: string,
  names: Set<string>,
  issues: ValidationIssue[],
): Promise<void> {
  const skillFile = resolve(root, "skills", folder, "SKILL.md");
  let source: string;
  try {
    source = await readFile(skillFile, "utf8");
  } catch {
    issue(issues, "error", `skills/${folder}`, "missing SKILL.md");
    return;
  }

  const displayFile = relativeFile(root, skillFile);
  const lines = source.split(/\r?\n/).length;
  if (lines > 500) issue(issues, "error", displayFile, `SKILL.md has ${lines} lines; limit is 500`);

  let metadata: SkillMetadata;
  try {
    metadata = parseFrontmatter(source);
  } catch (error) {
    issue(issues, "error", displayFile, error instanceof Error ? error.message : String(error));
    return;
  }

  if (typeof metadata.name !== "string" || !SKILL_NAME.test(metadata.name) || metadata.name.length > 64) {
    issue(issues, "error", displayFile, "name must be 1 to 64 lowercase letters, numbers, or single hyphens");
  } else {
    if (metadata.name !== folder) issue(issues, "error", displayFile, "name must match its directory");
    if (names.has(metadata.name)) issue(issues, "error", displayFile, "skill name is duplicated");
    names.add(metadata.name);
  }

  if (
    typeof metadata.description !== "string" ||
    metadata.description.length === 0 ||
    metadata.description.length > 1024
  ) {
    issue(issues, "error", displayFile, "description must be 1 to 1024 characters");
  } else if (!/\bUse (?:when|only when)\b/.test(metadata.description)) {
    issue(issues, "warning", displayFile, "description should state when to use the skill");
  }

  if (typeof metadata.license !== "string" || metadata.license.length === 0) {
    issue(issues, "error", displayFile, "license is required");
  }
  if (metadata.compatibility !== undefined) {
    if (typeof metadata.compatibility !== "string" || metadata.compatibility.length > 500) {
      issue(issues, "error", displayFile, "compatibility must be a string of at most 500 characters");
    }
  }
  if (metadata.metadata !== undefined) {
    if (!metadata.metadata || typeof metadata.metadata !== "object" || Array.isArray(metadata.metadata)) {
      issue(issues, "error", displayFile, "metadata must be a string-to-string mapping");
    } else {
      for (const [key, value] of Object.entries(metadata.metadata)) {
        if (typeof value !== "string") {
          issue(issues, "error", displayFile, `metadata.${key} must be a string`);
        }
      }
    }
  }

  const skillRoot = resolve(root, "skills", folder);
  async function checkTree(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = resolve(directory, entry.name);
      if (entry.isSymbolicLink()) {
        issue(issues, "error", relativeFile(root, file), "standalone skills must not contain symlinks");
      } else if (entry.isDirectory()) await checkTree(file);
      else if (entry.name.endsWith(".md")) await checkMarkdownLinks(skillRoot, file, await readFile(file, "utf8"), issues);
    }
  }
  await checkTree(skillRoot);

  const openAiFile = resolve(root, "skills", folder, "agents", "openai.yaml");
  try {
    const openAi = parse(await readFile(openAiFile, "utf8")) as {
      interface?: { short_description?: unknown; default_prompt?: unknown };
    };
    const short = openAi.interface?.short_description;
    if (typeof short !== "string" || short.length < 25 || short.length > 64) {
      issue(issues, "error", relativeFile(root, openAiFile), "short_description must be 25 to 64 characters");
    }
    const prompt = openAi.interface?.default_prompt;
    if (typeof prompt !== "string" || typeof metadata.name !== "string" || !prompt.includes(`$${metadata.name}`)) {
      issue(issues, "error", relativeFile(root, openAiFile), "default_prompt must mention the skill as $skill-name");
    }
  } catch (error) {
    issue(
      issues,
      "error",
      relativeFile(root, openAiFile),
      `invalid or missing OpenAI metadata: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function validateCorpus(inputRoot: string): Promise<ValidationResult> {
  const root = resolve(inputRoot);
  const issues: ValidationIssue[] = [];
  const skillsRoot = resolve(root, "skills");
  let folders: string[] = [];

  try {
    if ((await lstat(skillsRoot)).isSymbolicLink()) {
      issue(issues, "error", "skills", "skills directory must not be a symlink");
      return { ok: false, root, skillCount: 0, issues };
    }
    const entries = await readdir(skillsRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isSymbolicLink()) issue(issues, "error", `skills/${entry.name}`, "standalone skills must not contain symlinks");
    }
    folders = entries.filter((entry) => entry.isDirectory() && !entry.name.startsWith(".")).map((entry) => entry.name).sort();
  } catch {
    issue(issues, "error", "skills", "skills directory is missing");
  }

  const names = new Set<string>();
  for (const folder of folders) await checkSkill(root, folder, names, issues);
  if (folders.length === 0) issue(issues, "error", "skills", "no skills found");

  return {
    ok: !issues.some((item) => item.severity === "error"),
    root,
    skillCount: folders.length,
    issues,
  };
}
