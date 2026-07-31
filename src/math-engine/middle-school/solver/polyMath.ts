import { derivative, evaluate, parse, simplify } from "mathjs";

export interface PolynomialResult {
  coefficients: number[];
  degree: number;
  isPolynomial: boolean;
}

export function extractPolynomial(expression: string): PolynomialResult {
  const coefficients: number[] = [];
  let expr = expression;
  let fact = 1;
  let isPolynomial = false;
  try {
    for (let i = 0; i < 21; i++) {
      const value = evaluate(expr, { x: 0 });
      if (typeof value !== "number" || !Number.isFinite(value)) {
        return { coefficients, degree: coefficients.length - 1, isPolynomial: false };
      }
      coefficients.push(value / fact);
      const d = simplify(derivative(expr, "x"));
      if (d.toString() === "0") {
        isPolynomial = true;
        break;
      }
      expr = d.toString();
      fact *= i + 1;
    }
  } catch {
    isPolynomial = false;
  }
  return { coefficients, degree: coefficients.length - 1, isPolynomial };
}

export function isLinearExpression(expression: string): boolean {
  const poly = extractPolynomial(expression);
  return poly.isPolynomial && poly.degree === 1;
}

export function isQuadraticExpression(expression: string): boolean {
  const poly = extractPolynomial(expression);
  return poly.isPolynomial && poly.degree === 2;
}

export function splitOnRelationalOperator(input: string): {
  left: string;
  right: string;
  operator: string;
} | null {
  const text = input.trim();
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "(" || c === "[") depth += 1;
    else if (c === ")" || c === "]") depth = Math.max(0, depth - 1);
    else if (depth === 0) {
      const rest = text.slice(i);
      if (rest.startsWith(">=") || rest.startsWith("<=")) {
        return { left: text.slice(0, i), right: text.slice(i + 2), operator: rest.slice(0, 2) };
      }
      if (rest.startsWith(">") || rest.startsWith("<")) {
        return { left: text.slice(0, i), right: text.slice(i + 1), operator: rest.slice(0, 1) };
      }
    }
  }
  return null;
}

export function toLatex(expression: string): string {
  try {
    return parse(expression).toTex();
  } catch {
    return expression;
  }
}

export function fmt(n: number): string {
  if (Math.abs(n) < 1e-9) return "0";
  const rounded = Math.round(n * 1e9) / 1e9;
  return String(rounded);
}
