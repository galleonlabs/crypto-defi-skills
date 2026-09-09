# Skill quality review, 9 September 2026

This source update improves task completion and user configuration across 14 independently installable packs, covering 26 active skills. It retains existing public skill names, provider choice and authorization boundaries. It adds task-specific intake, calculated successful examples, recovery paths, preference reuse, and 52 behavioral fixtures with a neutral packet exporter.

## Comparison basis

Reviewed Minara's [public skill source](https://github.com/Minara-AI/minara-skills/tree/b93aba1029827c37cf5ad82b19bfa8c289912091) and [benchmark source](https://github.com/Minara-AI/crypto-skill-benchmark/tree/cc0593aea350de0e31598c31a88d16019f254a0b). Minara's clear intent-to-operation-to-result pattern informed these changes. Its platform documentation does not establish that every hosted capability ships in its skill. Its benchmark generates plain-text model responses; it does not supply evidence of actual financial tool execution.

The generic packs already contain substantial risk, accounting and recovery guidance. The changes focus on useful successful outcomes and preserving the user's chosen scope. LP and Hyperliquid also gained action-specific intake, explicit preference handling, experiment provenance and verifiable monitor lifecycle guidance. Read-only packs remain read-only.

## Evidence and reproducibility

- Source base: `ff81e4fa5e3633a16fc0588325b2f2d79099049f` plus this working-tree update. The digest records the evaluated pre-release skill tree, before metadata-only version bumps. Publication is verified separately; these exercises do not describe a deployed Boomkin installation.
- Skill tree digest: `dfa5910eda47e39bacf6b26afe1dcd2cc02547d1c62011088078d76bdd6574ae`. SHA-256 over sorted relative paths under `packages/*/skills`, each followed by NUL, file bytes and NUL; 275 files.
- Client: Codex agent exercises. Exact serving model revision and generation parameters were not captured, so this is not a reproducible cross-model score.
- General cases use changed amounts, horizons and user objectives compared with the teaching examples, including reversed recommendations. The performing agent did not read grading fields. [General responses](general-responses.md) record 26 answers and supplied versus missing observations.
- [Venue responses](venue-responses.md) record 26 answers. Their author also authored the fixtures and knew the criteria; this run is explicitly author-aware. A separate reviewer inspected the responses.
- Synthetic packet observations replace external provider responses. Tool execution, transactions, real scheduler registration and actual project implementation were not performed in these exercises. No live performance or Minara score parity is claimed.

Run `bun run eval:behavior` to check all fixture contracts. Run `bun run eval:behavior -- lending-useful-result` for one neutral packet. A performing agent reads the skill and relevant references, answers the packet, and records actual tool reads separately from supplied observations. A different reviewer inspects the answer against the expected and forbidden criteria in the owning pack's `evals/behavior.json`.

For stronger subsequent evidence, supply callable mock tools with recorded calls and temporary project fixtures, then repeat with pinned model settings and both old and new skill revisions. In particular, a textual submission receipt cannot prove one-send behavior, and named SDK methods cannot prove an implementation without source files and executable tests.

## Local validation

`bun run check` passed 165 tests across package and root suites. All 14 packages passed dry-run packing, clean independent npm installation and Node CLI smoke tests. Independent `validate-agent-skills` checks passed for all 28 installed skill directories, including two LP rename notices, with no errors or warnings. These checks establish package/structure integrity; they are separate from response review and live integration evidence.

## Response review and remaining evidence

The [independent review](review.md) checked all 52 responses. It found no arithmetic error, unsafe-action response or failure to incorporate updated evidence. Actual implementation/test assertions in two venue cases and actual submission/one-send assertions in two venue cases remain unproven by this text-only exercise. The payment answer correctly disclosed missing encoded payload bytes, but its readiness wording could be narrower. The payment teaching example and expectation were then clarified: calculated terms and supplied simulation do not establish a signable artifact. The recorded response is retained unchanged.

These observations support the usefulness of the revised instructions on the supplied scenarios. They do not establish parity with Minara, complete tool integration, or an improvement percentage against the previous skill revision.
