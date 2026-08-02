import { parse } from "mathjs";
import type { MathNode } from "mathjs";

export interface BivariateFunction {
  node: MathNode;
  expression: string;
  evaluate(x: number, y: number): number;
}

export function createBivariateFunction(expression: string): BivariateFunction {
  const node = parse(expression);
  return {
    node,
    expression,
    evaluate(x: number, y: number): number {
      try {
        const v = node.evaluate({ x, y });
        return typeof v === "number" && Number.isFinite(v) ? v : NaN;
      } catch {
        return NaN;
      }
    },
  };
}
