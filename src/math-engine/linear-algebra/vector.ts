import type { Vector2D, Vector3D } from "./types";

const EPSILON = 1e-10;

export function vec2(x: number, y: number): Vector2D {
  return { x, y };
}

export function vec3(x: number, y: number, z: number): Vector3D {
  return { x, y, z };
}

export function vec2Zero(): Vector2D {
  return { x: 0, y: 0 };
}

export function vec3Zero(): Vector3D {
  return { x: 0, y: 0, z: 0 };
}

export function vec2Add(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function vec2Sub(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function vec2Scale(v: Vector2D, s: number): Vector2D {
  return { x: v.x * s, y: v.y * s };
}

export function vec2Dot(a: Vector2D, b: Vector2D): number {
  return a.x * b.x + a.y * b.y;
}

export function vec2CrossScalar(a: Vector2D, b: Vector2D): number {
  return a.x * b.y - a.y * b.x;
}

export function vec2Norm(v: Vector2D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function vec2NormSq(v: Vector2D): number {
  return v.x * v.x + v.y * v.y;
}

export function vec2Normalize(v: Vector2D): Vector2D {
  const n = vec2Norm(v);
  if (n < EPSILON) return { x: 0, y: 0 };
  return { x: v.x / n, y: v.y / n };
}

export function vec2Angle(a: Vector2D, b: Vector2D): number {
  const dot = vec2Dot(a, b);
  const na = vec2Norm(a);
  const nb = vec2Norm(b);
  if (na < EPSILON || nb < EPSILON) return 0;
  const cosTheta = Math.max(-1, Math.min(1, dot / (na * nb)));
  return Math.acos(cosTheta);
}

export function vec2AngleDeg(a: Vector2D, b: Vector2D): number {
  return (vec2Angle(a, b) * 180) / Math.PI;
}

export function vec2IsOrthogonal(a: Vector2D, b: Vector2D): boolean {
  return Math.abs(vec2Dot(a, b)) < EPSILON;
}

export function vec2IsParallel(a: Vector2D, b: Vector2D): boolean {
  return Math.abs(vec2CrossScalar(a, b)) < EPSILON;
}

export function vec2Distance(a: Vector2D, b: Vector2D): number {
  return vec2Norm(vec2Sub(a, b));
}

export function vec2Project(a: Vector2D, onto: Vector2D): Vector2D {
  const nSq = vec2NormSq(onto);
  if (nSq < EPSILON) return vec2Zero();
  const scalar = vec2Dot(a, onto) / nSq;
  return vec2Scale(onto, scalar);
}

export function vec2LinearCombination(vectors: Vector2D[], coefficients: number[]): Vector2D {
  const result = vec2Zero();
  for (let i = 0; i < vectors.length; i++) {
    result.x += vectors[i].x * (coefficients[i] ?? 0);
    result.y += vectors[i].y * (coefficients[i] ?? 0);
  }
  return result;
}

export function vec3Add(a: Vector3D, b: Vector3D): Vector3D {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function vec3Sub(a: Vector3D, b: Vector3D): Vector3D {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function vec3Scale(v: Vector3D, s: number): Vector3D {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

export function vec3Dot(a: Vector3D, b: Vector3D): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function vec3Cross(a: Vector3D, b: Vector3D): Vector3D {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function vec3Norm(v: Vector3D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

export function vec3Normalize(v: Vector3D): Vector3D {
  const n = vec3Norm(v);
  if (n < EPSILON) return { x: 0, y: 0, z: 0 };
  return { x: v.x / n, y: v.y / n, z: v.z / n };
}

export function formatVector2D(v: Vector2D, precision = 2): string {
  const rx = parseFloat(v.x.toFixed(precision));
  const ry = parseFloat(v.y.toFixed(precision));
  return `(${rx}, ${ry})`;
}

export function formatVector2DLatex(v: Vector2D, precision = 2): string {
  const rx = parseFloat(v.x.toFixed(precision));
  const ry = parseFloat(v.y.toFixed(precision));
  return `\\begin{pmatrix} ${rx} \\\\ ${ry} \\end{pmatrix}`;
}

export function formatVector2DLatexRow(v: Vector2D, precision = 2): string {
  const rx = parseFloat(v.x.toFixed(precision));
  const ry = parseFloat(v.y.toFixed(precision));
  return `(${rx}, ${ry})`;
}
