# Benchmark data, October 2026

The results, method and limits are on the [benchmark page](../../BENCHMARK.md). This folder holds everything needed to audit or rerun it.

| Path | Contents |
| --- | --- |
| [`rubric.md`](rubric.md) | The fixed rubric and grader instructions, written before any model call |
| [`cases.json`](cases.json) | The 30 selected cases, pilot membership, selection notes and the figures each expected criterion must state |
| `runs/pilot/`, `runs/phase2/` | Per phase: `answers.jsonl` (every transcript, including tool calls, tool results, thinking summaries and per-request usage), `grades.jsonl` (every grading with per-criterion verdicts, quoted evidence, figure checks and overrides), manifests, `results.json` and generated tables |
| `runs/phase2/spot-check.md`, `runs/phase2/spot-sample.jsonl` | Claude's review of a random 10% of Phase 2 gradings, and the blind sample it used |
| `ledger.jsonl` | One line per API request: phase, job, outcome, reported usage and computed cost |
| [`harness/`](harness) | The harness source, its tests and its pinned SDK version |

Thinking signatures are omitted from transcripts. No credentials appear in any file.

The harness files' SHA-256 values at run time are in each manifest. Two changes came after the runs: the report recomputes quote checks with the ellipsis rule described in the rubric, and the CLI gained an `--out` option so a rerun can keep its own data and ledger. Neither touches how answers are produced or scored.
