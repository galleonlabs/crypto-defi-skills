import {lstat, readFile} from "node:fs/promises";
import {resolve} from "node:path";

export async function readSkillFile(root: string, name: string): Promise<string> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) throw new Error("show requires an exact skill name");
  const skills = resolve(root, "skills");
  const directory = resolve(skills, name);
  const file = resolve(directory, "SKILL.md");
  for (const path of [skills, directory, file]) {
    if ((await lstat(path)).isSymbolicLink()) throw new Error("show does not follow skill symlinks");
  }
  return readFile(file, "utf8");
}
