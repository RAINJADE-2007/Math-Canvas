import type { MonotonicInterval } from "@/types";
import type { NumericFunction } from "@/math-engine/calculus-intro/derivative/numericalDerivative";

export interface CriticalPointInfo {
  x: number;
  kind: "min" | "max" | "inflection" | "unknown";
  y?: number;
}

export interface MonotonicityAnalysisResult {
  criticalPoints: CriticalPointInfo[];
  intervals: MonotonicInterval[];
  isExact: boolean;
}

export function findCriticalPoints(
  derivativeAt: (x: number) => number,
  fn: NumericFunction | null,
  domain: { min: number; max: number },
  exactRoots: number[] = [],
): CriticalPointInfo[] {
  const exact: CriticalPointInfo[] = exactRoots
    .filter((x) => x >= domain.min && x <= domain.max)
    .map((x) => ({
      x,
      kind: "unknown",
      y: fn ? fn(x) : undefined,
    }));

  const step = (domain.max - domain.min) / 800;
  const roots: CriticalPointInfo[] = [];
  let prevX = domain.min;
  let prevD = derivativeAt(domain.min);
  for (let i = 1; i <= 800; i++) {
    const x = domain.min + i * step;
    const d = derivativeAt(x);
    if (Number.isFinite(prevD) && Number.isFinite(d) && prevD * d < 0) {
      let lo = prevX;
      let hi = x;
      for (let k = 0; k < 30; k++) {
        const mid = (lo + hi) / 2;
        const dm = derivativeAt(mid);
        if (prevD * dm <= 0) hi = mid;
        else lo = mid;
      }
      const root = (lo + hi) / 2;
      roots.push({
        x: root,
        kind: "unknown",
        y: fn ? fn(root) : undefined,
      });
    }
    prevX = x;
    prevD = d;
  }

  const all = [...exact, ...roots];
  const seen = new Set<number>();
  const merged: CriticalPointInfo[] = [];
  for (const cp of all) {
    if (!Number.isFinite(cp.x)) continue;
    const rounded = Math.round(cp.x * 1e6) / 1e6;
    if (seen.has(rounded)) continue;
    seen.add(rounded);
    merged.push(cp);
  }
  merged.sort((a, b) => a.x - b.x);

  for (let i = 0; i < merged.length; i++) {
    const cp = merged[i];
    const dLeft = derivativeAt(cp.x - 0.001);
    const dRight = derivativeAt(cp.x + 0.001);
    if (Number.isFinite(dLeft) && Number.isFinite(dRight)) {
      if (dLeft < 0 && dRight > 0) cp.kind = "min";
      else if (dLeft > 0 && dRight < 0) cp.kind = "max";
      else if (Math.abs(dLeft) < 1e-9 || Math.abs(dRight) < 1e-9) cp.kind = "inflection";
      else cp.kind = "unknown";
    }
  }

  return merged;
}

export function analyzeMonotonicity(
  derivativeAt: (x: number) => number,
  domain: { min: number; max: number },
  criticalX: number[],
): MonotonicInterval[] {
  const points = [...criticalX].sort((a, b) => a - b);
  const intervals: MonotonicInterval[] = [];
  const starts = [null, ...points.map((p) => p)];
  const ends = [...points.map((p) => p), null];
  const mids: (number | null)[] = [];

  for (let i = 0; i < starts.length; i++) {
    if (starts[i] === null && ends[i] === null) continue;
    if (starts[i] !== null && ends[i] !== null) {
      mids.push((starts[i]! + ends[i]!) / 2);
    } else if (starts[i] !== null) {
      mids.push(starts[i]! + 1);
    } else {
      mids.push(ends[i]! - 1);
    }
  }

  for (let i = 0; i < starts.length; i++) {
    const start = starts[i];
    const end = ends[i];
    const mid = mids[i];
    if (mid === null) continue;
    const d = derivativeAt(mid);
    let type: MonotonicInterval["type"] = "unknown";
    if (!Number.isFinite(d) || Math.abs(d) < 1e-12) type = "constant";
    else if (d > 0) type = "increasing";
    else type = "decreasing";
    intervals.push({ start, end, type });
  }

  return intervals;
}

export function isExactPolynomialDerivative(derivativeExpression: string | undefined): boolean {
  if (!derivativeExpression) return false;
  return /^[0-9a-zA-Z+\-*/^().\s]*$/.test(derivativeExpression);
}
