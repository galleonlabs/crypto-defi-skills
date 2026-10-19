/** Deterministic figure checks described in rubric.md ("Deterministic number check"). */

const HEX = /0x[0-9a-fA-F]+/g;
const IDENTIFIER = /\b[A-Za-z]+-\d+\b/g;

/** Numbers stated in a criterion, as absolute values. Identifiers such as FEE-001 or ERC4626 are skipped. */
export function criterionNumbers(text: string): number[] {
  const cleaned = text
    .replace(HEX, " ")
    .replace(IDENTIFIER, " ")
    // "currently2%" and "atblock700" are typos for "currently 2%" and "at block 700".
    .replace(/([a-z])(\d)/g, "$1 $2");
  const found = cleaned.match(/(?<![\w.])-?\d+(?:,\d{3})*(?:\.\d+)?(?!\w)/g) ?? [];
  return found.map((token) => Math.abs(Number(token.replace(/,/g, ""))));
}

/** Every number written in free text (answers, requests, observations), as absolute values. */
export function textNumbers(text: string): number[] {
  let cleaned = text.replace(HEX, " ");
  // Remove thousands separators: 1,000,000 -> 1000000.
  while (/(\d),(\d{3})(?!\d)/.test(cleaned)) cleaned = cleaned.replace(/(\d),(\d{3})(?!\d)/g, "$1$2");
  return (cleaned.match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
}

/** Figures a correct answer must state: numbers in the criterion that are not inputs. */
export function computedFigures(criterion: string, inputs: string): number[] {
  const given = new Set(textNumbers(inputs));
  return [...new Set(criterionNumbers(criterion))].filter((value) => !given.has(value));
}

export const TOLERANCE = 0.005;

export function figurePresent(figure: number, answerNumbers: readonly number[]): boolean {
  const slack = Math.abs(figure) * TOLERANCE;
  return answerNumbers.some((value) => Math.abs(value - figure) <= slack);
}

export type FigureCheck = { figures: number[]; missing: number[]; present: boolean };

export function checkFigures(figures: readonly number[], answer: string): FigureCheck {
  const numbers = textNumbers(answer);
  const missing = figures.filter((figure) => !figurePresent(figure, numbers));
  return { figures: [...figures], missing, present: missing.length === 0 };
}
