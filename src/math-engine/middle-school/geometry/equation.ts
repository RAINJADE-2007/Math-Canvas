import { evaluate } from "mathjs";
import type { GeometryObject } from "@/types";

export interface GeometryEquationResult {
  equation: string;
}

export interface ParseEquationResult {
  ok: boolean;
  patch?: Partial<GeometryObject>;
  error?: string;
}

function fmt(n: number): string {
  if (!Number.isFinite(n)) return "?";
  const r = Math.round(n * 1e4) / 1e4;
  return Math.abs(r) < 1e-9 ? "0" : Number.isInteger(r) ? String(r) : String(r);
}

export function geometryEquation(obj: GeometryObject): GeometryEquationResult | null {
  if (obj.type === "point") return null;
  if (
    (obj.type === "line" || obj.type === "segment") &&
    obj.x1 !== undefined && obj.y1 !== undefined && obj.x2 !== undefined && obj.y2 !== undefined
  ) {
    if (Math.abs(obj.x2 - obj.x1) < 1e-9) {
      return { equation: `x = ${fmt(obj.x1)}` };
    }
    const k = (obj.y2 - obj.y1) / (obj.x2 - obj.x1);
    const b = obj.y1 - k * obj.x1;
    let eq: string;
    if (Math.abs(k) < 1e-12) {
      eq = `y = ${fmt(b)}`;
    } else if (Math.abs(k - 1) < 1e-9) {
      eq = "y = x";
    } else if (Math.abs(k + 1) < 1e-9) {
      eq = "y = -x";
    } else {
      eq = `y = ${fmt(k)}x`;
    }
    const bR = Math.round(b * 1e9) / 1e9;
    if (Math.abs(bR) > 1e-9 && Math.abs(k) >= 1e-12) {
      eq += bR > 0 ? ` + ${fmt(bR)}` : ` - ${fmt(Math.abs(bR))}`;
    }
    return { equation: eq };
  }
  if (obj.type === "circle" && obj.centerX !== undefined && obj.centerY !== undefined && obj.radius !== undefined) {
    const a = obj.centerX;
    const b = obj.centerY;
    const r = obj.radius;
    const xTerm = Math.abs(a) < 1e-9 ? "x^2" : `(x ${a >= 0 ? "-" : "+"} ${fmt(Math.abs(a))})^2`;
    const yTerm = Math.abs(b) < 1e-9 ? "y^2" : `(y ${b >= 0 ? "-" : "+"} ${fmt(Math.abs(b))})^2`;
    return { equation: `${xTerm} + ${yTerm} = ${fmt(r)}^2` };
  }
  return null;
}

function evalNum(expr: string, scope: Record<string, number> = {}): number | null {
  try {
    const v = evaluate(expr, scope);
    return typeof v === "number" && Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

export function parseGeometryEquation(obj: GeometryObject, equation: string): ParseEquationResult {
  if (obj.type !== "line" && obj.type !== "segment" && obj.type !== "circle") {
    return { ok: false, error: "点对象暂不支持方程编辑" };
  }
  const text = equation.trim().replace(/\s+/g, "");
  if (!text) return { ok: false, error: "方程不能为空" };
  if (obj.type === "line" || obj.type === "segment") {
    return parseLineEquation(obj, text);
  }
  return parseCircleEquation(obj, text);
}

function normalizeRhs(rhs: string): string {
  return rhs.replace(/\*\*/g, "^").replace(/(\d)\(/g, "$1*(").replace(/(\d)([a-z])/gi, "$1*$2");
}

function parseLineEquation(obj: GeometryObject, text: string): ParseEquationResult {
  const vertical = text.match(/^x=(-?\d*\.?\d+)$/);
  if (vertical) {
    const c = parseFloat(vertical[1]);
    if (!Number.isFinite(c)) return { ok: false, error: "无法解析 x = c 中的常数" };
    return { ok: true, patch: { x1: c, x2: c } };
  }
  if (!/^y=/.test(text)) {
    return { ok: false, error: "请输入 y = kx + b 或 x = c 形式的直线方程" };
  }
  const rhs = normalizeRhs(text.slice(2));
  const y0 = evalNum(rhs, { x: 0 });
  const y1 = evalNum(rhs, { x: 1 });
  if (y0 === null || y1 === null) {
    return { ok: false, error: "无法解析该直线方程" };
  }
  const k = y1 - y0;
  const b = y0;
  const anchorX = ((obj.x1 ?? 0) + (obj.x2 ?? 0)) / 2;
  const half = Math.max(Math.abs((obj.x2 ?? anchorX) - (obj.x1 ?? anchorX)) / 2, 1);
  const x1 = anchorX - half;
  const x2 = anchorX + half;
  return {
    ok: true,
    patch: {
      x1,
      y1: k * x1 + b,
      x2,
      y2: k * x2 + b,
    },
  };
}

interface XYCenter {
  value: number;
}

function parseXYTerm(term: string): XYCenter | null {
  const t = term.replace(/\s+/g, "");
  const m = t.match(/^[xy]([+-])(.+)$/);
  if (!m) {
    if (t === "x" || t === "y") return { value: 0 };
    return null;
  }
  const v = evalNum(m[2]);
  if (v === null) return null;
  return { value: m[1] === "-" ? v : -v };
}

function parseCircleEquation(obj: GeometryObject, text: string): ParseEquationResult {
  const patterns: RegExp[] = [
    /^\(x([+-][^)]+)\)\^2\+\(y([+-][^)]+)\)\^2=(.+)$/,
    /^x\^2\+\(y([+-][^)]+)\)\^2=(.+)$/,
    /^\(x([+-][^)]+)\)\^2\+y\^2=(.+)$/,
    /^x\^2\+y\^2=(.+)$/,
  ];
  let matched: { a: number; b: number; r2: string } | null = null;
  for (const pattern of patterns) {
    const m = text.match(pattern);
    if (!m) continue;
    let a = 0;
    let b = 0;
    let r2 = "";
    if (m.length === 4) {
      const at = parseXYTerm(`x${m[1]}`);
      const bt = parseXYTerm(`y${m[2]}`);
      if (!at || !bt) break;
      a = at.value;
      b = bt.value;
      r2 = m[3];
    } else if (m.length === 3) {
      const hasX = pattern.source.startsWith("/^\\(x");
      if (hasX) {
        const at = parseXYTerm(`x${m[1]}`);
        if (!at) break;
        a = at.value;
        r2 = m[2];
      } else {
        const bt = parseXYTerm(`y${m[1]}`);
        if (!bt) break;
        b = bt.value;
        r2 = m[2];
      }
    } else {
      r2 = m[1];
    }
    matched = { a, b, r2 };
    break;
  }
  if (!matched) {
    return { ok: false, error: "请输入 (x-a)^2 + (y-b)^2 = r^2 形式的圆方程" };
  }
  const rSquared = evalNum(normalizeRhs(matched.r2));
  if (rSquared === null || rSquared <= 0) {
    return { ok: false, error: "圆半径必须为正数" };
  }
  const radius = Math.sqrt(rSquared);
  return {
    ok: true,
    patch: {
      centerX: matched.a,
      centerY: matched.b,
      radius,
    },
  };
}
