---
name: galleon-defi-infra
description: Set up and diagnose DeFi agent infrastructure, RPC access, managed wallets, payment permissions and Hermes tool connections. Use for onboarding or connection failures before protocol-specific activity.
license: MIT
compatibility: Portable instructions; optional diagnostics require Node.js 20+ and public network access.
metadata:
  version: "0.2.2"
  author: Galleon Labs
---

# DeFi infrastructure

Make the requested agent capable of its first task through maintained provider tools. Separate installed software, available credentials, authenticated access, live reads and transaction authority; success at one does not prove the next.

## Pick the needed plumbing

- RPC and Alchemy: read [RPC and Alchemy](references/rpc-alchemy.md) to select a chain, verify node freshness and choose CLI or MCP transport.
- Wallet ownership and Coinbase: read [Managed wallets](references/wallets.md) before selecting custody, an isolated portfolio or an agent wallet. Existing exchange access is not an onchain signer.
- Paid APIs, sponsorship and scoped permissions: read [Payments and authority](references/payments.md). An HTTP 402 is a price offer, not approval to pay.
- Hermes installation and tool exposure: read [Hermes wiring](references/hermes.md). Keep Hermes as the runtime; integrate its native skills, profiles and MCP configuration instead of maintaining a fork.
- CLI prompts, authentication failures or stalled sessions: use [CLI recovery](references/cli-recovery.md) to distinguish missing access from transport and uncertain writes.
- Broken connectivity: use [Readiness diagnostics](references/readiness.md) for a bounded, read-only probe and a precise readiness report.

Start with the user's selected chain and task. Read-only research needs RPC or indexed data, not a newly created wallet. Reuse an existing compatible provider connection when its account and permissions match; do not install every wallet product. Keep seed phrases and private keys outside agent prompts, repository files and diagnostic logs.

Read [primitive tool wiring](references/primitive-tools.md) for official MCP/SDK selection, progressive disclosure, schema changes and EVM/Solana transaction context.

## First usable result

Record the runtime/profile, provider, chain ID, tool or CLI version, authentication state, successful read with timestamp, and remaining limitation. For a signer also record its owner, active account, supported actions, spending/contract/chain limits, expiry and revocation path. Report unknown permission enforcement as unknown, rather than treating a prompt as a wallet policy.

A missing dependency or expired session should produce the exact relevant setup step. Authentication that creates an account, wallet, signer session or new spending permission requires the user's authorization for that action; installing a skill does not provide it. Preserve existing authorization when its scope still matches.

After onboarding, hand the verified chain/account/capabilities to the requested protocol, portfolio, payments, governance or data workflow if present. This pack supplies infrastructure procedures and diagnostics; it does not execute a trade, fund a wallet or implement a signer.
