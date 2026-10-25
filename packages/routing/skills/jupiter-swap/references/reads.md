# Read recipes and sources

Reviewed 2026-10-25. These recipes establish documented interfaces, not a live account or executed outcome.

Quote-only documented example:

```sh
curl 'https://api.jup.ag/swap/v2/order?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=100000000'
```

This reads a 0.1-SOL quote; verify current mint identities before real use. No taker means no transaction. Keyless docs state 0.5 requests/second; optional `x-api-key` uses the user's private key configuration. `/execute` submits a signed transaction and is excluded from read-only diagnostics. Use Solana `getSignatureStatuses` and `getTransaction` for existing-signature corroboration, preserving commitment and slot.

## Primary sources

- [Jupiter Swap v2 overview](https://developers.jup.ag/docs/swap)
- [Order and execute](https://developers.jup.ag/docs/swap/order-and-execute)
- [Jupiter build route](https://developers.jup.ag/docs/swap/build)
