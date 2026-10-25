# Read recipes and sources

Reviewed 2026-10-25. These recipes establish documented interfaces, not a live account or executed outcome.

Use current `@safe-global/protocol-kit` read methods such as `getOwners`, `getThreshold`, `getNonce` and version-matched module/guard inspection. API Kit can retrieve `getTransaction(safeTxHash)` and pending transactions from the selected chain service; inspect current auth requirements.

Compute `getTransactionHash` over the exact Safe transaction, without signing. `proposeTransaction`, `confirmTransaction`, `signTransaction` and `executeTransaction` mutate service/account/wallet state and are excluded from research. Corroborate `ExecutionSuccess`/`ExecutionFailure` and nonce via deployed Safe ABI and reread the actual affected asset or contract state.

## Primary sources

- [Safe Protocol Kit](https://docs.safe.global/sdk/protocol-kit)
- [Safe execution and nonce flow](https://docs.safe.global/sdk/protocol-kit/guides/execute-transactions)
- [Safe service proposal versus confirmation](https://docs.safe.global/sdk/api-kit/guides/propose-and-confirm-transactions)
