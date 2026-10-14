### Headline

| Arm | Graded answers | Strict passes | Expected criteria met | Forbidden hits per answer |
| --- | ---: | ---: | ---: | ---: |
| With skill | 10 | 8/10 (80.0%) | 86.7% | 0.00 |
| Without skill | 10 | 5/10 (50.0%) | 76.7% | 0.00 |

Paired over 10 cases (with skill minus without skill, mean of per-case differences, 95% bootstrap interval over cases):

| Metric | Difference | 95% interval | Cases better with skill | Ties | Cases worse with skill |
| --- | ---: | ---: | ---: | ---: | ---: |
| Strict pass rate | +30.0 pts | +0.0 pts to +60.0 pts | 3 | 7 | 0 |
| Expected criteria met | +10.0 pts | +0.0 pts to +20.0 pts | 3 | 7 | 0 |
| Forbidden hits per answer | 0.00 | 0.00 to 0.00 | | | |

### By pack

| Pack | Cases | Strict passes with | Strict passes without | Expected met with | Expected met without | Forbidden hits with | Forbidden hits without |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| lending | 2 | 2/2 (100.0%) | 0/2 (0.0%) | 100.0% | 66.7% | 0.00 | 0.00 |
| yield | 2 | 2/2 (100.0%) | 2/2 (100.0%) | 100.0% | 100.0% | 0.00 | 0.00 |
| routing | 2 | 2/2 (100.0%) | 2/2 (100.0%) | 100.0% | 100.0% | 0.00 | 0.00 |
| hyperliquid | 2 | 1/2 (50.0%) | 0/2 (0.0%) | 83.3% | 66.7% | 0.00 | 0.00 |
| prediction | 2 | 1/2 (50.0%) | 1/2 (50.0%) | 50.0% | 50.0% | 0.00 | 0.00 |

### By skill

| Skill | Strict passes with | Strict passes without | Expected met with | Expected met without |
| --- | ---: | ---: | ---: | ---: |
| `galleon-aave-position` | 2/2 (100.0%) | 0/2 (0.0%) | 100.0% | 66.7% |
| `galleon-vault-exit` | 2/2 (100.0%) | 2/2 (100.0%) | 100.0% | 100.0% |
| `lifi-cross-chain` | 2/2 (100.0%) | 2/2 (100.0%) | 100.0% | 100.0% |
| `hyperliquid-wallet-audit` | 1/2 (50.0%) | 0/2 (0.0%) | 83.3% | 66.7% |
| `galleon-prediction-market-resolution` | 1/2 (50.0%) | 1/2 (50.0%) | 50.0% | 50.0% |

### By case

Strict passes are out of the repeats graded for each arm. Expected met is the mean share with the range across repeats.

| Case | Skill | Strict with | Strict without | Expected met with | Expected met without | Forbidden hits with | Forbidden hits without | Strict result |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `galleon-aave-position-1` | `galleon-aave-position` | 1/1 | 0/1 | 100.0% | 66.7% | 0.00 | 0.00 | win |
| `galleon-aave-position-2` | `galleon-aave-position` | 1/1 | 0/1 | 100.0% | 66.7% | 0.00 | 0.00 | win |
| `galleon-vault-exit-1` | `galleon-vault-exit` | 1/1 | 1/1 | 100.0% | 100.0% | 0.00 | 0.00 | tie |
| `galleon-vault-exit-2` | `galleon-vault-exit` | 1/1 | 1/1 | 100.0% | 100.0% | 0.00 | 0.00 | tie |
| `lifi-cross-chain-partial` | `lifi-cross-chain` | 1/1 | 1/1 | 100.0% | 100.0% | 0.00 | 0.00 | tie |
| `lifi-cross-chain-minimum` | `lifi-cross-chain` | 1/1 | 1/1 | 100.0% | 100.0% | 0.00 | 0.00 | tie |
| `hl-wallet-audit-signed-costs` | `hyperliquid-wallet-audit` | 1/1 | 0/1 | 100.0% | 66.7% | 0.00 | 0.00 | win |
| `hl-wallet-audit-partial-history` | `hyperliquid-wallet-audit` | 0/1 | 0/1 | 66.7% | 66.7% | 0.00 | 0.00 | tie |
| `prediction-split-payout` | `galleon-prediction-market-resolution` | 0/1 | 0/1 | 0.0% | 0.0% | 0.00 | 0.00 | tie |
| `prediction-disputed` | `galleon-prediction-market-resolution` | 1/1 | 1/1 | 100.0% | 100.0% | 0.00 | 0.00 | tie |

### Cost and size per answer

Means per answer, excluding grading. Input tokens are uncached input; cache reads and writes are listed separately. Thinking tokens are part of output tokens.

| Arm | Answers | Model requests | Skill file reads | Input tokens | Cache read tokens | Cache write tokens | Output tokens | Thinking tokens | Answer characters | Wall time | Cost |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| With skill | 10 | 3.0 | 2.9 | 8 | 3552 | 4682 | 1355 | 274 | 2621 | 20.3 s | $0.0512 |
| Without skill | 10 | 1.0 | 0.0 | 208 | 0 | 0 | 1328 | 434 | 2403 | 14.1 s | $0.0274 |

### Grading checks

- 20 gradings covering 86 criterion verdicts: 37 yes, 48 no, 1 unclear.
- Figure checks ran on 10 expected-criterion verdicts and overrode 0 grader verdicts to no.
- 82 of 85 grader evidence quotes appear verbatim in the answer (whitespace normalized; an ellipsis separates excerpts).
- Mean grading cost $0.0196 and 582 output tokens per answer.
- Answer statuses: with_skill:ok 10, without_skill:ok 10.
