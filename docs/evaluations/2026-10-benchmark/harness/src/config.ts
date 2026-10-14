import { resolve } from "node:path";

/** Benchmark folder: docs/evaluations/2026-10-benchmark. */
export const BENCH_DIR = resolve(import.meta.dir, "../..");
/** Repository root. */
export const REPO = resolve(BENCH_DIR, "../../..");
export const RUBRIC_PATH = resolve(BENCH_DIR, "rubric.md");
export const CASES_PATH = resolve(BENCH_DIR, "cases.json");
export const LEDGER_PATH = resolve(BENCH_DIR, "ledger.jsonl");
export const RUNS_DIR = resolve(BENCH_DIR, "runs");

export const MODEL = "claude-opus-5-5";
export const EFFORT = "high" as const;
export const MAX_TOKENS = 32_000;
/** Model requests per with-skill answer; the last one is sent with tool_choice none. */
export const MAX_REQUESTS = 12;
export const SEED = 20261014;

/** Hard spend ceiling for every API call in the benchmark, pilot included. */
export const CAP_USD = 45;
/** Do not start a new answer or grade job when less than this remains under the cap. */
export const JOB_HEADROOM_USD = 2;

/**
 * Published first-party prices in USD per million tokens for claude-opus-5-5,
 * read from the pricing page on 2026-10-14.
 */
export const PRICES = {
  input: 4,
  cacheWrite5m: 5,
  cacheWrite1h: 8,
  cacheRead: 0.2,
  output: 20,
} as const;
export const PRICE_SOURCE = {
  url: "https://platform.claude.com/docs/en/about-claude/pricing",
  retrieved: "2026-10-14",
} as const;
/** Regional or multi-region inference carries a 10% premium. */
export const REGIONAL_MULTIPLIER = 1.1;

export const PHASES = {
  pilot: { repeats: 1 },
  phase2: { repeats: 3 },
} as const;
export type Phase = keyof typeof PHASES;
export const ARMS = ["with_skill", "without_skill"] as const;
export type Arm = (typeof ARMS)[number];
