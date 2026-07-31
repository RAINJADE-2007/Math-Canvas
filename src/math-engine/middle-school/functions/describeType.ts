import type { MathExpression } from "@/types";
import { extractPolynomial } from "@/math-engine/middle-school/solver/polyMath";

export type FunctionTypeLabel =
  | "一次函数"
  | "二次函数"
  | "反比例函数"
  | "三角函数"
  | "指数函数"
  | "对数函数"
  | "幂函数"
  | "其他函数";

export function guessFunctionType(expression: MathExpression): FunctionTypeLabel {
  const normalized = expression.normalizedExpression;
  const text = normalized.replace(/\s+/g, "");

  if (/^(sin|cos|tan)\(/.test(text) || /[+\-*/(]*(sin|cos|tan)\(/.test(text)) {
    return "三角函数";
  }
  if (/^[+-]?\d*(\.\d+)?\s*\/\s*x(\s*\+\s*)?$/.test(normalized) || /^[+-]?[a-zA-Z]\s*\/\s*x/.test(normalized)) {
    return "反比例函数";
  }
  if (/exp\(/.test(text) || /^\d+(\.\d+)?\s*\*\*\s*/.test(text)) {
    return "指数函数";
  }
  if (/^(log|log10|ln)\(/.test(text)) {
    return "对数函数";
  }
  if (/sqrt\(|abs\(/.test(text)) {
    return "幂函数";
  }

  const poly = extractPolynomial(normalized);
  if (poly.isPolynomial && poly.degree === 1) return "一次函数";
  if (poly.isPolynomial && poly.degree === 2) return "二次函数";
  if (poly.isPolynomial) return "幂函数";

  return "其他函数";
}
