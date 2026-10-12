# Vault exit evidence assessment, 2026-10-10

## Decision

Extend the existing independently installable `galleon-vault-exit` skill with a dependency-free offline assessment of supplied exit observations. The useful result is how much of a requested exit fits the observed limit, what remains outstanding, and which specific read is missing. Wallet shares, pending requests and claimable requests stay separate.

This is an assessment and preparation workflow. It neither connects to providers nor constructs, signs or submits transactions. No service, scheduler, deployment or package release is part of this change.

## Repository evidence and alternatives

Research began from `0132aed`, fetched `origin/main` on 10 October 2026. The personal repository `galleonlabs/crypto-defi-skills` had no open PRs or issues. The source is a Bun workspace of 17 independent packs and 49 active skills. Recent main already includes public-wallet cost audits and frozen strategy validation (`3f91a95`), so another generic wallet or backtesting feature would overlap completed work.

- The vault-exit skill already compares limits and previews, but had no executable helper or yield tests. Its two synthetic behavior cases cover one insufficient-limit case and one reverted asynchronous preview.
- Routing already has an offline settlement classifier. A second generic bridge status classifier would repeat an existing capability.
- Portfolio accounting already distinguishes pending claims from spendable cash. The missing capability belongs in the vault-exit procedure that obtains and interprets those observations, without a new pack or dependency.

The chosen change covers exact raw-unit arithmetic, partial exits with nonlinear fees, external share tokens, asynchronous controller limits, request inventory completeness and conflicting block evidence. It preserves the existing skill name and package interfaces.

## Current primary sources

All sources below were read on 10 October 2026. Specifications describe interfaces; provider documentation is not proof that a particular deployed contract implements them.

| Source | Consequence for this workflow |
| --- | --- |
| [ERC-4626](https://eips.ethereum.org/EIPS/eip-4626) | Limits and previews answer different questions. Use the preview for the exact candidate amount; standard exit calls have no user-supplied slippage argument. |
| [ERC-7540](https://eips.ethereum.org/EIPS/eip-7540) | Model requests separately from claims. Asynchronous redemption previews revert. Requests are keyed by controller and ID, with ID zero representing aggregation. Pending shares have no guaranteed settlement value or time. |
| [ERC-7575](https://eips.ethereum.org/EIPS/eip-7575) | Resolve the share token with `share()` where supported; the vault need not itself hold the ERC-20 share interface. |
| [Centrifuge vault concepts](https://docs.centrifuge.io/user/concepts/vaults/) | Instant deposits can coexist with request-based redemptions. A synchronous deposit label cannot select the exit interface. |
| [Centrifuge integration guide](https://docs.centrifuge.io/build/) | The documented redemption journey requests shares, waits for fulfillment, then withdraws using controller limits. Owner, controller and receiver serve different roles. |
| [Centrifuge composability](https://docs.centrifuge.io/developer/protocol/features/vaults/) | Hybrid and multi-asset vault configurations are practical protocol cases, not hypothetical standards combinations. |

## Independent skill-pack comparison

Inspected official source files through GitHub's contents API and recorded their latest file-change revisions:

- [Euler's vault skill at `8d3735c`](https://github.com/euler-xyz/agent-skills/blob/8d3735c162e3051f93bd892c7193b37d94d2be76/skills/euler-vaults/SKILL.md) routes into protocol-specific rules for vaults, EVC, risk and architecture. Its useful pattern is progressive disclosure; its broad Euler scope is complementary to this narrowly defined cross-vault exit assessment.
- [Intuition's redeem procedure at `0176358`](https://github.com/0xIntuition/agent-skills/blob/0176358a2a203b0a6eda5c9a11d7bf0fd01d6a27/skills/intuition/operations/redeem.md) supplies ordered reads, an unsigned transaction shape and post-broadcast evidence. Its Multivault signature and permission model are protocol-specific and must not be transplanted into standard vault instructions.

The resulting design uses a concrete input/output contract and worked failure cases, while retaining the user's selected official tools. No upstream runtime or skill text is vendored. These two sampled procedures do not establish an exhaustive competitor survey.

## Evidence and evaluation design

The helper accepts supplied observations at an identified historical block and performs no independent verification. A nonzero limit establishes an observed bound, not a simulation or an executable promise. Missing evidence stays unknown; duplicate requests and conflicting blocks cannot silently inflate the result. A partial amount is a report, not permission to execute that amount.

Deterministic tests cover arithmetic and failure paths. Repository checks, packing, format validation and clean consumer smoke establish resource integrity. Additional installed-helper exercises check the actual bundled resource under Node. Separate neutral synthetic agent exercises and independent review evaluate whether the procedure supports the intended decisions; fixture validation alone is not a model score, and synthetic exercises are not live protocol compatibility tests.

No private wallet data, provider credentials, financial transactions or live vault simulations were used. Deployment-specific fees, restrictions, cancellation, routing and request allocation still require current official implementation evidence.
