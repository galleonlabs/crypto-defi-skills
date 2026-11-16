# Prediction skill evaluations

`routing.json` is a portable prompt set for testing skill selection. Each case names one expected skill and the skills that must not load, including the neighbouring research or resolution skill and nearby trading packs.

`behavior.json` holds synthetic research and resolution exercises, including stale books, disputed outcomes and ledger mismatches. CI validates the structure and coverage of both files. Neither is a model score or a live market test. Record the model, client, date, prompt wrapper and raw results, and grade every criterion independently, before claiming a model outcome.
