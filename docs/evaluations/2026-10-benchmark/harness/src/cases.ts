import { readFileSync } from "node:fs";
import { dirname, relative } from "node:path";
import { corpus, neutralPrompt, type BehaviorCase } from "../../../../../scripts/behavior-evals.ts";
import { CASES_PATH, REPO, type Phase } from "./config.ts";
import { computedFigures } from "./numeric.ts";

/** The 15 Phase 2 skills named in the benchmark plan, in plan order. */
export const SKILLS = [
  "galleon-aave-position",
  "galleon-aave-v4",
  "galleon-morpho-market",
  "galleon-vault-exit",
  "galleon-pendle-maturity",
  "galleon-lido-withdrawals",
  "lifi-cross-chain",
  "uniswap-swap",
  "lp-monitor",
  "lp-plan",
  "hyperliquid-plan",
  "hyperliquid-wallet-audit",
  "galleon-prediction-market-research",
  "galleon-prediction-market-resolution",
  "galleon-defi-security-token-diligence",
] as const;

/**
 * Skills with more than two cases: the plan takes the first useful-completion
 * case and the first changed-evidence case. The reason for each choice is kept
 * in cases.json.
 */
export const MULTI_CASE_CHOICES: Record<string, { useful: string; changed: string; reason: string }> = {
  "galleon-aave-v4": {
    useful: "aave-v4-useful-result",
    changed: "aave-v4-changed-evidence",
    reason: "The case ids name their role.",
  },
  "galleon-vault-exit": {
    useful: "galleon-vault-exit-1",
    changed: "galleon-vault-exit-2",
    reason:
      "The numbered pair is the skill's original useful-completion and incomplete-evidence pair and comes first in file order. The five later cases cover the same two roles in more depth.",
  },
  "hyperliquid-plan": {
    useful: "hl-plan-cancel-specific-intake",
    changed: "hl-plan-close-not-entry",
    reason:
      "The cancel case is the first that expects a complete deliverable. The close case is the first whose observations are incomplete (fees and book data unavailable) and must be marked so. The two cap cases test documented limits rather than changed evidence.",
  },
  "galleon-prediction-market-resolution": {
    useful: "prediction-split-payout",
    changed: "prediction-disputed",
    reason:
      "The split-payout case expects a computed entitlement. The disputed case is the first with unresolved evidence. The ledger-mismatch case comes after both.",
  },
};

/** Pilot: both cases of five skills spread across five packs, with an average skill size close to the Phase 2 average. */
export const PILOT_SKILLS = [
  "galleon-aave-position",
  "galleon-vault-exit",
  "lifi-cross-chain",
  "hyperliquid-wallet-audit",
  "galleon-prediction-market-resolution",
] as const;

/**
 * Figures the rule in rubric.md picks automatically that a correct answer need
 * not state: figures used in a negative sense ("never raw 100000") or offered
 * as alternatives. Reviewed by hand before any model call.
 */
export const FIGURE_EXCLUSIONS: Record<string, { criterion: number; figure: number; reason: string }[]> = {
  "aave-v4-useful-result": [{ criterion: 0, figure: 100000, reason: "Used in a negative sense: never present raw 100000 as the human amount." }],
  "security-token-diligence-changed-evidence": [{ criterion: 0, figure: 5, reason: "Used in a negative sense: do not infer a 5% cap from the ABI." }],
  "galleon-pendle-maturity-2": [
    { criterion: 1, figure: 2, reason: "The criterion offers alternatives (2% gross or 1.7% after costs), so neither figure alone is required." },
    { criterion: 1, figure: 1.7, reason: "The criterion offers alternatives (2% gross or 1.7% after costs), so neither figure alone is required." },
  ],
};

export type SelectedCase = {
  id: string;
  skill: string;
  pack: string;
  pilot: boolean;
  skill_dir: string;
  prompt: string;
  context: string;
  expected: string[];
  forbidden: string[];
  /** Per expected criterion, the figures the answer must state. */
  figures: number[][];
  figure_exclusions: { criterion: number; figure: number; reason: string }[];
  selection_note?: string;
};

export async function selectCases(): Promise<SelectedCase[]> {
  const all = await corpus();
  const selected: SelectedCase[] = [];
  for (const skill of SKILLS) {
    const entries = all.filter((entry) => entry.item.skill === skill);
    if (entries.length < 2) throw new Error(`${skill}: fewer than two cases`);
    const choice = MULTI_CASE_CHOICES[skill];
    if (entries.length > 2 && !choice) throw new Error(`${skill}: has ${entries.length} cases and no recorded choice`);
    const ids = choice ? [choice.useful, choice.changed] : [entries[0]!.item.id, entries[1]!.item.id];
    for (const id of ids) {
      const entry = entries.find((candidate) => candidate.item.id === id);
      if (!entry) throw new Error(`${skill}: missing case ${id}`);
      const skillDir = relative(REPO, dirname(entry.skillPath));
      const exclusions = FIGURE_EXCLUSIONS[id] ?? [];
      const inputs = `${entry.item.prompt}\n${entry.item.context}`;
      selected.push({
        id,
        skill,
        pack: skillDir.split("/")[1]!,
        pilot: (PILOT_SKILLS as readonly string[]).includes(skill),
        skill_dir: skillDir,
        prompt: entry.item.prompt,
        context: entry.item.context,
        expected: entry.item.expected,
        forbidden: entry.item.forbidden,
        figures: entry.item.expected.map((criterion, criterionIndex) =>
          computedFigures(criterion, inputs).filter(
            (figure) => !exclusions.some((rule) => rule.criterion === criterionIndex && rule.figure === figure),
          ),
        ),
        figure_exclusions: exclusions,
        ...(choice ? { selection_note: choice.reason } : {}),
      });
    }
  }
  return selected;
}

export function loadCases(phase: Phase): SelectedCase[] {
  const cases = JSON.parse(readFileSync(CASES_PATH, "utf8")).cases as SelectedCase[];
  return phase === "pilot" ? cases.filter((item) => item.pilot) : cases;
}

export function asBehaviorCase(item: SelectedCase): BehaviorCase {
  return { id: item.id, skill: item.skill, prompt: item.prompt, context: item.context, expected: item.expected, forbidden: item.forbidden };
}

/** Both packets come from the repository's neutralPrompt(); the without-skill packet drops exactly one sentence. */
export function packets(item: SelectedCase): { with_skill: string; without_skill: string; removed: string } {
  const skillPath = `${item.skill_dir}/SKILL.md`;
  const withSkill = neutralPrompt(asBehaviorCase(item), skillPath);
  const removed = `Read the skill at ${skillPath} and relevant local references. `;
  if (withSkill.split(removed).length !== 2) throw new Error(`${item.id}: skill sentence not found exactly once`);
  return { with_skill: withSkill, without_skill: withSkill.replace(removed, ""), removed };
}
