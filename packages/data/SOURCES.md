# Sources and verification

Reviewed 2026-09-05. These are independently authored procedures; no provider runtime or paid data corpus is redistributed.

## Primary sources

- [CoinGecko AI Agents & LLM Apps](https://docs.coingecko.com/docs/ai-agents-llm-apps): maintained SDK/MCP access and query patterns.
- [CoinGecko MCP](https://docs.coingecko.com/ai-integration/mcp-server): keyless versus account-backed servers, transports, official local MCP and environment names.
- [CoinGecko simple price](https://docs.coingecko.com/reference/simple-price): identity and timestamp fields; [methodology](https://www.coingecko.com/en/methodology): aggregate data definitions.
- [DefiLlama MCP](https://defillama.com/mcp): OAuth, API subscription, credit use and single-client constraint.
- [DefiLlama official setup source](https://github.com/DefiLlama/defillama-skills/blob/f286bda4498ec8da4eb57bfba8ab40c188860e8e/defillama-setup/SKILL.md): reviewed at commit `f286bda4498ec8da4eb57bfba8ab40c188860e8e`; upstream workflow reuse remains optional and preserves our distinct skill name.
- [DefiLlama API docs](https://api-docs.defillama.com/), [free API reference](https://api-docs.defillama.com/llms-free.txt), and [yield adapters](https://github.com/DefiLlama/yield-server): free/paid separation, endpoint hosts, metric provenance.
- [Hermes MCP CLI](https://github.com/NousResearch/hermes-agent/blob/2e24e06e5513fa425ccf935d2e41991cb11ff383/hermes_cli/subcommands/mcp.py) and [configuration](https://github.com/NousResearch/hermes-agent/blob/2e24e06e5513fa425ccf935d2e41991cb11ff383/hermes_cli/mcp_config.py): native remote, OAuth, discovery and profile configuration at `2e24e06e5513fa425ccf935d2e41991cb11ff383`.

## Live public checks

At approximately 11:45 UTC on 2026-09-05, unauthenticated CoinGecko MCP initialize returned HTTP 200, protocol 2025-03-26 and server `coingecko_coingecko_typescript_api` v7.1.0. `tools/list` returned `execute` and `search_docs`, each with a read-only annotation. A single bounded `execute` of `client.simple.price.get` for Bitcoin/USD with `include_last_updated_at` returned a numeric price and timestamp. This establishes that operation only; the website's advertised large tool count was not assumed to match the deployed schema. Server tool annotations and execution isolation claims were not independently audited.

Unauthenticated DefiLlama MCP initialize returned HTTP 401 and OAuth protected-resource discovery metadata. No subscription login or paid tool call was attempted. Account-backed CoinGecko, local MCP packages and paid REST routes were researched but not authenticated or exercised.

Public CoinGecko simple-price REST and `coins.llama.fi/prices/current/coingecko:bitcoin` returned HTTP 200 with price and source timestamp. No wallet, order, payment, x402 spend or credential access occurred. Request/session material and volatile price values are excluded from this repository.

## Validation limits

Offline tests exercise malformed/stale/missing observations, HTTP access/rate/payment failures, redaction, body limits and timeout handling. Package validation and clean-consumer smoke establish portability. They do not measure agent research quality, validate every chain or prove a provider's uptime. Recheck live tools, schemas, plans and methodology before consequential use.
