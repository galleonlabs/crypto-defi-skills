# Historical skill benchmark

The 14 October 2026 run compared 15 then-current skills on 30 synthetic cases. It does not measure the current 81 active skills. The [full original report](https://github.com/galleonlabs/crypto-defi-skills/blob/0fb6faf0369951b628c6b146f055f3d5c8c5e6cb/docs/BENCHMARK.md) and [frozen harness, transcripts, grades and ledger](https://github.com/galleonlabs/crypto-defi-skills/tree/0fb6faf0369951b628c6b146f055f3d5c8c5e6cb/docs/evaluations/2026-10-benchmark) remain available at an immutable source revision.

## Method

Claude Opus 5.5 answered each case three times with a skill and three times without it. The skill arm could read only its own bundled files; both arms used supplied synthetic observations. A separate model call graded each answer against author-written expected and forbidden criteria.

## Results

The original model grades counted 86 of 90 strict passes with a skill and 66 of 90 without. A strict pass required every expected criterion and no forbidden criterion. These are the original recorded grades, not a new evaluation of current packages.

## Limits

The cases and criteria were written by the skill author, and the grader used the same model family as the answerer. Source references in answers could reveal the arm. Later review found incorrect or uneven grades; the original verdicts were not rescored. See the [spot-check record](https://github.com/galleonlabs/crypto-defi-skills/blob/0fb6faf0369951b628c6b146f055f3d5c8c5e6cb/docs/evaluations/2026-10-benchmark/runs/phase2/spot-check.md).

The run establishes neither live provider compatibility nor financial execution, security or performance. Format, fixture, install and simulation checks answer different questions; see [Skill quality](SKILL-QUALITY.md).

## Reproduce

Use the [frozen harness README](https://github.com/galleonlabs/crypto-defi-skills/blob/0fb6faf0369951b628c6b146f055f3d5c8c5e6cb/docs/evaluations/2026-10-benchmark/README.md) and its pinned source. Re-running it consumes model credits and is separate from ordinary repository checks. Current contributor exercises use `bun run eval:behavior`; validating those fixtures does not run or grade a model.
