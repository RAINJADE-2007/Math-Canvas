import type { EigenResult } from "./types";

const EPSILON = 1e-10;

export function computeEigen22(matrix: number[][]): EigenResult {
  if (matrix.length !== 2 || matrix[0].length !== 2) {
    throw new Error("仅支持 2x2 矩阵");
  }

  const [[a, b], [c, d]] = matrix;
  const trace = a + d;
  const det = a * d - b * c;
  const discriminant = trace * trace - 4 * det;

  if (discriminant < -EPSILON) {
    const realPart = trace / 2;
    const imagPart = Math.sqrt(-discriminant) / 2;
    return {
      eigenvalues: [
        {
          value: NaN,
          multiplicity: 1,
          latex: `${realPart.toFixed(2)} + ${imagPart.toFixed(2)}i`,
        },
        {
          value: NaN,
          multiplicity: 1,
          latex: `${realPart.toFixed(2)} - ${imagPart.toFixed(2)}i`,
        },
      ],
      eigenvectors: [],
      diagonalizable: discriminant <= -EPSILON,
    };
  }

  const sqrtDisc = Math.sqrt(Math.max(0, discriminant));
  const lambda1 = (trace + sqrtDisc) / 2;
  const lambda2 = (trace - sqrtDisc) / 2;

  const eigenvalues = [
    {
      value: lambda1,
      multiplicity: Math.abs(lambda1 - lambda2) < EPSILON ? 2 : 1,
      latex: parseFloat(lambda1.toFixed(4)).toString(),
    },
  ];

  if (Math.abs(lambda1 - lambda2) > EPSILON) {
    eigenvalues.push({
      value: lambda2,
      multiplicity: 1,
      latex: parseFloat(lambda2.toFixed(4)).toString(),
    });
  }

  const eigenvectors: EigenResult["eigenvectors"] = [];

  for (const lambda of eigenvalues) {
    const ev = solveEigenvector22(matrix, lambda.value);
    if (ev) {
      eigenvectors.push({
        eigenvalue: lambda.value,
        vector: ev,
        latex: `\\begin{pmatrix} ${ev[0].toFixed(3)} \\\\ ${ev[1].toFixed(3)} \\end{pmatrix}`,
      });
    }
  }

  const diagonalizable = eigenvectors.length === (Math.abs(lambda1 - lambda2) > EPSILON ? 2 : 2);

  let diagonalMatrix: number[][] | undefined;
  let diagonalTransform: number[][] | undefined;

  if (eigenvectors.length === 2) {
    const [ev1, ev2] = eigenvectors;
    if (ev1 && ev2) {
      diagonalTransform = [
        [ev1.vector[0], ev2.vector[0]],
        [ev1.vector[1], ev2.vector[1]],
      ];
      diagonalMatrix = [
        [lambda1, 0],
        [0, lambda2],
      ];
    }
  }

  return {
    eigenvalues,
    eigenvectors,
    diagonalizable,
    diagonalMatrix,
    diagonalTransform,
  };
}

export function computeEigen33(matrix: number[][]): EigenResult {
  if (matrix.length !== 3 || matrix[0].length !== 3) {
    throw new Error("仅支持 3x3 矩阵");
  }

  const [[a11, a12, a13], [a21, a22, a23], [a31, a32, a33]] = matrix;

  const trace = a11 + a22 + a33;
  const detM =
    a11 * (a22 * a33 - a23 * a32) -
    a12 * (a21 * a33 - a23 * a31) +
    a13 * (a21 * a32 - a22 * a31);
  const traceAdj = (a11 * a22 - a12 * a21) + (a11 * a33 - a13 * a31) + (a22 * a33 - a23 * a32);

  const p2 = -trace;
  const p1 = traceAdj;
  const p0 = -detM;

  const eigenvals = solveCubic(1, p2, p1, p0);

  const eigenvalues = eigenvals
    .filter((v) => !isNaN(v))
    .map((v, _, arr) => ({
      value: v,
      multiplicity: arr.filter((w) => Math.abs(w - v) < 1e-6).length,
      latex: parseFloat(v.toFixed(4)).toString(),
    }));

  const eigenvectors: EigenResult["eigenvectors"] = [];
  for (const lambda of eigenvalues) {
    const ev = solveEigenvector(matrix, lambda.value);
    if (ev) {
      eigenvectors.push({
        eigenvalue: lambda.value,
        vector: ev,
        latex: `\\begin{pmatrix} ${ev.map((x) => x.toFixed(3)).join(" \\\\ ")} \\end{pmatrix}`,
      });
    }
  }

  return {
    eigenvalues,
    eigenvectors,
    diagonalizable: eigenvectors.length === 3,
  };
}

function solveEigenvector22(matrix: number[][], lambda: number): number[] | null {
  const [[a, b], [c, d]] = matrix;
  const a11 = a - lambda;
  const a12 = b;
  const a21 = c;
  const a22 = d - lambda;

  if (Math.abs(a11) > EPSILON || Math.abs(a12) > EPSILON) {
    if (Math.abs(a12) > EPSILON) {
      return [1, -a11 / a12];
    }
    return [0, 1];
  }
  if (Math.abs(a21) > EPSILON || Math.abs(a22) > EPSILON) {
    if (Math.abs(a22) > EPSILON) {
      return [-a22 / a21, 1];
    }
    return [1, 0];
  }
  return [1, 0];
}

function solveEigenvector(matrix: number[][], lambda: number): number[] | null {
  const n = matrix.length;
  const M = matrix.map((row) => row.map((v, j) => (j === 0 ? v - lambda : v)));

  if (n === 2) return solveEigenvector22(matrix, lambda);

  let best = -1;
  let maxNorm = 0;
  for (let i = 0; i < n; i++) {
    let norm = 0;
    for (let j = 0; j < n; j++) norm += M[i][j] * M[i][j];
    if (norm > maxNorm) {
      maxNorm = norm;
      best = i;
    }
  }

  if (best < 0) return [1, 0, 0];

  if (n === 3) {
    const r = [(best + 1) % 3, (best + 2) % 3];
    const [i1, i2] = r;
    const det2x2 = M[i1][1] * M[i2][2] - M[i1][2] * M[i2][1];
    if (Math.abs(det2x2) > EPSILON) {
      return [det2x2, -(M[i1][0] * M[i2][2] - M[i1][2] * M[i2][0]), M[i1][0] * M[i2][1] - M[i1][1] * M[i2][0]];
    }
    const mag = Math.max(Math.abs(M[i1][1]), Math.abs(M[i1][2]));
    if (mag > EPSILON) {
      return [M[i1][2] - M[i1][1], -M[i1][0], M[i1][0]];
    }
    return [1, 0, 0];
  }

  return [1, 0, 0];
}

function solveCubic(a: number, b: number, c: number, d: number): number[] {
  if (Math.abs(a) < EPSILON) {
    return solveQuadratic(b, c, d);
  }
  const p = (3 * a * c - b * b) / (3 * a * a);
  const q = (2 * b * b * b - 9 * a * b * c + 27 * a * a * d) / (27 * a * a * a);
  const discriminant = (q * q) / 4 + (p * p * p) / 27;

  if (Math.abs(discriminant) < EPSILON) {
    const u = Math.cbrt(-q / 2);
    const x1 = 2 * u - b / (3 * a);
    const x2 = -u - b / (3 * a);
    return [x1, x2, x2];
  }

  if (discriminant > 0) {
    const sqrtD = Math.sqrt(discriminant);
    const u = Math.cbrt(-q / 2 + sqrtD);
    const v = Math.cbrt(-q / 2 - sqrtD);
    return [u + v - b / (3 * a)];
  }

  const r = Math.sqrt((-p * p * p) / 27);
  const phi = Math.acos(-q / (2 * r));
  const r13 = 2 * Math.cbrt(r);
  const shift = b / (3 * a);
  return [
    r13 * Math.cos(phi / 3) - shift,
    r13 * Math.cos((phi + 2 * Math.PI) / 3) - shift,
    r13 * Math.cos((phi + 4 * Math.PI) / 3) - shift,
  ];
}

function solveQuadratic(a: number, b: number, c: number): number[] {
  if (Math.abs(a) < EPSILON) {
    if (Math.abs(b) < EPSILON) return [];
    return [-c / b];
  }
  const discriminant = b * b - 4 * a * c;
  if (discriminant < -EPSILON) return [];
  const sqrtD = Math.sqrt(Math.max(0, discriminant));
  return [(-b + sqrtD) / (2 * a), (-b - sqrtD) / (2 * a)];
}

export function matrix2x2Transform(matrix: number[][], points: Array<[number, number]>): Array<[number, number]> {
  const [[a, b], [c, d]] = matrix;
  return points.map(([x, y]) => [
    a * x + b * y,
    c * x + d * y,
  ]);
}

export function matrix3x3Transform2D(matrix: number[][], points: Array<[number, number]>): Array<[number, number]> {
  const [[a11, a12, a13], [a21, a22, a23], [a31, a32, a33]] = matrix;
  return points.map(([x, y]) => {
    const w = a31 * x + a32 * y + a33;
    if (Math.abs(w) < EPSILON) return [NaN, NaN] as [number, number];
    return [(a11 * x + a12 * y + a13) / w, (a21 * x + a22 * y + a23) / w];
  });
}

export const eigenvalues2x2 = computeEigen22;
export const eigenvalues3x3 = computeEigen33;

export function applyMatrixToShape(
  matrix: number[][],
  points: Array<{ x: number; y: number }>
): Array<{ x: number; y: number }> {
  const [[a, b], [c, d]] = matrix;
  return points.map((p) => ({
    x: a * p.x + b * p.y,
    y: c * p.x + d * p.y,
  }));
}
