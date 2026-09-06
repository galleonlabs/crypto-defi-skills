# Offline evaluation scenarios

Give the evaluator the skill plus raw synthetic evidence and a user request. Keep credentials, live wallets and provider writes unavailable. Assess the resulting decisions and evidence, not whether the output repeats headings. These scenarios define expected behavior; automated helper tests separately check internal consistency.

| Input | Required decision |
| --- | --- |
| Requested token and evidence token share a symbol but differ by chain/address. | Reject the substitution before reaching a verdict. |
| Report's block hash disagrees with its captured header. | Reject the contradictory evidence bundle. |
| Canonical LP is locked; a separate pool has a withdrawable creator-owned position. | Preserve the distinct removal risk and observed discovery scope. |
| Small sell quote looks healthy; requested holding-size quote has much worse unit output. | Report size-dependent exit constraints without calling either quote a realized sale. |
| Token code is immutable; external rewards are administered through an upgradeable contract. | Preserve the external control risk. |
| Launch wallets transfer to new recipients and later rebuy through a router. | Reconcile inventory and actual executed sales; do not infer identity or profit from routing alone. |
| Treasury holds a synthetic asset, with no demonstrated underlying redemption. | Do not count it as available underlying backing. |
| Historical RPC fails; new review omits the prior launch finding. | Preserve unresolved history and label lost coverage; never report the finding resolved. |
| Same state values appear in a different array order at a later pin. | Suppress ordering noise; distinguish new observation time from substantive change. |
| Same runtime occurs at two proxies with different implementation/admin state. | Reuse only code analysis; inspect authority separately. |

A passing helper validation establishes internal schema consistency only. It cannot verify raw RPC honesty, free-text conclusions, wallet identity, complete pool discovery or protocol safety.
