"use client";

import { useEffect, useRef, useState } from "react";
import type { MultivariateFunction } from "@/types";
import { createBivariateFunction } from "@/math-engine/middle-school/multivariate/evaluate";
import { autoLevels, extractContours } from "@/math-engine/middle-school/multivariate/contour";
import { hueOf } from "@/utils/color";
import {
  DEFAULT_MULTIVARIATE_DOMAIN,
  DEFAULT_MULTIVARIATE_GRID,
  type MultivariateDomain,
} from "@/components/multivariate/SurfaceView";

function toUser(px: number, py: number, w: number, h: number, domain: MultivariateDomain): { x: number; y: number } {
  return {
    x: domain.xMin + (px / Math.max(1, w)) * (domain.xMax - domain.xMin),
    y: domain.yMax - (py / Math.max(1, h)) * (domain.yMax - domain.yMin),
  };
}

function xToPx(x: number, w: number, domain: MultivariateDomain): number {
  return ((x - domain.xMin) / (domain.xMax - domain.xMin)) * w;
}

function yToPx(y: number, h: number, domain: MultivariateDomain): number {
  return ((domain.yMax - y) / (domain.yMax - domain.yMin)) * h;
}

export function ContourMap({
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
  const [hover, setHover] = useState<{ x: number; y: number; z: number | null } | null>(null);

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

      const visible = functions.filter((f) => f.visible);
      if (visible.length === 0) {
        ctx.fillStyle = "#94a3b8";
        ctx.font = "13px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("暂无可见的多元函数，请在「多元函数」页签中添加", w / 2, h / 2);
        return;
      }

      const xs: number[] = [];
      for (let i = 0; i <= grid; i++) {
        xs.push(domain.xMin + ((domain.xMax - domain.xMin) * i) / grid);
      }
      const ys: number[] = [];
      for (let j = 0; j <= grid; j++) {
        ys.push(domain.yMin + ((domain.yMax - domain.yMin) * j) / grid);
      }

      // 采样每个函数
      const layers = visible.map((f) => {
        const fn = createBivariateFunction(f.expression);
        const zs: number[][] = [];
        let zMin = Infinity;
        let zMax = -Infinity;
        for (let i = 0; i <= grid; i++) {
          const row: number[] = [];
          for (let j = 0; j <= grid; j++) {
            const z = fn.evaluate(xs[i], ys[j]);
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

      // 热力图底色：以第一个可见函数为主
      const base = layers[0];
      if (base) {
        const range = base.zMax - base.zMin || 1;
        for (let i = 0; i < grid; i++) {
          for (let j = 0; j < grid; j++) {
            const z = base.zs[i][j];
            if (!Number.isFinite(z)) continue;
            const t = Math.max(0, Math.min(1, (z - base.zMin) / range));
            ctx.fillStyle = `hsl(${base.hue}, 70%, ${18 + 52 * t}%)`;
            ctx.fillRect((i / grid) * w, (j / grid) * h, w / grid + 0.5, h / grid + 0.5);
          }
        }
      }

      // 坐标轴（当 0 落在取值范围内时绘制）
      ctx.strokeStyle = "rgba(148,163,184,0.9)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      if (domain.yMin <= 0 && domain.yMax >= 0) {
        const y0 = yToPx(0, h, domain);
        ctx.moveTo(0, y0);
        ctx.lineTo(w, y0);
      }
      if (domain.xMin <= 0 && domain.xMax >= 0) {
        const x0 = xToPx(0, w, domain);
        ctx.moveTo(x0, 0);
        ctx.lineTo(x0, h);
      }
      ctx.stroke();
      ctx.fillStyle = "#64748b";
      ctx.font = "12px sans-serif";
      ctx.fillText("x", w - 12, yToPx(0, h, domain) - 6);
      ctx.fillText("y", xToPx(0, w, domain) + 6, 12);

      // 等高线
      layers.forEach((layer, layerIndex) => {
        const levels = autoLevels(layer.zMin, layer.zMax, 10);
        const levelsResult = extractContours(layer.zs, xs, ys, levels);
        ctx.strokeStyle = `hsl(${layer.hue}, 85%, 45%)`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (const lv of levelsResult) {
          for (const seg of lv.segments) {
            const x1 = xToPx(seg.x1, w, domain);
            const y1 = yToPx(seg.y1, h, domain);
            const x2 = xToPx(seg.x2, w, domain);
            const y2 = yToPx(seg.y2, h, domain);
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
          }
        }
        ctx.stroke();

        // 高度值标注（仅第一个函数，避免杂乱）
        if (layerIndex === 0) {
          ctx.font = "10px sans-serif";
          ctx.fillStyle = `hsl(${layer.hue}, 90%, 30%)`;
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          for (const lv of levelsResult) {
            let longest: ContourSeg | null = null;
            let maxLen = 0;
            for (const seg of lv.segments) {
              const dx = seg.x2 - seg.x1;
              const dy = seg.y2 - seg.y1;
              const len = dx * dx + dy * dy;
              if (len > maxLen) {
                maxLen = len;
                longest = seg;
              }
            }
            if (!longest || maxLen < 0.05) continue;
            const mx = xToPx((longest.x1 + longest.x2) / 2, w, domain);
            const my = yToPx((longest.y1 + longest.y2) / 2, h, domain);
            ctx.fillText(levelText(lv.level), mx, my);
          }
        }
      });

      // 提示文字
      ctx.fillStyle = "#64748b";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("等高线图 · 悬停查看高度", 8, 8);
    };

    render();
    const ro = new ResizeObserver(render);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [functions, domain, grid]);

  function handleMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const { x, y } = toUser(e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height, domain);
    const visible = functions.filter((f) => f.visible);
    let z: number | null = null;
    if (visible.length > 0) {
      const fn = createBivariateFunction(visible[0].expression);
      const v = fn.evaluate(x, y);
      z = Number.isFinite(v) ? v : null;
    }
    setHover({ x, y, z });
  }

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className={`${className ?? ""} h-full w-full`}
        style={{ touchAction: "none", cursor: "crosshair" }}
        onPointerMove={handleMove}
        onPointerLeave={() => setHover(null)}
      />
      {hover ? (
        <div className="pointer-events-none absolute bottom-2 left-2 rounded-md border border-slate-200 bg-white/90 px-2 py-1 font-mono text-xs text-slate-600 shadow-sm">
          x={hover.x.toFixed(2)}, y={hover.y.toFixed(2)}
          {hover.z !== null ? `, z=${hover.z.toFixed(3)}` : ", z=无定义"}
        </div>
      ) : null}
    </div>
  );
}

interface ContourSeg {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function levelText(v: number): string {
  return Math.abs(v) < 1e-6 ? "0" : v.toFixed(2);
}
