import type { SubjectModule } from "@/subjects/types";
import { analyzeMiddleSchoolFunction } from "@/math-engine/middle-school/functions/analyze";
import type { MathExpression, MathProblem, MathParameter } from "@/types";

const MIDDLE_SCHOOL_EXPRESSION_RE = /^[^=]*=/;

export const middleSchoolModule: SubjectModule = {
  id: "middle-school",
  name: "中学数学",
  description: "中学函数图像、方程、不等式、几何与统计",
  enabled: true,
  supportedObjectTypes: [
    "function",
    "point",
    "line",
    "circle",
    "parameter",
    "dataset",
  ],
  supportedProblemTypes: [
    "linear-equation",
    "quadratic-equation",
    "linear-inequality",
    "numeric",
  ],

  canHandle(input: string): boolean {
    return MIDDLE_SCHOOL_EXPRESSION_RE.test(input.trim()) || input.trim().length > 0;
  },

  async analyze(expression: MathExpression, context?: { parameters?: Record<string, MathParameter>; parameterValues?: Record<string, number> }) {
    return analyzeMiddleSchoolFunction(
      expression,
      context?.parameters ?? {},
      context?.parameterValues ?? {},
      expression.domain ?? { min: -10, max: 10 },
    );
  },

  async solve(problem: MathProblem, _context?: { parameters?: Record<string, MathParameter> }) {
    const { solveMiddleSchoolProblem } = await import("@/math-engine/middle-school/solver/solve");
    return solveMiddleSchoolProblem(problem);
  },
};
