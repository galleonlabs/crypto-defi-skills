import { describe, expect, test } from "bun:test";
import { Budget, BudgetExceeded, priceUsage, worstCase } from "../src/budget.ts";
import { checkFigures, computedFigures, criterionNumbers } from "../src/numeric.ts";
import { readSkillPath } from "../src/agent.ts";
import { loadCases, packets } from "../src/cases.ts";
import { applyRubric, graderSystem, quoteFound } from "../src/grade.ts";
import { answerId } from "../src/run.ts";
import { bootstrap } from "../src/report.ts";

const skillDir = "packages/lending/skills/galleon-aave-position";

describe("budget", () => {
  test("prices usage at the published rates", () => {
    const cost = priceUsage({
      input_tokens: 1_000_000,
      output_tokens: 1_000_000,
      cache_read_input_tokens: 1_000_000,
      cache_creation_input_tokens: 1_000_000,
      cache_creation: { ephemeral_5m_input_tokens: 1_000_000, ephemeral_1h_input_tokens: 0 },
      inference_geo: "global",
    });
    expect(cost).toBeCloseTo(4 + 20 + 0.2 + 5, 10);
    expect(priceUsage({ input_tokens: 1_000_000, output_tokens: 0, inference_geo: "us" })).toBeCloseTo(4.4, 10);
  });

  test("refuses a request whose worst case would pass the cap", () => {
    const budget = new Budget(1, null);
    const first = budget.reserve(0.6);
    expect(() => budget.reserve(0.5)).toThrow(BudgetExceeded);
    budget.settle(first, { phase: "pilot", kind: "answer", job: "x", request: 1, model: "m", outcome: "ok", usage: null }, 0.1);
    expect(budget.spent).toBeCloseTo(0.1, 10);
    expect(budget.reserve(0.85).amount).toBe(0.85);
    expect(() => budget.reserve(0.1)).toThrow(BudgetExceeded);
  });

  test("worst case covers the full output allowance", () => {
    expect(worstCase(0, 32_000)).toBeCloseTo(0.704, 10);
  });
});

describe("figure checks", () => {
  test("reads criterion figures and skips identifiers and inputs", () => {
    expect(criterionNumbers("FEE-001: currently2%, owner can change fee up to5%, atblock700")).toEqual([2, 5, 700]);
    expect(criterionNumbers("ERC4626 V3 vault at 0xabc12")).toEqual([]);
    expect(computedFigures("Stressed HF about 1.219 fails floor 1.3", "minimum health factor 1.3")).toEqual([1.219]);
  });

  test("matches rounding and separators but not different values", () => {
    expect(checkFigures([1.219, 2970], "HF falls to ~1.22; bound $2,970.00").present).toBe(true);
    expect(checkFigures([34.75], "net 34.5 USDC").missing).toEqual([34.75]);
    expect(checkFigures([2.5], "funding -2.5 USDC").present).toBe(true);
  });
});

describe("skill tool", () => {
  test("reads inside the skill directory only", () => {
    expect(readSkillPath(skillDir, "SKILL.md").ok).toBe(true);
    expect(readSkillPath(skillDir, `${skillDir}/references/recipe.md`).ok).toBe(true);
    expect(readSkillPath(skillDir, ".").content).toContain("SKILL.md");
    expect(readSkillPath(skillDir, "../../evals/behavior.json").ok).toBe(false);
    expect(readSkillPath(skillDir, "/etc/hosts").ok).toBe(false);
    expect(readSkillPath(skillDir, "missing.md").ok).toBe(false);
  });
});

describe("packets and grading", () => {
  test("arms differ by exactly the skill sentence", () => {
    for (const item of loadCases("phase2")) {
      const { with_skill, without_skill, removed } = packets(item);
      expect(with_skill.replace(removed, "")).toBe(without_skill);
      expect(without_skill).not.toContain("SKILL.md");
    }
  });

  test("answer ids do not reveal the arm", () => {
    expect(answerId("pilot", "c", "with_skill", 1)).not.toBe(answerId("pilot", "c", "without_skill", 1));
    expect(answerId("pilot", "c", "with_skill", 1)).toMatch(/^[0-9a-f]{12}$/);
  });

  test("grader prompt comes from the rubric", () => {
    expect(graderSystem()).toContain("You grade one answer");
  });

  test("a missing figure overrides a yes, and unclear fails strict pass", () => {
    const item = loadCases("phase2").find((entry) => entry.id === "galleon-aave-position-1")!;
    const verdicts = (first: "yes" | "unclear") => [
      { id: "E1", verdict: first, evidence: "", note: "" },
      { id: "E2", verdict: "yes" as const, evidence: "", note: "" },
      { id: "E3", verdict: "yes" as const, evidence: "", note: "" },
      { id: "F1", verdict: "no" as const, evidence: "", note: "" },
      { id: "F2", verdict: "no" as const, evidence: "", note: "" },
    ];
    const answer = "Current HF 2.0, proposed 1.6, stressed 1.22 below 1.3.";
    expect(applyRubric(item, answer, verdicts("yes")).metrics.strict_pass).toBe(true);
    const missing = applyRubric(item, "Current HF 2, proposed 1.6, stressed 1.25.", verdicts("yes"));
    expect(missing.criteria[1]!.overridden).toBe(true);
    expect(missing.metrics.strict_pass).toBe(false);
    expect(applyRubric(item, answer, verdicts("unclear")).metrics.strict_pass).toBe(false);
  });

  test("quote check normalizes whitespace", () => {
    expect(quoteFound("health  factor\n1.6", "The health factor 1.6 holds")).toBe(true);
    expect(quoteFound("", "anything")).toBeNull();
    expect(quoteFound("**Result: fails.** ... HF **1.22**", "**Result: fails.** The stressed HF **1.22** is low")).toBe(true);
    expect(quoteFound("Result: passes ... HF 1.22", "Result: fails. HF 1.22")).toBe(false);
  });

  test("bootstrap interval is deterministic", () => {
    expect(bootstrap([0, 1, 0, 1])).toEqual(bootstrap([0, 1, 0, 1]));
  });
});
