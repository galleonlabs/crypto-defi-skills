import { describe, expect, test } from "bun:test";
import { checkReadmeReleases } from "./check-readme-releases.ts";

const packs = [
  { id: "hyperliquid", name: "galleon-hyperliquid-skills", version: "0.3.4" },
  { id: "payments", name: "galleon-defi-payments-skills", version: "0.1.3" },
];
const row = (id: string, name: string, displayVersion: string, urlVersion = displayVersion) =>
  `| [${id}](packages/${id}) | [\`${name}@${displayVersion}\`](https://www.npmjs.com/package/${name}/v/${urlVersion}) | Coverage |`;
const readme = (...rows: string[]) => `# README\n\n## Independent packs\n\n${rows.join("\n")}\n\n## Install\n`;

describe("README release table", () => {
  test("accepts every package with matching display and URL versions", () => {
    expect(checkReadmeReleases(readme(
      row("hyperliquid", "galleon-hyperliquid-skills", "0.3.4"),
      row("payments", "galleon-defi-payments-skills", "0.1.3"),
    ), packs)).toEqual([]);
  });

  test("reports stale display and URL versions and a missing row", () => {
    const errors = checkReadmeReleases(readme(
      row("hyperliquid", "galleon-hyperliquid-skills", "0.3.3", "0.3.2"),
    ), packs);
    expect(errors).toContain("README: hyperliquid displays galleon-hyperliquid-skills@0.3.3; manifest is galleon-hyperliquid-skills@0.3.4");
    expect(errors).toContain("README: hyperliquid URL points to galleon-hyperliquid-skills@0.3.2; manifest is galleon-hyperliquid-skills@0.3.4");
    expect(errors).toContain("README: missing pack row payments");
  });
});
