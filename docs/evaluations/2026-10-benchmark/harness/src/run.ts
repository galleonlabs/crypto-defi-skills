import { createHash } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { Budget } from "./budget.ts";
import { ARMS, BENCH_DIR, CAP_USD, EFFORT, JOB_HEADROOM_USD, MAX_REQUESTS, MAX_TOKENS, MODEL, PHASES, PRICES, PRICE_SOURCE, REPO, RUBRIC_PATH, SEED, type Arm, type Phase } from "./config.ts";
import { loadCases, type SelectedCase } from "./cases.ts";
import { runAnswer, type AnswerRecord, type CallModel } from "./agent.ts";
import { graderSystem, runGrade, type GradeRecord } from "./grade.ts";

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], seed: number): T[] {
  const random = mulberry32(seed);
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap]!, copy[index]!];
  }
  return copy;
}

/** Opaque id: the arm cannot be read from it. */
export function answerId(phase: Phase, caseId: string, arm: Arm, repeat: number): string {
  return createHash("sha256").update(`${SEED}|${phase}|${caseId}|${arm}|${repeat}`).digest("hex").slice(0, 12);
}

export const sha256 = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");

export function readJsonl<T>(path: string): T[] {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8").split("\n").filter((line) => line.trim()).map((line) => JSON.parse(line) as T);
}

async function pool<T>(items: readonly T[], concurrency: number, work: (item: T) => Promise<boolean>): Promise<void> {
  let next = 0;
  let stop = false;
  const worker = async () => {
    while (!stop && next < items.length) {
      const item = items[next++]!;
      if (!(await work(item))) stop = true;
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
}

export type RunOptions = { phase: Phase; call: CallModel; outDir: string; ledgerPath: string; concurrency: number; log?: (line: string) => void };

const COMPLETE: AnswerRecord["status"][] = ["ok", "refusal", "max_tokens", "request_cap"];

function gitCommit(): string {
  const result = spawnSync("git", ["rev-parse", "HEAD"], { cwd: REPO, encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : "unknown";
}

function manifest(phase: Phase, cases: SelectedCase[], budget: Budget, stage: string) {
  const harness = ["agent.ts", "budget.ts", "cases.ts", "chart.ts", "cli.ts", "config.ts", "grade.ts", "numeric.ts", "report.ts", "run.ts", "stub.ts"];
  return {
    phase,
    stage,
    written_at: new Date().toISOString(),
    repository_commit: gitCommit(),
    rubric_sha256: sha256(RUBRIC_PATH),
    cases_sha256: sha256(resolve(BENCH_DIR, "cases.json")),
    harness_sha256: Object.fromEntries(harness.map((file) => [file, sha256(resolve(BENCH_DIR, "harness/src", file))])),
    sdk: JSON.parse(readFileSync(resolve(BENCH_DIR, "harness/node_modules/@anthropic-ai/sdk/package.json"), "utf8")).version as string,
    model: MODEL,
    effort: EFFORT,
    thinking: { type: "adaptive", display: "summarized" },
    max_tokens: MAX_TOKENS,
    max_requests_per_answer: MAX_REQUESTS,
    repeats: PHASES[phase].repeats,
    seed: SEED,
    cases: cases.map((item) => item.id),
    prices_usd_per_mtok: PRICES,
    price_source: PRICE_SOURCE,
    cap_usd: CAP_USD,
    ledger_spent_usd: Number(budget.spent.toFixed(6)),
  };
}

export async function runAnswers(options: RunOptions): Promise<AnswerRecord[]> {
  const { phase, call, outDir, concurrency } = options;
  const log = options.log ?? ((line: string) => process.stdout.write(`${line}\n`));
  mkdirSync(outDir, { recursive: true });
  const cases = loadCases(phase);
  const budget = new Budget(CAP_USD, options.ledgerPath);
  const answersPath = resolve(outDir, "answers.jsonl");
  const done = new Set(readJsonl<AnswerRecord>(answersPath).filter((record) => COMPLETE.includes(record.status)).map((record) => record.answer_id));
  const jobs = shuffle(
    cases.flatMap((item) =>
      ARMS.flatMap((arm) => Array.from({ length: PHASES[phase].repeats }, (_, index) => ({ answerId: answerId(phase, item.id, arm, index + 1), phase, item, arm, repeat: index + 1 }))),
    ),
    SEED,
  ).filter((job) => !done.has(job.answerId));
  writeFileSync(resolve(outDir, "manifest.answers.json"), `${JSON.stringify(manifest(phase, cases, budget, "answers:start"), null, 2)}\n`);
  log(`${phase}: ${jobs.length} answers to run, ${done.size} already complete, spent so far $${budget.spent.toFixed(4)} of $${CAP_USD}`);
  const records: AnswerRecord[] = [];
  await pool(jobs, concurrency, async (job) => {
    if (budget.remaining() < JOB_HEADROOM_USD) {
      log(`stop: $${budget.remaining().toFixed(4)} left under the cap is below the $${JOB_HEADROOM_USD} job headroom`);
      return false;
    }
    const record = await runAnswer(call, budget, job);
    appendFileSync(answersPath, `${JSON.stringify(record)}\n`);
    records.push(record);
    const cost = record.requests.reduce((sum, request) => sum + request.cost_usd, 0);
    log(`${record.case_id} ${record.arm} r${record.repeat}: ${record.status}, ${record.requests.length} requests, ${record.tool_calls.length} reads, $${cost.toFixed(4)}, total $${budget.spent.toFixed(4)}`);
    return record.status !== "budget_stopped";
  });
  writeFileSync(resolve(outDir, "manifest.answers.json"), `${JSON.stringify(manifest(phase, cases, budget, "answers:end"), null, 2)}\n`);
  return records;
}

export async function runGrades(options: RunOptions): Promise<GradeRecord[]> {
  const { phase, call, outDir, concurrency } = options;
  const log = options.log ?? ((line: string) => process.stdout.write(`${line}\n`));
  const cases = new Map(loadCases(phase).map((item) => [item.id, item]));
  const budget = new Budget(CAP_USD, options.ledgerPath);
  const gradesPath = resolve(outDir, "grades.jsonl");
  const graded = new Set(readJsonl<GradeRecord>(gradesPath).filter((record) => record.status === "ok").map((record) => record.answer_id));
  const answers = readJsonl<AnswerRecord>(resolve(outDir, "answers.jsonl")).filter((record) => COMPLETE.includes(record.status));
  // Latest record per answer id wins, so a resumed run never grades a superseded attempt.
  const latest = new Map(answers.map((record) => [record.answer_id, record]));
  const jobs = shuffle([...latest.values()], SEED + 1)
    .filter((record) => !graded.has(record.answer_id))
    .map((record) => ({ answerId: record.answer_id, phase, item: cases.get(record.case_id)!, answer: record.final_text }));
  const system = graderSystem();
  writeFileSync(resolve(outDir, "manifest.grades.json"), `${JSON.stringify(manifest(phase, [...cases.values()], budget, "grades:start"), null, 2)}\n`);
  log(`${phase}: ${jobs.length} answers to grade, spent so far $${budget.spent.toFixed(4)} of $${CAP_USD}`);
  const records: GradeRecord[] = [];
  await pool(jobs, concurrency, async (job) => {
    if (budget.remaining() < JOB_HEADROOM_USD) {
      log(`stop: $${budget.remaining().toFixed(4)} left under the cap is below the $${JOB_HEADROOM_USD} job headroom`);
      return false;
    }
    const record = await runGrade(call, budget, job, system);
    appendFileSync(gradesPath, `${JSON.stringify(record)}\n`);
    records.push(record);
    const summary = record.metrics ? `strict ${record.metrics.strict_pass}, expected ${record.metrics.expected_share.toFixed(2)}, forbidden ${record.metrics.forbidden_hits}` : record.error;
    log(`grade ${record.answer_id} ${record.case_id}: ${record.status}, ${summary}, $${record.cost_usd.toFixed(4)}, total $${budget.spent.toFixed(4)}`);
    return record.status !== "budget_stopped";
  });
  writeFileSync(resolve(outDir, "manifest.grades.json"), `${JSON.stringify(manifest(phase, [...cases.values()], budget, "grades:end"), null, 2)}\n`);
  return records;
}
