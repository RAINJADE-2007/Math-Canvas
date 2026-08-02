"use client";

import { useEffect, useRef, useState } from "react";
import type { MultivariateFunction } from "@/types";
import { createBivariateFunction } from "@/math-engine/middle-school/multivariate/evaluate";
import { hueOf } from "@/utils/color";

export interface MultivariateDomain {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

// 默认采样精度：标准 50×50，精细 100×100（需求建议）
export const DEFAULT_MULTIVARIATE_GRID = 50;
export const DEFAULT_MULTIVARIATE_DOMAIN: MultivariateDomain = {
  xMin: -4,
  xMax: 4,
  yMin: -4,
  yMax: 4,
};

interface ViewState {
  az: number;
  el: number;
  panX: number;
  panY: number;
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
  panX: number,
  panY: number,
): Projected {
  const ca = Math.cos(az);
  const sa = Math.sin(az);
  const ce = Math.cos(el);
  const se = Math.sin(el);
  const xr = x * ca - y * sa;
  const yr = x * sa + y * ca;
  const ye = yr * ce - z * se;
  const ze = yr * se + z * ce;
  return { sx: cx + panX + xr * scale, sy: cy + panY - ye * scale, depth: ze };
}

function gridXY(i: number, j: number, domain: MultivariateDomain, grid: number): [number, number] {
  return [
    domain.xMin + ((domain.xMax - domain.xMin) * i) / grid,
    domain.yMin + ((domain.yMax - domain.yMin) * j) / grid,
  ];
}

export function SurfaceView({
  functions,
  domain = DEFAULT_MULTIVARIATE_DOMAIN,
  grid = DEFAULT_MULTIVARIATE_GRID,
  className,
}: {
  functions: MultivariateFunction[];
  domain?: MultivariateDomain;
  grid?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewRef = useRef<ViewState>({ az: -Math.PI / 4, el: 0.55, panX: 0, panY: 0 });
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const modeRef = useRef<"rotate" | "pan">("rotate");
  const functionsRef = useRef(functions);
  functionsRef.current = functions;
  const [zoom, setZoom] = useState(1);

  const resetView = () => {
    viewRef.current = { az: -Math.PI / 4, el: 0.55, panX: 0, panY: 0 };
    setZoom(1);
  };

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
        ctx.fillText("暂无可见的多元函数，请在下方「多元函数」页签中添加", w / 2, h / 2);
        return;
      }

      // 根据取值范围自适应缩放与平移中心
      const spanX = Math.max(1e-6, domain.xMax - domain.xMin);
      const spanY = Math.max(1e-6, domain.yMax - domain.yMin);
      const span = Math.max(spanX, spanY);
      const cxWorld = (domain.xMin + domain.xMax) / 2;
      const cyWorld = (domain.yMin + domain.yMax) / 2;

      const { az, el, panX, panY } = viewRef.current;
      const scale = (Math.min(w, h) * 0.32 * zoom) / span;
      const cx = w / 2;
      const cy = h / 2;
      const proj = (x: number, y: number, z: number) =>
        project(x - cxWorld, y - cyWorld, z, az, el, scale, cx, cy, panX, panY);

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
        for (let i = 0; i <= grid; i++) {
          const row: number[] = [];
          const [x] = gridXY(i, 0, domain, grid);
          for (let j = 0; j <= grid; j++) {
            const [, y] = gridXY(0, j, domain, grid);
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

      // 坐标轴（穿过世界原点）
      const axisLen = span * 0.55;
      const drawAxis = (end: [number, number, number], color: string, label: string) => {
        const p0 = proj(0, 0, 0);
        const p1 = proj(end[0], end[1], end[2]);
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

      // 四边形网格（画家算法）
      for (const layer of layers) {
        const cells: { i: number; j: number; depth: number; zAvg: number }[] = [];
        for (let i = 0; i < grid; i++) {
          for (let j = 0; j < grid; j++) {
            const z00 = layer.zs[i][j];
            const z10 = layer.zs[i + 1][j];
            const z01 = layer.zs[i][j + 1];
            const z11 = layer.zs[i + 1][j + 1];
            if ([z00, z10, z01, z11].some((z) => !Number.isFinite(z))) continue;
            const [x0, y0] = gridXY(i, j, domain, grid);
            const [x1, y1] = gridXY(i + 1, j + 1, domain, grid);
            const c00 = proj(x0, y0, z00);
            const c10 = proj(x1, y0, z10);
            const c11 = proj(x1, y1, z11);
            const c01 = proj(x0, y1, z01);
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
          const [x0, y0] = gridXY(cell.i, cell.j, domain, grid);
          const [x1, y1] = gridXY(cell.i + 1, cell.j + 1, domain, grid);
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
          ctx.moveTo(proj(x0, y0, z00).sx, proj(x0, y0, z00).sy);
          ctx.lineTo(proj(x1, y0, z10).sx, proj(x1, y0, z10).sy);
          ctx.lineTo(proj(x1, y1, z11).sx, proj(x1, y1, z11).sy);
          ctx.lineTo(proj(x0, y1, z01).sx, proj(x0, y1, z01).sy);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }

      ctx.fillStyle = "#64748b";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("左键拖动旋转 · 右键/Shift+拖动平移 · 滚轮缩放", 8, 8);
    };

    render();
    const ro = new ResizeObserver(render);
    ro.observe(canvas);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      setZoom((z) => Math.min(4, Math.max(0.4, z * factor)));
    };

    const onDown = (e: PointerEvent) => {
      modeRef.current = e.button === 2 || e.button === 1 || e.shiftKey ? "pan" : "rotate";
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
      if (modeRef.current === "pan") {
        viewRef.current.panX += dx;
        viewRef.current.panY += dy;
      } else {
        viewRef.current.az += dx * 0.01;
        viewRef.current.el = Math.min(Math.PI - 0.05, Math.max(0.05, viewRef.current.el + dy * 0.01));
      }
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
    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("contextmenu", onContextMenu);
    return () => {
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("contextmenu", onContextMenu);
    };
  }, [zoom, domain, grid]);

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className={`${className ?? ""} h-full w-full`}
        style={{ touchAction: "none", cursor: "grab" }}
      />
      <div className="absolute bottom-2 right-2 z-10 flex items-center gap-0.5 rounded-full border border-slate-200 bg-white/90 p-0.5 shadow-sm">
        <button
          type="button"
          title="缩小"
          onClick={() => setZoom((z) => Math.min(4, Math.max(0.4, z * 0.8)))}
          className="flex h-7 w-7 items-center justify-center rounded-full text-base text-slate-600 hover:bg-slate-100"
        >
          −
        </button>
        <span className="min-w-10 px-1 text-center text-xs text-slate-500">{Math.round(zoom * 100)}%</span>
        <button
          type="button"
          title="放大"
          onClick={() => setZoom((z) => Math.min(4, Math.max(0.4, z * 1.25)))}
          className="flex h-7 w-7 items-center justify-center rounded-full text-base text-slate-600 hover:bg-slate-100"
        >
          ＋
        </button>
        <button
          type="button"
          title="重置视角"
          onClick={resetView}
          className="flex h-7 items-center justify-center rounded-full px-2 text-xs text-slate-600 hover:bg-slate-100"
        >
          重置
        </button>
      </div>
    </div>
  );
}
