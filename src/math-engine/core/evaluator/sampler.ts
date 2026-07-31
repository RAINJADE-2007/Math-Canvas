import type { SafeFunction } from "@/math-engine/core/evaluator/evaluator";

export const MAX_SAMPLE_Y = 1e8;
const BREAK_DY = 50;
const BREAK_MAG = 20;

export interface SampleOptions {
  min: number;
  max: number;
  steps?: number;
}

export interface SampleChunk {
  xs: number[];
  ys: number[];
}

export interface SampledFunction {
  xs: number[];
  ys: number[];
  chunks: SampleChunk[];
}

export function sampleFunction(
  fn: SafeFunction,
  options: SampleOptions,
  params: Record<string, number> = {},
): SampledFunction {
  const steps = Math.max(40, Math.min(2000, options.steps ?? 800));
  const min = options.min;
  const max = options.max;
  const step = (max - min) / steps;

  const xs: number[] = new Array(steps + 1);
  const ys: number[] = new Array(steps + 1);

  for (let i = 0; i <= steps; i++) {
    const x = min + i * step;
    xs[i] = x;
    let y = fn.evaluate(x, params);
    if (!Number.isFinite(y) || Math.abs(y) > MAX_SAMPLE_Y) y = NaN;
    ys[i] = y;
  }

  for (let i = 1; i < ys.length; i++) {
    const prev = ys[i - 1];
    const curr = ys[i];
    if (Number.isNaN(prev) || Number.isNaN(curr)) continue;
    if (Math.abs(curr - prev) > BREAK_DY && Math.abs(prev) > BREAK_MAG && Math.abs(curr) > BREAK_MAG) {
      ys[i] = NaN;
    }
  }

  const chunks: SampleChunk[] = [];
  let current: SampleChunk = { xs: [], ys: [] };
  for (let i = 0; i < xs.length; i++) {
    if (!Number.isFinite(ys[i])) {
      if (current.xs.length > 0) {
        chunks.push(current);
        current = { xs: [], ys: [] };
      }
      continue;
    }
    current.xs.push(xs[i]);
    current.ys.push(ys[i]);
  }
  if (current.xs.length > 0) chunks.push(current);

  return { xs, ys, chunks: chunks.filter((c) => c.xs.length >= 2) };
}
