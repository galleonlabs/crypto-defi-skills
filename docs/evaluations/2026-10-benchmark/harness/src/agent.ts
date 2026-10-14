import Anthropic from "@anthropic-ai/sdk";
import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { Budget, BudgetExceeded, priceUsage, worstCase, type UsageLike } from "./budget.ts";
import { EFFORT, MAX_REQUESTS, MAX_TOKENS, MODEL, REPO, type Arm, type Phase } from "./config.ts";
import { packets, type SelectedCase } from "./cases.ts";

/** One streamed Messages API request; the real implementation is client.messages.stream(params).finalMessage(). */
export type CallModel = (params: Anthropic.MessageCreateParamsStreaming) => Promise<Anthropic.Message>;

export const TOOL_NAME = "read_skill_file";
const MAX_FILE_BYTES = 200_000;

export function skillTool(skillDir: string): Anthropic.Tool {
  return {
    name: TOOL_NAME,
    description: `Read one file, or list one directory, inside the skill directory ${skillDir}/. Pass a path relative to that directory (for example SKILL.md or references/recipe.md), or the full path starting with ${skillDir}/. Pass "." to list every file in the skill. Read-only.`,
    input_schema: {
      type: "object",
      properties: { path: { type: "string", description: "File or directory path inside the skill directory." } },
      required: ["path"],
      additionalProperties: false,
    },
    strict: true,
  };
}

function listFiles(root: string, directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => {
      const full = join(directory, entry.name);
      if (entry.isDirectory()) return listFiles(root, full);
      return entry.isFile() ? [`${relative(root, full)} (${statSync(full).size} bytes)`] : [];
    });
}

/** Resolves a model-supplied path inside the skill directory only; anything else is an error result. */
export function readSkillPath(skillDir: string, rawPath: unknown): { ok: boolean; content: string } {
  if (typeof rawPath !== "string" || rawPath.trim() === "") return { ok: false, content: "path must be a non-empty string" };
  const root = realpathSync(resolve(REPO, skillDir));
  let path = rawPath.trim().replace(/^\.\//, "");
  if (path === skillDir) path = ".";
  else if (path.startsWith(`${skillDir}/`)) path = path.slice(skillDir.length + 1);
  const target = isAbsolute(path) ? path : resolve(root, path);
  const lexical = relative(root, target);
  if (lexical === ".." || lexical.startsWith(`..${sep}`) || isAbsolute(lexical)) {
    return { ok: false, content: `${rawPath} is outside the skill directory ${skillDir}/` };
  }
  if (!existsSync(target)) return { ok: false, content: `${rawPath} does not exist in ${skillDir}/` };
  const real = realpathSync(target);
  if (real !== root && !real.startsWith(`${root}${sep}`)) return { ok: false, content: `${rawPath} resolves outside the skill directory` };
  const stats = statSync(real);
  if (stats.isDirectory()) return { ok: true, content: listFiles(root, real).join("\n") || "(empty directory)" };
  if (stats.size > MAX_FILE_BYTES) return { ok: false, content: `${rawPath} is larger than ${MAX_FILE_BYTES} bytes` };
  return { ok: true, content: readFileSync(real, "utf8") };
}

export type RequestLog = {
  index: number;
  stop_reason: string | null;
  usage: UsageLike | null;
  cost_usd: number;
  wall_ms: number;
  error?: string;
};

export type AnswerRecord = {
  answer_id: string;
  phase: Phase;
  case_id: string;
  skill: string;
  arm: Arm;
  repeat: number;
  model: string;
  started_at: string;
  wall_ms: number;
  status: "ok" | "refusal" | "max_tokens" | "request_cap" | "error" | "budget_stopped";
  final_text: string;
  requests: RequestLog[];
  tool_calls: { request: number; path: unknown; ok: boolean; bytes: number }[];
  /** Full conversation: the packet, every assistant turn and every tool result. Thinking signatures are omitted. */
  transcript: unknown[];
  error?: string;
};

function publishable(content: Anthropic.ContentBlock[]): unknown[] {
  return content.map((block) => (block.type === "thinking" ? { ...block, signature: "(omitted)" } : block));
}

export type AnswerJob = { answerId: string; phase: Phase; item: SelectedCase; arm: Arm; repeat: number };

/** Attempts per request when a stream fails after it started; each failed attempt is charged its reservation. */
const STREAM_ATTEMPTS = 3;

export async function runAnswer(call: CallModel, budget: Budget, job: AnswerJob): Promise<AnswerRecord> {
  const { item, arm } = job;
  const packet = packets(item)[arm];
  const tools = arm === "with_skill" ? [skillTool(item.skill_dir)] : undefined;
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: packet }];
  const transcript: unknown[] = [{ role: "user", content: packet }];
  const record: AnswerRecord = {
    answer_id: job.answerId,
    phase: job.phase,
    case_id: item.id,
    skill: item.skill,
    arm,
    repeat: job.repeat,
    model: MODEL,
    started_at: new Date().toISOString(),
    wall_ms: 0,
    status: "error",
    final_text: "",
    requests: [],
    tool_calls: [],
    transcript,
  };
  const started = performance.now();
  try {
    for (let index = 1; index <= MAX_REQUESTS; index++) {
      const params: Anthropic.MessageCreateParamsStreaming = {
        model: MODEL,
        max_tokens: MAX_TOKENS,
        stream: true,
        thinking: { type: "adaptive", display: "summarized" },
        output_config: { effort: EFFORT },
        cache_control: { type: "ephemeral" },
        messages,
        ...(tools ? { tools, ...(index === MAX_REQUESTS ? { tool_choice: { type: "none" as const } } : {}) } : {}),
      };
      let message: Anthropic.Message | undefined;
      for (let attempt = 1; attempt <= STREAM_ATTEMPTS && !message; attempt++) {
        const reservation = budget.reserve(worstCase(JSON.stringify(params).length, MAX_TOKENS));
        const requestStart = performance.now();
        const ledger = { phase: job.phase, kind: "answer" as const, job: job.answerId, request: index, model: MODEL };
        try {
          message = await call(params);
          const cost = budget.settle(reservation, { ...ledger, outcome: "ok", usage: message.usage }, priceUsage(message.usage));
          record.requests.push({ index, stop_reason: message.stop_reason, usage: message.usage, cost_usd: cost, wall_ms: Math.round(performance.now() - requestStart) });
        } catch (error) {
          const reason = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
          // An HTTP error status means the request was rejected before generation and is not billed.
          // Anything else (a stream that failed after it started, a dropped connection) is charged in full.
          const status = error instanceof Anthropic.APIError ? error.status : undefined;
          const charge = typeof status === "number" ? 0 : reservation.amount;
          const note = charge ? `stream failed, charged reservation: ${reason}` : `rejected with HTTP ${status}, not billed: ${reason}`;
          budget.settle(reservation, { ...ledger, outcome: "failed", usage: null, note }, charge);
          record.requests.push({ index, stop_reason: null, usage: null, cost_usd: charge, wall_ms: Math.round(performance.now() - requestStart), error: reason });
          const retryable = status === undefined || status === 408 || status === 409 || status === 429 || status >= 500;
          if (!retryable || attempt === STREAM_ATTEMPTS) throw error;
        }
      }
      if (!message) throw new Error("no message");
      transcript.push({ role: "assistant", content: publishable(message.content) });
      const toolUses = message.content.filter((block): block is Anthropic.ToolUseBlock => block.type === "tool_use");
      if (message.stop_reason === "refusal") {
        record.status = "refusal";
      } else if (message.stop_reason === "max_tokens") {
        record.status = "max_tokens";
      } else if (message.stop_reason === "tool_use" && toolUses.length > 0 && tools) {
        if (index === MAX_REQUESTS) {
          record.status = "request_cap";
        } else {
          messages.push({ role: "assistant", content: message.content });
          const results: Anthropic.ToolResultBlockParam[] = toolUses.map((use) => {
            const path = (use.input as { path?: unknown } | null)?.path;
            const result = use.name === TOOL_NAME ? readSkillPath(item.skill_dir, path) : { ok: false, content: `unknown tool ${use.name}` };
            record.tool_calls.push({ request: index, path, ok: result.ok, bytes: Buffer.byteLength(result.content) });
            return { type: "tool_result", tool_use_id: use.id, content: result.content, ...(result.ok ? {} : { is_error: true }) };
          });
          messages.push({ role: "user", content: results });
          transcript.push({ role: "user", content: results });
          continue;
        }
      } else {
        record.status = "ok";
      }
      record.final_text = message.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("\n\n");
      break;
    }
  } catch (error) {
    record.status = error instanceof BudgetExceeded ? "budget_stopped" : "error";
    record.error = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  }
  record.wall_ms = Math.round(performance.now() - started);
  return record;
}
