import { ConstantNode, OperatorNode, parse, simplify } from "mathjs";
import type { MathNode } from "mathjs";
import { asNode } from "@/math-engine/core/validator/astAccess";

export interface TranslatedFunctionResult {
  ok: boolean;
  expression: string;
  latex: string;
  error?: string;
}

function roundValue(n: number): number {
  const r = Math.round(n * 1e6) / 1e6;
  return Math.abs(r) < 1e-9 ? 0 : r;
}

export function describeTranslation(dx: number, dy: number): string {
  const h = roundValue(dx);
  const k = roundValue(dy);
  const parts: string[] = [];
  if (h > 0) parts.push(`向右平移 ${h} 个单位`);
  else if (h < 0) parts.push(`向左平移 ${Math.abs(h)} 个单位`);
  if (k > 0) parts.push(`向上平移 ${k} 个单位`);
  else if (k < 0) parts.push(`向下平移 ${Math.abs(k)} 个单位`);
  if (parts.length === 0) return "未平移";
  return parts.join("，");
}

export function translateFunction(expression: string, dx: number, dy: number): TranslatedFunctionResult {
  try {
    const h = roundValue(dx);
    const k = roundValue(dy);
    let node: MathNode = parse(expression);
    if (h !== 0) {
      const shift = parse(`(x - ${h})`);
      node = node.transform((n) => {
        const inner = asNode(n);
        if (inner.type === "SymbolNode" && inner.name === "x") {
          return shift;
        }
        return n;
      });
    }
    if (k !== 0) {
      node = new OperatorNode("+", "add", [node, new ConstantNode(k)]);
    }
    const simplified = simplify(node, {}, { exactFractions: false });
    return { ok: true, expression: simplified.toString(), latex: simplified.toTex() };
  } catch (err) {
    return {
      ok: false,
      expression: "",
      latex: "",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
