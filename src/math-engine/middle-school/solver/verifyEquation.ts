import { evaluate } from "mathjs";

export interface VerificationResult {
  verified: boolean;
  detail: string;
}

export function verifyEquationSolution(left: string, right: string, x: number): VerificationResult {
  try {
    const scope = { x };
    const l = evaluate(left, scope);
    const r = evaluate(right, scope);
    if (typeof l !== "number" || typeof r !== "number" || !Number.isFinite(l) || !Number.isFinite(r)) {
      return { verified: false, detail: "无法计算（表达式在 x 处无定义）" };
    }
    const diff = Math.abs(l - r);
    return {
      verified: diff < 1e-8,
      detail: `左边 = ${l}，右边 = ${r}，差 = ${diff}`,
    };
  } catch (err) {
    return { verified: false, detail: err instanceof Error ? err.message : String(err) };
  }
}
