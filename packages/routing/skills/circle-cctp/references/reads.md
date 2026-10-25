# Read recipes and sources

Reviewed 2026-10-25. These recipes establish documented interfaces, not a live account or executed outcome.

For CCTP V2 mainnet query `GET https://iris-api.circle.com/v2/messages/{sourceDomain}?transactionHash={sourceHash}`. Testnet uses API host `iris-api-sandbox.circle.com` with the same versioned message path; follow the [message endpoint reference](https://developers.circle.com/api-reference/cctp/all/get-messages-v2) and never mix environments. Match the message's own attestation/status and identities rather than taking the first array entry.

Current EVM V2 flow uses `TokenMessengerV2.depositForBurn` and destination `MessageTransmitterV2.receiveMessage(message, attestation)`. These are financial writes, not diagnostic calls. Read receipt logs and deployed nonce/message-consumption state using the matching verified ABI. Circle's testnet quickstart demonstrates the mechanism; its example addresses are not mainnet deployment instructions.

## Primary sources

- [CCTP technical architecture](https://developers.circle.com/cctp/references/technical-guide)
- [Circle message API](https://developers.circle.com/api-reference/cctp/all/get-messages-v2)
- [Current EVM quickstart and recovery context](https://developers.circle.com/cctp/quickstarts/transfer-usdc-ethereum-to-arc)
- [Finality](https://developers.circle.com/cctp/concepts/finality-and-block-confirmations)
