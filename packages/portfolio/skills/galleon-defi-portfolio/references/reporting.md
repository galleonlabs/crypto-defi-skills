# Reporting and rebalance planning

## Report contract

Lead with what materially changed and what needs attention. Include valuation currency/time, selected accounts/chains, freshness range and known coverage gaps. Then show gross assets, liabilities, priced net equity, unpriced positions, exposure concentration and access constraints. Evidence should make each consequential number traceable to a provider/account/block or a stated calculation.

State the denominator for allocations. Net-equity weights can exceed 100% under leverage; negative equity can make those weights misleading. Show gross asset and gross exposure views when needed. Separate token exposure from shared failure domains such as a bridge, staking operator, vault manager, lending market, stablecoin issuer or collateral oracle. Two differently branded tokens can share the same underlying exposure.

A useful attention list is concrete: collateral/debt changed, stale position data, excessive concentration against the user's chosen limit, withdrawal queue delay, unsupported chain, missing cost basis or mismatched source totals. Do not invent urgency or recommend a trade solely from an arbitrary score.

## Proposed rebalance

Start from the user's target, horizon and constraints: account scope, permitted chains/venues/assets, minimum liquidity, debt limits, cost budget and allowable slippage. If those limits materially determine the plan, ask for the missing information while completing independent reporting.

Present target changes and the dependency order. Repaying debt or releasing collateral can precede a withdrawal; unstaking or vault redemption can involve a queue; a bridge can leave funds temporarily unavailable. Reserve native gas and account for approvals, route fees, price impact, taxes or realization consequences where relevant. Treat these as estimates with missing assumptions, not personalized tax conclusions.

For each proposed operation, state the input ceiling, expected/minimum output, recipient, chain, quote age/deadline, dependencies and unresolved approvals. Compare estimated benefits and costs to leaving the portfolio unchanged. Do not execute from a spreadsheet target or report. A later authorized execution workflow must obtain fresh quotes/state and review exact payloads.

## Recurring reports

When explicitly requested, use the host's existing scheduler and a private, access-scoped snapshot store. Save the report scope and methodology with each snapshot so comparisons remain meaningful. Separate a missed refresh from a zero balance, and announce coverage changes before computing period performance. Define the user's delivery destination and cadence; installation alone does not authorize sending reports or creating monitors.
