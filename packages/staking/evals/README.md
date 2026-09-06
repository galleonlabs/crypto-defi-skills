# Routing evals

`routing.json` is a portable prompt set for testing skill selection. Each case names one expected skill and the skills that must not load. Negative cases name this pack's nearest neighbours, because a wrong pack is the failure a consumer notices first.

CI validates the dataset's structure and coverage. It does not claim a model score. Record the model, client, date, prompt wrapper, and raw results before publishing any routing score.

Output-quality cases for this pack are the offline scenarios in [workflows](../skills/galleon-defi-staking/references/workflows.md). Run them in a fresh agent context with the installed skill and no credentials, grade every required behavior with quoted evidence, and keep those outcomes separate from this structural validation.
