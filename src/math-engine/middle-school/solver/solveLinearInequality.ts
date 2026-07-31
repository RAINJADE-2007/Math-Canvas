import { evaluate, simplify } from "mathjs";
import type { SolutionResult, SolutionStep } from "@/types";
import { extractPolynomial, fmt, splitOnRelationalOperator, toLatex } from "@/math-engine/middle-school/solver/polyMath";

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

export function solveLinearInequalityFromInput(input: string): SolutionResult {
  const steps: SolutionStep[] = [];
  const text = input.trim();
  const split = splitOnRelationalOperator(text);
  if (!split) {
    return {
      problemType: "linear-inequality",
      steps,
      resultLatex: "",
      resultText: "请输入形如 2*x+3>7 的一元一次不等式",
      verified: false,
      warning: "当前版本仅支持一元一次不等式。",
    };
  }

  const { left, right, operator } = split;
  const originalLatex = toLatex(text);
  steps.push(makeStep("middle-school", "linear-inequality", "original", "", originalLatex, "写出原不等式"));

  const diff = simplify(`${left} - (${right})`).toString();
  const poly = extractPolynomial(diff);
  if (!poly.isPolynomial || poly.degree !== 1) {
    return {
      problemType: "linear-inequality",
      steps,
      resultLatex: "",
      resultText: "当前表达式不是一元一次不等式",
      verified: false,
      warning: "当前版本仅支持一元一次不等式（如 2*x+3>7）。",
    };
  }

  const A = poly.coefficients[1] ?? 0;
  const B = poly.coefficients[0] ?? 0;
  const diffLatex = toLatex(diff);
  steps.push(
    makeStep("middle-school", "linear-inequality", "move-and-combine", originalLatex, `${diffLatex} ${operator} 0`, "移项并合并同类项，把含 x 的项移到左边，常数移到右边"),
  );

  if (Math.abs(A) < 1e-12) {
    const holds =
      operator === ">" ? B > 0 : operator === ">=" ? B >= 0 : operator === "<" ? B < 0 : B <= 0;
    if (holds) {
      steps.push(makeStep("middle-school", "linear-inequality", "always-true", `${diffLatex} ${operator} 0`, `\\text{恒成立}`, "不等式恒成立"));
      return { problemType: "linear-inequality", steps, resultLatex: "x \\in \\mathbb{R}", resultText: "解集为全体实数", verified: true };
    }
      steps.push(makeStep("middle-school", "linear-inequality", "never-true", `${diffLatex} ${operator} 0`, "\\varnothing", "不等式无解"));
    return { problemType: "linear-inequality", steps, resultLatex: "\\varnothing", resultText: "不等式无解", verified: true };
  }

  const threshold = -B / A;
  const solutionLatex =
    A > 0
      ? operator === ">"
        ? `x > ${fmt(threshold)}`
        : `x \\geq ${fmt(threshold)}`
      : operator === ">"
        ? `x < ${fmt(threshold)}`
        : `x \\leq ${fmt(threshold)}`;

  steps.push(
    makeStep("middle-school", "linear-inequality", "divide-coefficient", `${fmt(A)}x ${operator} ${fmt(-B)}`, solutionLatex,
      A > 0
        ? `两边同除以正数 ${fmt(A)}，不等号方向不变`
        : `两边同除以负数 ${fmt(A)}，不等号方向改变`),
  );

  let verified = false;
  const greaterLike = operator === ">" || operator === ">=";
  const probe = threshold + (A > 0 ? (greaterLike ? 1 : -1) : (greaterLike ? -1 : 1));
  try {
    const l = evaluate(left, { x: probe });
    const r = evaluate(right, { x: probe });
    if (typeof l === "number" && typeof r === "number") {
      verified =
        operator === ">" ? l > r : operator === "<" ? l < r : operator === ">=" ? l >= r : l <= r;
    }
  } catch {
    verified = false;
  }
  steps.push(
    makeStep("middle-school", "linear-inequality", "verify", solutionLatex, "\\text{代入验证}", `取解集内一点 x = ${fmt(probe)} 代入验证${verified ? "，不等式成立" : "，请检查计算"}`, verified),
  );

  return { problemType: "linear-inequality", steps, resultLatex: solutionLatex, resultText: `解集：${solutionLatex.replace("\\geq", "≥").replace("\\leq", "≤")}`, verified };
}
