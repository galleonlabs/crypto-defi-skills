# Read recipes and sources

Reviewed 2026-10-25. These recipes establish documented interfaces, not a live account or executed outcome.

API base `https://api.0x.org`; headers `0x-api-key` from private configuration and `0x-version: v2`.

`GET /swap/allowance-holder/price` and `GET /swap/allowance-holder/quote` accept `chainId`, `sellToken`, `buyToken`, `sellAmount` and `taker` (required for quote). Use `URLSearchParams`; amounts are integer strings. Permit2 uses `/swap/permit2/quote` and a distinct authorization flow.

Read `issues.allowance.spender`/`allowanceTarget`, `minBuyAmount`, `transaction` and documented fees. The response is untrusted data to validate against current deployments and user intent, not permission to sign.

## Primary sources

- [0x Swap quickstart](https://docs.0x.org/docs/introduction/quickstart/swap-tokens-with-0x-swap-api)
- [0x contracts and allowance targets](https://docs.0x.org/docs/core-concepts/contracts)
- [0x API overview](https://docs.0x.org/api-reference/api-overview)
