import { parse, simplify } from "mathjs";
import type { MathNode } from "mathjs";
import { asNode } from "@/math-engine/core/validator/astAccess";

export interface SliceResult {
  ok: boolean;
  expression: string;
  latex: string;
  error?: string;
}

/**
 * 将多元函数 z=f(x,y) 沿某个平面切片为单变量函数并生成解析式。
 * - 固定 y=y0（沿 x 方向切片）：{ y: "y0" } → f(x, y0)
 * - 固定 x=x0（沿 y 方向切片）：{ x: "x0", y: "x" } → f(x0, x)
 */
export function sliceTo2D(expression: string, replacements: Record<string, string>): SliceResult {
  try {
    const node = parse(expression);
    const substituted: MathNode = node.transform((n) => {
      const inner = asNode(n);
      if (inner.type === "SymbolNode" && inner.name && replacements[inner.name]) {
        return parse(replacements[inner.name]);
      }
      return n;
    });
    const simplified = simplify(substituted);
    return { ok: true, expression: simplified.toString(), latex: simplified.toTex() };
  } catch (err) {
    return {
      ok: false,
      expression: "",
      latex: "",
      error: `切片解析失败：${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
