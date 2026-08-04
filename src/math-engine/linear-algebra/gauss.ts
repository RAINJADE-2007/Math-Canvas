import type { GaussStep, GaussResult } from "./types";

const EPSILON = 1e-10;

export function solveLinearSystem(coefficients: number[][], constants: number[]): GaussResult {
  const n = coefficients.length;
  const m = coefficients[0]?.length ?? 0;
  const aug = coefficients.map((row, i) => [...row, constants[i]]);
  const steps: GaussStep[] = [];
  const nCols = m + 1;

  steps.push({
    description: "写出增广矩阵",
    matrix: aug.map((r) => [...r]),
    rowOps: "",
  });

  let row = 0;
  const pivotCols: number[] = [];

  for (let col = 0; col < m && row < n; col++) {
    let pivot = row;
    for (let i = row; i < n; i++) {
      if (Math.abs(aug[i][col]) > Math.abs(aug[pivot][col])) pivot = i;
    }

    if (Math.abs(aug[pivot][col]) < EPSILON) continue;

    if (pivot !== row) {
      [aug[row], aug[pivot]] = [aug[pivot], aug[row]];
      steps.push({
        description: `交换第 ${row + 1} 行和第 ${pivot + 1} 行，使第 ${col + 1} 列主元最大`,
        matrix: aug.map((r) => [...r]),
        rowOps: `R${row + 1} ↔ R${pivot + 1}`,
        highlightRow: row,
        highlightCol: col,
      });
    }

    const pivotVal = aug[row][col];
    const pivotDesc =
      Math.abs(pivotVal - 1) < EPSILON
        ? ""
        : `将第 ${row + 1} 行乘以 ${roundStr(1 / pivotVal)}，使主元化为 1`;

    if (Math.abs(pivotVal - 1) > EPSILON) {
      for (let j = col; j < nCols; j++) {
        aug[row][j] /= pivotVal;
      }
      steps.push({
        description:
          pivotDesc || `将第 ${row + 1} 行除以 ${roundStr(pivotVal)}`,
        matrix: aug.map((r) => [...r]),
        rowOps: `R${row + 1} ÷ ${roundStr(pivotVal)}`,
        highlightRow: row,
        highlightCol: col,
      });
    }

    for (let i = 0; i < n; i++) {
      if (i === row) continue;
      const factor = aug[i][col];
      if (Math.abs(factor) < EPSILON) continue;

      for (let j = col; j < nCols; j++) {
        aug[i][j] -= factor * aug[row][j];
      }
      steps.push({
        description: `第 ${i + 1} 行减去第 ${row + 1} 行的 ${roundStr(factor)} 倍，消去第 ${col + 1} 列`,
        matrix: aug.map((r) => [...r]),
        rowOps: `R${i + 1} ← R${i + 1} - ${roundStr(factor)}R${row + 1}`,
        highlightRow: i,
        highlightCol: col,
      });
    }

    pivotCols.push(col);
    row++;
  }

  const rank = row;
  const hasNoSolution = aug.slice(rank).some((r) => Math.abs(r[m]) > EPSILON);
  const hasInfinite = rank < m;

  if (hasNoSolution) {
    steps.push({
      description: `发现矛盾行：常数项非零但系数全零，所以方程组无解`,
      matrix: aug.map((r) => [...r]),
      rowOps: "",
    });
    return {
      solution: null,
      solutionType: "none",
      solutionLatex: "\\text{无解}",
      steps,
      rank,
      nullity: m - rank,
    };
  }

  if (hasInfinite) {
    const freeVars = m - rank;
    steps.push({
      description: `系数矩阵的秩为 ${rank}，小于未知数个数 ${m}，有 ${freeVars} 个自由变量，方程组有无穷多解`,
      matrix: aug.map((r) => [...r]),
      rowOps: "",
    });
    const paramSolutions = extractInfiniteSolutions(aug, m, rank, pivotCols);
    return {
      solution: null,
      solutionType: "infinite",
      solutionLatex: paramSolutions,
      steps,
      rank,
      nullity: freeVars,
    };
  }

  const solution = aug.slice(0, m).map((r) => r[m]);

  steps.push({
    description: "已化为行最简形式，直接读出唯一解",
    matrix: aug.map((r) => [...r]),
    rowOps: "",
  });

  return {
    solution,
    solutionType: "unique",
    solutionLatex: formatSolutionLatex(solution),
    steps,
    rank,
    nullity: 0,
  };
}

function extractInfiniteSolutions(aug: number[][], m: number, rank: number, pivotCols: number[]): string {
  const freeCols: number[] = [];
  for (let j = 0; j < m; j++) {
    if (!pivotCols.includes(j)) freeCols.push(j);
  }
  const parts: string[] = [];
  const freeLabels = freeCols.map((_, i) => `t_${i + 1}`);

  for (let i = 0; i < m; i++) {
    if (pivotCols.includes(i)) {
      const pivotRow = pivotCols.indexOf(i);
      let expr = `${roundStr(aug[pivotRow][m])}`;
      for (let j = 0; j < freeCols.length; j++) {
        const coeff = -aug[pivotRow][freeCols[j]];
        if (Math.abs(coeff) > EPSILON) {
          expr += ` ${coeff > 0 ? "+" : ""} ${roundStr(coeff)}\\cdot ${freeLabels[j]}`;
        }
      }
      parts.push(`x_{${i + 1}} = ${expr}`);
    } else {
      const fi = freeCols.indexOf(i);
      parts.push(`x_{${i + 1}} = ${freeLabels[fi]}`);
    }
  }

  const freeCond = freeLabels.map((l) => `${l} \\in \\mathbb{R}`).join(", ");
  return parts.join(" \\\\ ") + ` \\\\ ${freeCond}`;
}

function formatSolutionLatex(solution: number[]): string {
  return solution.map((v, i) => `x_{${i + 1}} = ${roundStr(v)}`).join(", \\quad ");
}

function roundStr(val: number): string {
  if (Math.abs(val) < EPSILON) return "0";
  const r = parseFloat(val.toFixed(6));
  return String(r);
}

export function gaussEliminationSimple(augmented: number[][]): { result: number[][]; steps: GaussStep[] } {
  const data = augmented.map((row) => [...row]);
  const rows = data.length;
  const cols = data[0]?.length ?? 0;
  const steps: GaussStep[] = [];

  steps.push({
    description: "初始增广矩阵",
    matrix: data.map((r) => [...r]),
    rowOps: "",
  });

  let row = 0;
  for (let col = 0; col < cols - 1 && row < rows; col++) {
    let pivotRow = row;
    for (let r = row; r < rows; r++) {
      if (Math.abs(data[r][col]) > Math.abs(data[pivotRow][col])) {
        pivotRow = r;
      }
    }
    if (Math.abs(data[pivotRow][col]) < EPSILON) continue;

    if (pivotRow !== row) {
      [data[row], data[pivotRow]] = [data[pivotRow], data[row]];
      steps.push({
        description: `交换 R${row + 1} ↔ R${pivotRow + 1}`,
        matrix: data.map((r) => [...r]),
        rowOps: `R_{${row + 1}} \\leftrightarrow R_{${pivotRow + 1}}`,
        highlightRow: row,
      });
    }

    const pivot = data[row][col];
    if (Math.abs(pivot - 1) > EPSILON) {
      for (let c = col; c < cols; c++) {
        data[row][c] /= pivot;
      }
      steps.push({
        description: `R${row + 1} ÷ ${roundStr(pivot)}（标准化主元）`,
        matrix: data.map((r) => [...r]),
        rowOps: `R_{${row + 1}} \\gets \\frac{1}{${roundStr(pivot)}} R_{${row + 1}}`,
        highlightRow: row,
        highlightCol: col,
      });
    }

    for (let r = 0; r < rows; r++) {
      if (r === row) continue;
      const factor = data[r][col];
      if (Math.abs(factor) < EPSILON) continue;
      for (let c = col; c < cols; c++) {
        data[r][c] -= factor * data[row][c];
      }
      steps.push({
        description: `R${r + 1} ← R${r + 1} - ${roundStr(factor)}·R${row + 1}（消元）`,
        matrix: data.map((r) => [...r]),
        rowOps: `R_{${r + 1}} \\gets R_{${r + 1}} - ${roundStr(factor)} R_{${row + 1}}`,
        highlightRow: r,
        highlightCol: col,
      });
    }
    row++;
  }

  steps.push({
    description: "消元完成，得到行最简形式",
    matrix: data.map((r) => [...r]),
    rowOps: "",
  });

  return { result: data, steps };
}
