# Read recipes and sources

Reviewed 2026-10-25. These recipes establish documented interfaces, not a live account or executed outcome.

Use read-only contract calls with the deployed verified ABI. Typical OpenZeppelin Governor reads include `state(proposalId)`, `proposalSnapshot`, `proposalDeadline`, `COUNTING_MODE`, `clock`, `CLOCK_MODE`, `quorum(timepoint)` and version-specific vote totals. Custom extensions can change this set.

Read proposal events for exact targets/values/calldata and use matching `hashProposal`. For TimelockController inspect `getMinDelay`, operation timestamp/readiness and relevant roles using its verified ABI. Never call `queue`, `execute`, `castVote` or token delegation during research. Cactus discovery uses its current GraphQL schema and private `Api-Key`; corroborate critical state onchain.

## Primary sources

- [OpenZeppelin Governor lifecycle](https://docs.openzeppelin.com/contracts/5.x/governance)
- [Governor and Timelock reference](https://docs.openzeppelin.com/contracts/5.x/api/governance)
- [Cactus API access](https://docs.tally.xyz/set-up-and-technical-documentation/welcome/how-to-use-the-tally-api/)
