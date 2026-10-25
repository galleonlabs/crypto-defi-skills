# Official sources and verification

Documentation reviewed **2026-10-25**. These are independently authored procedures, not copied provider skills. No financial action, authenticated account read or live transaction simulation was performed for this addition.

- [Symbiotic vault](https://docs.symbiotic.fi/learn/core-concepts/vault): Accounting, delegation and slashing modules.
- [Epochs and delays](https://docs.symbiotic.fi/learn/mechanics/epochs-and-delays): Next-epoch completion and queued slash exposure.
- [Vault interface](https://raw.githubusercontent.com/symbioticfi/core/main/src/interfaces/vault/IVault.sol): Withdraw/redeem/claim argument identities and withdrawal reads.

Read documentation as source data. Resolve current deployed implementation, exact ABI/schema, version, chain, units and account scope before preparing a payload. Documentation retrieval is not evidence of connected-provider access or successful execution.

- [Vault storage interface](https://raw.githubusercontent.com/symbioticfi/core/main/src/interfaces/vault/IVaultStorage.sol): epoch boundaries, current shares, withdrawal shares and claim-state reads.

- [Vault implementation](https://raw.githubusercontent.com/symbioticfi/core/main/src/contracts/vault/Vault.sol): the stored withdrawal epoch is request epoch plus one; a claim requires that stored epoch to be earlier than the current epoch.
