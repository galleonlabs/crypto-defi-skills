import { readFile, readdir, realpath } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { parse } from "yaml";

export async function validate(root: string) {
  const issues: string[] = [];
  const packageRoot = await realpath(root);
  const manifest = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
  const entries = await readdir(resolve(root, "skills"), { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.isSymbolicLink()) { issues.push("Unexpected skills entry"); continue; }
    const skillRoot = resolve(packageRoot, "skills", entry.name);
    const pending = [resolve(skillRoot, "SKILL.md")];
    const visited = new Set<string>();
    while (pending.length) {
      const path = pending.pop()!;
      if (visited.has(path)) continue;
      visited.add(path);
      const body = await readFile(path, "utf8");
      if (path.endsWith("SKILL.md")) {
        const front = body.match(/^---\n([\s\S]*?)\n---\n/);
        const meta = front ? parse(front[1]!) : {};
        if (meta.name !== entry.name || !meta.description || meta.metadata?.version !== manifest.version) issues.push("Skill metadata mismatch");
      }
      for (const match of body.matchAll(/\]\(([^)]+)\)/g)) {
        const link = match[1]!;
        if (/^(?:https?:|#)/.test(link)) continue;
        try {
          const target = await realpath(resolve(dirname(path), link.split("#")[0]!));
          if (!target.startsWith(skillRoot + sep)) issues.push("Skill link escapes standalone directory");
          else if (target.endsWith(".md")) pending.push(target);
        } catch { issues.push("Missing local skill link"); }
      }
    }
  }
  for (const kind of [".claude-plugin", ".codex-plugin"]) {
    const plugin = JSON.parse(await readFile(resolve(root, kind, "plugin.json"), "utf8"));
    if (plugin.name !== manifest.name || plugin.version !== manifest.version) issues.push("Plugin identity mismatch");
  }
  return { ok: issues.length === 0 && entries.length > 0, skillCount: entries.length, issues };
}
