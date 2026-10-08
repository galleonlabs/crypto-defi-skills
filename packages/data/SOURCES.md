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

- [AIXBT MCP](https://docs.aixbt.tech/developers/mcp), [API v3](https://docs.aixbt.tech/developers/v3), [OpenAPI contract](https://api.aixbt.tech/v3/openapi.yaml) and [research workflow](https://docs.aixbt.tech/developers/skill): reviewed 2026-09-05 for transport, authentication, resource identity and timestamp/score semantics. The separately published research skill is not vendored.
- [DeFi Native](https://github.com/emlai/defi-native-skill/tree/77aacfa0ee87de8c55082b13d1111f696d7bc22a): conceptual research input for yield payer, collateral, control and exit questions. Our concise diligence reference is independently authored; no upstream runtime, recommendation policy or dataset is imported.
- [Chainlink feed usage](https://docs.chain.link/data-feeds/using-data-feeds) and [Ethereum proof-of-stake](https://ethereum.org/en/developers/docs/consensus-mechanisms/pos/): primary documentation reviewed 2026-09-05 for feed fields, L2 sequencer considerations and chain-specific finality.

## Live public checks

At approximately 11:45 UTC on 2026-09-05, unauthenticated CoinGecko MCP initialize returned HTTP 200, protocol 2025-03-26 and server `coingecko_coingecko_typescript_api` v7.1.0. `tools/list` returned `execute` and `search_docs`, each with a read-only annotation. A single bounded `execute` of `client.simple.price.get` for Bitcoin/USD with `include_last_updated_at` returned a numeric price and timestamp. This establishes that operation only; the website's advertised large tool count was not assumed to match the deployed schema. Server tool annotations and execution isolation claims were not independently audited.

Unauthenticated DefiLlama MCP initialize returned HTTP 401 and OAuth protected-resource discovery metadata. No subscription login or paid tool call was attempted. Account-backed CoinGecko, local MCP packages and paid REST routes were researched but not authenticated or exercised.

Public CoinGecko simple-price REST and `coins.llama.fi/prices/current/coingecko:bitcoin` returned HTTP 200 with price and source timestamp. No wallet, order, payment, x402 spend or credential access occurred. Request/session material and volatile price values are excluded from this repository.

## Validation limits

Offline tests exercise malformed/stale/missing observations, HTTP access/rate/payment failures, redaction, body limits and timeout handling. Package validation and clean-consumer smoke establish portability. They do not measure agent research quality, validate every chain or prove a provider's uptime. Recheck live tools, schemas, plans and methodology before consequential use.

For AIXBT v0.2.0, public documentation and the live v3 OpenAPI contract were retrieved on 2026-09-05. Protected research reads, account entitlements and Hermes header resolution were not tested by this package release; consumer provisioning must verify them separately. No credentials were used in package validation.

## Primitive expansion - 2026-09-05

Add cross-primitive evidence, vault standards and portfolio accounting while preserving AIXBT research. The [research ledger](https://github.com/galleonlabs/crypto-defi-skills/blob/main/docs/research/report-source.md) records primary sources, public discovery and untested access paths. No authenticated financial actions were performed for this release.

## galleon-coingecko-token-research

Reviewed 2026-09-27; REST API v3. Documentation review does not prove an authenticated plan or all live endpoints.

- [Demo contract identity](https://docs.coingecko.com/demo/reference/coins-contract-address): platform and contract lookup.
- [Demo token price](https://docs.coingecko.com/demo/reference/simple-token-price): address-keyed prices and requested timestamps.
- [Pro token price](https://docs.coingecko.com/reference/simple-token-price): separate host and credential header.
- [Top pools](https://docs.coingecko.com/reference/top-pools-contract-address): onchain network and pool evidence.
- [API changelog](https://docs.coingecko.com/changelog): check schema changes before relying on nullable rank or ticker trust fields.

## galleon-defillama-yield-screen

Reviewed 2026-09-27. Public yields REST has no pinned semantic API version; retain observed schemas and fail clearly on changes.

- [DefiLlama API index](https://api-docs.defillama.com/): free and Pro endpoint separation, pools and history.
- [Yield adapter schema and methodology](https://github.com/DefiLlama/yield-server): APY units, optional decomposition, underlying tokens and lending TVL.
- [Provider update cadence](https://docs.llama.fi/faqs/frequently-asked-questions): nominal frequency, not per-row freshness proof.
- [Public yields API](https://yields.llama.fi/pools): live snapshot surface used by the recipe.

## Release verification 2026-09-27

- Keyless CoinGecko Ethereum USDC token-price GET succeeded with address-keyed USD price and provider UNIX timestamp. This tested public response shape, not authenticated Demo/Pro access or arbitrary token coverage.
- Public DefiLlama yields snapshot GET succeeded; the offline helper processed 17,143 rows and selected one `aave-v3` Base native-USDC pool above $1m TVL. The snapshot supplied no per-row observation time, retained as unknown. This was a data workflow probe, not yield diligence or a deposit test.
- Package check, offline failure tests, build and canonical skill validator passed. Automated tests do not make network calls.

## Market evidence and history - 2026-10-02

- [Current CoinGecko Demo market chart](https://docs.coingecko.com/demo/reference/coins-id-market-chart): daily UTC automatic granularity for more than 90 days, current 365-day Demo limit, documented Demo key requirement and completed-day timing. The helper makes a separate unauthenticated public probe; no account entitlement is inferred.
- [DefiLlama free API reference](https://api-docs.defillama.com/llms-free.txt): public current-price host and namespaces. CoinGecko-ID agreement may share upstream data.
- New offline tests cover bounded snapshots, raw-response hashes, partial/malformed/stale observations, time alignment, safe transport failures, daily sampling, gaps/range/freshness and compatibility with the independent strategy engine. No network calls run in tests.

At 06:43:24–25 UTC on 2026-10-02, the new keyless snapshot completed CoinGecko and DefiLlama Bitcoin/Ethereum reads with four valid observations aged 84–104 seconds. Their observation times aligned within the declared 120-second skew. The new Bitcoin 180-day history read produced 180 consecutive UTC-midnight aggregate observations from 2026-04-06 through 2026-10-02 and explicitly excluded the trailing current-day point. This verifies those bounded public reads only; no account entitlement, wallet action or provider-wide coverage is claimed. Volatile marks and response bodies are retained as local verification artifacts rather than packaged data.

## Ethereum agent tool review, 2026-10-08

[Onchain agent evidence sources](skills/galleon-defi-data/references/onchain-agents.md) document current primary Etherscan, Blockscout, Dune, GoldRush and Octav access, pagination, billing and freshness boundaries. Documentation was checked; this package did not authenticate to those services or perform paid queries.
