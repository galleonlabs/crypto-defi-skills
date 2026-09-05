# Account modes

Query `userAbstraction` for the exact user or subaccount before planning. Current API values include `default`, `disabled`, `unifiedAccount`, `portfolioMargin`, and the discontinued `dexAbstraction`. Verify current meanings in official docs.

## Standard or manual

Spot and each perp DEX keep separate balances. Cross margin applies inside each DEX. Plans must identify the balance that funds the target action and any required user-managed transfer. Do not add a transfer to a trading ticket.

## Unified account

Balances for a collateral asset are unified across spot and the relevant perp DEXs. API users read balances and holds from spot clearinghouse state; individual DEX user-state balances may not represent usable equity. Compute the current unified account ratio from the documented formula and all applicable DEX states.

## Portfolio margin

Eligible spot assets, perp positions, borrowable assets, and supplied balances share one portfolio. The plan must read:

- current eligibility and mode
- `spotClearinghouseState`
- every relevant DEX state
- `borrowLendUserState`
- current reserve parameters, caps, LTVs, rates, and oracle inputs
- portfolio margin ratio and fallback conditions

Borrow and supply parameters are mutable. Caps can make behavior fall back to non-portfolio margin. Liquidation order across spot borrow and perp positions may be non-deterministic. Do not reduce this to a single per-position liquidation price.

## DEX abstraction

Treat discontinued DEX abstraction as a legacy state to migrate deliberately through a separate, user-signed workflow. Do not assume its balance movement is intuitive and do not change account mode inside a trading ticket.

## Planning consequence

Every ticket records the observed account mode and expires if it changes. Account-mode changes, transfers, API-wallet approval, and builder configuration require separate authorization and are outside `hyperliquid-execute`.
