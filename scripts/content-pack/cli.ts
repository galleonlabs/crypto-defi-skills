import { lstat, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { validateCorpus } from "./validation.ts";

export async function runCli(root: string, skills: readonly { name: string; purpose: string }[]): Promise<void> {
  const print = (value: unknown) => process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
  try {
    const manifest = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
    const [command = "help", ...args] = process.argv.slice(2);
    if (["--version", "version"].includes(command) && !args.length) process.stdout.write(`${manifest.version}\n`);
    else if (command === "catalog") {
      if (args.some(arg => arg !== "--json")) throw new Error("catalog accepts only --json");
      print({ ok: true, skills });
    } else if (command === "show") {
      if (args.length !== 1 || !skills.some(skill => skill.name === args[0])) throw new Error("show requires an exact name from catalog");
      const skillFile = resolve(root, "skills", args[0]!, "SKILL.md");
      for (const path of [resolve(root, "skills"), resolve(root, "skills", args[0]!), skillFile]) {
        if ((await lstat(path)).isSymbolicLink()) throw new Error("show does not follow skill symlinks");
      }
      process.stdout.write(await readFile(skillFile, "utf8"));
    } else if (command === "validate") {
      if (args.filter(arg => arg !== "--json").length > 1 || args.some(arg => arg.startsWith("--") && arg !== "--json")) throw new Error("validate accepts [path] [--json]");
      const result = await validateCorpus(args.find(arg => arg !== "--json") ?? root);
      print(result);
      if (!result.ok) process.exitCode = 1;
    } else if (["help", "--help", "-h"].includes(command) && !args.length) {
      process.stdout.write(`${Object.keys(manifest.bin)[0]} ${manifest.version}\n\nCommands:\n  catalog [--json]\n  show <skill-name>\n  validate [path] [--json]\n  --version\n\nLocal corpus tools; no network calls or wallet actions.\n`);
    } else throw new Error("Unknown command or arguments; use --help");
  } catch (error) {
    print({ ok: false, error: error instanceof Error ? error.message : "Command failed" });
    process.exitCode = 1;
  }
}
