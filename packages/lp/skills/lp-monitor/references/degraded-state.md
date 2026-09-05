# Degraded state

## Evidence classes

- `live`: direct current read within the stated freshness limit
- `indexed`: current indexer result with known lag
- `last-good`: prior verified state, marked with block and time
- `unknown`: unavailable or conflicting

A last-good value can preserve charts and explain changes. It cannot authorize an action or be relabeled as live.

## Failure behavior

- Keep security failures, data failures, and ordinary zero values distinct.
- Do not replace a failed current read with zero.
- Do not drop an existing position because its pool left a catalog.
- Do not overwrite historical basis during a partial sync.
- Do not publish a new canonical snapshot from an incomplete sweep unless the snapshot marks missing sections and preserves the prior good record.
- On RPC disagreement, record both blocks and stop action recommendations until reconciled.

When the position cannot be measured safely, return `state unknown`, preserve the last-good record as history, and list the exact read needed.
