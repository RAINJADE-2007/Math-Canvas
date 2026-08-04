import type { Matrix2D } from "./types";

const EPSILON = 1e-10;

export function matrix(rows: number, cols: number, initial = 0): Matrix2D {
  const data: number[][] = [];
  for (let i = 0; i < rows; i++) {
    data.push(new Array(cols).fill(initial));
  }
  return { rows, cols, data };
}

export function matrixFrom(data: number[][]): Matrix2D {
  const rows = data.length;
  const cols = rows > 0 ? data[0].length : 0;
  return { rows, cols, data: data.map((r) => [...r]) };
}

export function identityMatrix(n: number): Matrix2D {
  const m = matrix(n, n, 0);
  for (let i = 0; i < n; i++) m.data[i][i] = 1;
  return m;
}

export function matrixAdd(a: Matrix2D, b: Matrix2D): Matrix2D | null {
  if (a.rows !== b.rows || a.cols !== b.cols) return null;
  const result = matrix(a.rows, a.cols);
  for (let i = 0; i < a.rows; i++) {
    for (let j = 0; j < a.cols; j++) {
      result.data[i][j] = a.data[i][j] + b.data[i][j];
    }
  }
  return result;
}

export function matrixSub(a: Matrix2D, b: Matrix2D): Matrix2D | null {
  if (a.rows !== b.rows || a.cols !== b.cols) return null;
  const result = matrix(a.rows, a.cols);
  for (let i = 0; i < a.rows; i++) {
    for (let j = 0; j < a.cols; j++) {
      result.data[i][j] = a.data[i][j] - b.data[i][j];
    }
  }
  return result;
}

export function matrixScale(m: Matrix2D, s: number): Matrix2D {
  const result = matrix(m.rows, m.cols);
  for (let i = 0; i < m.rows; i++) {
    for (let j = 0; j < m.cols; j++) {
      result.data[i][j] = m.data[i][j] * s;
    }
  }
  return result;
}

export function matrixMultiply(a: Matrix2D, b: Matrix2D): Matrix2D | null {
  if (a.cols !== b.rows) return null;
  const result = matrix(a.rows, b.cols);
  for (let i = 0; i < a.rows; i++) {
    for (let j = 0; j < b.cols; j++) {
      let sum = 0;
      for (let k = 0; k < a.cols; k++) {
        sum += a.data[i][k] * b.data[k][j];
      }
      result.data[i][j] = sum;
    }
  }
  return result;
}

export function matrixTranspose(m: Matrix2D): Matrix2D {
  const result = matrix(m.cols, m.rows);
  for (let i = 0; i < m.rows; i++) {
    for (let j = 0; j < m.cols; j++) {
      result.data[j][i] = m.data[i][j];
    }
  }
  return result;
}

export function matrixDeterminant(m: Matrix2D): number | null {
  if (m.rows !== m.cols) return null;
  const n = m.rows;

  if (n === 1) return m.data[0][0];
  if (n === 2) {
    return m.data[0][0] * m.data[1][1] - m.data[0][1] * m.data[1][0];
  }

  const copy = m.data.map((r) => [...r]);
  let det = 1;
  for (let i = 0; i < n; i++) {
    let pivot = i;
    while (pivot < n && Math.abs(copy[pivot][i]) < EPSILON) pivot++;
    if (pivot === n) return 0;
    if (pivot !== i) {
      [copy[i], copy[pivot]] = [copy[pivot], copy[i]];
      det = -det;
    }
    const pivotVal = copy[i][i];
    det *= pivotVal;
    for (let j = i; j < n; j++) copy[i][j] /= pivotVal;
    for (let k = i + 1; k < n; k++) {
      const factor = copy[k][i];
      for (let j = i; j < n; j++) {
        copy[k][j] -= factor * copy[i][j];
      }
    }
  }
  return det;
}

export function matrixInverse(m: Matrix2D): Matrix2D | null {
  if (m.rows !== m.cols) return null;
  const n = m.rows;
  const aug = m.data.map((row, i) => {
    const r = [...row];
    for (let j = 0; j < n; j++) r.push(i === j ? 1 : 0);
    return r;
  });

  for (let i = 0; i < n; i++) {
    let pivot = i;
    while (pivot < n && Math.abs(aug[pivot][i]) < EPSILON) pivot++;
    if (pivot === n) return null;
    [aug[i], aug[pivot]] = [aug[pivot], aug[i]];
    const pivotVal = aug[i][i];
    for (let j = 0; j < 2 * n; j++) aug[i][j] /= pivotVal;
    for (let k = 0; k < n; k++) {
      if (k === i) continue;
      const factor = aug[k][i];
      for (let j = 0; j < 2 * n; j++) {
        aug[k][j] -= factor * aug[i][j];
      }
    }
  }

  const inv = matrix(n, n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      inv.data[i][j] = aug[i][j + n];
    }
  }
  return inv;
}

export function matrixRank(m: Matrix2D): number {
  const copy = m.data.map((r) => [...r]);
  const rows = m.rows;
  const cols = m.cols;
  let rank = 0;

  for (let col = 0; col < cols; col++) {
    let pivot = rank;
    while (pivot < rows && Math.abs(copy[pivot][col]) < EPSILON) pivot++;
    if (pivot === rows) continue;
    [copy[rank], copy[pivot]] = [copy[pivot], copy[rank]];
    const pivotVal = copy[rank][col];
    for (let j = col; j < cols; j++) copy[rank][j] /= pivotVal;
    for (let i = 0; i < rows; i++) {
      if (i === rank) continue;
      const factor = copy[i][col];
      for (let j = col; j < cols; j++) {
        copy[i][j] -= factor * copy[rank][j];
      }
    }
    rank++;
  }
  return rank;
}

export function matrixToLatex(m: Matrix2D): string {
  const rows = m.data
    .map((row) => row.map((v) => parseFloat(v.toFixed(3)).toString()).join(" & "))
    .join(" \\\\ ");
  return `\\begin{pmatrix} ${rows} \\end{pmatrix}`;
}

export function matrixToLatexBracket(m: Matrix2D): string {
  const rows = m.data
    .map((row) => row.map((v) => parseFloat(v.toFixed(3)).toString()).join(" & "))
    .join(" \\\\ ");
  return `\\begin{bmatrix} ${rows} \\end{bmatrix}`;
}

export function matrixClone(m: Matrix2D): Matrix2D {
  return { rows: m.rows, cols: m.cols, data: m.data.map((r) => [...r]) };
}

export function matrixApplyToVector(m: Matrix2D, v: number[]): number[] | null {
  if (m.cols !== v.length) return null;
  const result: number[] = [];
  for (let i = 0; i < m.rows; i++) {
    let sum = 0;
    for (let j = 0; j < m.cols; j++) {
      sum += m.data[i][j] * v[j];
    }
    result.push(sum);
  }
  return result;
}

export function matrixApplyToVector2D(
  m: Matrix2D,
  x: number,
  y: number
): { x: number; y: number } | null {
  if (m.rows !== 2 || m.cols !== 2) return null;
  return {
    x: m.data[0][0] * x + m.data[0][1] * y,
    y: m.data[1][0] * x + m.data[1][1] * y,
  };
}

export const matrixFromData = matrixFrom;
