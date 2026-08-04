import type { DeterminantStep } from "./types";

function _computeDet(matrix: number[][]): number | null {
  const n = matrix.length;
  if (n === 0 || matrix[0].length !== n) return null;
  if (n === 1) return matrix[0][0];
  if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  const copy = matrix.map((r) => [...r]);
  let det = 1;
  for (let i = 0; i < n; i++) {
    let pivot = i;
    for (let r = i + 1; r < n; r++) {
      if (Math.abs(copy[r][i]) > Math.abs(copy[pivot][i])) pivot = r;
    }
    if (pivot !== i) {
      [copy[i], copy[pivot]] = [copy[pivot], copy[i]];
      det = -det;
    }
    if (Math.abs(copy[i][i]) < 1e-10) return 0;
    det *= copy[i][i];
    for (let r = i + 1; r < n; r++) {
      const factor = copy[r][i] / copy[i][i];
      for (let c = i; c < n; c++) copy[r][c] -= factor * copy[i][c];
    }
  }
  return det;
}

export function determinantVsArea(matrix: number[][]): {
  det: number;
  basis1: { x: number; y: number };
  basis2: { x: number; y: number };
  area: number;
  orientation: "preserved" | "reversed" | "degenerate";
} {
  if (matrix.length < 2 || matrix[0].length < 2) {
    return { det: 0, basis1: { x: 0, y: 0 }, basis2: { x: 0, y: 0 }, area: 0, orientation: "degenerate" };
  }
  const [a, b] = matrix[0];
  const [c, d] = matrix[1];
  const det = a * d - b * c;
  const area = Math.abs(det);
  const orientation =
    Math.abs(det) < 1e-10 ? "degenerate" : det > 0 ? "preserved" : "reversed";
  return { det, basis1: { x: a, y: c }, basis2: { x: b, y: d }, area, orientation };
}

export function computeDeterminantSteps(matrix: number[][]): DeterminantStep[] {
  const n = matrix.length;
  const copy = matrix.map((r) => [...r]);
  const steps: DeterminantStep[] = [];
  let det = 1;

  steps.push({
    description: `计算 ${n} 阶行列式`,
    matrix: copy.map((r) => [...r]),
  });

  if (n === 1) {
    steps.push({
      description: `一阶行列式就是它本身`,
      matrix: copy.map((r) => [...r]),
      value: copy[0][0],
    });
    return steps;
  }

  if (n === 2) {
    steps.push({
      description: `二阶行列式：主对角线乘积减去副对角线乘积`,
      matrix: copy.map((r) => [...r]),
    });
    const val = copy[0][0] * copy[1][1] - copy[0][1] * copy[1][0];
    steps.push({
      description: `(${copy[0][0]} × ${copy[1][1]}) - (${copy[0][1]} × ${copy[1][0]}) = ${(copy[0][0] * copy[1][1]).toFixed(2)} - ${(copy[0][1] * copy[1][0]).toFixed(2)} = ${val.toFixed(2)}`,
      matrix: copy.map((r) => [...r]),
      value: val,
    });
    return steps;
  }

  for (let i = 0; i < n; i++) {
    let pivot = i;
    for (let j = i; j < n; j++) {
      if (Math.abs(copy[j][i]) > Math.abs(copy[pivot][i])) pivot = j;
    }

    if (Math.abs(copy[pivot][i]) < 1e-10) {
      steps.push({
        description: `第 ${i + 1} 列全为零，行列式的值为 0`,
        matrix: copy.map((r) => [...r]),
        value: 0,
      });
      return steps;
    }

    if (pivot !== i) {
      [copy[i], copy[pivot]] = [copy[pivot], copy[i]];
      det = -det;
      steps.push({
        description: `交换第 ${i + 1} 行和第 ${pivot + 1} 行（行列式符号取反）`,
        matrix: copy.map((r) => [...r]),
      });
    }

    const pivotVal = copy[i][i];
    for (let j = i; j < n; j++) copy[i][j] /= pivotVal;
    const newDet = det * pivotVal;
    steps.push({
      description: `将第 ${i + 1} 行除以 ${pivotVal.toFixed(2)}，行列式乘以 ${pivotVal.toFixed(2)} → 当前累计: ${newDet.toFixed(2)}`,
      matrix: copy.map((r) => [...r]),
      value: newDet,
    });
    det = newDet;

    for (let k = i + 1; k < n; k++) {
      const factor = copy[k][i];
      if (Math.abs(factor) < 1e-10) continue;
      for (let j = i; j < n; j++) copy[k][j] -= factor * copy[i][j];
      steps.push({
        description: `第 ${k + 1} 行减去第 ${i + 1} 行的 ${factor.toFixed(2)} 倍（行列式值不变）`,
        matrix: copy.map((r) => [...r]),
      });
    }
  }

  steps.push({
    description: `最终结果：行列式的值为 ${det.toFixed(2)}`,
    matrix: copy.map((r) => [...r]),
    value: det,
  });
  return steps;
}

export function det2x2Latex(a: number, b: number, c: number, d: number): string {
  return `\\det \\begin{pmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{pmatrix} = ${a} \\times ${d} - ${b} \\times ${c} = ${(a * d - b * c).toFixed(2)}`;
}

export function det3x3Latex(matrix: number[][]): string {
  const [[a11, a12, a13], [a21, a22, a23], [a31, a32, a33]] = matrix;
  const detVal =
    a11 * (a22 * a33 - a23 * a32) -
    a12 * (a21 * a33 - a23 * a31) +
    a13 * (a21 * a32 - a22 * a31);
  return `\\det \\begin{pmatrix} ${a11} & ${a12} & ${a13} \\\\ ${a21} & ${a22} & ${a23} \\\\ ${a31} & ${a32} & ${a33} \\end{pmatrix} = ${a11}(${a22}\\times${a33}-${a23}\\times${a32}) - ${a12}(${a21}\\times${a33}-${a23}\\times${a31}) + ${a13}(${a21}\\times${a32}-${a22}\\times${a31}) = ${detVal.toFixed(2)}`;
}
