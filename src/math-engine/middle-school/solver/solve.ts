import type { MathProblem, SolutionResult } from "@/types";
import { solveLinearEquationFromInput } from "@/math-engine/middle-school/solver/solveLinearEquation";
import { solveQuadraticEquationFromInput } from "@/math-engine/middle-school/solver/solveQuadraticEquation";
import { solveLinearInequalityFromInput } from "@/math-engine/middle-school/solver/solveLinearInequality";

export function solveMiddleSchoolProblem(problem: MathProblem): SolutionResult {
  switch (problem.problemType) {
    case "linear-equation":
      return solveLinearEquationFromInput(problem.input);
    case "quadratic-equation":
      return solveQuadraticEquationFromInput(problem.input);
    case "linear-inequality":
      return solveLinearInequalityFromInput(problem.input);
    default:
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
