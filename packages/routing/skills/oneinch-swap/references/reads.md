# Read recipes and sources

Reviewed 2026-10-25. These recipes establish documented interfaces, not a live account or executed outcome.

Base `https://api.1inch.com/swap/v6.1/{chainId}` with `Authorization: Bearer` from private config.

- `GET /quote?src=...&dst=...&amount=...`: raw input, expected `dstAmount`.
- `GET /approve/spender`: documented router spender.
- `GET /approve/allowance?tokenAddress=...&walletAddress=...`: current allowance.
- `GET /swap?src=...&dst=...&amount=...&from=...&origin=...&slippage=...`: unsigned transaction construction; include documented receiver when it differs. The current schema requires both `from` (calling address) and `origin` (initiating EOA); resolve both rather than assuming they are equal.

Select the endpoint schema for the current chain/product. Classic routes and Fusion order lifecycles are not interchangeable. HTTP retrieval constructs no wallet authority.

## Primary sources

- [1inch Classic introduction](https://business.1inch.com/portal/documentation/apis/swap/classic-swap/introduction)
- [Classic quote reference](https://business.1inch.com/portal/documentation/apis/swap/classic-swap/methods/v6.1/chainId/quote/method/get)
- [Classic swap reference](https://business.1inch.com/portal/documentation/apis/swap/classic-swap/methods/v6.1/chainId/swap/method/get)
