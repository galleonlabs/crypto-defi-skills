# Payments, sponsorship and permission boundaries

An agent's data budget, gas budget and investment capital are separate limits. Before enabling a paying tool, identify the payer, chain, token, maximum per request and cumulative spend, expiry, permitted destinations and revocation path. Confirm those limits at the wallet/provider layer. A prompt constraint alone is not enforcement.

[Coinbase for Agents](https://docs.cdp.coinbase.com/x402/agentic-accounts/coinbase-for-agents) documents x402 payments from the account's retail USDC balance on Base, without a separate wallet (checked 2026-10-19). [Wallet MCP](https://docs.cdp.coinbase.com/coinbase-for-agents/wallet-mcp/skill.md) documents a separate Coinbase Wallet x402 path. Either is an optional, explicitly authorized payment path, not a setup dependency.

Prefer the provider's supported payment client rather than implementing authorization signing. A paid API request needs an approved resource, quoted asset/amount/network, budget and expiry. After an ambiguous payment, reconcile the provider's payment receipt/status before retrying; a fresh HTTP request may produce another charge. Distinguish payment acceptance from successful delivery of useful data.

Alchemy's [x402 guide](https://www.alchemy.com/docs/x402-payments) covers third-party API payments; its CLI exposes quote-only `alchemy x402 request <url> --estimate`. Automated payment uses a maximum payment argument and a signer, which must be separately authorized. This is distinct from Alchemy's global `--x402` mode for authenticating to its own APIs. Do not enable either during a general readiness check.

For current wallet payment setup, use [Wallet MCP installation](https://docs.cdp.coinbase.com/coinbase-for-agents/wallet-mcp/references/install.md), then inspect the exposed payment schema, payer and approval requirements. No installer, login or paid discovery request is needed to validate this pack. A legacy `@coinbase/payments-mcp@1.0.5` installer was previously inspected; its old quickstart is now unavailable. Preserve an existing installation only after checking its generated server and runtime version: pinning that installer does not pin the runtime it downloads. Do not launch the installer as a stdio server or present it as the current documented setup.


Gas sponsorship is a billing arrangement, not free unlimited execution. Check sponsor policy, eligible calls, chain, quota and fallback payer. A simulation or sponsorship quote does not establish authorization or settlement.
