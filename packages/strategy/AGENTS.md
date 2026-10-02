# Strategy research pack

Own reproducible local daily strategy simulation. Keep the engine pure ESM so the exact algorithm can run in Node and a browser; host file access and input hashing belong in its CLI wrapper.

- This pack never signs, submits, provisions credentials or creates a trading scheduler.
- Preserve the next-observation convention, flow-neutral return accounting and same-flow/same-cost benchmark. Never substitute the signal observation as its execution price.
- Aggregate observations are research marks, not venue closes or realistic fills. Reject invalid, reversed, duplicated or gapped daily inputs rather than interpolating them.
- Add hand-calculated fixtures for changes to costs, timing, cash flows or drawdown. Future observations must not change prior decisions.
- Run package check, root check/pack/smoke and `validate-agent-skills packages/strategy/skills` before release. Tests have no network dependency.
