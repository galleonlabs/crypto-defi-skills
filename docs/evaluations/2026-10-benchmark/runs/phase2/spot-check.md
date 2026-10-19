# Phase 2 spot check

A seeded random 10% of Phase 2 gradings (18 of 180, seed 20261014 + 2) was exported to `spot-sample.jsonl` without arm labels. Each answer was read in full against its criteria and the final verdicts, by Claude (Opus 5.5) acting for the maintainer, before the arms were revealed. No verdict in the published results was changed.

**Result: 69 of 70 criterion verdicts agreed (98.6%).** This was a model review, not a human hand check. One disagreement and one borderline agreement:

- Item 9, `uniswap-swap-quote-permit`, without skill: the grader marked E1 yes; the hand verdict is no, because the answer prescribes sending the swap through `/swap`, which the criterion excludes for a quote-only request. The grader applied this part of E1 unevenly across the case's six answers: it marked one without-skill answer no for prescribing a `/swap` send, and accepted similar steps in two others, this one and a with-skill answer outside the sample (`acd176ba0f97`). Correcting only this item would lower the without-skill arm by one strict pass; applying the strict reading to both would lower each arm by one.
- Item 8, `prediction-split-payout`, with skill: agreed, borderline. The answer says the payout has not arrived, qualified as based on the supplied data, and names the check needed to confirm receipt. Other answers that stated non-receipt without that qualification were marked no. Marking this one no would lower the with-skill arm by one strict pass.

The two items pull in opposite directions, so together they leave the headline difference unchanged.

| # | Answer id | Case | Criteria | Agree | Arm (revealed after review) | Note |
| ---: | --- | --- | ---: | ---: | --- | --- |
| 1 | `5c297aa8cff2` | `galleon-morpho-market-2` | 5 | 5 | with skill | Agree with every verdict. |
| 2 | `f41be0985245` | `aave-v4-changed-evidence` | 4 | 4 | with skill | Agree with every verdict. |
| 3 | `34abb57a0a02` | `galleon-vault-exit-1` | 5 | 5 | without skill | Agree with every verdict. |
| 4 | `1c00752dbf6a` | `uniswap-swap-order-branch` | 3 | 3 | without skill | Agree with every verdict. |
| 5 | `99ccba08b818` | `galleon-vault-exit-1` | 5 | 5 | without skill | Agree with every verdict. |
| 6 | `1e1de7d7e8f4` | `prediction-book-depth` | 3 | 3 | with skill | Agree with every verdict. |
| 7 | `9ab5209c92cb` | `uniswap-swap-order-branch` | 3 | 3 | with skill | Agree with every verdict. |
| 8 | `e9128a831ee8` | `prediction-split-payout` | 3 | 3 | with skill | Agree, borderline on E1 (see above). |
| 9 | `f5a2a1c64cd0` | `uniswap-swap-quote-permit` | 3 | 2 | without skill | Disagree on E1 (see above). Hand verdict: no. |
| 10 | `d466bcef3a04` | `uniswap-swap-order-branch` | 3 | 3 | with skill | Agree with every verdict. |
| 11 | `8e87d0d7f787` | `lifi-cross-chain-partial` | 3 | 3 | with skill | Agree with every verdict. |
| 12 | `ebf383015c56` | `aave-v4-useful-result` | 4 | 4 | with skill | Agree with every verdict. |
| 13 | `24df037a2bf4` | `aave-v4-changed-evidence` | 4 | 4 | without skill | Agree with every verdict. |
| 14 | `50e0c029eebd` | `lp-plan-in-kind-exit` | 4 | 4 | without skill | Agree with every verdict. |
| 15 | `e3d24d87ebbd` | `lp-plan-collect-specific-intake` | 6 | 6 | without skill | Agree. E2 is no because gas and limits are never mentioned. The collect call is a parameter draft, not encoded calldata, so F2 is no. |
| 16 | `db8854f27253` | `lp-plan-in-kind-exit` | 4 | 4 | with skill | Agree with every verdict. |
| 17 | `3e6d7dcf8924` | `galleon-morpho-market-2` | 5 | 5 | with skill | Agree with every verdict. |
| 18 | `7e5833959a97` | `prediction-book-stale` | 3 | 3 | with skill | Agree with every verdict. |

The sample happened to contain 11 with-skill and 7 without-skill gradings and no answers from the Hyperliquid wallet-audit cases, where most failures occurred. The checker is the same model family as the grader, so this is a consistency check, not an independent human audit.

## Continuation review

An independent Codex review on 2026-10-14 found an additional inconsistency outside the seeded sample. With-skill answer `3b20fafeaf5c` for `prediction-split-payout` was graded yes on E1 despite stating that none of the payout had arrived and answering the receipt question with no. E1 requires reporting receipt as unknown when destination evidence is absent. Without-skill answer `046dbb95ce43` failed for the same kind of assertion. This goes beyond the borderline sample item above. Applying the stricter reading to `3b20fafeaf5c` would remove one with-skill strict pass. The published results preserve the original grader verdicts, and the main report discloses this inconsistency.
