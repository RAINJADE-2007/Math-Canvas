"use client";

import { useEffect, useRef } from "react";
import type { MultivariateFunction } from "@/types";
import { createBivariateFunction } from "@/math-engine/middle-school/multivariate/evaluate";

const GRID = 40;
const DOMAIN = 4;

interface ViewState {
  az: number;
  el: number;
}

interface Projected {
  sx: number;
  sy: number;
  depth: number;
}

function project(
  x: number,
  y: number,
  z: number,
  az: number,
  el: number,
  scale: number,
  cx: number,
  cy: number,
): Projected {
  const ca = Math.cos(az);
  const sa = Math.sin(az);
  const ce = Math.cos(el);
  const se = Math.sin(el);
  const xr = x * ca - y * sa;
  const yr = x * sa + y * ca;
  const ye = yr * ce - z * se;
  const ze = yr * se + z * ce;
  return { sx: cx + xr * scale, sy: cy - ye * scale, depth: ze };
}

function gridXY(i: number, j: number): [number, number] {
  return [-DOMAIN + (2 * DOMAIN * i) / GRID, -DOMAIN + (2 * DOMAIN * j) / GRID];
}

function hueOf(hex: string): number {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if ([r, g, b].some((v) => Number.isNaN(v))) return 210;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 210;
  let h = 0;
  if (max === r) h = (g - b) / (max - min);
  else if (max === g) h = (b - r) / (max - min) + 2;
  else h = (r - g) / (max - min) + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
}

export function SurfaceView({
  functions,
  className,
}: {
  functions: MultivariateFunction[];
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewRef = useRef<ViewState>({ az: -Math.PI / 4, el: 0.55 });
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const functionsRef = useRef(functions);
  functionsRef.current = functions;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const visible = functionsRef.current.filter((f) => f.visible);
      if (visible.length === 0) {
        ctx.fillStyle = "#94a3b8";
        ctx.font = "13px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("暂无可见的多元函数，请在上方添加", w / 2, h / 2);
        return;
      }

      const { az, el } = viewRef.current;
      const scale = (Math.min(w, h) * 0.3) / DOMAIN;
      const cx = w / 2;
      const cy = h / 2;

      interface Layer {
        zs: number[][];
        zMin: number;
        zMax: number;
        hue: number;
      }
      const layers: Layer[] = visible.map((f) => {
        const fn = createBivariateFunction(f.expression);
        const zs: number[][] = [];
        let zMin = Infinity;
        let zMax = -Infinity;
        for (let i = 0; i <= GRID; i++) {
          const row: number[] = [];
          const [x] = gridXY(i, 0);
          for (let j = 0; j <= GRID; j++) {
            const [, y] = gridXY(0, j);
            const z = fn.evaluate(x, y);
            row.push(z);
            if (Number.isFinite(z)) {
              if (z < zMin) zMin = z;
              if (z > zMax) zMax = z;
            }
          }
          zs.push(row);
        }
        if (!Number.isFinite(zMin)) zMin = -1;
        if (!Number.isFinite(zMax)) zMax = 1;
        return { zs, zMin, zMax, hue: hueOf(f.color) };
      });

      // axes
      const axisLen = DOMAIN * 1.08;
      const drawAxis = (end: [number, number, number], color: string, label: string) => {
        const p0 = project(0, 0, 0, az, el, scale, cx, cy);
        const p1 = project(end[0], end[1], end[2], az, el, scale, cx, cy);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p0.sx, p0.sy);
        ctx.lineTo(p1.sx, p1.sy);
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.font = "12px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillText(label, p1.sx + 4, p1.sy);
      };
      drawAxis([axisLen, 0, 0], "#dc2626", "x");
      drawAxis([0, axisLen, 0], "#059669", "y");
      drawAxis([0, 0, axisLen], "#2563eb", "z");

      // quads (painter's algorithm)
      for (const layer of layers) {
        const cells: { i: number; j: number; depth: number; zAvg: number }[] = [];
        for (let i = 0; i < GRID; i++) {
          for (let j = 0; j < GRID; j++) {
            const z00 = layer.zs[i][j];
            const z10 = layer.zs[i + 1][j];
            const z01 = layer.zs[i][j + 1];
            const z11 = layer.zs[i + 1][j + 1];
            if ([z00, z10, z01, z11].some((z) => !Number.isFinite(z))) continue;
            const [x0, y0] = gridXY(i, j);
            const [x1, y1] = gridXY(i + 1, j + 1);
            const c00 = project(x0, y0, z00, az, el, scale, cx, cy);
            const c10 = project(x1, y0, z10, az, el, scale, cx, cy);
            const c11 = project(x1, y1, z11, az, el, scale, cx, cy);
            const c01 = project(x0, y1, z01, az, el, scale, cx, cy);
            cells.push({
              i,
              j,
              depth: (c00.depth + c10.depth + c11.depth + c01.depth) / 4,
              zAvg: (z00 + z10 + z01 + z11) / 4,
            });
          }
        }
        cells.sort((a, b) => a.depth - b.depth);
        const range = layer.zMax - layer.zMin || 1;
        for (const cell of cells) {
          const [x0, y0] = gridXY(cell.i, cell.j);
          const [x1, y1] = gridXY(cell.i + 1, cell.j + 1);
          const z00 = layer.zs[cell.i][cell.j];
          const z10 = layer.zs[cell.i + 1][cell.j];
          const z11 = layer.zs[cell.i + 1][cell.j + 1];
          const z01 = layer.zs[cell.i][cell.j + 1];
          const t = (cell.zAvg - layer.zMin) / range;
          const lightness = 25 + 45 * Math.max(0, Math.min(1, t));
          ctx.fillStyle = `hsl(${layer.hue}, 70%, ${lightness}%)`;
          ctx.strokeStyle = `hsl(${layer.hue}, 55%, ${Math.max(0, lightness - 8)}%)`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(project(x0, y0, z00, az, el, scale, cx, cy).sx, project(x0, y0, z00, az, el, scale, cx, cy).sy);
          ctx.lineTo(project(x1, y0, z10, az, el, scale, cx, cy).sx, project(x1, y0, z10, az, el, scale, cx, cy).sy);
          ctx.lineTo(project(x1, y1, z11, az, el, scale, cx, cy).sx, project(x1, y1, z11, az, el, scale, cx, cy).sy);
          ctx.lineTo(project(x0, y1, z01, az, el, scale, cx, cy).sx, project(x0, y1, z01, az, el, scale, cx, cy).sy);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }

      ctx.fillStyle = "#64748b";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("拖动鼠标旋转视角", 8, 8);
    };

    render();
    const ro = new ResizeObserver(render);
    ro.observe(canvas);

    const onDown = (e: PointerEvent) => {
      dragRef.current = { x: e.clientX, y: e.clientY };
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };
    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      drag.x = e.clientX;
      drag.y = e.clientY;
      viewRef.current.az += dx * 0.01;
      viewRef.current.el = Math.min(Math.PI - 0.05, Math.max(0.05, viewRef.current.el + dy * 0.01));
      render();
    };
    const onUp = (e: PointerEvent) => {
      dragRef.current = null;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    return () => {
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} style={{ touchAction: "none", cursor: "grab" }} />;
}
