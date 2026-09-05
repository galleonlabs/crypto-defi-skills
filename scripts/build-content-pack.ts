import { chmod, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

export async function buildContentPack(root: string): Promise<void> {
  await rm(resolve(root, "dist"), { recursive: true, force: true });
  const result = await Bun.build({ entrypoints: [resolve(root, "src/index.ts"), resolve(root, "src/cli.ts")], outdir: resolve(root, "dist"), target: "node", format: "esm" });
  if (!result.success) throw new Error(result.logs.map(String).join("\n"));
  const types = spawnSync("bunx", ["tsc", "-p", "tsconfig.build.json"], { cwd: root, stdio: "inherit" });
  if (types.status !== 0) throw new Error("Declaration build failed");
  await chmod(resolve(root, "dist/cli.js"), 0o755);
}
if (import.meta.main) await buildContentPack(process.cwd());
