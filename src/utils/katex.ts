import katex from "katex";
import "katex/dist/katex.min.css";

export function renderLatex(latex: string, displayMode = false): string {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode,
      strict: false,
      output: "html",
    });
  } catch {
    return latex;
  }
}

export function formatNumber(value: number, digits = 4): string {
  if (!Number.isFinite(value)) return "无法计算";
  return Number.isInteger(value) ? String(value) : value.toFixed(digits);
}
