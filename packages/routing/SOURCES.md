# Sources and verification

Research accessed 2026-09-05. The [provider reference](skills/galleon-defi-routing/references/providers.md) links primary documentation and distinguishes official SDKs, APIs, skills and MCP servers. Provider availability does not establish authenticated access, payment authority or successful transaction execution. Recheck versions, deployment identities and live schemas before use.

These are independently authored operational procedures. Upstream code and documentation are linked, not vendored. Names identify their providers and do not imply endorsement.

## Protocol workflow sources, checked 2026-09-27

- [uniswap-swap primary sources](skills/uniswap-swap/references/recipes.md)
- [lifi-cross-chain primary sources](skills/lifi-cross-chain/references/recipes.md)

## Ethereum agent tool review, 2026-10-08

[Agent route lifecycles](skills/galleon-defi-routing/references/agent-lifecycles.md) records Across amounts/embedded-action recovery, Socket deposit-address boundaries and Aave signed-order stages from current primary sources. No financial actions, paid quotes or signing were performed for this update.

## Protocol workflow review, 2026-10-25

Standalone protocol procedures now bundle their exact read recipes and dated primary source lists under each skill. This review checked official documentation and source; it did not authorize accounts or test signing, trading, voting or settlement.

- [0x swap](skills/zerox-swap/references/reads.md)
- [1inch swap](skills/oneinch-swap/references/reads.md)
- [CoW order](skills/cow-order/references/reads.md)
- [Jupiter swap](skills/jupiter-swap/references/reads.md)
- [Relay bridge](skills/relay-bridge/references/reads.md)
- [Across bridge](skills/across-bridge/references/reads.md)
- [Circle CCTP](skills/circle-cctp/references/reads.md)
