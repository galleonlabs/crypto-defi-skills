import { describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { root } from "../workspaces.ts";
import {
  classifyHref,
  evaluateProbe,
  evaluateRelative,
  extractLinks,
  externalHrefs,
  probeHref,
  summarize,
} from "./links.ts";

const mcpAlive = [
  "https://api-v2.pendle.finance/core/mcp",
  "https://mcp.api.coingecko.com/mcp",
  "https://mcp.jup.ag",
  "https://mcp.across.to/mcp",
  "https://mcp.revert.finance/mcp",
  "https://mcp.morpho.org/",
  "https://api.aixbt.tech/mcp",
  "https://api.1inch.com/mcp/protocol",
  "https://mcp.tenderly.co/mcp",
  "https://mcp.alchemy.com/mcp",
  "https://mcp.defillama.com/mcp",
  "https://agents.coinbase.com/mcp",
  "https://mcp.pro-api.coingecko.com/mcp",
  "https://docs.coingecko.com/mcp",
  "https://developers.jup.ag/docs/mcp",
  "https://docs.relay.link/mcp",
];

const apiAlive = [
  "https://api.hyperliquid.xyz",
  "https://liquidity.api.uniswap.org",
  "https://api.coingecko.com/api/v3/simple/price",
  "https://api.zerion.io/v1/wallets/{address}/positions/",
  "https://pro-openapi.debank.com/v1/user/complex_protocol_list",
  "https://kong.yearn.fi/api/gql",
];

const deadDocs = [
  "https://docs.ethena.fi/solution-overview/protocol-revenue-explanation/susde-rewards-mechanism",
  "https://drift-labs.github.io/protocol-v2/sdk/",
];

const eigencloud = [
  "https://docs.eigencloud.xyz/eigenlayer/restakers/restaking-guides/restaking-developer-guide",
  "https://docs.eigencloud.xyz/eigenlayer/restakers/restaking-guides/restaking-user-guide/liquid-restaking/withdraw-from-eigenlayer",
  "https://docs.eigencloud.xyz/eigenlayer/security/withdrawal-delay",
];

describe("link classification", () => {
  test("treats official documentation hosts as documentation", () => {
    for (const href of deadDocs) expect(classifyHref(href)).toBe("documentation");
    for (const href of eigencloud) expect(classifyHref(href)).toBe("documentation");
    expect(classifyHref("https://docs.ethena.fi/protocol-overview/rewards-mechanism")).toBe("documentation");
    expect(classifyHref("https://velocity-exchange.github.io/protocol-v2/sdk/")).toBe("documentation");
    expect(classifyHref("https://api-v2.pendle.finance/core/docs")).toBe("documentation");
  });

  test("probes MCP endpoints instead of treating them as pages", () => {
    for (const href of mcpAlive) expect(classifyHref(href)).toBe("mcp");
  });

  test("treats API and templated paths as endpoints", () => {
    for (const href of apiAlive) expect(classifyHref(href)).toBe("api");
  });

  test("does not treat git install specs as pages", () => {
    expect(classifyHref("git+https://github.com/velodrome-finance/sugar-sdk.git@v0.4.1")).toBe("install-spec");
    expect(classifyHref("https://github.com/velodrome-finance/sugar-sdk.git@v0.4.1")).toBe("install-spec");
    expect(externalHrefs("uvx --from git+https://github.com/velodrome-finance/sugar-sdk.git@v0.4.1 sugar pools")).toEqual([
      "git+https://github.com/velodrome-finance/sugar-sdk.git@v0.4.1",
    ]);
  });
});

describe("probe evaluation", () => {
  test("only documentation 404/410 is broken", () => {
    expect(evaluateProbe("documentation", { statusCode: 404 }).status).toBe("broken");
    expect(evaluateProbe("documentation", { statusCode: 410 }).status).toBe("broken");
    expect(evaluateProbe("documentation", { statusCode: 200 }).status).toBe("ok");
    expect(evaluateProbe("documentation", { statusCode: 403 }).status).toBe("unverifiable");
    expect(evaluateProbe("mcp", { statusCode: 404 }).status).toBe("ok");
    expect(evaluateProbe("mcp", { statusCode: 200 }).status).toBe("ok");
    expect(evaluateProbe("mcp", { statusCode: 401 }).status).toBe("ok");
    expect(evaluateProbe("mcp", { statusCode: 405 }).status).toBe("ok");
    expect(evaluateProbe("api", { statusCode: 404 }).status).toBe("ok");
    expect(evaluateProbe("api", { statusCode: 402 }).status).toBe("ok");
    expect(evaluateProbe("api", { statusCode: 422 }).status).toBe("ok");
    expect(evaluateProbe("api", { statusCode: 400 }).status).toBe("ok");
    expect(evaluateProbe("documentation", { error: "timeout", message: "aborted" }).status).toBe("unverifiable");
  });

  test("issue false positives stay out of broken", () => {
    const cases: Array<[string, number]> = [
      ...mcpAlive.map((href) => [href, 404] as [string, number]),
      ...apiAlive.map((href) => [href, 404] as [string, number]),
    ];
    for (const [href, statusCode] of cases) {
      const kind = classifyHref(href);
      expect(evaluateProbe(kind, { statusCode }).status).not.toBe("broken");
    }
    for (const href of eigencloud) {
      expect(evaluateProbe(classifyHref(href), { statusCode: 403 })).toEqual({
        status: "unverifiable",
        reason: "HTTP 403",
      });
    }
    expect(evaluateProbe("install-spec", { statusCode: 0 }).status).toBe("ok");
  });

  test("the two dead official docs evaluate as broken", () => {
    for (const href of deadDocs) {
        expect(evaluateProbe(classifyHref(href), { statusCode: 404 }).status).toBe("broken");
    }
  });
});

describe("repository surfaces", () => {
  test("relative package markdown links all resolve", async () => {
    const extracted = await extractLinks(root);
    const relative = await Promise.all(extracted.relative.map((link) => evaluateRelative(root, link)));
    expect(relative.length).toBeGreaterThan(0);
    expect(summarize(relative)).toEqual({ checked: relative.length, ok: relative.length, broken: 0, unverifiable: 0 });
  });

  test("missing relative markdown links are broken", async () => {
    const fixture = await mkdtemp(resolve(tmpdir(), "link-health-"));
    await mkdir(resolve(fixture, "packages", "sample", "skills", "demo"), { recursive: true });
    await writeFile(resolve(fixture, "packages", "sample", "README.md"), "See [missing](./nope.md).\n");
    await writeFile(resolve(fixture, "packages", "sample", "skills", "demo", "SKILL.md"), "See [ok](https://docs.example.com/).\n");
    const extracted = await extractLinks(fixture);
    const relative = await Promise.all(extracted.relative.map((link) => evaluateRelative(fixture, link)));
    expect(summarize(relative).broken).toBe(1);
  });
});

describe("MCP probing", () => {
  test("sends initialize POST for MCP endpoints", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const fetchImpl = (async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(url), init });
      return new Response("ok", { status: 200 });
    }) as typeof fetch;
    const result = await probeHref("https://mcp.jup.ag", "mcp", { timeoutMs: 1000, fetchImpl });
    expect(result).toEqual({ statusCode: 200 });
    expect(calls[0]?.init?.method).toBe("POST");
    expect(String(calls[0]?.init?.body)).toContain('"method":"initialize"');
  });

  test("does not POST documentation pages", async () => {
    const calls: Array<RequestInit | undefined> = [];
    const fetchImpl = (async (_url: string | URL | Request, init?: RequestInit) => {
      calls.push(init);
      return new Response("missing", { status: 404 });
    }) as typeof fetch;
    await probeHref(deadDocs[0]!, "documentation", { timeoutMs: 1000, fetchImpl });
    expect(calls[0]?.method ?? "GET").toBe("GET");
  });
});

