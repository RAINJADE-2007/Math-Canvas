import type { TangentResult, SecantResult } from "@/types";
import type { NumericFunction } from "@/math-engine/calculus-intro/derivative/numericalDerivative";

export function formatEquation(k: number, b: number): string {
  if (!Number.isFinite(k) || !Number.isFinite(b)) return "无法计算";
  const kStr = Number.isInteger(k) ? String(k) : k.toFixed(4);
  const bAbs = Math.abs(b);
  const bStr = Number.isInteger(b) ? String(Math.abs(b)) : bAbs.toFixed(4);
  if (Math.abs(b) < 1e-9) return `y = ${kStr}x`;
  if (b > 0) return `y = ${kStr}x + ${bStr}`;
  return `y = ${kStr}x - ${bStr}`;
}

export function calculateTangent(
  x: number,
  fn: NumericFunction,
  derivativeAt: (x: number) => number,
): TangentResult {
  const y = fn(x);
  const slope = derivativeAt(x);
  return {
    x,
    y,
    slope,
    equation: Number.isFinite(y) && Number.isFinite(slope) ? formatEquation(slope, y - slope * x) : "无法计算",
  };
}

export function calculateSecant(x: number, h: number, fn: NumericFunction): SecantResult {
  const x1 = x;
  const y1 = fn(x1);
  const x2 = x + h;
  const y2 = fn(x2);
  const slope = (y2 - y1) / h;
  return {
    x1,
    y1,
    x2,
    y2,
    h,
    slope,
  };
}
