import { expect, test } from "bun:test";
import { cp, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
// Standalone JavaScript is intentionally dependency-free for installed Agent Skills.
// @ts-expect-error portable script has no separate declaration file
import { summarize } from "../skills/hyperliquid-setup/scripts/market-snapshot.mjs";
import fixture from "./fixtures/market.json";

const root = resolve(import.meta.dirname, "..");
test("snapshot distinguishes fixture provenance and checks current live book time", () => {
  const result = summarize(fixture.metaAndAssetCtxs, fixture.l2Book, "ETH", "fixture");
  expect(result.source).toBe("fixture");
  expect(result.book.ageMs).toBeNull();
  expect(result.markPrice).toBe(3000.1);
  expect(() => summarize(fixture.metaAndAssetCtxs, fixture.l2Book, "ETH", "live", fixture.l2Book.time + 61000)).toThrow();
  expect(summarize(fixture.metaAndAssetCtxs, fixture.l2Book, "ETH", "live", fixture.l2Book.time + 1000).book.ageMs).toBe(1000);
});
test("malformed, wrong-market, empty and crossed responses fail closed", () => {
  for (const change of [
    (v: any) => { v.metaAndAssetCtxs[1][0].markPx = "0xff"; },
    (v: any) => { v.metaAndAssetCtxs[1][0].dayNtlVlm = "-1"; },
    (v: any) => { v.metaAndAssetCtxs[1][0].openInterest = "-1"; },
    (v: any) => { v.l2Book.coin = "BTC"; },
    (v: any) => { v.l2Book.levels[0] = []; },
    (v: any) => { v.l2Book.levels[0][0].px = "NaN"; },
    (v: any) => { v.l2Book.levels[0][0].px = "4000"; },
    (v: any) => { v.metaAndAssetCtxs[1] = []; },
  ]) {
    const v = structuredClone(fixture); change(v);
    expect(() => summarize(v.metaAndAssetCtxs, v.l2Book, "ETH", "fixture")).toThrow();
  }
});
test("setup works from an independently copied skill without repository dependencies", async () => {
  const directory = await mkdtemp(join(tmpdir(), "hl-standalone-"));
  try {
    await cp(join(root, "skills/hyperliquid-setup"), join(directory, "skill"), { recursive: true });
    const child = Bun.spawn(["node", join(directory, "skill/scripts/market-snapshot.mjs"), "--coin", "ETH", "--fixture", join(root, "test/fixtures/market.json")], { cwd: directory, stdout: "pipe", stderr: "pipe" });
    const text = await new Response(child.stdout).text();
    expect(await child.exited).toBe(0);
    expect(JSON.parse(text).source).toBe("fixture");
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test("every installed skill's local markdown links resolve inside that skill", async () => {
  for (const skill of await readdir(join(root, "skills"))) {
    const base = join(root, "skills", skill);
    async function walk(dir: string): Promise<void> {
      for (const item of await readdir(dir, { withFileTypes: true })) {
        const file = join(dir, item.name);
        if (item.isDirectory()) await walk(file);
        else if (item.name.endsWith(".md")) {
          for (const match of (await readFile(file, "utf8")).matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
            const target = match[1]!;
            if (/^(https?:|mailto:|#)/.test(target)) continue;
            const path = resolve(dir, target.split("#")[0]!);
            expect(path.startsWith(base + "/")).toBe(true);
            expect(await Bun.file(path).exists()).toBe(true);
          }
        }
      }
    }
    await walk(base);
  }
});
