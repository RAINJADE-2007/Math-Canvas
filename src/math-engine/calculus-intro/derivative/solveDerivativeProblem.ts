import type { MathExpression, MathProblem, SolutionResult, SolutionStep } from "@/types";
import { parseExpressionInput } from "@/math-engine/core/parser/parseExpression";
import { buildDerivativeResult } from "@/math-engine/calculus-intro/derivative/derivativeAnalysis";

export function solveCalculusIntroProblem(problem: MathProblem): SolutionResult {
  const parsed = parseExpressionInput(problem.input);
  if (!parsed.ok) {
    return {
      problemType: problem.problemType,
      steps: [],
      resultLatex: "",
      resultText: parsed.error ?? "当前版本暂不支持该数学内容。",
      verified: false,
      warning: "请输入形如 x^2、sin(x)、exp(x) 的函数表达式。",
    };
  }

  const expression: MathExpression = {
    id: problem.id,
    subjectId: "calculus-intro",
    type: "function",
    rawInput: problem.input,
    latex: parsed.latex,
    normalizedExpression: parsed.normalizedExpression,
    color: "#2563eb",
    visible: true,
    parameters: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const result = buildDerivativeResult({
    expression,
    parameterValues: {},
    domain: { min: -10, max: 10 },
  });

  const derivativeText = result.derivativeLatex
    ? `f'(x) = ${result.derivativeLatex}`
    : "当前表达式无法进行稳定的导数分析。";

  switch (problem.problemType) {
    case "derivative": {
      return {
        problemType: "derivative",
        steps: result.steps,
        resultLatex: derivativeText,
        resultText:
          result.method === "symbolic"
            ? `符号求导结果：f'(x) = ${result.derivativeExpression}`
            : "数值导数（数值近似）：无法获得符号结果",
        verified: result.method === "symbolic",
        warning: result.warning,
      };
    }
    case "tangent": {
      const tangent = result.tangent;
      const steps: SolutionStep[] = [
        ...result.steps,
        ...(tangent
          ? [
              {
                id: "tangent-step",
                subjectId: "calculus-intro" as const,
                problemType: "tangent" as const,
                rule: "tangent-line",
                beforeLatex: derivativeText,
                afterLatex: `\\text{切点 }(${tangent.x}, ${tangent.y.toFixed(4)}),\\ y = ${tangent.equation}`,
                explanation: `在 x = ${tangent.x} 处，f(x) = ${tangent.y.toFixed(4)}，斜率 f'(${tangent.x}) = ${tangent.slope.toFixed(4)}`,
                verified: Number.isFinite(tangent.slope),
              },
            ]
          : []),
      ];
      return {
        problemType: "tangent",
        steps,
        resultLatex: tangent ? `y - f(a) = f'(a)(x-a)` : "无法计算切线",
        resultText: tangent ? `在 a=${tangent.x} 处切线方程：${tangent.equation}` : "无法计算切线",
        verified: !!tangent && Number.isFinite(tangent.slope),
        warning: result.warning,
      };
    }
    case "monotonicity": {
      const intervalsText = result.monotonicIntervals
        .map((iv) => {
          const range = `${iv.start === null ? "(-∞" : `(${iv.start}`}, ${iv.end === null ? "+∞)" : `${iv.end})`}`;
          const label =
            iv.type === "increasing" ? "递增" : iv.type === "decreasing" ? "递减" : iv.type === "constant" ? "恒定" : "未知";
          return `${range}：${label}`;
        })
        .join("；");
      return {
        problemType: "monotonicity",
        steps: result.steps,
        resultLatex: intervalsText || "无法分析",
        resultText: result.criticalPoints.length > 0 ? `临界点：${result.criticalPoints.join(", ")}` : "未发现明显临界点",
        verified: result.method === "symbolic",
        warning: result.warning ?? (result.criticalPoints.length > 0 ? "数值分析发现可能的临界点。" : undefined),
      };
    }
    default: {
      return {
        problemType: problem.problemType,
        steps: [],
        resultLatex: "",
        resultText: "当前版本暂不支持该数学内容。",
        verified: false,
        warning: "当前版本暂不支持该数学内容。",
      };
    }
  }
}
