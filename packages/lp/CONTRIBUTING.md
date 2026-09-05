# Contributing

Contributions should make LP work safer, clearer, or more reproducible.

## Good changes

- Add a protocol behavior backed by primary documentation and a reproducible read.
- Add a failure case from a real receipt, simulation, audit, or postmortem.
- Tighten a trigger description so the right skill loads.
- Add deterministic arithmetic or validation with tests.
- Remove stale instructions, duplicated prose, or hardcoded deployment data.

## Pull requests

1. Open an issue for a new protocol or a material workflow change.
2. Keep each skill self-contained. Individual skill installs must not depend on sibling directories.
3. Put the decision loop in `SKILL.md`; move detailed tables and cases to one-level `references/` files.
4. Keep `SKILL.md` below 500 lines.
5. Add positive, negative, and failure-path routing cases under `evals/`.
6. Run `bun run check`.

A protocol claim without a source or test is incomplete. A transaction path without recovery behavior will not merge.

## Style

Use direct technical prose. Define terms once. Do not use hype, filler, emojis, em dashes, or promises of returns. Date any market number and identify its source.

## Scope

This repository may prepare and validate transaction plans. It must never store private keys, seed phrases, session tokens, production cookies, or unrestricted RPC credentials.
