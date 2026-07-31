import { parse } from "mathjs";
import type { MathNode } from "mathjs";

export interface SafeFunction {
  node: MathNode;
  expression: string;
  evaluate(x: number, params?: Record<string, number>): number;
  toString(): string;
}

export function createSafeFunction(expression: string): SafeFunction {
  const node = parse(expression);
  return {
    node,
    expression,
    evaluate(x, params = {}) {
      const scope: Record<string, number> = { x, ...params };
      try {
        const value = node.evaluate(scope);
        if (typeof value !== "number" || !Number.isFinite(value)) return NaN;
        return value;
      } catch {
        return NaN;
      }
    },
    toString() {
      return node.toString();
    },
  };
}

export function evaluateExpression(expression: string, scope: Record<string, number>): number {
  try {
    const node = parse(expression);
    const value = node.evaluate(scope);
    if (typeof value !== "number" || !Number.isFinite(value)) return NaN;
    return value;
  } catch {
    return NaN;
  }
}
