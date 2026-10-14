import { resolve } from "node:path";
import { ARMS, SEED, type Arm, type Phase } from "./config.ts";
import { loadCases } from "./cases.ts";
import type { AnswerRecord } from "./agent.ts";
import { quoteFound, type GradeRecord } from "./grade.ts";
import type { LedgerEntry } from "./budget.ts";
import { mulberry32, readJsonl } from "./run.ts";

type Row = { answer: AnswerRecord; grade: GradeRecord };
const mean = (values: number[]) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : Number.NaN);
const pct = (value: number) => `${(value * 100).toFixed(1)}%`;
const signedPct = (value: number) => `${value >= 0 ? "+" : "-"}${Math.abs(value * 100).toFixed(1)} pts`;
const fixed = (value: number, digits = 2) => value.toFixed(digits);

export function latestById<T extends { answer_id: string }>(records: T[]): Map<string, T> {
  return new Map(records.map((record) => [record.answer_id, record]));
}

export function bootstrap(differences: number[], seed = SEED, resamples = 10_000): [number, number] {
  const random = mulberry32(seed);
  const means: number[] = [];
  for (let draw = 0; draw < resamples; draw++) {
    let sum = 0;
    for (let index = 0; index < differences.length; index++) sum += differences[Math.floor(random() * differences.length)]!;
    means.push(sum / differences.length);
  }
  means.sort((a, b) => a - b);
  return [means[Math.floor(0.025 * resamples)]!, means[Math.ceil(0.975 * resamples) - 1]!];
}

type ArmStats = { answers: number; strict: number; strict_rate: number; expected_share: number; forbidden_hits: number; strict_min: number; strict_max: number; expected_min: number; expected_max: number };

function armStats(rows: Row[]): ArmStats {
  const strict = rows.filter((row) => row.grade.metrics!.strict_pass).length;
  const shares = rows.map((row) => row.grade.metrics!.expected_share);
  const passes = rows.map((row) => (row.grade.metrics!.strict_pass ? 1 : 0));
  return {
    answers: rows.length,
    strict,
    strict_rate: rows.length ? strict / rows.length : Number.NaN,
    expected_share: mean(shares),
    forbidden_hits: mean(rows.map((row) => row.grade.metrics!.forbidden_hits)),
    strict_min: Math.min(...passes),
    strict_max: Math.max(...passes),
    expected_min: Math.min(...shares),
    expected_max: Math.max(...shares),
  };
}

const outcome = (difference: number) => (Math.abs(difference) < 1e-9 ? "tie" : difference > 0 ? "win" : "loss");

export function buildReport(phase: Phase, runDir: string, ledgerPath: string) {
  const cases = loadCases(phase);
  const answers = latestById(readJsonl<AnswerRecord>(resolve(runDir, "answers.jsonl")));
  const grades = latestById(readJsonl<GradeRecord>(resolve(runDir, "grades.jsonl")).filter((grade) => grade.status === "ok"));
  const rows: Row[] = [];
  for (const [id, answer] of answers) {
    const grade = grades.get(id);
    if (grade?.metrics) rows.push({ answer, grade });
  }
  const statuses: Record<string, number> = {};
  for (const answer of answers.values()) statuses[`${answer.arm}:${answer.status}`] = (statuses[`${answer.arm}:${answer.status}`] ?? 0) + 1;

  const perCase = cases.map((item) => {
    const byArm = Object.fromEntries(ARMS.map((arm) => [arm, armStats(rows.filter((row) => row.answer.case_id === item.id && row.answer.arm === arm))])) as Record<Arm, ArmStats>;
    const strictDiff = byArm.with_skill.strict_rate - byArm.without_skill.strict_rate;
    const expectedDiff = byArm.with_skill.expected_share - byArm.without_skill.expected_share;
    const forbiddenDiff = byArm.with_skill.forbidden_hits - byArm.without_skill.forbidden_hits;
    return { id: item.id, skill: item.skill, pack: item.pack, ...byArm, strict_diff: strictDiff, expected_diff: expectedDiff, forbidden_diff: forbiddenDiff, strict_outcome: outcome(strictDiff), expected_outcome: outcome(expectedDiff) };
  });
  const complete = perCase.filter((entry) => entry.with_skill.answers > 0 && entry.without_skill.answers > 0);

  const overall = Object.fromEntries(ARMS.map((arm) => [arm, {
    ...armStats(rows.filter((row) => row.answer.arm === arm)),
    case_mean_strict_rate: mean(complete.map((entry) => entry[arm].strict_rate)),
    case_mean_expected_share: mean(complete.map((entry) => entry[arm].expected_share)),
  }])) as Record<Arm, ArmStats & { case_mean_strict_rate: number; case_mean_expected_share: number }>;
  const tally = (key: "strict_outcome" | "expected_outcome") => ({
    win: complete.filter((entry) => entry[key] === "win").length,
    tie: complete.filter((entry) => entry[key] === "tie").length,
    loss: complete.filter((entry) => entry[key] === "loss").length,
  });
  const paired = {
    cases: complete.length,
    strict_diff: mean(complete.map((entry) => entry.strict_diff)),
    strict_ci: bootstrap(complete.map((entry) => entry.strict_diff)),
    expected_diff: mean(complete.map((entry) => entry.expected_diff)),
    expected_ci: bootstrap(complete.map((entry) => entry.expected_diff)),
    forbidden_diff: mean(complete.map((entry) => entry.forbidden_diff)),
    forbidden_ci: bootstrap(complete.map((entry) => entry.forbidden_diff)),
    strict_tally: tally("strict_outcome"),
    expected_tally: tally("expected_outcome"),
  };

  const group = (key: "skill" | "pack") => [...new Set(cases.map((item) => item[key]))].map((name) => {
    const groupRows = rows.filter((row) => cases.find((item) => item.id === row.answer.case_id)![key] === name);
    return { name, cases: cases.filter((item) => item[key] === name).length, with_skill: armStats(groupRows.filter((row) => row.answer.arm === "with_skill")), without_skill: armStats(groupRows.filter((row) => row.answer.arm === "without_skill")) };
  });

  const profile = Object.fromEntries(ARMS.map((arm) => {
    const armAnswers = [...answers.values()].filter((answer) => answer.arm === arm && answer.status !== "error" && answer.status !== "budget_stopped");
    const sum = (pick: (answer: AnswerRecord) => number) => mean(armAnswers.map(pick));
    const usage = (answer: AnswerRecord, field: "input_tokens" | "output_tokens" | "cache_read_input_tokens" | "cache_creation_input_tokens") =>
      answer.requests.reduce((total, request) => total + ((request.usage?.[field] as number | null | undefined) ?? 0), 0);
    return [arm, {
      answers: armAnswers.length,
      requests: sum((answer) => answer.requests.length),
      file_reads: sum((answer) => answer.tool_calls.length),
      input_tokens: sum((answer) => usage(answer, "input_tokens")),
      cache_read_tokens: sum((answer) => usage(answer, "cache_read_input_tokens")),
      cache_write_tokens: sum((answer) => usage(answer, "cache_creation_input_tokens")),
      output_tokens: sum((answer) => usage(answer, "output_tokens")),
      thinking_tokens: sum((answer) => answer.requests.reduce((total, request) => total + (request.usage?.output_tokens_details?.thinking_tokens ?? 0), 0)),
      answer_chars: sum((answer) => answer.final_text.length),
      wall_seconds: sum((answer) => answer.wall_ms / 1000),
      cost_usd: sum((answer) => answer.requests.reduce((total, request) => total + request.cost_usd, 0)),
    }];
  }));

  const criteria = [...grades.values()].flatMap((grade) => grade.criteria);
  // Recomputed with the current quote check so every phase uses the same rule (rubric.md, Changes after the pilot).
  const quoteResults = [...grades.values()].flatMap((grade) => grade.criteria.map((entry) => quoteFound(entry.evidence, answers.get(grade.answer_id)?.final_text ?? "")));
  const gradeRecords = [...grades.values()];
  const grading = {
    grades: gradeRecords.length,
    criteria: criteria.length,
    verdicts: { yes: criteria.filter((entry) => entry.final_verdict === "yes").length, no: criteria.filter((entry) => entry.final_verdict === "no").length, unclear: criteria.filter((entry) => entry.final_verdict === "unclear").length },
    figure_checks: criteria.filter((entry) => entry.figure_check).length,
    figure_overrides: criteria.filter((entry) => entry.overridden).length,
    quotes: quoteResults.filter((found) => found !== null).length,
    quotes_found: quoteResults.filter((found) => found === true).length,
    cost_per_grade_usd: mean(gradeRecords.map((grade) => grade.cost_usd)),
    output_tokens_per_grade: mean(gradeRecords.map((grade) => grade.usage?.output_tokens ?? 0)),
  };

  const ledger = readJsonl<LedgerEntry>(ledgerPath);
  const spend: Record<string, number> = {};
  for (const entry of ledger) spend[`${entry.phase}:${entry.kind}`] = (spend[`${entry.phase}:${entry.kind}`] ?? 0) + entry.cost_usd;
  const spendTotal = ledger.reduce((sum, entry) => sum + entry.cost_usd, 0);
  const failedRequests = ledger.filter((entry) => entry.outcome === "failed").length;

  return { phase, generated_at: new Date().toISOString(), statuses, overall, paired, per_case: perCase, per_skill: group("skill"), per_pack: group("pack"), profile, grading, spend: { by_phase_kind: spend, total_usd: spendTotal, ledger_requests: ledger.length, failed_requests: failedRequests } };
}

export type Report = ReturnType<typeof buildReport>;

const ratio = (stats: ArmStats) => `${stats.strict}/${stats.answers} (${pct(stats.strict_rate)})`;

export function renderTables(report: Report): string {
  const { overall, paired, profile, grading } = report;
  const lines: string[] = [];
  lines.push("### Headline", "");
  lines.push("| Arm | Graded answers | Strict passes | Expected criteria met | Forbidden hits per answer |", "| --- | ---: | ---: | ---: | ---: |");
  for (const arm of ARMS) lines.push(`| ${arm === "with_skill" ? "With skill" : "Without skill"} | ${overall[arm].answers} | ${ratio(overall[arm])} | ${pct(overall[arm].expected_share)} | ${fixed(overall[arm].forbidden_hits)} |`);
  lines.push("");
  lines.push(`Paired over ${paired.cases} cases (with skill minus without skill, mean of per-case differences, 95% bootstrap interval over cases):`, "");
  lines.push("| Metric | Difference | 95% interval | Cases better with skill | Ties | Cases worse with skill |", "| --- | ---: | ---: | ---: | ---: | ---: |");
  lines.push(`| Strict pass rate | ${signedPct(paired.strict_diff)} | ${signedPct(paired.strict_ci[0])} to ${signedPct(paired.strict_ci[1])} | ${paired.strict_tally.win} | ${paired.strict_tally.tie} | ${paired.strict_tally.loss} |`);
  lines.push(`| Expected criteria met | ${signedPct(paired.expected_diff)} | ${signedPct(paired.expected_ci[0])} to ${signedPct(paired.expected_ci[1])} | ${paired.expected_tally.win} | ${paired.expected_tally.tie} | ${paired.expected_tally.loss} |`);
  lines.push(`| Forbidden hits per answer | ${fixed(paired.forbidden_diff)} | ${fixed(paired.forbidden_ci[0])} to ${fixed(paired.forbidden_ci[1])} | | | |`);
  lines.push("");
  lines.push("### By pack", "");
  lines.push("| Pack | Cases | Strict passes with | Strict passes without | Expected met with | Expected met without | Forbidden hits with | Forbidden hits without |", "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const entry of report.per_pack) lines.push(`| ${entry.name} | ${entry.cases} | ${ratio(entry.with_skill)} | ${ratio(entry.without_skill)} | ${pct(entry.with_skill.expected_share)} | ${pct(entry.without_skill.expected_share)} | ${fixed(entry.with_skill.forbidden_hits)} | ${fixed(entry.without_skill.forbidden_hits)} |`);
  lines.push("");
  lines.push("### By skill", "");
  lines.push("| Skill | Strict passes with | Strict passes without | Expected met with | Expected met without |", "| --- | ---: | ---: | ---: | ---: |");
  for (const entry of report.per_skill) lines.push(`| \`${entry.name}\` | ${ratio(entry.with_skill)} | ${ratio(entry.without_skill)} | ${pct(entry.with_skill.expected_share)} | ${pct(entry.without_skill.expected_share)} |`);
  lines.push("");
  lines.push("### By case", "");
  lines.push("Strict passes are out of the repeats graded for each arm. Expected met is the mean share with the range across repeats.", "");
  lines.push("| Case | Skill | Strict with | Strict without | Expected met with | Expected met without | Forbidden hits with | Forbidden hits without | Strict result |", "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |");
  for (const entry of report.per_case) {
    const range = (stats: ArmStats) => (stats.answers > 1 ? `${pct(stats.expected_share)} (${pct(stats.expected_min)} to ${pct(stats.expected_max)})` : pct(stats.expected_share));
    lines.push(`| \`${entry.id}\` | \`${entry.skill}\` | ${entry.with_skill.strict}/${entry.with_skill.answers} | ${entry.without_skill.strict}/${entry.without_skill.answers} | ${range(entry.with_skill)} | ${range(entry.without_skill)} | ${fixed(entry.with_skill.forbidden_hits)} | ${fixed(entry.without_skill.forbidden_hits)} | ${entry.strict_outcome} |`);
  }
  lines.push("");
  lines.push("### Cost and size per answer", "");
  lines.push("Means per answer, excluding grading. Input tokens are uncached input; cache reads and writes are listed separately. Thinking tokens are part of output tokens.", "");
  lines.push("| Arm | Answers | Model requests | Skill file reads | Input tokens | Cache read tokens | Cache write tokens | Output tokens | Thinking tokens | Answer characters | Wall time | Cost |", "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const arm of ARMS) {
    const stats = profile[arm]!;
    lines.push(`| ${arm === "with_skill" ? "With skill" : "Without skill"} | ${stats.answers} | ${fixed(stats.requests, 1)} | ${fixed(stats.file_reads, 1)} | ${Math.round(stats.input_tokens)} | ${Math.round(stats.cache_read_tokens)} | ${Math.round(stats.cache_write_tokens)} | ${Math.round(stats.output_tokens)} | ${Math.round(stats.thinking_tokens)} | ${Math.round(stats.answer_chars)} | ${fixed(stats.wall_seconds, 1)} s | $${fixed(stats.cost_usd, 4)} |`);
  }
  lines.push("");
  lines.push("### Grading checks", "");
  lines.push(`- ${grading.grades} gradings covering ${grading.criteria} criterion verdicts: ${grading.verdicts.yes} yes, ${grading.verdicts.no} no, ${grading.verdicts.unclear} unclear.`);
  lines.push(`- Figure checks ran on ${grading.figure_checks} expected-criterion verdicts and overrode ${grading.figure_overrides} grader verdicts to no.`);
  lines.push(`- ${grading.quotes_found} of ${grading.quotes} grader evidence quotes appear verbatim in the answer (whitespace normalized; an ellipsis separates excerpts).`);
  lines.push(`- Mean grading cost $${fixed(grading.cost_per_grade_usd, 4)} and ${Math.round(grading.output_tokens_per_grade)} output tokens per answer.`);
  const statusLine = Object.entries(report.statuses).sort().map(([key, count]) => `${key} ${count}`).join(", ");
  lines.push(`- Answer statuses: ${statusLine}.`);
  return lines.join("\n");
}
