# Offline exit assessment contract

Run `node scripts/assess-exit.mjs <snapshot.json>` from this skill directory, or pass `-` to read JSON from stdin. Node.js 20+ is sufficient; no install step, dependencies, provider key or sibling skill is needed. `--help` prints usage. The exported `assessExit(input)` function returns the same record when imported from JavaScript.

The helper does arithmetic on **supplied historical observations**. It does not read the chain, validate contract behavior, check freshness against a wall clock, simulate, authorize or build calldata. A positive reported portion still needs current implementation evidence, actual-caller simulation and appropriate authority before any write.

## Input

Use the bundled [synchronous example](../examples/sync-partial.json) or [asynchronous example](../examples/async-partial.json) as the exact JSON shape. Both are synthetic; their addresses and block are not a deployment recommendation.

| Field | Contract |
| --- | --- |
| `schemaVersion` | Number `1`. Unknown fields are rejected so spelling mistakes cannot silently change a result. |
| `snapshot` | `chainId` (positive integer string), `blockNumber` (integer string), `blockHash` (32-byte hex), and `vault`, `asset`, `shareToken`, `owner`, `controller`, `receiver`, `caller` (20-byte hex addresses). `assetDecimals` and `shareDecimals` are integers from 0 to 255. Resolve every role explicitly, even when addresses are equal. |
| `mode` | `erc4626` for verified synchronous redemption, `erc7540` for verified asynchronous redemption, or `unknown`. This is a supplied interface classification, not an auto-detection result. Synchronous ERC7575 entry points can use the synchronous branch with their external share token. |
| `intent` | `{ "unit": "assets" or "shares", "amountRaw": "..." }`. The amount is positive. This assesses a controller/owner-wide exit, not a selected request ID. |
| `reads` | All three keys `shareBalance`, `maxWithdraw`, `maxRedeem`. Each is `null` for an unavailable read or `{ "raw": "...", "blockHash": "..." }`. Share balance comes from `shareToken.balanceOf(owner)`; maxima come from the vault for `owner` in synchronous mode and `controller` in asynchronous mode. |
| `preview` | Optional or `null`. Otherwise `{ "method": "previewWithdraw" or "previewRedeem", "amountRaw": "...", "resultRaw": "...", "blockHash": "..." }`. Only an exact candidate preview supplies an estimate. Do not supply successful redemption previews for asynchronous mode. |
| `requests` | Optional or `null` for unknown inventory. Otherwise `{ "coverage": "complete" or "partial" or "unknown", "items": [...] }`. Each item has `requestId`, `pendingSharesRaw`, `claimableSharesRaw`, `blockHash`. Pending/claimable values may be `null` if unread; ID is always an integer string. Use only in asynchronous mode. |

Every raw amount is a canonical unsigned decimal string in uint256 range, never a JSON number, decimal fraction, symbol or formatted human amount. For example, 500 units of a 6-decimal asset is `"500000000"`; 400 shares with 18 decimals is `"400000000000000000000"`. The helper never combines asset and share units or converts using a guessed exchange rate.

All supplied read, preview and request hashes must match the snapshot hash. The collector must additionally verify the shared chain/vault/account/token scope and collect previews with `snapshot.caller` as the actual vault caller; repeating a block hash cannot authenticate observations. Record collection provenance in the accompanying decision record. Use `null` for a failed read, never zero.

Coverage is an explicit collector assertion. `complete` means the list covers the controller's full relevant request inventory at this vault and block; zero-ID implementations need only their one aggregate read. A recent event window is generally `partial`. An unread field remains unknown even in a complete inventory. An empty complete inventory asserts no outstanding requests but does not establish how earlier requests ended.

## Result

Amounts in `requested`, `available` and `remaining` use the original request unit. **`available` is only the portion of this request within the supplied limit**, not the whole wallet, entire vault liquidity or a current executable quote.

| `status` | Meaning |
| --- | --- |
| `observed-full-limit` | The requested amount fits the supplied relevant limit. Missing preview or incomplete request inventory can still appear in evidence issues. |
| `observed-partial-limit` | The observed portion is smaller; the remainder stays in the original requested unit. This grants no partial-exit authority. |
| `observed-zero-limit` | A zero limit was actually observed. No candidate is returned; this is not zero position value or confirmed settlement. |
| `needs-evidence` | Mode or required limit/balance evidence is missing. Amounts are unknown and no candidate is returned. |
| `inconsistent-evidence` | Observations conflict, for example mixed block hashes, duplicate IDs or impossible complete claimable-share coverage. No candidate is returned. Replace conflicting observations. |

A `candidate` is an indicative method and amount for further investigation, not a transaction. Its account role is `owner` for synchronous exits and `controller` for asynchronous claims; `receiver` remains separate. A synchronous `previewEstimate` distinguishes `shares-required` for withdraw from `assets-returned` for redeem. If absent, use the indicated exact preview or simulation; never fill it using another amount's ratio.

`asyncRequests` reports wallet shares separately, listed pending and claimable shares, inventory coverage and `totalsScope: listed-requests-only`. Partial totals are not the controller's full holdings. Controller-wide limits need not be attributed to the listed subset. ID zero cannot appear twice or alongside nonzero IDs. Conflicting request evidence leaves its aggregate totals unusable. Neither an empty list nor zero request values proves assets arrived.

`evidence.issues`, `evidence.requirements` and `nextRead` explain what remains. Exit code zero means the assessment ran, including `needs-evidence` or `inconsistent-evidence`; inspect `status`. Invalid schema/JSON, unreadable input and invalid CLI arguments exit with code one and a redacted diagnostic that does not echo the input or file path.

## Worked decisions

**Synchronous shares.** The example requests 1,000 shares with a 400-share limit. It returns an observed portion of 400 and remainder of 600. Its separate exact-size preview estimates 435.6 underlying assets. Replacing the preview with one for 1,000 shares keeps the portion but removes the estimate; the next read is a preview for 400 shares.

**Asynchronous assets.** The example requests 500 underlying assets. Wallet balance is zero, pending requests represent 600 shares, claimable requests represent 400 shares, and the controller's observed `maxWithdraw` is 420 assets. The supported portion is 420 assets, leaving 80 assets of the requested amount unsupported by the current limit. The indicative claim uses the controller, not the original owner. The pending 600 shares do not become an assumed 630 assets or a promised delivery date. This is neither proof that 420 was received nor permission to claim it.

**Incomplete history.** Marking the request inventory partial preserves the controller-wide 420-asset bound but makes listed request totals explicitly incomplete. Read the missing inventory before explaining the whole position or proposing a new request. A controller's ability to claim is not restricted by an already-depleted original wallet balance.
