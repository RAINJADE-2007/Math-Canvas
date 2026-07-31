export const DEFAULT_DIFFERENTIAL_STEP = 0.0001;

export type NumericFunction = (x: number) => number;

export function numericalDerivativeAt(fn: NumericFunction, x: number, h = DEFAULT_DIFFERENTIAL_STEP): number {
  const plus = fn(x + h);
  const minus = fn(x - h);
  if (!Number.isFinite(plus) || !Number.isFinite(minus)) return NaN;
  return (plus - minus) / (2 * h);
}

export function isNumericalDerivativeSafe(fn: NumericFunction, x: number, h = DEFAULT_DIFFERENTIAL_STEP): boolean {
  if (!Number.isFinite(fn(x))) return false;
  return Number.isFinite(numericalDerivativeAt(fn, x, h));
}
