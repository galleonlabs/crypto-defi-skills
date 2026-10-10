# Vault exit assessment verification

Research began 2026-10-10; validation continued on 2026-10-11 (Europe/London).

This change extends the independently installable yield skill's exit workflow. The [research decision](../../research/vault-exit-evidence-2026-10-10.md) records current standards, official provider documentation, sampled independent packs and the scope decision. The [recorded synthetic responses](vault-exit-responses.md) preserve actual agent answers and the read trace.

## Independent review

A reviewer separate from the implementation collaborator inspected the actual diff, helper, tests, examples, metadata and official ERC4626/7540/7575 specifications. It identified two actionable findings:

1. A complete, known-zero claimable inventory could still produce a positive asset-withdrawal candidate if `maxRedeem` was zero or unread. The helper now marks this contradictory evidence inconsistent. Regression cases cover empty and pending-only inventories while retaining valid partial/unknown coverage behavior.
2. Cast preview recipes omitted the intended caller, allowing caller-dependent fees to be read for the wrong sender. Recipes now bind `--from "$CALLER"`, explain router caller identity, and align the skill and observation contract.

The reviewer rechecked both fixes and found no remaining high-confidence issues. Its independent focused run passed 35 tests with 207 assertions; a separate 18-case inventory/limit matrix also passed. This is an independent technical review, not a GitHub approval or a security audit.

## Synthetic procedure exercises

A fresh respondent context received only neutral packets, the skill and relevant references. A separate reviewer checked each preserved answer against every assertion:

| Case | Expected criteria evidenced | Forbidden behaviors observed |
| --- | --- | --- |
| `vault-async-partial-claim` | 4 of 4: 420/80 assets; separate share states; correct controller claim; no duplicate request or invented timing | None of 3 |
| `vault-async-partial-inventory` | 3 of 3: 420/280 assets; controller limit not attributed to one ID; incomplete inventory acknowledged | None of 3 |
| `vault-mixed-block-evidence` | 2 of 2: conflict identified; same-block refresh required | None of 2 |

These are three reviewed synthetic responses, not an aggregate model pass rate or proof of improvement against the previous version. The zero-state and exact-partial-preview fixtures were added but not run as model exercises. No live providers, simulations or financial transactions were used.

## Validation scope

The yield regression suite covers exact uint256 arithmetic, distinct decimals, nonlinear partial previews, asynchronous controller/owner separation, zero wallet balances, missing reads, incomplete inventory, duplicate/mixed request IDs, contradictory claim limits, mixed blocks, redacted errors, import safety, file/stdin input and detached/symlinked Node execution. The skill format validator reports three canonical skills with zero errors or warnings.

Recorded local results use the repository-pinned Bun 1.3.14:

- Yield `bun run check`: passed, including 35 tests and 207 assertions, corpus validation, type checking and build.
- Root style, TypeScript checking and integration suites: passed, 64 tests and 968 assertions. The integration test command used an explicit 30-second per-test budget on this busy Mac.
- All 17 native package builds: passed.
- `validate-agent-skills packages/yield/skills`: three skills, zero errors or warnings.
- `bun run eval:behavior`: 115 fixtures structurally validated; this command does not grade answers.
- Both bundled examples ran on Node 20.20.2. The helper also ran from a freshly installed local npm tarball and a detached single-skill directory under Node 26.10.0; six installed resource digests matched source.

Two full local workspace-check attempts encountered the unchanged data and infrastructure `show returns every exact catalog skill and rejects paths` tests at Bun's five-second timeout. Each passed a narrow replay with a longer timeout; no source test or assertion was changed. The second full attempt passed data before encountering the infrastructure timeout. These local full runs are recorded as incomplete, not passing. Packaging, clean-consumer smoke and the exact-head CI result are recorded in the PR. No blanket local workspace pass is claimed.

The helper accepts supplied historical observations. It does not authenticate their chain/account provenance, establish current liquidity, simulate a call, sign, execute or grant authority. Deployment restrictions, caller-specific fees, cancellation and request allocation still require actual contract evidence. Version 0.3.0 is prepared source only; nothing has been published.
