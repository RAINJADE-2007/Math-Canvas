import { ConstantNode, OperatorNode, parse, simplify } from "mathjs";
import type { MathNode } from "mathjs";
import { asNode } from "@/math-engine/core/validator/astAccess";

export interface RotatedFunctionResult {
  ok: boolean;
  expression: string;
  latex: string;
  error?: string;
}

const EPS = 1e-9;

function mod360(deg: number): number {
  let v = deg % 360;
  if (v < 0) v += 360;
  return v;
}

function substituteX(node: MathNode, replacement: string): MathNode {
  return node.transform((n) => {
    const inner = asNode(n);
    if (inner.type === "SymbolNode" && inner.name === "x") {
      return parse(replacement);
    }
    return n;
  });
}

function hasSymbolX(node: MathNode): boolean {
  const inner = asNode(node);
  if (inner.type === "SymbolNode" && inner.name === "x") return true;
  if (inner.args) return inner.args.some(hasSymbolX);
  if (inner.type === "ParenthesisNode" && inner.content) return hasSymbolX(inner.content);
  return false;
}

function toLatex(expression: string): string {
  try {
    return parse(expression).toTex();
  } catch {
    return expression;
  }
}

function numericOf(node: MathNode): number {
  if (node.type === "ConstantNode") {
    const v = Number((node as { value?: unknown }).value);
    return Number.isFinite(v) ? v : NaN;
  }
  const v = Number(node.toString());
  return Number.isFinite(v) ? v : NaN;
}

/**
 * 绕原点逆时针旋转 angleDeg 度后，尝试把原图像表示为 y=g(x) 的解析式。
 * - 0°/360°：原函数。
 * - 180°：g(x) = -f(-x)，任意函数均成立。
 * - 一次函数（直线）：旋转后仍为直线（除非垂直于 x 轴），可解析生成。
 * - 其余情形：旋转后通常不再是函数图像，返回具体缘由。
 */
export function rotateFunctionExpression(expression: string, angleDeg: number): RotatedFunctionResult {
  const angle = mod360(angleDeg);

  let f: MathNode;
  try {
    f = parse(expression);
  } catch (err) {
    return {
      ok: false,
      expression: "",
      latex: "",
      error: `无法解析表达式：${err instanceof Error ? err.message : String(err)}`,
    };
  }

  if (Math.abs(angle) < EPS || Math.abs(angle - 360) < EPS) {
    return { ok: true, expression, latex: toLatex(expression) };
  }

  if (Math.abs(angle - 180) < EPS) {
    const g = simplify(new OperatorNode("-", "unaryMinus", [substituteX(f, "(-x)")]));
    return { ok: true, expression: g.toString(), latex: g.toTex() };
  }

  const diff = simplify(new OperatorNode("-", "subtract", [substituteX(f, "(x + 1)"), f]));
  if (!hasSymbolX(diff)) {
    const theta = (angle * Math.PI) / 180;
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    const m = diff;
    const b = simplify(substituteX(f, "0"));
    const denom = simplify(
      new OperatorNode("-", "subtract", [
        new ConstantNode(c),
        new OperatorNode("*", "multiply", [m, new ConstantNode(s)]),
      ]),
    );
    const num = simplify(
      new OperatorNode("+", "add", [
        new ConstantNode(s),
        new OperatorNode("*", "multiply", [m, new ConstantNode(c)]),
      ]),
    );
    const denomNum = numericOf(denom);
    if (Number.isFinite(denomNum) && Math.abs(denomNum) < EPS) {
      return {
        ok: false,
        expression: "",
        latex: "",
        error: "旋转后该直线垂直于 x 轴（图像成为竖直直线，同一 x 对应多个 y），不再是函数图像，无法表示为 y=g(x)。",
      };
    }
    const mPrime = simplify(new OperatorNode("/", "divide", [num, denom]));
    const bPrime = simplify(
      new OperatorNode("+", "add", [
        new OperatorNode("*", "multiply", [b, new ConstantNode(c)]),
        new OperatorNode("*", "multiply", [mPrime, new OperatorNode("*", "multiply", [b, new ConstantNode(s)])]),
      ]),
    );
    const g = simplify(
      new OperatorNode("+", "add", [
        new OperatorNode("*", "multiply", [mPrime, parse("x")]),
        bPrime,
      ]),
    );
    return { ok: true, expression: g.toString(), latex: g.toTex() };
  }

  if (Math.abs(angle - 90) < EPS || Math.abs(angle - 270) < EPS) {
    return {
      ok: false,
      expression: "",
      latex: "",
      error: "旋转 90°（或 270°）后，图像在相同 x 处通常对应多个 y 值（不再满足垂直直线检验），无法表示为 y=g(x) 的形式。",
    };
  }

  return {
    ok: false,
    expression: "",
    latex: "",
    error: `绕原点旋转 ${angle}° 后，曲线通常不再是函数图像（不满足垂直直线检验）；要写出解析式需要先解出反函数 x=φ(x')，而当前函数一般不存在初等反函数。`,
  };
}
