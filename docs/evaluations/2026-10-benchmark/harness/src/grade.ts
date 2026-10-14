import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "node:fs";
import { Budget, BudgetExceeded, priceUsage, worstCase, type Reservation, type UsageLike } from "./budget.ts";
import { EFFORT, MAX_TOKENS, MODEL, RUBRIC_PATH, type Phase } from "./config.ts";
import type { CallModel } from "./agent.ts";
import type { SelectedCase } from "./cases.ts";
import { checkFigures, type FigureCheck } from "./numeric.ts";

export type Verdict = "yes" | "no" | "unclear";

/** The grader system prompt is the fenced grader-system block in rubric.md, used verbatim. */
export function graderSystem(rubric = readFileSync(RUBRIC_PATH, "utf8")): string {
  const match = rubric.match(/```grader-system\n([\s\S]*?)\n```/);
  if (!match) throw new Error("rubric.md has no grader-system block");
  return match[1]!;
}

export function criteriaIds(item: SelectedCase): string[] {
  return [...item.expected.map((_, index) => `E${index + 1}`), ...item.forbidden.map((_, index) => `F${index + 1}`)];
}

export function graderUserTurn(item: SelectedCase, answer: string): string {
  const criteria = [
    ...item.expected.map((text, index) => `E${index + 1}: ${text}`),
    ...item.forbidden.map((text, index) => `F${index + 1}: ${text}`),
  ].join("\n");
  return `<exercise>\nUser request: ${item.prompt}\n\nObservations: ${item.context}\n</exercise>\n\n<criteria>\n${criteria}\n</criteria>\n\n<answer>\n${answer}\n</answer>`;
}

export function graderSchema(item: SelectedCase): Anthropic.JSONOutputFormat {
  return {
    type: "json_schema",
    schema: {
      type: "object",
      properties: {
        criteria: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string", enum: criteriaIds(item) },
              verdict: { type: "string", enum: ["yes", "no", "unclear"] },
              evidence: { type: "string" },
              note: { type: "string" },
            },
            required: ["id", "verdict", "evidence", "note"],
            additionalProperties: false,
          },
        },
      },
      required: ["criteria"],
      additionalProperties: false,
    },
  };
}

export type CriterionGrade = {
  id: string;
  kind: "expected" | "forbidden";
  text: string;
  grader_verdict: Verdict;
  evidence: string;
  note: string;
  quote_found: boolean | null;
  figure_check?: FigureCheck;
  final_verdict: Verdict;
  overridden: boolean;
};

export type Metrics = { expected_share: number; forbidden_hits: number; strict_pass: boolean; unclear: number };

export type GradeRecord = {
  answer_id: string;
  phase: Phase;
  case_id: string;
  model: string;
  graded_at: string;
  status: "ok" | "error" | "budget_stopped";
  usage: UsageLike | null;
  cost_usd: number;
  wall_ms: number;
  criteria: CriterionGrade[];
  metrics: Metrics | null;
  thinking_summary: string;
  error?: string;
};

const normalize = (text: string) => text.replace(/\s+/g, " ").trim().toLowerCase();

/** A quote may join several excerpts with an ellipsis; each excerpt must appear in the answer. */
export function quoteFound(evidence: string, answer: string): boolean | null {
  const excerpts = evidence
    .split(/\.\.\.|…/)
    .map((part) => normalize(part.replace(/^[\s"'“|]+|[\s"'”|]+$/g, "")))
    .filter((part) => part.length > 0);
  if (excerpts.length === 0) return null;
  const haystack = normalize(answer);
  return excerpts.every((part) => haystack.includes(part));
}

/** Applies the rubric: figure overrides, then the three metrics. */
export function applyRubric(
  item: SelectedCase,
  answer: string,
  verdicts: { id: string; verdict: Verdict; evidence: string; note: string }[],
): { criteria: CriterionGrade[]; metrics: Metrics } {
  const byId = new Map(verdicts.map((entry) => [entry.id, entry]));
  const criteria: CriterionGrade[] = criteriaIds(item).map((id) => {
    const raw = byId.get(id);
    if (!raw) throw new Error(`grader omitted ${id}`);
    const expected = id.startsWith("E");
    const index = Number(id.slice(1)) - 1;
    const text = expected ? item.expected[index]! : item.forbidden[index]!;
    const grade: CriterionGrade = {
      id,
      kind: expected ? "expected" : "forbidden",
      text,
      grader_verdict: raw.verdict,
      evidence: raw.evidence,
      note: raw.note,
      quote_found: quoteFound(raw.evidence, answer),
      final_verdict: raw.verdict,
      overridden: false,
    };
    const figures = expected ? item.figures[index] ?? [] : [];
    if (figures.length > 0) {
      grade.figure_check = checkFigures(figures, answer);
      if (!grade.figure_check.present && raw.verdict !== "no") {
        grade.final_verdict = "no";
        grade.overridden = true;
      }
    }
    return grade;
  });
  const expected = criteria.filter((entry) => entry.kind === "expected");
  const forbidden = criteria.filter((entry) => entry.kind === "forbidden");
  const metrics: Metrics = {
    expected_share: expected.filter((entry) => entry.final_verdict === "yes").length / expected.length,
    forbidden_hits: forbidden.filter((entry) => entry.final_verdict === "yes").length,
    strict_pass: expected.every((entry) => entry.final_verdict === "yes") && forbidden.every((entry) => entry.final_verdict === "no"),
    unclear: criteria.filter((entry) => entry.final_verdict === "unclear").length,
  };
  return { criteria, metrics };
}

export type GradeJob = { answerId: string; phase: Phase; item: SelectedCase; answer: string };

/** The grader sees the case, the criteria and the final answer text. It never sees the arm, tool calls or thinking. */
export async function runGrade(call: CallModel, budget: Budget, job: GradeJob, system = graderSystem()): Promise<GradeRecord> {
  const record: GradeRecord = {
    answer_id: job.answerId,
    phase: job.phase,
    case_id: job.item.id,
    model: MODEL,
    graded_at: new Date().toISOString(),
    status: "error",
    usage: null,
    cost_usd: 0,
    wall_ms: 0,
    criteria: [],
    metrics: null,
    thinking_summary: "",
  };
  const params: Anthropic.MessageCreateParamsStreaming = {
    model: MODEL,
    max_tokens: MAX_TOKENS,
    stream: true,
    system,
    thinking: { type: "adaptive", display: "summarized" },
    output_config: { effort: EFFORT, format: graderSchema(job.item) },
    messages: [{ role: "user", content: graderUserTurn(job.item, job.answer) }],
  };
  const started = performance.now();
  for (let attempt = 1; attempt <= 3 && record.status !== "ok"; attempt++) {
    let reservation: Reservation;
    try {
      reservation = budget.reserve(worstCase(JSON.stringify(params).length, MAX_TOKENS));
    } catch (error) {
      if (!(error instanceof BudgetExceeded)) throw error;
      record.status = "budget_stopped";
      record.error = error.message;
      break;
    }
    const ledger = { phase: job.phase, kind: "grade" as const, job: job.answerId, request: attempt, model: MODEL };
    let message: Anthropic.Message;
    try {
      message = await call(params);
    } catch (error) {
      const reason = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      // Same rule as answers: an HTTP error status is not billed; a failed stream is charged in full.
      const status = error instanceof Anthropic.APIError ? error.status : undefined;
      const charge = typeof status === "number" ? 0 : reservation.amount;
      const note = charge ? `stream failed, charged reservation: ${reason}` : `rejected with HTTP ${status}, not billed: ${reason}`;
      record.cost_usd += budget.settle(reservation, { ...ledger, outcome: "failed", usage: null, note }, charge);
      record.error = reason;
      const retryable = status === undefined || status === 408 || status === 409 || status === 429 || status >= 500;
      if (!retryable) break;
      continue;
    }
    record.usage = message.usage;
    record.cost_usd += budget.settle(reservation, { ...ledger, outcome: "ok", usage: message.usage }, priceUsage(message.usage));
    record.thinking_summary = message.content
      .filter((block): block is Anthropic.ThinkingBlock => block.type === "thinking")
      .map((block) => block.thinking)
      .join("\n\n");
    try {
      if (message.stop_reason !== "end_turn") throw new Error(`grader stopped with ${message.stop_reason}`);
      const text = message.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("");
      const parsed = JSON.parse(text) as { criteria: { id: string; verdict: Verdict; evidence: string; note: string }[] };
      const ids = parsed.criteria.map((entry) => entry.id);
      if (new Set(ids).size !== ids.length) throw new Error("grader repeated a criterion id");
      const { criteria, metrics } = applyRubric(job.item, job.answer, parsed.criteria);
      record.criteria = criteria;
      record.metrics = metrics;
      record.status = "ok";
      delete record.error;
    } catch (error) {
      record.error = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    }
  }
  record.wall_ms = Math.round(performance.now() - started);
  return record;
}
