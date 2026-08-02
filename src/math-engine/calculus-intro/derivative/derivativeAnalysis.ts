import type { DerivativeResult, MathExpression, MonotonicInterval, SecantResult, TangentResult } from "@/types";
import { createSafeFunction } from "@/math-engine/core/evaluator/evaluator";
import { computeDerivative } from "@/math-engine/calculus-intro/derivative/differentiate";
import { calculateSecant, calculateTangent } from "@/math-engine/calculus-intro/tangent/calculateTangent";
import { analyzeMonotonicity, findCriticalPoints } from "@/math-engine/calculus-intro/monotonicity/findCriticalPoints";
import { extractPolynomial } from "@/math-engine/middle-school/solver/polyMath";

export interface DerivativeBuildInput {
  expression: MathExpression;
  parameterValues: Record<string, number>;
  domain: { min: number; max: number };
  tangentX?: number;
  secantH?: number;
}

export function buildDerivativeResult(input: DerivativeBuildInput): DerivativeResult {
  const fn = createSafeFunction(input.expression.normalizedExpression);
  const numericFn = (x: number): number => fn.evaluate(x, input.parameterValues);

  const computed = computeDerivative({
    expression: input.expression.normalizedExpression,
    fn: numericFn,
    params: input.parameterValues,
  });

  let exactRoots: number[] = [];
  if (computed.method === "symbolic" && computed.derivativeExpression) {
    const poly = extractPolynomial(computed.derivativeExpression);
    if (poly.isPolynomial && poly.degree === 1) {
      const A = poly.coefficients[1] ?? 0;
      const B = poly.coefficients[0] ?? 0;
      if (Math.abs(A) > 1e-12) exactRoots = [-B / A];
    }
  }

  const critical = findCriticalPoints(computed.derivativeAt, numericFn, input.domain, exactRoots);
  const criticalPoints = critical.map((c) => c.x);
  const intervals: MonotonicInterval[] = analyzeMonotonicity(
    computed.derivativeAt,
    input.domain,
    criticalPoints,
  );

  let warning = computed.warning;
  if (exactRoots.length === 0 && computed.method === "numeric") {
    warning = [warning, "数值分析发现可能的临界点。"].filter(Boolean).join(" ");
  }

  const x0 = input.tangentX ?? pickDefaultTangentX(numericFn, input.domain);
  const tangent: TangentResult | undefined = Number.isFinite(numericFn(x0))
    ? calculateTangent(x0, numericFn, computed.derivativeAt)
    : undefined;
  const secant: SecantResult | undefined =
    tangent && Number.isFinite(numericFn(x0 + (input.secantH ?? 2)))
      ? calculateSecant(x0, input.secantH ?? 2, numericFn)
      : undefined;

  return {
    originalExpression: input.expression.normalizedExpression,
    derivativeExpression: computed.derivativeExpression,
    derivativeLatex: computed.derivativeLatex,
    method: computed.method,
    steps: computed.steps,
    tangent,
    secant,
    criticalPoints,
    monotonicIntervals: intervals,
    warning,
  };
}

function pickDefaultTangentX(fn: (x: number) => number, domain: { min: number; max: number }): number {
  for (const candidate of [1, 0, -1, 2, domain.min, domain.max]) {
    if (Number.isFinite(fn(candidate))) return candidate;
  }
  return 0;
}
