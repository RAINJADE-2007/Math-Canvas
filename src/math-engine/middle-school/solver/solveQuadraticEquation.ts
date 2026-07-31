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

function isPerfectSquare(n: number): boolean {
  if (n < 0) return false;
  const root = Math.round(Math.sqrt(n));
  return Math.abs(root * root - n) < 1e-9;
}

export function solveQuadraticEquation(
  left: string,
  right: string,
  subjectId: "middle-school" | "calculus-intro" = "middle-school",
): SolutionResult {
  const steps: SolutionStep[] = [];
  const original = `${left} = ${right}`;
  const originalLatex = toLatex(original);

  steps.push(makeStep(subjectId, "quadratic-equation", "original", "", originalLatex, "写出原方程"));

  const standard = simplify(`${left} - (${right})`).toString();
  const poly = extractPolynomial(standard);
  if (!poly.isPolynomial || poly.degree !== 2) {
    return {
      problemType: "quadratic-equation",
      steps,
      resultLatex: "",
      resultText: "当前表达式不是一元二次方程",
      verified: false,
      warning: "当前版本仅支持一元二次方程（如 x^2-5*x+6=0）。",
    };
  }

  const a = poly.coefficients[2] ?? 0;
  const b = poly.coefficients[1] ?? 0;
  const c = poly.coefficients[0] ?? 0;
  const standardLatex = toLatex(`${standard} = 0`);
  steps.push(
    makeStep(subjectId, "quadratic-equation", "standard-form", originalLatex, standardLatex, "移项并整理为标准形式 ax^2 + bx + c = 0"),
    makeStep(subjectId, "quadratic-equation", "coefficients", standardLatex, `a = ${fmt(a)},\\ b = ${fmt(b)},\\ c = ${fmt(c)}`, "确定系数 a、b、c"),
  );

  const delta = b * b - 4 * a * c;
  const deltaLatex = `\\Delta = b^2 - 4ac = (${fmt(b)})^2 - 4 \\cdot (${fmt(a)}) \\cdot (${fmt(c)}) = ${fmt(delta)}`;
  steps.push(makeStep(subjectId, "quadratic-equation", "discriminant", `a = ${fmt(a)},\\ b = ${fmt(b)},\\ c = ${fmt(c)}`, deltaLatex, "计算判别式 Δ = b^2 - 4ac"));

  let resultLatex: string;
  let resultText: string;

  if (delta < -1e-9) {
    steps.push(makeStep(subjectId, "quadratic-equation", "no-real-roots", deltaLatex, "\\Delta < 0", "判别式小于 0，方程无实数根"));
    resultLatex = "\\text{无实数根}";
    resultText = "方程无实数根";
    return { problemType: "quadratic-equation", steps, resultLatex, resultText, verified: true };
  }

  if (Math.abs(delta) <= 1e-9) {
    const root = -b / (2 * a);
    const rootLatex = `x_1 = x_2 = ${fmt(root)}`;
    steps.push(
      makeStep(subjectId, "quadratic-equation", "double-root", deltaLatex, "\\Delta = 0", "判别式等于 0，方程有两个相等的实数根"),
      makeStep(subjectId, "quadratic-equation", "quadratic-formula", "\\Delta = 0", rootLatex, `利用求根公式 x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a} 代入计算`),
    );
    resultLatex = rootLatex;
    resultText = `x = ${fmt(root)}（二重根）`;
  } else {
    const sqrtDelta = Math.sqrt(delta);
    const root1 = (-b + sqrtDelta) / (2 * a);
    const root2 = (-b - sqrtDelta) / (2 * a);
    const rootsLatex = `x_1 = ${fmt(root1)},\\ x_2 = ${fmt(root2)}`;
    steps.push(
      makeStep(subjectId, "quadratic-equation", "two-roots", deltaLatex, "\\Delta > 0", "判别式大于 0，方程有两个不相等的实数根"),
      makeStep(subjectId, "quadratic-equation", "quadratic-formula", "\\Delta > 0", rootsLatex, `利用求根公式 x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a} 代入计算`),
    );

    if (isPerfectSquare(delta) && a !== 0) {
      const factor1 = root1 === 0 ? "x" : `(x ${-root1 >= 0 ? "-" : "+"} ${fmt(Math.abs(root1))})`;
      const factor2 = root2 === 0 ? "x" : `(x ${-root2 >= 0 ? "-" : "+"} ${fmt(Math.abs(root2))})`;
      const factoredLatex = `${fmt(a)} \\cdot ${factor1} \\cdot ${factor2} = 0`;
      steps.push(
        makeStep(subjectId, "quadratic-equation", "factor", rootsLatex, factoredLatex, "判别式为完全平方数，可进行因式分解"),
      );
    }

    resultLatex = rootsLatex;
    resultText = `x₁ = ${fmt(root1)}，x₂ = ${fmt(root2)}`;
  }

  const roots: number[] = [];
  if (delta >= -1e-9) {
    const sqrtDelta = Math.sqrt(Math.max(0, delta));
    roots.push((-b + sqrtDelta) / (2 * a));
    roots.push((-b - sqrtDelta) / (2 * a));
  }

  let verified = true;
  for (const root of roots) {
    try {
      const l = evaluate(left, { x: root });
      const r = evaluate(right, { x: root });
      if (typeof l !== "number" || typeof r !== "number" || Math.abs(l - r) > 1e-6) verified = false;
    } catch {
      verified = false;
    }
  }
  steps.push(
    makeStep(subjectId, "quadratic-equation", "verify", resultLatex, "\\text{左边} = \\text{右边}", `将求得的根代回原方程验证${verified ? "，等式成立" : "，请检查计算"}`, verified),
  );

  return { problemType: "quadratic-equation", steps, resultLatex, resultText, verified };
}

export function solveQuadraticEquationFromInput(input: string): SolutionResult {
  const eq = input.trim();
  let depth = 0;
  let eqIndex = -1;
  for (let i = 0; i < eq.length; i++) {
    const c = eq[i];
    if (c === "(" || c === "[") depth += 1;
    else if (c === ")" || c === "]") depth = Math.max(0, depth - 1);
    else if (c === "=" && depth === 0) {
      if (eqIndex !== -1) return noInputResult();
      eqIndex = i;
    }
  }
  if (eqIndex === -1) return noInputResult();
  const left = eq.slice(0, eqIndex).trim();
  const right = eq.slice(eqIndex + 1).trim();
  if (!left || !right) return noInputResult();
  return solveQuadraticEquation(left, right);
}

function noInputResult(): SolutionResult {
  return {
    problemType: "quadratic-equation",
    steps: [],
    resultLatex: "",
    resultText: "请输入形如 x^2-5*x+6=0 的一元二次方程",
    verified: false,
    warning: "当前版本仅支持一元二次方程。",
  };
}
