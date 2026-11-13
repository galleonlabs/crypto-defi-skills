# Managed wallets and Coinbase account access

Select one model matching the user's task. Do not silently replace an existing wallet or import a raw key to simplify setup.

| Surface | What it controls | Setup distinction |
| --- | --- | --- |
| Alchemy Agent Wallet | Provider-held keys through an approved session | Operator authorizes `alchemy wallet connect --mode session`; check session expiry, wallet address and actual limits |
| Coinbase for Agents | Coinbase Advanced Trade account access, optionally scoped to a separate spot portfolio | Existing Coinbase account and explicit portfolio permissions; not a general DeFi contract signer |
| Coinbase Wallet MCP | An existing Coinbase Wallet through the hosted MCP | OAuth connection; each write has a separate approval flow |
| Legacy Agentic Wallet CLI | An existing `awal` installation | Inspect its installed version/help; current Coinbase docs no longer cover this CLI |

[Alchemy Agent Wallets](https://www.alchemy.com/docs/agent-wallets) keep the signer behind a dashboard-approved session. Prefer the session route over local key creation. `alchemy wallet status --verify` checks an existing backend session; status alone does not approve a transaction. Revoke through the provider's session controls when the mandate expires. Its EVM session uses smart-wallet calls; it does not expose raw transaction signing. Sponsorship policies control fees, not wallet spending.

[Coinbase for Agents setup](https://docs.cdp.coinbase.com/ai-agents/coinbase-for-agents/coinbase-mcp) still allowlists remote OAuth MCP clients; its current list includes Hermes. Reuse a supported existing connector; custom clients outside that list should use the official CLI rather than assuming registration grants access. Verified CLI: `@coinbase/coinbase-cli@0.0.7`, Node 22+. An operator configures a deliberately scoped key using `coinbase env live --key-file <private-file>`; `coinbase balance` and `coinbase portfolios list` check access. Keep key files outside the repo and verify secure credential storage on the target OS. Choose the intended spot portfolio rather than silently granting the default portfolio; derivatives have different portfolio constraints. Do not enable trading or transfer permissions just to read balances.

For a legacy `awal` installation, preserve its existing account and inspect the installed version and help before using a bounded read. The former Agentic Wallet CLI/MCP quickstarts and x402 wallet page returned 404 on 2026-11-13. `awal` remains on npm without a deprecation notice; this does not establish current documented support or prove that Wallet MCP is a renamed CLI. Do not auto-upgrade, run email/OTP login, create a replacement wallet or migrate funds to fix missing documentation. Identify unsupported capabilities explicitly.

## Coinbase Wallet MCP and WalletConnect

[Wallet MCP](https://docs.cdp.coinbase.com/ai-agents/coinbase-for-agents/wallet-mcp), formerly Base MCP, now uses OAuth at `https://wallet-mcp.coinbase.com`. Use the [current installation reference](https://docs.cdp.coinbase.com/coinbase-for-agents/wallet-mcp/references/install.md) for the selected client; its server configuration examples use `base-mcp`. Check whether tools are already exposed before proposing setup. If missing, report the connector gap and the documented endpoint; connection/authentication remains a separately authorized operator step. Inspect current tool schemas and request only the account/chain read needed for the task.

The [approval reference](https://docs.cdp.coinbase.com/coinbase-for-agents/wallet-mcp/references/approval-mode.md) distinguishes a pending write from completion: a write returns an approval URL and request ID; only a matching successful terminal status establishes completion. OAuth connection, a quoted payment or an approval URL does not authorize or prove a signature, transfer or payment. Do not invoke write tools to test readiness.

Wallet history covers the connected Coinbase Wallet and in-session agent wallets, rejects third-party addresses, uses cursors and offers no date-range filter. Inspect amount units and exact contract decimals. Protocol batch builders return proposed calls; review every nested approval/action before `send_calls`. Readiness means selected account/chain plus a bounded read; an approval link means requested, not completed.

[WalletConnect Agent SDK](https://github.com/WalletConnect/agent-sdk) is beta. Persisted sessions require active account, chain/method scope, expiry and revocation checks. Signing can auto-connect, and agent-mode send can auto-bridge missing gas. A session lookup is not authorization for a new connection, bridge, signature or transfer. Do not invoke those paths under narrower authority; use inspected non-writing commands for readiness.
