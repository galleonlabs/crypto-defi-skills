# Routing evals

`routing.json` is a portable prompt set for testing skill selection. Each case names one expected skill and skills that must not load.

CI validates the dataset's structure and coverage. It does not claim a model score. Record the model, client, date, prompt wrapper, and raw results before publishing any routing score.

Output-quality cases ship with the standalone skill at `skills/galleon-defi-data/evals/evals.json`. Run each in a fresh agent context with the installed skill and then with the previous released skill. Keep network access off for these synthetic cases. Save the answer and execution trace, grade every assertion with quoted evidence, and record any attempted tools or unnecessary reference loads. Keep outcomes separate from structural validation; a passing JSON fixture is not a passing model run.
