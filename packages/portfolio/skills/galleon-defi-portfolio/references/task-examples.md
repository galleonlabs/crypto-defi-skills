# Worked task and changed evidence

Synthetic observations only; descriptive steps refer to discovered provider schemas, not literal API names.

## Worked successful task

**Request:** Give me a compact USD portfolio report and flow-adjusted change.

**Available evidence:** Consistent synthetic snapshot: wallet USDC 2,000; ETH 3,000 USD; vault receipt worth 5,000 USD includes 4,000 underlying and 1,000 accrued value already in receipt valuation; debt 1,500 USD. Prior NAV 7,500 USD; external deposit 500 USD; no withdrawals.

**Read sequence:** Read scoped accounts and valuation times; map receipt claims to underlying, remove overlaps, subtract debt and external flows.

**Completed answer:** Gross assets 10,000 USD; liabilities 1,500 USD; NAV 8,500 USD. Economic change = 8,500 - 7,500 - 500 = +500 USD. Receipt underlying is not added again. This is dollar change, not a time-weighted return or claim about realized profit.

## Recovery and continuation

**Changed evidence:** The vault price is stale and no compatible fresh valuation tool is available.

**Useful response:** Report known gross assets 5,000 USD less known debt 1,500 = 3,500 USD plus unvalued vault exposure. Do not report complete NAV or complete period change; identify the missing receipt valuation.
