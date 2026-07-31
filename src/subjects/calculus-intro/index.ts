import type { SubjectModule } from "@/subjects/types";
import type { MathAnalysisResult, MathExpression, MathProblem, MathParameter } from "@/types";
import { buildDerivativeResult } from "@/math-engine/calculus-intro/derivative/derivativeAnalysis";
import { parseExpressionInput } from "@/math-engine/core/parser/parseExpression";

export const calculusIntroModule: SubjectModule = {
  id: "calculus-intro",
  name: "导数入门",
  description: "基础导数、切线、割线逼近与单调性分析（拓展模块）",
  enabled: true,
  supportedObjectTypes: ["function", "derivative", "tangent", "secant"],
  supportedProblemTypes: ["derivative", "tangent", "monotonicity"],

  canHandle(input: string): boolean {
    const parsed = parseExpressionInput(input);
    return parsed.ok;
  },

  async analyze(expression: MathExpression, context?: { parameters?: Record<string, MathParameter>; parameterValues?: Record<string, number> }): Promise<MathAnalysisResult> {
    const values = context?.parameterValues ?? {};
    const result = buildDerivativeResult({
      expression,
      parameterValues: values,
      domain: expression.domain ?? { min: -10, max: 10 },
    });
    const properties: MathAnalysisResult["properties"] = [
      {
        key: "method",
        label: "求导方式",
        value: result.method === "symbolic" ? "符号求导" : "数值导数（数值近似）",
      },
    ];
    if (result.derivativeLatex) {
      properties.push({ key: "derivative", label: "导函数", latex: `f'(x) = ${result.derivativeLatex}` });
    }
    return {
      objectType: "derivative",
      functionType: null,
      summary: result.method === "symbolic" ? "导数分析（符号）" : "导数分析（数值近似）",
      properties,
      warning: result.warning,
    };
  },

  async solve(problem: MathProblem): Promise<import("@/types").SolutionResult> {
    const { solveCalculusIntroProblem } = await import("@/math-engine/calculus-intro/derivative/solveDerivativeProblem");
    return solveCalculusIntroProblem(problem);
  },
};
