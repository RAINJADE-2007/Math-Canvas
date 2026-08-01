import { useMemo } from "react";
import { useMathCanvasStore } from "@/store/useMathCanvasStore";
import { createSafeFunction } from "@/math-engine/core/evaluator/evaluator";
import { computeDerivative } from "@/math-engine/calculus-intro/derivative/differentiate";
import type { DerivativeResult, MathExpression, MathParameter, PinnedPoint } from "@/types";

export interface PinnedPointInfo {
  point: PinnedPoint;
  expression: MathExpression;
  y: number;
  valid: boolean;
  derivative?: number;
  derivativeValid: boolean;
}

function makeNumericFn(
  expression: MathExpression,
  parameters: Record<string, MathParameter>,
): (x: number) => number {
  const fn = createSafeFunction(expression.normalizedExpression);
  const paramValues: Record<string, number> = {};
  for (const p of expression.parameters) {
    const value = parameters[p]?.value;
    if (typeof value === "number") paramValues[p] = value;
  }
  return (x: number) => fn.evaluate(x, paramValues);
}

export function buildPinnedPointInfos(
  pinnedPoints: PinnedPoint[],
  expressions: MathExpression[],
  parameters: Record<string, MathParameter>,
  derivativeResults: Record<string, DerivativeResult>,
): PinnedPointInfo[] {
  const fnCache = new Map<string, (x: number) => number>();
  const result: PinnedPointInfo[] = [];
  for (const point of pinnedPoints) {
    const expression = expressions.find((e) => e.id === point.expressionId);
    if (!expression) continue;
    let numericFn = fnCache.get(expression.id);
    if (!numericFn) {
      numericFn = makeNumericFn(expression, parameters);
      fnCache.set(expression.id, numericFn);
    }
    const y = numericFn(point.x);
    let derivative: number | undefined;
    let derivativeValid = false;
    if (derivativeResults[expression.id]) {
      const computed = computeDerivative({ expression: expression.normalizedExpression, fn: numericFn });
      const dv = computed.derivativeAt(point.x);
      if (Number.isFinite(dv)) {
        derivative = dv;
        derivativeValid = true;
      }
    }
    result.push({ point, expression, y, valid: Number.isFinite(y), derivative, derivativeValid });
  }
  return result;
}

export function usePinnedPointsData(): PinnedPointInfo[] {
  const pinnedPoints = useMathCanvasStore((s) => s.pinnedPoints);
  const expressions = useMathCanvasStore((s) => s.expressions);
  const parameters = useMathCanvasStore((s) => s.parameters);
  const derivativeResults = useMathCanvasStore((s) => s.derivativeResults);
  return useMemo(
    () => buildPinnedPointInfos(pinnedPoints, expressions, parameters, derivativeResults),
    [pinnedPoints, expressions, parameters, derivativeResults],
  );
}
