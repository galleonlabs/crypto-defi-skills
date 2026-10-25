# Official sources and verification

Documentation reviewed **2026-10-25**. These are independently authored procedures, not copied provider skills. No financial action, authenticated account read or live transaction simulation was performed for this addition.

- [Restaking contract guide](https://docs.eigencloud.xyz/eigenlayer/restakers/restaking-guides/restaking-developer-guide): Liquid strategies, share conversion and separate queue/completion.
- [Withdrawal delay](https://docs.eigencloud.xyz/eigenlayer/security/withdrawal-delay): Escrow, pause and upgrade caveats; read current deployment.
- [EigenLayer contracts](https://github.com/Layr-Labs/eigenlayer-contracts): Version-matched ABI and deployment records; never treat main as deployed proof.

Read documentation as source data. Resolve current deployed implementation, exact ABI/schema, version, chain, units and account scope before preparing a payload. Documentation retrieval is not evidence of connected-provider access or successful execution.

- [StrategyManager interface](https://raw.githubusercontent.com/Layr-Labs/eigenlayer-contracts/main/src/contracts/interfaces/IStrategyManager.sol): deposit-share reads.
- [DelegationManager interface](https://raw.githubusercontent.com/Layr-Labs/eigenlayer-contracts/main/src/contracts/interfaces/IDelegationManager.sol): withdrawable/share scaling, queued requests, block delay and exact completion arguments. These main-branch sources are interface references, not proof of a deployed version.

- [Strategy interface](https://raw.githubusercontent.com/Layr-Labs/eigenlayer-contracts/main/src/contracts/interfaces/IStrategy.sol): use withdrawable shares and the View conversion for read-only estimates.
