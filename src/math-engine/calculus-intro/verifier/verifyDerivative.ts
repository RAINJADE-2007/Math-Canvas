import { evaluateExpression } from "@/math-engine/core/evaluator/evaluator";
import type { NumericFunction } from "@/math-engine/calculus-intro/derivative/numericalDerivative";

export interface DerivativeVerificationResult {
  verified: boolean;
  points: { x: number; symbolic: number; numeric: number; diff: number }[];
}

export function verifyDerivative(
  derivativeExpression: string,
  fn: NumericFunction,
  derivativeNumeric: (x: number) => number,
  sampleCount = 20,
): DerivativeVerificationResult {
  const points: DerivativeVerificationResult["points"] = [];
  for (let i = 0; i < sampleCount; i++) {
    const x = -8 + (16 * i) / (sampleCount - 1);
    const symbolic = evaluateExpression(derivativeExpression, { x });
    const numeric = derivativeNumeric(x);
    if (!Number.isFinite(fn(x))) continue;
    if (Number.isFinite(symbolic) && Number.isFinite(numeric)) {
      points.push({ x, symbolic, numeric, diff: Math.abs(symbolic - numeric) });
    }
  }
  if (points.length === 0) return { verified: false, points };
  const maxDiff = Math.max(...points.map((p) => p.diff));
  const meanDiff = points.reduce((s, p) => s + p.diff, 0) / points.length;
  return { verified: meanDiff < 1e-4 && maxDiff < 1e-2, points };
}
