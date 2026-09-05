# Contributing

Contributions should make one user intent safer or more precise.

## Before opening a pull request

1. Open an issue for a new skill or a material scope change.
2. Cite current Hyperliquid documentation or official SDK code for protocol claims.
3. Add routing cases for prompts that should and should not load the skill.
4. Add a reproducible test for arithmetic, parsing, or failure behavior.
5. Run `bun run check`.

Keep `SKILL.md` concise. Put conditional mechanics in one-level `references/` files and repeated deterministic work in `scripts/`. Never include secrets, account data, proprietary strategies, or claims of expected return.

Protocol changes should state the observation date and avoid copying mutable values into permanent rules when a live read exists.
