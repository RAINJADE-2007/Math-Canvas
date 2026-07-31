import { ConstantNode, derivative, evaluate, parse, simplify } from "mathjs";
import type { MathNode } from "mathjs";
import { asNode, fnName as fnNameOf } from "@/math-engine/core/validator/astAccess";
import type {
  FunctionPropertyItem,
  MathAnalysisResult,
  MathExpression,
  MathParameter,
} from "@/types";

const NOT_SUPPORTED = "当前版本暂不支持该函数的完整性质分析。";

function roundValue(value: number): number {
  if (!Number.isFinite(value)) return value;
  return Math.round(value * 1e6) / 1e6;
}

export function substituteParameters(expression: string, params: Record<string, MathParameter>): string {
  let node: MathNode;
  try {
    node = parse(expression);
  } catch {
    return expression;
  }
  for (const name of Object.keys(params)) {
    const value = params[name]?.value;
    if (typeof value !== "number") continue;
    const targetName = name;
    node = node.transform((n) => {
      const inner = asNode(n);
      if (inner.type === "SymbolNode" && inner.name === targetName) {
        return new ConstantNode(value);
      }
      return n;
    });
  }
  return node.toString();
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
}

function containsFunctionNode(node: MathNode, name: string): boolean {
  const n = asNode(node);
  if (n.type === "FunctionNode" && fnNameOf(n) === name) return true;
  if (n.args) return n.args.some((arg) => containsFunctionNode(arg, name));
  return false;
}

interface LinearInfo {
  slope: number;
  intercept: number;
}

function tryLinear(numericExpression: string): LinearInfo | null {
  try {
    const d1 = simplify(derivative(numericExpression, "x"));
    const d2 = simplify(derivative(d1.toString(), "x"));
    if (d2.toString() !== "0") return null;
    const slope = toNumber(evaluate(d1.toString(), {}));
    if (slope === null) return null;
    const intercept = toNumber(evaluate(numericExpression, { x: 0 }));
    if (intercept === null) return null;
    return { slope, intercept };
  } catch {
    return null;
  }
}

interface QuadraticInfo {
  a: number;
  b: number;
  c: number;
}

function tryQuadratic(numericExpression: string): QuadraticInfo | null {
  try {
    const d1 = simplify(derivative(numericExpression, "x"));
    const d2 = simplify(derivative(d1.toString(), "x"));
    const a2 = toNumber(evaluate(d2.toString(), {}));
    if (a2 === null || Math.abs(a2) < 1e-9) return null;
    const a = a2 / 2;
    const b = toNumber(evaluate(d1.toString(), { x: 0 }));
    const c = toNumber(evaluate(numericExpression, { x: 0 }));
    if (b === null || c === null) return null;
    return { a, b, c };
  } catch {
    return null;
  }
}

function tryInverseProportional(numericExpression: string): { k: number } | null {
  try {
    const simplified = simplify(numericExpression).toString();
    const match = simplified.match(/^([+-]?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*\/\s*x$/i);
    if (!match) return null;
    const k = Number(match[1]);
    if (!Number.isFinite(k)) return null;
    return { k };
  } catch {
    return null;
  }
}

interface TrigInfo {
  amplitude: number;
  period: number;
  phase: number;
  verticalShift: number;
}

function tryTrigonometric(
  numericExpression: string,
  evaluateAt: (x: number) => number,
  domain: { min: number; max: number },
): TrigInfo | null {
  try {
    const xs: number[] = [];
    const ys: number[] = [];
    const count = 600;
    for (let i = 0; i <= count; i++) {
      const x = domain.min + ((domain.max - domain.min) * i) / count;
      const y = evaluateAt(x);
      if (Number.isFinite(y)) {
        xs.push(x);
        ys.push(y);
      }
    }
    if (ys.length < 10) return null;
    let maxY = -Infinity;
    let minY = Infinity;
    for (const y of ys) {
      if (y > maxY) maxY = y;
      if (y < minY) minY = y;
    }
    const amplitude = (maxY - minY) / 2;
    const verticalShift = (maxY + minY) / 2;
    if (!Number.isFinite(amplitude) || amplitude < 1e-9) return null;

    const crossings: number[] = [];
    for (let i = 1; i < ys.length; i++) {
      const a = ys[i - 1] - verticalShift;
      const b = ys[i] - verticalShift;
      if ((a >= 0 && b < 0) || (a < 0 && b >= 0)) {
        const t = a / (a - b);
        crossings.push(xs[i - 1] + (xs[i] - xs[i - 1]) * t);
      }
    }
    if (crossings.length < 3) return null;
    const halfPeriods: number[] = [];
    for (let i = 2; i < crossings.length; i++) {
      halfPeriods.push(crossings[i] - crossings[i - 2]);
    }
    halfPeriods.sort((a, b) => a - b);
    const period = halfPeriods[Math.floor(halfPeriods.length / 2)] ?? 0;
    if (!Number.isFinite(period) || period < 1e-6) return null;
    const phase = (-crossings[0] * (2 * Math.PI)) / period;
    return { amplitude, period, phase, verticalShift };
  } catch {
    return null;
  }
}

export function analyzeMiddleSchoolFunction(
  expression: MathExpression,
  params: Record<string, MathParameter>,
  parameters: Record<string, number>,
  domain: { min: number; max: number },
): MathAnalysisResult {
  const numericExpression = substituteParameters(expression.normalizedExpression, params);
  let node: MathNode;
  try {
    node = parse(expression.normalizedExpression);
  } catch {
    return {
      objectType: "function",
      functionType: null,
      summary: "无法解析",
      properties: [],
      warning: NOT_SUPPORTED,
    };
  }
  const fn = (x: number): number => {
    const scope: Record<string, number> = { x, ...parameters };
    try {
      const v = node.evaluate(scope);
      return typeof v === "number" && Number.isFinite(v) ? v : NaN;
    } catch {
      return NaN;
    }
  };

  const properties: FunctionPropertyItem[] = [];

  const linear = tryLinear(numericExpression);
  if (linear) {
    properties.push({ key: "type", label: "函数类型", value: "一次函数（线性函数）" });
    const slope = roundValue(linear.slope);
    const intercept = roundValue(linear.intercept);
    properties.push({ key: "slope", label: "斜率", latex: `k = ${slope}` });
    properties.push({ key: "intercept", label: "y 轴截距", latex: `b = ${intercept}` });
    if (Math.abs(linear.slope) > 1e-9) {
      const root = roundValue(-intercept / slope);
      properties.push({ key: "root", label: "与 x 轴交点", latex: `(${root}, 0)` });
    } else {
      properties.push({ key: "root", label: "与 x 轴交点", value: intercept === 0 ? "整条 x 轴" : "无交点（平行于 x 轴）" });
    }
    properties.push({
      key: "monotonic",
      label: "单调性",
      value: linear.slope > 0 ? "在 R 上单调递增" : linear.slope < 0 ? "在 R 上单调递减" : "常值函数，不增不减",
    });
    properties.push({ key: "domain", label: "定义域", value: "R" });
    return { objectType: "function", functionType: "linear", summary: "一次函数", properties };
  }

  const quadratic = tryQuadratic(numericExpression);
  if (quadratic) {
    const { a, b, c } = quadratic;
    const aR = roundValue(a);
    const bR = roundValue(b);
    const cR = roundValue(c);
    properties.push({ key: "type", label: "函数类型", value: "二次函数" });
    properties.push({ key: "coefficients", label: "系数", latex: `a = ${aR},\\ b = ${bR},\\ c = ${cR}` });
    properties.push({ key: "opening", label: "开口方向", value: a > 0 ? "开口向上" : "开口向下" });
    const axis = roundValue(-b / (2 * a));
    properties.push({ key: "axis", label: "对称轴", latex: `x = ${axis}` });
    const vertexY = roundValue((4 * a * c - b * b) / (4 * a));
    properties.push({ key: "vertex", label: "顶点", latex: `(${axis}, ${vertexY})` });
    const delta = roundValue(b * b - 4 * a * c);
    properties.push({ key: "discriminant", label: "判别式", latex: `\\Delta = b^2 - 4ac = ${delta}` });
    if (delta > 1e-9) {
      const x1 = roundValue((-b + Math.sqrt(delta)) / (2 * a));
      const x2 = roundValue((-b - Math.sqrt(delta)) / (2 * a));
      properties.push({ key: "roots", label: "与 x 轴交点", latex: `x_1 = ${x1},\\ x_2 = ${x2}` });
    } else if (Math.abs(delta) <= 1e-9) {
      const x0 = roundValue(-b / (2 * a));
      properties.push({ key: "roots", label: "与 x 轴交点", latex: `x = ${x0}（二重根）` });
    } else {
      properties.push({ key: "roots", label: "与 x 轴交点", value: "无实数交点" });
    }
    properties.push({ key: "yIntercept", label: "与 y 轴交点", latex: `(0, ${cR})` });
    properties.push({
      key: "extremum",
      label: a > 0 ? "最小值" : "最大值",
      latex: `${a > 0 ? "\\min" : "\\max"} f = ${vertexY}（当 x = ${axis} 时取得）`,
    });
    return { objectType: "function", functionType: "quadratic", summary: "二次函数", properties };
  }

  const inverse = tryInverseProportional(numericExpression);
  if (inverse) {
    const k = roundValue(inverse.k);
    properties.push({ key: "type", label: "函数类型", value: "反比例函数" });
    properties.push({ key: "coefficient", label: "比例系数", latex: `k = ${k}` });
    properties.push({
      key: "quadrants",
      label: "所在象限",
      value: k > 0 ? "第一、三象限" : "第二、四象限",
    });
    properties.push({ key: "domain", label: "定义域", latex: "x \\in \\mathbb{R} \\setminus \\{0\\}" });
    properties.push({ key: "range", label: "值域", latex: "y \\in \\mathbb{R} \\setminus \\{0\\}" });
    properties.push({ key: "asymptote", label: "渐近线", latex: "x = 0,\\ y = 0" });
    return { objectType: "function", functionType: "inverse-proportional", summary: "反比例函数", properties };
  }

  if (
    containsFunctionNode(node, "sin") ||
    containsFunctionNode(node, "cos") ||
    containsFunctionNode(node, "tan")
  ) {
    const trig = tryTrigonometric(numericExpression, fn, domain);
    if (trig) {
      const amplitude = roundValue(trig.amplitude);
      const period = roundValue(trig.period);
      const phase = roundValue(trig.phase);
      const vertical = roundValue(trig.verticalShift);
      properties.push({ key: "type", label: "函数类型", value: "三角函数" });
      properties.push({ key: "amplitude", label: "振幅", latex: `A = ${amplitude}` });
      properties.push({ key: "period", label: "周期", latex: `T = ${period}` });
      properties.push({ key: "phase", label: "相位偏移", latex: `\\varphi = ${phase}` });
      properties.push({ key: "vertical", label: "纵向偏移", latex: `d = ${vertical}` });
      return { objectType: "function", functionType: "trigonometric", summary: "三角函数", properties };
    }
    return {
      objectType: "function",
      functionType: "trigonometric",
      summary: "三角函数",
      properties: [{ key: "type", label: "函数类型", value: "三角函数（正切等复杂形式）" }],
      warning: NOT_SUPPORTED,
    };
  }

  return {
    objectType: "function",
    functionType: "other",
    summary: "其他函数",
    properties: [{ key: "type", label: "函数类型", value: "未能识别为常见中学函数" }],
    warning: NOT_SUPPORTED,
  };
}
