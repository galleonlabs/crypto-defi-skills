# Vault exit synthetic responses, 2026-10-10

Respondent: independent Codex collaborator inheriting this GPT-6 Astra, ultra-effort session. A fresh context received neutral packets exported by `scripts/behavior-evals.ts`; it did not receive expected/forbidden criteria. The respondent read the skill and its protocol recipe, not the helper, tests or evaluation dataset. The responses below are preserved from its returned answers. This is a small synthetic procedure exercise, not a matched before/after benchmark or live-provider test.

## vault-async-partial-claim

You cannot substantiate withdrawing the full **500 USDC** from this snapshot. The controller's observed limit supports a **420 USDC claim portion**, leaving **80 USDC outside that limit**. This is a recorded bound, not a simulated or completed withdrawal.

The complete request inventory contains aggregate ID **0**, counted once:

- Wallet: **0 shares**
- Pending: **600 shares**
- Claimable: **400 shares**
- Controller limits: **420 USDC** via `maxWithdraw`, or **400 shares** via `maxRedeem`

Your zero wallet share balance does not prevent claiming: requested shares may already have been escrowed or burned. The pending 600 shares are not guaranteed USDC proceeds and have no supplied fulfillment time.

An additional redemption request is **not supported by this snapshot**: your wallet has no unrequested shares, and you already have pending exposure. Do not duplicate that existing request to cover the 80 USDC remainder.

The specific next step is an unsigned simulation of `withdraw(420000000, receiver, controller)` using:

- Original owner: `0x4444444444444444444444444444444444444444`
- Controller and caller: `0x5555555555555555555555555555555555555555`
- Receiver: `0x6666666666666666666666666666666666666666`

Use the verified deployment's claim rules; do not use asynchronous redemption previews. The observations identify an ERC7540 redemption vault with an external ERC7575 share token, 18-decimal shares and 6-decimal USDC. Chain, vault/token addresses, and the actual verified block number/hash were not supplied and must be recorded. Refresh the snapshot before claiming availability now. No simulation, receipt or receiver-balance increase is supplied; nothing establishes settlement.

## vault-async-partial-inventory

The observed controller-wide limit supports **420 USDC of your requested 700 USDC exit**, leaving **280 USDC outside that limit**. Partial request discovery does not invalidate that supplied controller limit.

However, the dashboard entry is **not evidence of your whole outstanding balance**. Its scan covers only 50 blocks. Request ID **7** has **600 pending shares** and **100 claimable shares**, but other IDs were not queried. These share amounts are not guaranteed asset proceeds. The controller-wide `maxRedeem = 400 shares` and `maxWithdraw = 420 USDC` cannot be attributed solely to ID 7.

The specific next reads are:

1. Enumerate the controller's complete request history through verified receipts/events or the implementation's official inventory, then read pending and claimable shares for every identified ID at one verified block.
2. Read the owner's wallet share balance separately.
3. Refresh controller-wide limits at that same block and simulate an exact **420 USDC** withdrawal with the actual controller, caller and receiver.

Do not use asynchronous redemption previews or submit another request to fill the 280 USDC gap before reconciling existing requests. Chain, vault, asset/share addresses, account identities and block number/hash are absent from the packet; the supplied decimals are 6 for assets and 18 for shares. No simulation or receipt supports execution or settlement.

## vault-mixed-block-evidence

These reads do **not support a coherent redemption quote or an amount available now**, because the limit/balance observations and the redemption preview come from different blocks.

At block hash `0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`, the recorded owner balance is **1,000 shares**, `maxRedeem` is **400 shares**, and `maxWithdraw` is **435.6 assets**. That records a historical 400-share ceiling, with 600 of the requested 1,000 shares above it.

The supplied `previewRedeem(400) = 435.6 assets` belongs to block hash `0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb`. Its numerical agreement with `maxWithdraw` does not reconcile the blocks or establish a valid 400-share quote.

The next read is a fresh, single-block set: owner balance, `maxRedeem(owner)`, `maxWithdraw(owner)`, and `previewRedeem` for the exact supported share amount at that block. If the refreshed limit remains 400 shares, preview exactly 400 shares. Record and recheck the block hash, then simulate with actual caller/owner/receiver before any execution. Chain, vault/asset identities, decimals, account addresses and block numbers are also missing. No executable candidate or confirmed proceeds are established by the supplied evidence.

## Observed read trace

Paths are normalized to the repository or the task's external evidence directory:

1. `exercise-partial.txt`, exported neutral packet for `vault-async-partial-claim`.
2. `exercise-inventory.txt`, exported neutral packet for `vault-async-partial-inventory`.
3. `exercise-blocks.txt`, exported neutral packet for `vault-mixed-block-evidence`.
4. `packages/yield/skills/galleon-vault-exit/SKILL.md`.
5. `packages/yield/skills/galleon-vault-exit/references/recipe.md`.

The first read collected the three packets; the blocks packet was initially empty while its exporter finished. The second read loaded the skill and retried only that packet. The last read loaded the recipe. No network calls, installations, helper execution, file writes, signing or transactions occurred in the respondent's exercise.

To reproduce a neutral packet from this checkout:

```sh
bun run eval:behavior -- vault-async-partial-claim
bun run eval:behavior -- vault-async-partial-inventory
bun run eval:behavior -- vault-mixed-block-evidence
```

The remaining new zero-state and exact-partial-preview cases are grading fixtures, not recorded model runs. No aggregate model pass rate is claimed.
