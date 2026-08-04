"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { vec2 } from "@/math-engine/linear-algebra/vector";

interface VectorSpaceVisProps {
  height?: number;
}

export function VectorSpaceVis({ height = 420 }: VectorSpaceVisProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [v1, setV1] = useState(vec2(3, 1));
  const [v2, setV2] = useState(vec2(1, 2.5));
  const [testPoint, setTestPoint] = useState(vec2(2, 3));
  const [dragging, setDragging] = useState<"v1" | "v2" | "pt" | null>(null);
  const [showRelation, setShowRelation] = useState(true);

  const v1Ref = useRef(v1);
  const v2Ref = useRef(v2);
  const ptRef = useRef(testPoint);
  v1Ref.current = v1;
  v2Ref.current = v2;
  ptRef.current = testPoint;

  const toCanvas = useCallback((x: number, y: number, w: number, h: number) => {
    const scale = Math.min(w, h) / 14;
    const cx = w / 2;
    const cy = h / 2;
    return { sx: cx + x * scale, sy: cy - y * scale, scale };
  }, []);

  const fromCanvas = useCallback((sx: number, sy: number, w: number, h: number) => {
    const scale = Math.min(w, h) / 14;
    const cx = w / 2;
    const cy = h / 2;
    return { x: (sx - cx) / scale, y: (cy - sy) / scale };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, w, h);

    const { sx: cx, sy: cy } = toCanvas(0, 0, w, h);

    // Grid
    ctx.strokeStyle = "#f1f5f9";
    ctx.lineWidth = 0.5;
    for (let i = -7; i <= 7; i++) {
      const p1 = toCanvas(i, -7, w, h);
      const p2 = toCanvas(i, 7, w, h);
      ctx.beginPath(); ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy); ctx.stroke();
    }
    for (let i = -7; i <= 7; i++) {
      const p1 = toCanvas(-7, i, w, h);
      const p2 = toCanvas(7, i, w, h);
      ctx.beginPath(); ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();

    const det = v1.x * v2.y - v1.y * v2.x;
    const independent = Math.abs(det) > 0.01;

    // Shade the span area
    if (independent) {
      ctx.fillStyle = "rgba(37, 99, 235, 0.04)";
      ctx.fillRect(0, 0, w, h);
    } else {
      // Linearly dependent: span is a line
      const end = toCanvas(v1.x * 5, v1.y * 5, w, h);
      const start = toCanvas(-v1.x * 5, -v1.y * 5, w, h);
      ctx.setLineDash([8, 4]);
      ctx.strokeStyle = "rgba(220, 38, 38, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(start.sx, start.sy);
      ctx.lineTo(end.sx, end.sy);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Parallelogram from v1, v2
    if (independent) {
      const p0 = toCanvas(0, 0, w, h);
      const pv1 = toCanvas(v1.x, v1.y, w, h);
      const pv2 = toCanvas(v2.x, v2.y, w, h);
      const psum = toCanvas(v1.x + v2.x, v1.y + v2.y, w, h);

      ctx.fillStyle = "rgba(37, 99, 235, 0.08)";
      ctx.beginPath();
      ctx.moveTo(p0.sx, p0.sy);
      ctx.lineTo(pv1.sx, pv1.sy);
      ctx.lineTo(psum.sx, psum.sy);
      ctx.lineTo(pv2.sx, pv2.sy);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Vectors
    const ov1 = toCanvas(v1.x, v1.y, w, h);
    drawArrow(ctx, cx, cy, ov1.sx, ov1.sy, "#2563eb", 2.5, "v₁");
    const ov2 = toCanvas(v2.x, v2.y, w, h);
    drawArrow(ctx, cx, cy, ov2.sx, ov2.sy, "#dc2626", 2.5, "v₂");

    // Drag handles
    [v1, v2].forEach((v, idx) => {
      const p = toCanvas(v.x, v.y, w, h);
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, 8, 0, Math.PI * 2);
      ctx.fillStyle = idx === 0 ? "#2563eb" : "#dc2626";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Test point and its relation to span
    if (showRelation) {
      const tp = toCanvas(testPoint.x, testPoint.y, w, h);
      ctx.beginPath();
      ctx.arc(tp.sx, tp.sy, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#7c3aed";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Check if test point is in span
      if (independent) {
        const coeff = solveCoef(v1, v2, testPoint);
        const inSpan = coeff !== null;
        if (inSpan && coeff) {
          ctx.fillStyle = "#7c3aed";
          ctx.font = "12px sans-serif";
          ctx.textAlign = "left";
          ctx.fillText(
            `= ${coeff.c1.toFixed(1)}v₁ + ${coeff.c2.toFixed(1)}v₂`,
            tp.sx + 8, tp.sy - 6
          );
        } else {
          ctx.fillStyle = "#dc2626";
          ctx.font = "12px sans-serif";
          ctx.textAlign = "left";
          ctx.fillText("不在张成空间内", tp.sx + 8, tp.sy - 6);
        }
      } else {
        // Linearly dependent: check if on the line
        const cross = v1.x * testPoint.y - v1.y * testPoint.x;
        if (Math.abs(cross) < 0.05) {
          ctx.fillStyle = "#7c3aed";
          ctx.font = "12px sans-serif";
          ctx.textAlign = "left";
          ctx.fillText("在张成空间内(直线上)", tp.sx + 8, tp.sy - 6);
        } else {
          ctx.fillStyle = "#dc2626";
          ctx.font = "12px sans-serif";
          ctx.textAlign = "left";
          ctx.fillText("不在张成空间内", tp.sx + 8, tp.sy - 6);
        }
      }
    }

    // Info panel
    ctx.fillStyle = "#475569";
    ctx.font = "13px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(independent ? "线性无关 (满秩)" : "线性相关 (秩=1)", 12, 22);
    ctx.fillText(`det = ${det.toFixed(2)}`, 12, 44);
    if (independent) {
      ctx.fillText(`span = 整个平面 (R²)`, 12, 66);
    } else {
      ctx.fillText("span = 一条直线", 12, 66);
    }
  }, [v1, v2, testPoint, showRelation, toCanvas]);

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getWorld = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return fromCanvas(e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height);
    };

    const onDown = (e: PointerEvent) => {
      const wp = getWorld(e);
      const d1 = Math.hypot(wp.x - v1Ref.current.x, wp.y - v1Ref.current.y);
      const d2 = Math.hypot(wp.x - v2Ref.current.x, wp.y - v2Ref.current.y);
      const dp = Math.hypot(wp.x - ptRef.current.x, wp.y - ptRef.current.y);
      if (d1 < 1) setDragging("v1");
      else if (d2 < 1) setDragging("v2");
      else if (dp < 1) setDragging("pt");
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const wp = getWorld(e);
      if (dragging === "v1") setV1(vec2(wp.x, wp.y));
      if (dragging === "v2") setV2(vec2(wp.x, wp.y));
      if (dragging === "pt") setTestPoint(vec2(wp.x, wp.y));
    };
    const onUp = () => setDragging(null);

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointerleave", onUp);
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerleave", onUp);
    };
  }, [dragging, fromCanvas]);

  const det = v1.x * v2.y - v1.y * v2.x;
  const independent = Math.abs(det) > 0.01;

  return (
    <div className="space-y-3">
      <div className="relative rounded-lg border border-slate-200 bg-white" style={{ height }}>
        <canvas
          ref={canvasRef}
          className="h-full w-full cursor-crosshair touch-none"
          style={{ height: "100%", width: "100%" }}
          aria-label="向量空间可视化：拖动向量观察张成空间和线性相关性"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={() => {
            setV1(vec2(3, 1));
            setV2(vec2(1, 2.5));
            setTestPoint(vec2(2, 3));
          }}
          className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50"
        >
          重置
        </button>
        <label className="flex cursor-pointer items-center gap-1.5">
          <input
            type="checkbox"
            checked={showRelation}
            onChange={(e) => setShowRelation(e.target.checked)}
            className="accent-primary-600"
          />
          <span className="text-slate-600">测试点</span>
        </label>
        <button
          onClick={() => {
            setV2(vec2(v1.x * 2, v1.y * 2));
          }}
          className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
        >
          共线(线性相关)
        </button>
        <button
          onClick={() => {
            setV2(vec2(-v1.y, v1.x));
          }}
          className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
        >
          正交
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div className="rounded-md bg-blue-50 p-2">
          <span className="text-slate-500">v₁</span>
          <span className="ml-1 font-mono text-slate-700">({v1.x.toFixed(1)},{v1.y.toFixed(1)})</span>
        </div>
        <div className="rounded-md bg-red-50 p-2">
          <span className="text-slate-500">v₂</span>
          <span className="ml-1 font-mono text-slate-700">({v2.x.toFixed(1)},{v2.y.toFixed(1)})</span>
        </div>
        <div className="rounded-md bg-slate-50 p-2">
          <span className={`font-medium ${independent ? "text-green-700" : "text-red-600"}`}>
            {independent ? "线性无关" : "线性相关"}
          </span>
        </div>
        <div className="rounded-md bg-slate-50 p-2">
          <span className="text-slate-500">span = </span>
          <span className="font-medium text-slate-700">
            {independent ? "R² (整个平面)" : "一条直线 (1维)"}
          </span>
        </div>
      </div>
    </div>
  );
}

function solveCoef(
  v1: { x: number; y: number },
  v2: { x: number; y: number },
  target: { x: number; y: number }
): { c1: number; c2: number } | null {
  const det = v1.x * v2.y - v1.y * v2.x;
  if (Math.abs(det) < 1e-10) return null;
  const c1 = (target.x * v2.y - target.y * v2.x) / det;
  const c2 = (v1.x * target.y - v1.y * target.x) / det;
  return { c1, c2 };
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number,
  color: string, lineWidth: number, label?: string
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 2) return;
  const ux = dx / len;
  const uy = dy / len;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  const as = Math.min(12, len / 3);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - as * ux + as * 0.4 * uy, y2 - as * uy - as * 0.4 * ux);
  ctx.lineTo(x2 - as * ux - as * 0.4 * uy, y2 - as * uy + as * 0.4 * ux);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  if (label) {
    ctx.fillStyle = color;
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(label, x2 + 10 * ux, y2 + 10 * uy);
  }
}
