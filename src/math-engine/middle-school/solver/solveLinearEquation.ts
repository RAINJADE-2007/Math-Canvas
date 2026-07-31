import { evaluate, simplify } from "mathjs";
import type { SolutionResult, SolutionStep } from "@/types";
import { extractPolynomial, fmt, toLatex } from "@/math-engine/middle-school/solver/polyMath";

let stepCounter = 0;
function makeStep(
  subjectId: "middle-school" | "calculus-intro",
  problemType: SolutionStep["problemType"],
  rule: string,
  beforeLatex: string,
  afterLatex: string,
  explanation: string,
  verified = false,
): SolutionStep {
  stepCounter += 1;
  return {
    id: `step-${subjectId}-${stepCounter}`,
    subjectId,
    problemType,
    rule,
    beforeLatex,
    afterLatex,
    explanation,
    verified,
  };
}

function evaluateEquation(left: string, right: string, x: number): number {
  try {
    const scope = { x };
    const l = evaluate(left, scope);
    const r = evaluate(right, scope);
    if (typeof l !== "number" || typeof r !== "number") return NaN;
    return Math.abs(l - r);
  } catch {
    return NaN;
  }
}

export function solveLinearEquation(
  left: string,
  right: string,
  subjectId: "middle-school" | "calculus-intro" = "middle-school",
): SolutionResult {
  const steps: SolutionStep[] = [];
  const original = `${left} = ${right}`;
  const originalLatex = toLatex(original);

  steps.push(makeStep(subjectId, "linear-equation", "original", "", originalLatex, "写出原方程"));

  const diff = simplify(`${left} - (${right})`).toString();
  const poly = extractPolynomial(diff);
  if (!poly.isPolynomial || poly.degree !== 1) {
    return {
      problemType: "linear-equation",
      steps,
      resultLatex: "",
      resultText: "当前表达式不是一元一次方程",
      verified: false,
      warning: "当前版本仅支持一元一次方程（如 2*x+3=7）。",
    };
  }

  const A = poly.coefficients[1] ?? 0;
  const B = poly.coefficients[0] ?? 0;
  const diffLatex = toLatex(diff);
  steps.push(
    makeStep(subjectId, "linear-equation", "move-and-combine", originalLatex, diffLatex, "移项：把含 x 的项移到等号一边，常数项移到另一边，并合并同类项"),
  );

  if (Math.abs(A) < 1e-12) {
    if (Math.abs(B) < 1e-12) {
      steps.push(makeStep(subjectId, "linear-equation", "identity", diffLatex, "0 = 0", "方程两边恒等"));
      return { problemType: "linear-equation", steps, resultLatex: "x \\in \\mathbb{R}", resultText: "方程有无数个解（恒等式）", verified: true };
    }
    steps.push(makeStep(subjectId, "linear-equation", "contradiction", diffLatex, `${fmt(B)} = 0`, `得到 ${fmt(B)} = 0，与事实矛盾`));
    return { problemType: "linear-equation", steps, resultLatex: "\\varnothing", resultText: "方程无解", verified: true };
  }

  const solution = -B / A;
  const solutionLatex = `x = ${fmt(solution)}`;
  const isolatedLatex = `${fmt(A)}x = ${fmt(-B)}`;
  steps.push(
    makeStep(subjectId, "linear-equation", "isolate", diffLatex, isolatedLatex, `把常数项移到等号右边：${isolatedLatex}`),
    makeStep(subjectId, "linear-equation", "divide-coefficient", isolatedLatex, solutionLatex, `系数化为 1：两边同时除以 ${fmt(A)}，得到解`),
  );

  const residual = evaluateEquation(left, right, solution);
  const verified = Number.isFinite(residual) && residual < 1e-8;
  steps.push(
    makeStep(subjectId, "linear-equation", "verify", solutionLatex, "\\text{左边} = \\text{右边}", `代入验证：x = ${fmt(solution)} 时，左边 - 右边 = ${Number.isFinite(residual) ? fmt(residual) : "无法计算"}${verified ? "，等式成立" : "，请检查计算"}`, verified),
  );

  return { problemType: "linear-equation", steps, resultLatex: solutionLatex, resultText: `x = ${fmt(solution)}`, verified };
}

export function solveLinearEquationFromInput(input: string): SolutionResult {
  const eq = input.trim();
  const eqSplit = splitEquation(eq);
  if (!eqSplit) {
    return {
      problemType: "linear-equation",
      steps: [],
      resultLatex: "",
      resultText: "请输入形如 2*x+3=7 的一元一次方程",
      verified: false,
      warning: "当前版本仅支持一元一次方程。",
    };
  }
  return solveLinearEquation(eqSplit.left, eqSplit.right);
}

function splitEquation(input: string): { left: string; right: string } | null {
  let depth = 0;
  let eqIndex = -1;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (c === "(" || c === "[") depth += 1;
    else if (c === ")" || c === "]") depth = Math.max(0, depth - 1);
    else if (c === "=" && depth === 0) {
      if (eqIndex !== -1) return null;
      eqIndex = i;
    }
  }
  if (eqIndex === -1) return null;
  const left = input.slice(0, eqIndex).trim();
  const right = input.slice(eqIndex + 1).trim();
  if (!left || !right) return null;
  return { left, right };
}
