import type { Report } from "./report.ts";

/** Validated with the dataviz palette checker against GitHub's light (#ffffff) and dark (#0d1117) page surfaces. */
const THEMES = {
  light: { withSkill: "#2a78d6", withoutSkill: "#eb6834", text: "#1f2328", muted: "#59636e", grid: "#d1d9e0" },
  dark: { withSkill: "#3987e5", withoutSkill: "#d95926", text: "#f0f6fc", muted: "#9198a1", grid: "#3d444d" },
} as const;

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Horizontal bar with a square baseline end and a 4px rounded data end. */
function bar(x: number, y: number, width: number, height: number, fill: string): string {
  if (width <= 0) return "";
  const r = Math.min(4, width, height / 2);
  return `<path d="M${x} ${y}H${x + width - r}Q${x + width} ${y} ${x + width} ${y + r}V${y + height - r}Q${x + width} ${y + height} ${x + width - r} ${y + height}H${x}Z" fill="${fill}"/>`;
}

export function renderChart(report: Report, mode: keyof typeof THEMES, title: string): string {
  const theme = THEMES[mode];
  const rows = report.per_skill;
  const width = 760;
  const labelWidth = 300;
  const plotLeft = labelWidth + 12;
  const plotWidth = 380;
  const top = 78;
  const rowHeight = 34;
  const barHeight = 11;
  const plotHeight = rows.length * rowHeight;
  const height = top + plotHeight + 44;
  const font = `font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"`;
  const parts: string[] = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="t d">`);
  parts.push(`<title id="t">${escape(title)}</title>`);
  const description = rows.map((row) => `${row.name}: ${row.with_skill.strict} of ${row.with_skill.answers} with the skill, ${row.without_skill.strict} of ${row.without_skill.answers} without`).join("; ");
  parts.push(`<desc id="d">${escape(description)}</desc>`);
  parts.push(`<g ${font}>`);
  parts.push(`<text x="0" y="22" font-size="16" font-weight="600" fill="${theme.text}">${escape(title)}</text>`);
  parts.push(`<rect x="0" y="40" width="12" height="12" rx="2" fill="${theme.withSkill}"/><text x="18" y="50" font-size="13" fill="${theme.text}">With skill</text>`);
  parts.push(`<rect x="100" y="40" width="12" height="12" rx="2" fill="${theme.withoutSkill}"/><text x="118" y="50" font-size="13" fill="${theme.text}">Without skill</text>`);
  for (const tick of [0, 0.25, 0.5, 0.75, 1]) {
    const x = plotLeft + tick * plotWidth;
    parts.push(`<line x1="${x}" y1="${top - 6}" x2="${x}" y2="${top + plotHeight}" stroke="${theme.grid}" stroke-width="1"/>`);
    parts.push(`<text x="${x}" y="${top + plotHeight + 18}" font-size="12" fill="${theme.muted}" text-anchor="middle">${Math.round(tick * 100)}%</text>`);
  }
  parts.push(`<text x="${plotLeft + plotWidth / 2}" y="${top + plotHeight + 38}" font-size="12" fill="${theme.muted}" text-anchor="middle">Strict pass rate (every expected criterion met, no forbidden criterion hit)</text>`);
  rows.forEach((row, index) => {
    const y = top + index * rowHeight + (rowHeight - (barHeight * 2 + 2)) / 2;
    parts.push(`<text x="${labelWidth}" y="${y + barHeight + 5}" font-size="13" fill="${theme.text}" text-anchor="end">${escape(row.name)}</text>`);
    ([["with_skill", theme.withSkill, y], ["without_skill", theme.withoutSkill, y + barHeight + 2]] as const).forEach(([arm, fill, barY]) => {
      const stats = row[arm];
      const length = stats.answers ? (stats.strict / stats.answers) * plotWidth : 0;
      parts.push(bar(plotLeft, barY, length, barHeight, fill));
      parts.push(`<text x="${plotLeft + length + 6}" y="${barY + barHeight - 1}" font-size="11" fill="${theme.muted}">${stats.strict}/${stats.answers}</text>`);
    });
  });
  parts.push("</g></svg>");
  return `${parts.join("\n")}\n`;
}
