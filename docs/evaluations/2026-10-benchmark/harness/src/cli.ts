import Anthropic from "@anthropic-ai/sdk";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { CASES_PATH, CAP_USD, LEDGER_PATH, MAX_TOKENS, PHASES, REPO, RUNS_DIR, SEED, type Phase } from "./config.ts";
import { loadCases, packets, selectCases, SKILLS } from "./cases.ts";
import type { CallModel } from "./agent.ts";
import { Budget, worstCase } from "./budget.ts";
import { readJsonl, runAnswers, runGrades, shuffle } from "./run.ts";
import { buildReport, renderTables } from "./report.ts";
import { stubModel } from "./stub.ts";
import { renderChart } from "./chart.ts";
import type { AnswerRecord } from "./agent.ts";
import type { GradeRecord } from "./grade.ts";

const [command, ...rest] = process.argv.slice(2);
const flag = (name: string, fallback?: string) => {
  const index = rest.indexOf(`--${name}`);
  return index >= 0 ? rest[index + 1] : fallback;
};
const phaseArg = (): Phase => {
  const phase = flag("phase");
  if (phase !== "pilot" && phase !== "phase2") throw new Error("--phase pilot|phase2 is required");
  return phase;
};

/**
 * Real model calls. The key is read inside this process from the file named by
 * --key-file, or taken from ANTHROPIC_API_KEY. It is never printed or written.
 */
function liveModel(): CallModel {
  const keyFile = flag("key-file");
  const apiKey = keyFile ? readFileSync(keyFile, "utf8").trim() : process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("no API key: pass --key-file PATH or set ANTHROPIC_API_KEY");
  // First-party API only; an inherited ANTHROPIC_BASE_URL cannot redirect the run.
  const client = new Anthropic({ apiKey, baseURL: "https://api.anthropic.com", maxRetries: 4, timeout: 15 * 60 * 1000 });
  return (params) => client.messages.stream(params).finalMessage();
}

/** Published runs live in runs/<phase> with the shared ledger; --out DIR keeps a rerun and its own ledger apart. */
function locations(phase: Phase): { outDir: string; ledgerPath: string; published: boolean } {
  const out = flag("out");
  if (!out) return { outDir: resolve(RUNS_DIR, phase), ledgerPath: LEDGER_PATH, published: true };
  mkdirSync(out, { recursive: true });
  return { outDir: resolve(out, phase), ledgerPath: resolve(out, "ledger.jsonl"), published: false };
}

function writeCharts(report: ReturnType<typeof buildReport>, dir: string) {
  const answers = report.per_skill[0]?.with_skill.answers ?? 0;
  const title = `Strict pass rate by skill, ${answers} answers per skill per arm`;
  for (const mode of ["light", "dark"] as const) writeFileSync(resolve(dir, `chart-${mode}.svg`), renderChart(report, mode, title));
}

const usage = `Usage: bun src/cli.ts <command>
  select                      write cases.json from the plan's selection rule
  packets --phase P           print both packets for every case in a phase
  dry-run --phase P --out DIR run the whole pipeline offline with a stub model
  run --phase P [--out DIR] [--key-file F] [--concurrency N]    answer every case in both arms (spends money)
  grade --phase P [--out DIR] [--key-file F] [--concurrency N]  grade every answer blind (spends money)
  report --phase P [--out DIR]  write results JSON, tables and charts for a phase
  Without --out, runs use the published runs/ folder and ledger.jsonl.
  spot --phase P              export a blind 10% grading sample
  spend                       print recorded spend from the ledger`;

switch (command) {
  case "select": {
    const cases = await selectCases();
    writeFileSync(CASES_PATH, `${JSON.stringify({ generated_by: "harness/src/cli.ts select", skills: SKILLS, cases }, null, 2)}\n`);
    process.stdout.write(`${cases.length} cases written, ${cases.filter((item) => item.pilot).length} in the pilot\n`);
    break;
  }
  case "packets": {
    for (const item of loadCases(phaseArg())) {
      const { with_skill, without_skill } = packets(item);
      process.stdout.write(`=== ${item.id} with_skill\n${with_skill}\n=== ${item.id} without_skill\n${without_skill}\n`);
    }
    break;
  }
  case "dry-run": {
    const phase = phaseArg();
    const out = flag("out");
    if (!out) throw new Error("--out DIR is required so dry-run output never lands in the published runs folder");
    mkdirSync(out, { recursive: true });
    const ledgerPath = resolve(out, "ledger.jsonl");
    const call = stubModel();
    await runAnswers({ phase, call, outDir: out, ledgerPath, concurrency: 4 });
    await runGrades({ phase, call, outDir: out, ledgerPath, concurrency: 4 });
    const report = buildReport(phase, out, ledgerPath);
    writeFileSync(resolve(out, "results.json"), `${JSON.stringify(report, null, 2)}\n`);
    writeFileSync(resolve(out, "tables.md"), `${renderTables(report)}\n`);
    writeCharts(report, out);
    const cases = loadCases(phase);
    const requestBound = worstCase(JSON.stringify(packets(cases[0]!).with_skill).length + 40_000, MAX_TOKENS);
    process.stdout.write(`dry run complete in ${out}; worst-case reservation for one large request is $${requestBound.toFixed(4)}\n`);
    break;
  }
  case "run":
  case "grade": {
    const phase = phaseArg();
    const { outDir, ledgerPath } = locations(phase);
    const concurrency = Number(flag("concurrency", "4"));
    const options = { phase, call: liveModel(), outDir, ledgerPath, concurrency };
    if (command === "run") await runAnswers(options);
    else await runGrades(options);
    break;
  }
  case "report": {
    const phase = phaseArg();
    const { outDir, ledgerPath, published } = locations(phase);
    const report = buildReport(phase, outDir, ledgerPath);
    writeFileSync(resolve(outDir, "results.json"), `${JSON.stringify(report, null, 2)}\n`);
    const tables = renderTables(report);
    writeFileSync(resolve(outDir, "tables.md"), `${tables}\n`);
    writeCharts(report, outDir);
    const page = resolve(REPO, "docs/BENCHMARK.md");
    const start = `<!-- results:${phase}:start -->`;
    const end = `<!-- results:${phase}:end -->`;
    if (published && existsSync(page)) {
      const text = readFileSync(page, "utf8");
      if (text.includes(start) && text.includes(end)) {
        writeFileSync(page, `${text.slice(0, text.indexOf(start) + start.length)}\n\n${tables}\n\n${text.slice(text.indexOf(end))}`);
      }
    }
    process.stdout.write(`${tables}\n`);
    break;
  }
  case "spot": {
    const phase = phaseArg();
    const outDir = resolve(RUNS_DIR, phase);
    const answers = new Map(readJsonl<AnswerRecord>(resolve(outDir, "answers.jsonl")).map((record) => [record.answer_id, record]));
    const grades = [...new Map(readJsonl<GradeRecord>(resolve(outDir, "grades.jsonl")).filter((grade) => grade.status === "ok").map((grade) => [grade.answer_id, grade])).values()];
    const sample = shuffle(grades, SEED + 2).slice(0, Math.ceil(grades.length / 10));
    const blind = sample.map((grade) => ({
      answer_id: grade.answer_id,
      case_id: grade.case_id,
      answer: answers.get(grade.answer_id)!.final_text,
      criteria: grade.criteria.map((entry) => ({ id: entry.id, text: entry.text, final_verdict: entry.final_verdict, evidence: entry.evidence })),
    }));
    // JSONL: answer text is stored verbatim and the repository style check does not scan .jsonl files.
    writeFileSync(resolve(outDir, "spot-sample.jsonl"), blind.map((entry) => JSON.stringify(entry)).join("\n") + "\n");
    process.stdout.write(`${blind.length} of ${grades.length} gradings exported without arm labels\n`);
    break;
  }
  case "spend": {
    const budget = new Budget(CAP_USD, LEDGER_PATH);
    process.stdout.write(`recorded spend $${budget.spent.toFixed(6)} of $${CAP_USD}; ${readJsonl(LEDGER_PATH).length} ledger entries; phases ${Object.keys(PHASES).join(", ")}\n`);
    break;
  }
  default:
    process.stdout.write(`${usage}\n`);
}
