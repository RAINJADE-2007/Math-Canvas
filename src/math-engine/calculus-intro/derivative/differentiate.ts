import type { SolutionStep } from "@/types";
import { differentiateSymbolically } from "@/math-engine/calculus-intro/derivative/derivativeRules";
import { DEFAULT_DIFFERENTIAL_STEP, isNumericalDerivativeSafe, numericalDerivativeAt } from "@/math-engine/calculus-intro/derivative/numericalDerivative";
import type { NumericFunction } from "@/math-engine/calculus-intro/derivative/numericalDerivative";
import { toSolutionSteps } from "@/math-engine/calculus-intro/derivative/types";
import { evaluateExpression } from "@/math-engine/core/evaluator/evaluator";

export interface ComputeDerivativeInput {
  expression: string;
  fn: NumericFunction;
  params?: Record<string, number>;
}

export interface ComputeDerivativeOutput {
  derivativeExpression?: string;
  derivativeLatex?: string;
  method: "symbolic" | "numeric";
  steps: SolutionStep[];
  warning?: string;
  derivativeAt: (x: number) => number;
}

export const NUMERIC_MODE_MESSAGE = "当前表达式暂不支持完整符号求导，已切换为数值导数。";
export const UNSTABLE_MESSAGE = "当前表达式无法进行稳定的导数分析。";

export function computeDerivative(input: ComputeDerivativeInput): ComputeDerivativeOutput {
  const symbolic = differentiateSymbolically(input.expression);

  if (symbolic.ok) {
    const symbolicSteps = toSolutionSteps("calculus-intro", "derivative", symbolic.steps);
    const params = input.params ?? {};
    return {
      derivativeExpression: symbolic.derivative,
      derivativeLatex: symbolic.latex,
      method: "symbolic",
      steps: symbolicSteps,
      derivativeAt: (x) => {
        if (!Number.isFinite(input.fn(x))) return NaN;
        return evaluateExpression(symbolic.derivative, { x, ...params });
      },
    };
  }

  const testPoints = [-8, -4, -1, 1, 4, 8];
  const safe = testPoints.some((x) => isNumericalDerivativeSafe(input.fn, x));

  const warning = safe ? NUMERIC_MODE_MESSAGE : `${symbolic.error ?? ""} ${UNSTABLE_MESSAGE}`.trim();

  return {
    method: "numeric",
    steps: toSolutionSteps("calculus-intro", "derivative", [
      {
        rule: "numeric",
        beforeLatex: input.expression,
        afterLatex: "f'(x) \\approx \\frac{f(x+h)-f(x-h)}{2h}",
        explanation: NUMERIC_MODE_MESSAGE,
      },
    ]),
    warning,
    derivativeAt: (x) => numericalDerivativeAt(input.fn, x, DEFAULT_DIFFERENTIAL_STEP),
  };
}
