import type { GeometryObject } from "@/types";

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function midpoint(x1: number, y1: number, x2: number, y2: number): { x: number; y: number } {
  return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
}

export function slope(x1: number, y1: number, x2: number, y2: number): number | null {
  if (Math.abs(x2 - x1) < 1e-9) return null;
  return (y2 - y1) / (x2 - x1);
}

export interface GeometryCalculations {
  label: string;
  summary: string;
  items: { label: string; value: string }[];
  warning?: string;
}

export function calculateGeometryObject(obj: GeometryObject): GeometryCalculations {
  if (obj.type === "point" && obj.x !== undefined && obj.y !== undefined) {
    return {
      label: obj.label,
      summary: `点 ${obj.label} (${obj.x}, ${obj.y})`,
      items: [
        { label: "横坐标", value: String(obj.x) },
        { label: "纵坐标", value: String(obj.y) },
        { label: "到原点距离", value: distance(0, 0, obj.x, obj.y).toFixed(4) },
      ],
    };
  }

  if (
    (obj.type === "line" || obj.type === "segment") &&
    obj.x1 !== undefined && obj.y1 !== undefined && obj.x2 !== undefined && obj.y2 !== undefined
  ) {
    const d = distance(obj.x1, obj.y1, obj.x2, obj.y2);
    const m = midpoint(obj.x1, obj.y1, obj.x2, obj.y2);
    const k = slope(obj.x1, obj.y1, obj.x2, obj.y2);
    const items: { label: string; value: string }[] = [
      { label: "长度", value: obj.type === "line" ? "（直线无限延伸）" : d.toFixed(4) },
      { label: "中点", value: `(${m.x}, ${m.y})` },
      { label: "斜率", value: k === null ? "不存在（垂直于 x 轴）" : k.toFixed(4) },
    ];
    if (k !== null && k !== undefined) {
      const b = obj.y1 - k * obj.x1;
      items.push({ label: "直线方程", value: `y = ${formatNumber(k)}x ${b >= 0 ? "+" : "-"} ${formatNumber(Math.abs(b))}` });
    }
    return { label: obj.label, summary: `${obj.type === "line" ? "直线" : "线段"} ${obj.label}`, items };
  }

  if (obj.type === "circle" && obj.centerX !== undefined && obj.centerY !== undefined && obj.radius !== undefined) {
    return {
      label: obj.label,
      summary: `圆 ${obj.label}：圆心 (${obj.centerX}, ${obj.centerY})，半径 ${obj.radius}`,
      items: [
        { label: "圆心", value: `(${obj.centerX}, ${obj.centerY})` },
        { label: "半径", value: String(obj.radius) },
        { label: "面积", value: (Math.PI * obj.radius * obj.radius).toFixed(4) },
        { label: "周长", value: (2 * Math.PI * obj.radius).toFixed(4) },
      ],
    };
  }

  return { label: obj.label, summary: obj.label, items: [] };
}

function formatNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(4);
}
