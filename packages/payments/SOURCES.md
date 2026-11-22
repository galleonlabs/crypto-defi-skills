# Sources and verification

Research accessed 2026-09-05. The [provider reference](skills/galleon-defi-payments/references/providers.md) links primary documentation and distinguishes official SDKs, APIs, skills and MCP servers. Provider availability does not establish authenticated access, payment authority or successful transaction execution. Recheck versions, deployment identities and live schemas before use.

These are independently authored operational procedures. Upstream code and documentation are linked, not vendored. Names identify their providers and do not imply endorsement.

The [x402 v2 reference](skills/galleon-defi-payments/references/x402-v2.md) was checked against official protocol documentation on 2026-09-21. This is documentation and synthetic-case validation, not a payment execution test.

## Ethereum agent tool review, 2026-10-08

- [galleon-sablier-streams sources](skills/galleon-sablier-streams/references/modules.md): version-specific official procedures, exact amount scales, rights, prerequisites and recovery.
- [galleon-superfluid-streams sources](skills/galleon-superfluid-streams/references/operations.md): version-specific official procedures, exact amount scales, rights, prerequisites and recovery.

Documentation was researched and synthetic cases were added; no financial operation or connected-provider simulation was performed.

## Content maintenance, 2026-10-25

Remove repeated task-routing/persona scaffolding; retain stream arithmetic, authorization limits and uncertain-payment recovery. Existing dated discovery and release receipts remain historical evidence; no live provider/account access or financial outcome is inferred from this cleanup.

## ERC-20 receipt reconciliation

Reviewed on 2026-11-22 using the [ERC-20 standard](https://eips.ethereum.org/EIPS/eip-20), [execution API schemas](https://github.com/ethereum/execution-apis) and [Circle’s deployment list](https://developers.circle.com/stablecoins/usdc-contract-addresses). On Base, a public receipt and matching canonical and finalized headers identified a native USDC transfer of 600000 raw units in [this transaction](https://basescan.org/tx/0xee9b0ca7d51ebf9d51c09a384665c3fe9cd38c717c47179e94136afae60589fd). The expected terms of that smoke check came from the public event. Invoice acceptance and an independent commercial obligation were outside that observation.
