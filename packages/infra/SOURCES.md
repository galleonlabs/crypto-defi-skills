# Sources and verification

Reviewed 2026-09-05. Guidance is independently authored; provider runtimes and signer code are not copied into this package. Provider feature availability, tool catalogs, endpoints and versions can change. Live credentials, wallet setup and paid requests were not exercised.

## Official documentation

- [Alchemy AI agents](https://www.alchemy.com/ai-agents): provider product scope and official tool links.
- [Alchemy DeFi agent overview](https://www.alchemy.com/overviews/defi-ai-agents): architecture context, separate data/custody/policy/payment layers.
- [Alchemy MCP](https://www.alchemy.com/docs/alchemy-mcp-server): OAuth Streamable HTTP endpoint, app selection, read/admin/wallet tool distinctions.
- [Alchemy CLI](https://www.alchemy.com/docs/alchemy-cli): supported configuration variables and machine-readable command surface.
- [Alchemy Agent Wallets](https://www.alchemy.com/docs/agent-wallets): session custody, expiry, capabilities and smart-wallet execution limits.
- [Alchemy x402](https://www.alchemy.com/docs/x402-payments): quote inspection and bounded provider-managed payments.
- [Coinbase for Agents](https://docs.cdp.coinbase.com/x402/agentic-accounts/coinbase-for-agents): isolated account portfolio and forthcoming account x402 support.
- [Coinbase Agentic Wallet](https://docs.cdp.coinbase.com/x402/agentic-accounts/agentic-wallet): managed wallet and current x402 access.
- [Coinbase CLI and remote MCP](https://docs.cdp.coinbase.com/coinbase-for-agents/overview): remote harness allowlist, portfolio/key onboarding and supported operations.
- [Agentic Wallet CLI](https://docs.cdp.coinbase.com/agentic-wallet/cli/quickstart): email/OTP creation flow, chain flags and Node 24+ documented prerequisite.
- [Agentic Wallet MCP](https://docs.cdp.coinbase.com/agentic-wallet/mcp/quickstart): operator installer and separate account/payment steps.
- [Hermes upstream](https://github.com/NousResearch/hermes-agent/tree/2e24e06e): native home/skills and MCP configuration. The consuming Boomkin project owns runtime installation and integration validation; this package does not fork Hermes.

## Reviewed public distributions

| Package | Version | Evidence |
| --- | --- | --- |
| `@alchemy/cli` | 0.24.0 | npm metadata; Node >=22; official documented CLI and environment surface |
| `@coinbase/coinbase-cli` | 0.0.7 | npm tarball, MIT, Node >=22; inspected bundled configuration and stdio server; `mcp --help`, initialize and tools/list executed without credentials or account calls |
| `awal` | 2.12.1 | npm tarball and current quickstart; npm engines >=18 differs from documented Node 24+ requirement; OS-based storage inspected, no portable profile override established |
| `@coinbase/payments-mcp` | 1.0.5 | npm tarball; installer generates Node plus installed `bundle.js` stdio config and downloads a separately versioned runtime; installer not executed |

Coinbase CLI 0.0.7 discovery returned 32 tools. Only initialize, notification and tool-list messages were sent. Its configuration supports `COINBASE_CONFIG_DIR` and `COINBASE_ENV`; OS keyring service is `coinbase-cli` with secrets keyed by environment name, so profile integration requires unique environment names. No existing credential files or account state were read. The `live-` environment prefix resolves to official production endpoints; this is configuration behavior, not authority to trade.

Tarball integrity (npm metadata):

- `@alchemy/cli@0.24.0`: `sha512-OFJMX9ZdC+T6SUYhws81uGSEBNQJvvg8jgnULHJX0dPiCEdvfAXDgKehykghuXLSPvdBh7w5XV53Y3n58VnT6g==`
- `@coinbase/coinbase-cli@0.0.7`: `sha512-DsDQbL16py6Ot+g90PmT957GelzvFNHD9P3gyM37y2vMaUT1j5QJ/jo5a58AAIKVUd2G1fj6lfQ7SHFRv5gUFA==`
- `awal@2.12.1`: `sha512-z4whchSMbUhDuhwoI/+7vZ1ArwG9e8C9yIX9Y3W+JXJkR3E95iIZ1vIBZ6nPWSzakCw21YuZhFvOpGKEXtN6kQ==`
- `@coinbase/payments-mcp@1.0.5`: `sha512-SqUAAyn8VLNaSIoGj20dhnqXB1mNSr08fMSlxuk5Ztep/E2iqgKJC6qMm31deqjWZfpBtI6qMdzyUxbIfs/Cjg==`

## Validation boundary

The local diagnostic uses standard EVM JSON-RPC reads and is tested against deterministic provider fixtures, including HTTP 402, rate limits, wrong chain, malformed state, oversized responses and secret-bearing exceptions. Those checks do not certify a production provider or wallet. Package validation covers frontmatter, version agreement and self-contained local links; it is not a measured skill-routing benchmark.

## Primitive expansion — 2026-09-05

Expand official DeFi tool selection, Hermes progressive disclosure and EVM/Solana transaction context. The [research ledger](https://github.com/galleonlabs/crypto-defi-skills/blob/main/docs/research/report-source.md) records primary sources, public discovery and untested access paths. No authenticated financial actions were performed for this release.
