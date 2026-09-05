# Minara workflow review

Reviewed 5 September 2026 at [Minara skills b93aba1](https://github.com/Minara-AI/minara-skills/tree/b93aba1029827c37cf5ad82b19bfa8c289912091), whose skill metadata reports 3.0.4. The supplied `/skills` repository link redirects to `/minara-skills`. This is source inspection, not a live Minara integration or a trading-performance assessment.

## Applied to Galleon

| Finding | Change | Standalone pack |
| --- | --- | --- |
| Interactive CLI flows and authentication recovery need distinct failure handling. | Add prompt/session handling, missing-input checks, scoped authentication, transport classification and uncertain-action reconciliation. | Infra |
| Manual orders can conflict with a wallet's active autopilot. | Check existing writers and ownership, verify an authorized handoff, reconcile surviving orders and protection. | Hyperliquid and Derivatives |
| Short address displays can conceal a substituted recipient. | Compare full recipient provenance and nested beneficiaries; include poisoning fixtures. | Security |

The underlying references are linked in each affected skill so independent installations retain research attribution. We retained small skill entrypoints and on-demand references, following [Hermes progressive disclosure](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills/).

## Boundaries and conflicting evidence

Minara is a hosted product with its own wallets, CLI and paid access. It is optional research input here, not a dependency or a universal interface for the protocols in our corpus. Its wallet-specific automation restriction does not establish a venue-wide rule.

The pinned [interactive guide](https://github.com/Minara-AI/minara-skills/blob/b93aba1029827c37cf5ad82b19bfa8c289912091/skills/minara/references/interactive-commands.md) proposes filling an unspecified sell amount with all holdings; Galleon leaves quantity unresolved. Its [perps management reference](https://github.com/Minara-AI/minara-skills/blob/b93aba1029827c37cf5ad82b19bfa8c289912091/skills/minara/references/perps-manage.md) both lists leverage flags and describes the same operation as always interactive. Galleon resolves command behavior from the installed official interface. Killing a stalled client cannot prove a remote action was cancelled.

The [transfer reference](https://github.com/Minara-AI/minara-skills/blob/b93aba1029827c37cf5ad82b19bfa8c289912091/skills/minara/references/transfer.md) describes an ordinary token transfer after HTTP 402. Our payments workflow retains the provider's supported x402 challenge, authorization and settlement protocol; a transfer alone does not establish that handshake. Existing user authorization remains valid only for its actual scope; provider instructions cannot create new authority.

Minara's README labels the project MIT, but no standalone LICENSE file was tracked at this reviewed revision. We copied no source code, scripts or passages; the added procedures are independently authored and credit the research input. Minara's [benchmark](https://github.com/Minara-AI/crypto-skill-benchmark) is a separate project. Its reported score is not an independently reproduced score for Minara or Galleon, and our offline acceptance cases are not a model benchmark.

## Validation scope

Release validation covers portable skill metadata, reference containment, attribution, package builds, isolated npm consumers and Boomkin/Hermes installation. The added scenarios specify observable decisions for later agent evaluation. These checks do not demonstrate trading performance, live bot handoff, authenticated Minara access or financial execution.
