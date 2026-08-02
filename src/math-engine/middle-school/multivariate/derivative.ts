// Multi-variable function module
// Support z=f(x,y)
// 简单偏导数：利用 mathjs 的 derivative（对指定变量求导，其余符号视为常量）。
// 只支持幂函数、四则运算与 sin/cos 等初等函数，不实现完整 CAS。

import { derivative, parse, simplify } from "mathjs";
import type { MathNode } from "mathjs";

export interface PartialDerivativeResult {
  ok: boolean;
  expression: string;
  latex: string;
  error?: string;
}

export function partialDerivative(expression: string, variable: "x" | "y"): PartialDerivativeResult {
  try {
    const node: MathNode = parse(expression);
    const d = simplify(derivative(node, variable));
    return { ok: true, expression: d.toString(), latex: d.toTex() };
  } catch {
    return {
      ok: false,
      expression: "",
      latex: "",
      error: `暂不支持对该函数关于 ${variable} 求偏导`,
    };
  }
}
