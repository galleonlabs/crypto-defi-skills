### Headline

| Arm | Graded answers | Strict passes | Expected criteria met | Forbidden hits per answer |
| --- | ---: | ---: | ---: | ---: |
| With skill | 90 | 86/90 (95.6%) | 97.8% | 0.00 |
| Without skill | 90 | 66/90 (73.3%) | 86.3% | 0.01 |

Paired over 30 cases (with skill minus without skill, mean of per-case differences, 95% bootstrap interval over cases):

| Metric | Difference | 95% interval | Cases better with skill | Ties | Cases worse with skill |
| --- | ---: | ---: | ---: | ---: | ---: |
| Strict pass rate | +22.2 pts | +10.0 pts to +35.6 pts | 10 | 20 | 0 |
| Expected criteria met | +11.5 pts | +5.2 pts to +18.9 pts | 11 | 19 | 0 |
| Forbidden hits per answer | -0.01 | -0.03 to 0.00 | | | |

### By pack

| Pack | Cases | Strict passes with | Strict passes without | Expected met with | Expected met without | Forbidden hits with | Forbidden hits without |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| lending | 6 | 18/18 (100.0%) | 10/18 (55.6%) | 100.0% | 83.3% | 0.00 | 0.00 |
| yield | 4 | 12/12 (100.0%) | 12/12 (100.0%) | 100.0% | 100.0% | 0.00 | 0.00 |
| staking | 2 | 6/6 (100.0%) | 5/6 (83.3%) | 100.0% | 94.4% | 0.00 | 0.00 |
| routing | 4 | 12/12 (100.0%) | 11/12 (91.7%) | 100.0% | 91.7% | 0.00 | 0.00 |
| lp | 4 | 12/12 (100.0%) | 10/12 (83.3%) | 100.0% | 97.2% | 0.00 | 0.08 |
| hyperliquid | 4 | 9/12 (75.0%) | 5/12 (41.7%) | 91.7% | 77.8% | 0.00 | 0.00 |
| prediction | 4 | 11/12 (91.7%) | 7/12 (58.3%) | 91.7% | 58.3% | 0.00 | 0.00 |
| security | 2 | 6/6 (100.0%) | 6/6 (100.0%) | 100.0% | 100.0% | 0.00 | 0.00 |

### By skill

| Skill | Strict passes with | Strict passes without | Expected met with | Expected met without |
| --- | ---: | ---: | ---: | ---: |
| `galleon-aave-position` | 6/6 (100.0%) | 3/6 (50.0%) | 100.0% | 83.3% |
| `galleon-aave-v4` | 6/6 (100.0%) | 4/6 (66.7%) | 100.0% | 83.3% |
| `galleon-morpho-market` | 6/6 (100.0%) | 3/6 (50.0%) | 100.0% | 83.3% |
| `galleon-vault-exit` | 6/6 (100.0%) | 6/6 (100.0%) | 100.0% | 100.0% |
| `galleon-pendle-maturity` | 6/6 (100.0%) | 6/6 (100.0%) | 100.0% | 100.0% |
| `galleon-lido-withdrawals` | 6/6 (100.0%) | 5/6 (83.3%) | 100.0% | 94.4% |
| `lifi-cross-chain` | 6/6 (100.0%) | 6/6 (100.0%) | 100.0% | 100.0% |
| `uniswap-swap` | 6/6 (100.0%) | 5/6 (83.3%) | 100.0% | 83.3% |
| `lp-monitor` | 6/6 (100.0%) | 6/6 (100.0%) | 100.0% | 100.0% |
| `lp-plan` | 6/6 (100.0%) | 4/6 (66.7%) | 100.0% | 94.4% |
| `hyperliquid-plan` | 6/6 (100.0%) | 5/6 (83.3%) | 100.0% | 94.4% |
| `hyperliquid-wallet-audit` | 3/6 (50.0%) | 0/6 (0.0%) | 83.3% | 61.1% |
| `galleon-prediction-market-research` | 6/6 (100.0%) | 4/6 (66.7%) | 100.0% | 66.7% |
| `galleon-prediction-market-resolution` | 5/6 (83.3%) | 3/6 (50.0%) | 83.3% | 50.0% |
| `galleon-defi-security-token-diligence` | 6/6 (100.0%) | 6/6 (100.0%) | 100.0% | 100.0% |

### By case

Strict passes are out of the repeats graded for each arm. Expected met is the mean share with the range across repeats.

| Case | Skill | Strict with | Strict without | Expected met with | Expected met without | Forbidden hits with | Forbidden hits without | Strict result |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `galleon-aave-position-1` | `galleon-aave-position` | 3/3 | 3/3 | 100.0% (100.0% to 100.0%) | 100.0% (100.0% to 100.0%) | 0.00 | 0.00 | tie |
| `galleon-aave-position-2` | `galleon-aave-position` | 3/3 | 0/3 | 100.0% (100.0% to 100.0%) | 66.7% (66.7% to 66.7%) | 0.00 | 0.00 | win |
| `aave-v4-useful-result` | `galleon-aave-v4` | 3/3 | 1/3 | 100.0% (100.0% to 100.0%) | 66.7% (50.0% to 100.0%) | 0.00 | 0.00 | win |
| `aave-v4-changed-evidence` | `galleon-aave-v4` | 3/3 | 3/3 | 100.0% (100.0% to 100.0%) | 100.0% (100.0% to 100.0%) | 0.00 | 0.00 | tie |
| `galleon-morpho-market-1` | `galleon-morpho-market` | 3/3 | 0/3 | 100.0% (100.0% to 100.0%) | 66.7% (66.7% to 66.7%) | 0.00 | 0.00 | win |
| `galleon-morpho-market-2` | `galleon-morpho-market` | 3/3 | 3/3 | 100.0% (100.0% to 100.0%) | 100.0% (100.0% to 100.0%) | 0.00 | 0.00 | tie |
| `galleon-vault-exit-1` | `galleon-vault-exit` | 3/3 | 3/3 | 100.0% (100.0% to 100.0%) | 100.0% (100.0% to 100.0%) | 0.00 | 0.00 | tie |
| `galleon-vault-exit-2` | `galleon-vault-exit` | 3/3 | 3/3 | 100.0% (100.0% to 100.0%) | 100.0% (100.0% to 100.0%) | 0.00 | 0.00 | tie |
| `galleon-pendle-maturity-1` | `galleon-pendle-maturity` | 3/3 | 3/3 | 100.0% (100.0% to 100.0%) | 100.0% (100.0% to 100.0%) | 0.00 | 0.00 | tie |
| `galleon-pendle-maturity-2` | `galleon-pendle-maturity` | 3/3 | 3/3 | 100.0% (100.0% to 100.0%) | 100.0% (100.0% to 100.0%) | 0.00 | 0.00 | tie |
| `galleon-lido-withdrawals-1` | `galleon-lido-withdrawals` | 3/3 | 2/3 | 100.0% (100.0% to 100.0%) | 88.9% (66.7% to 100.0%) | 0.00 | 0.00 | win |
| `galleon-lido-withdrawals-2` | `galleon-lido-withdrawals` | 3/3 | 3/3 | 100.0% (100.0% to 100.0%) | 100.0% (100.0% to 100.0%) | 0.00 | 0.00 | tie |
| `lifi-cross-chain-partial` | `lifi-cross-chain` | 3/3 | 3/3 | 100.0% (100.0% to 100.0%) | 100.0% (100.0% to 100.0%) | 0.00 | 0.00 | tie |
| `lifi-cross-chain-minimum` | `lifi-cross-chain` | 3/3 | 3/3 | 100.0% (100.0% to 100.0%) | 100.0% (100.0% to 100.0%) | 0.00 | 0.00 | tie |
| `uniswap-swap-quote-permit` | `uniswap-swap` | 3/3 | 2/3 | 100.0% (100.0% to 100.0%) | 66.7% (0.0% to 100.0%) | 0.00 | 0.00 | win |
| `uniswap-swap-order-branch` | `uniswap-swap` | 3/3 | 3/3 | 100.0% (100.0% to 100.0%) | 100.0% (100.0% to 100.0%) | 0.00 | 0.00 | tie |
| `lp-monitor-known-range-unknown-pnl` | `lp-monitor` | 3/3 | 3/3 | 100.0% (100.0% to 100.0%) | 100.0% (100.0% to 100.0%) | 0.00 | 0.00 | tie |
| `lp-monitor-stale-not-hold` | `lp-monitor` | 3/3 | 3/3 | 100.0% (100.0% to 100.0%) | 100.0% (100.0% to 100.0%) | 0.00 | 0.00 | tie |
| `lp-plan-collect-specific-intake` | `lp-plan` | 3/3 | 1/3 | 100.0% (100.0% to 100.0%) | 88.9% (66.7% to 100.0%) | 0.00 | 0.33 | win |
| `lp-plan-in-kind-exit` | `lp-plan` | 3/3 | 3/3 | 100.0% (100.0% to 100.0%) | 100.0% (100.0% to 100.0%) | 0.00 | 0.00 | tie |
| `hl-plan-cancel-specific-intake` | `hyperliquid-plan` | 3/3 | 2/3 | 100.0% (100.0% to 100.0%) | 88.9% (66.7% to 100.0%) | 0.00 | 0.00 | win |
| `hl-plan-close-not-entry` | `hyperliquid-plan` | 3/3 | 3/3 | 100.0% (100.0% to 100.0%) | 100.0% (100.0% to 100.0%) | 0.00 | 0.00 | tie |
| `hl-wallet-audit-signed-costs` | `hyperliquid-wallet-audit` | 3/3 | 0/3 | 100.0% (100.0% to 100.0%) | 66.7% (66.7% to 66.7%) | 0.00 | 0.00 | win |
| `hl-wallet-audit-partial-history` | `hyperliquid-wallet-audit` | 0/3 | 0/3 | 66.7% (66.7% to 66.7%) | 55.6% (33.3% to 66.7%) | 0.00 | 0.00 | tie |
| `prediction-book-depth` | `galleon-prediction-market-research` | 3/3 | 1/3 | 100.0% (100.0% to 100.0%) | 33.3% (0.0% to 100.0%) | 0.00 | 0.00 | win |
| `prediction-book-stale` | `galleon-prediction-market-research` | 3/3 | 3/3 | 100.0% (100.0% to 100.0%) | 100.0% (100.0% to 100.0%) | 0.00 | 0.00 | tie |
| `prediction-split-payout` | `galleon-prediction-market-resolution` | 2/3 | 0/3 | 66.7% (0.0% to 100.0%) | 0.0% (0.0% to 0.0%) | 0.00 | 0.00 | win |
| `prediction-disputed` | `galleon-prediction-market-resolution` | 3/3 | 3/3 | 100.0% (100.0% to 100.0%) | 100.0% (100.0% to 100.0%) | 0.00 | 0.00 | tie |
| `security-token-diligence-useful-result` | `galleon-defi-security-token-diligence` | 3/3 | 3/3 | 100.0% (100.0% to 100.0%) | 100.0% (100.0% to 100.0%) | 0.00 | 0.00 | tie |
| `security-token-diligence-changed-evidence` | `galleon-defi-security-token-diligence` | 3/3 | 3/3 | 100.0% (100.0% to 100.0%) | 100.0% (100.0% to 100.0%) | 0.00 | 0.00 | tie |

### Cost and size per answer

Means per answer, excluding grading. Input tokens are uncached input; cache reads and writes are listed separately. Thinking tokens are part of output tokens.

| Arm | Answers | Model requests | Skill file reads | Input tokens | Cache read tokens | Cache write tokens | Output tokens | Thinking tokens | Answer characters | Wall time | Cost |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| With skill | 90 | 3.1 | 3.1 | 8 | 6022 | 2488 | 1475 | 325 | 2745 | 21.7 s | $0.0432 |
| Without skill | 90 | 1.0 | 0.0 | 210 | 0 | 0 | 1228 | 420 | 2180 | 13.5 s | $0.0254 |

### Grading checks

- 180 gradings covering 804 criterion verdicts: 381 yes, 421 no, 2 unclear.
- Figure checks ran on 72 expected-criterion verdicts and overrode 0 grader verdicts to no.
- 728 of 770 grader evidence quotes appear verbatim in the answer (whitespace normalized; an ellipsis separates excerpts).
- Mean grading cost $0.0188 and 541 output tokens per answer.
- Answer statuses: with_skill:ok 90, without_skill:ok 90.
