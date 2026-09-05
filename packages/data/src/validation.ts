import { lstat, readdir, readFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
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
  const matches = source.matchAll(/\[[^\]]*\]\(([^)]+)\)/g);
  for (const match of matches) {
    const rawTarget = match[1]?.trim();
    if (!rawTarget || /^(?:https?:|mailto:|#)/.test(rawTarget)) continue;
    const target = rawTarget.replace(/^<|>$/g, "").split("#", 1)[0];
    if (!target) continue;
    const resolved = resolve(dirname(file), decodeURIComponent(target));
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

  await checkMarkdownLinks(root, skillFile, source, issues);

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
    const entries = await readdir(skillsRoot, { withFileTypes: true });
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
