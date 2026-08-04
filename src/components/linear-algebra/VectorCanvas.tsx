"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { vec2, vec2Add, vec2Scale } from "@/math-engine/linear-algebra/vector";

interface VectorCanvasProps {
  initialV1?: { x: number; y: number };
  initialV2?: { x: number; y: number };
  showSum?: boolean;
  showDot?: boolean;
  showProjection?: boolean;
  height?: number;
}

export function VectorCanvas({
  initialV1 = { x: 3, y: 2 },
  initialV2 = { x: 1, y: 4 },
  showSum = true,
  showDot = true,
  showProjection = false,
  height = 440,
}: VectorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [v1, setV1] = useState(vec2(initialV1.x, initialV1.y));
  const [v2, setV2] = useState(vec2(initialV2.x, initialV2.y));
  const [dragging, setDragging] = useState<"v1" | "v2" | null>(null);
  const v1Ref = useRef(v1);
  const v2Ref = useRef(v2);

  v1Ref.current = v1;
  v2Ref.current = v2;

  const worldToScreen = useCallback((x: number, y: number, w: number, h: number) => {
    const scale = Math.min(w, h) / 22;
    const cx = w / 2;
    const cy = h / 2;
    return { sx: cx + x * scale, sy: cy - y * scale, scale };
  }, []);

  const screenToWorld = useCallback(
    (sx: number, sy: number, w: number, h: number) => {
      const scale = Math.min(w, h) / 22;
      const cx = w / 2;
      const cy = h / 2;
      return { x: (sx - cx) / scale, y: (cy - sy) / scale };
    },
    []
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width: w, height: h } = canvas;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, w, h);

    const { scale } = worldToScreen(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    const gridExtent = 12;

    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 0.5;
    for (let i = -gridExtent; i <= gridExtent; i++) {
      const sx = cx + i * scale;
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, h);
      ctx.stroke();
    }
    for (let i = -gridExtent; i <= gridExtent; i++) {
      const sy = cy - i * scale;
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(w, sy);
      ctx.stroke();
    }

    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(w, cy);
    ctx.stroke();

    ctx.fillStyle = "#64748b";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    for (let i = -gridExtent; i <= gridExtent; i++) {
      if (i === 0) continue;
      const sx = cx + i * scale;
      ctx.fillText(String(i), sx, cy + 16);
    }
    ctx.textAlign = "right";
    for (let i = -gridExtent; i <= gridExtent; i++) {
      if (i === 0) continue;
      const sy = cy - i * scale;
      ctx.fillText(String(i), cx - 6, sy + 4);
    }

    // Draw basis vectors (light)
    const basisI = worldToScreen(1, 0, w, h);
    const basisJ = worldToScreen(0, 1, w, h);
    drawArrow(ctx, cx, cy, basisI.sx, basisI.sy, "#cbd5e1", 0.8);
    drawArrow(ctx, cx, cy, basisJ.sx, basisJ.sy, "#cbd5e1", 0.8);

    // v1
    const p1 = worldToScreen(v1.x, v1.y, w, h);
    drawArrow(ctx, cx, cy, p1.sx, p1.sy, "#2563eb", 2.5, "v₁");

    // v2
    const p2 = worldToScreen(v2.x, v2.y, w, h);
    drawArrow(ctx, cx, cy, p2.sx, p2.sy, "#dc2626", 2.5, "v₂");

    // sum
    if (showSum) {
      const sum = vec2Add(v1, v2);
      const pSum = worldToScreen(sum.x, sum.y, w, h);
      drawArrow(ctx, cx, cy, pSum.sx, pSum.sy, "#7c3aed", 2.5, "v₁+v₂");

      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = "#c084fc";
      ctx.lineWidth = 1.2;
      const p1End = { sx: p1.sx, sy: p1.sy };
      ctx.beginPath();
      ctx.moveTo(p1End.sx, p1End.sy);
      ctx.lineTo(pSum.sx, pSum.sy);
      ctx.stroke();

      const p2End = { sx: p2.sx, sy: p2.sy };
      ctx.beginPath();
      ctx.moveTo(p2End.sx, p2End.sy);
      ctx.lineTo(pSum.sx, pSum.sy);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // projection
    if (showProjection) {
      const proj = vec2Scale(v1, (v1.x * v2.x + v1.y * v2.y) / (v1.x * v1.x + v1.y * v1.y + 1e-10));
      const pProj = worldToScreen(proj.x, proj.y, w, h);
      drawArrow(ctx, cx, cy, pProj.sx, pProj.sy, "#10b981", 2, "proj");

      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = "#6ee7b7";
      ctx.lineWidth = 1;
      const v2End = worldToScreen(v2.x, v2.y, w, h);
      ctx.beginPath();
      ctx.moveTo(v2End.sx, v2End.sy);
      ctx.lineTo(pProj.sx, pProj.sy);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // drag handles
    [v1, v2].forEach((v, idx) => {
      const pos = worldToScreen(v.x, v.y, w, h);
      ctx.beginPath();
      ctx.arc(pos.sx, pos.sy, 8, 0, Math.PI * 2);
      ctx.fillStyle = idx === 0 ? "#2563eb" : "#dc2626";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [v1, v2, showSum, showProjection, worldToScreen]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handlePointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const wp = screenToWorld(sx, sy, w, h);

      const d1 = Math.hypot(wp.x - v1Ref.current.x, wp.y - v1Ref.current.y);
      const d2 = Math.hypot(wp.x - v2Ref.current.x, wp.y - v2Ref.current.y);

      if (d1 < 1.5) setDragging("v1");
      else if (d2 < 1.5) setDragging("v2");
      else setDragging(null);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const wp = screenToWorld(sx, sy, w, h);

      if (dragging === "v1") setV1(vec2(wp.x, wp.y));
      if (dragging === "v2") setV2(vec2(wp.x, wp.y));
    };

    const handlePointerUp = () => setDragging(null);

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointerleave", handlePointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointerleave", handlePointerUp);
    };
  }, [dragging, screenToWorld]);

  const sum = vec2Add(v1, v2);
  const dot = v1.x * v2.x + v1.y * v2.y;
  const norm1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const norm2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  const cosAngle = norm1 > 1e-6 && norm2 > 1e-6 ? dot / (norm1 * norm2) : 0;
  const angle = (Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180) / Math.PI;

  return (
    <div className="space-y-3">
      <div className="relative rounded-lg border border-slate-200 bg-white" style={{ height }}>
        <canvas
          ref={canvasRef}
          className="h-full w-full cursor-crosshair touch-none"
          style={{ height: "100%", width: "100%" }}
          aria-label="交互式向量可视化：拖动端点改变向量"
        />
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        <button
          onClick={() => {
            setV1(vec2(initialV1.x, initialV1.y));
            setV2(vec2(initialV2.x, initialV2.y));
          }}
          className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50"
        >
          重置
        </button>
        <button
          onClick={() => setV2(vec2(Math.round(Math.random() * 8 - 4), Math.round(Math.random() * 8 - 4)))}
          className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50"
        >
          随机 v₂
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div className="rounded-md bg-blue-50 p-2">
          <span className="font-medium text-blue-700">v₁</span>
          <span className="ml-1 text-slate-600">({v1.x.toFixed(1)}, {v1.y.toFixed(1)})</span>
        </div>
        <div className="rounded-md bg-red-50 p-2">
          <span className="font-medium text-red-600">v₂</span>
          <span className="ml-1 text-slate-600">({v2.x.toFixed(1)}, {v2.y.toFixed(1)})</span>
        </div>
        <div className="rounded-md bg-violet-50 p-2">
          <span className="font-medium text-violet-600">v₁+v₂</span>
          <span className="ml-1 text-slate-600">({sum.x.toFixed(1)}, {sum.y.toFixed(1)})</span>
        </div>
        <div className="rounded-md bg-slate-50 p-2">
          <span className="font-medium text-slate-500">|v₁|</span>
          <span className="ml-1 text-slate-600">{norm1.toFixed(2)}</span>
          <span className="mx-1 text-slate-400">|</span>
          <span className="font-medium text-slate-500">|v₂|</span>
          <span className="ml-1 text-slate-600">{norm2.toFixed(2)}</span>
        </div>
      </div>

      {showDot && (
        <div className="rounded-md bg-emerald-50 p-2 text-xs">
          <span className="font-medium text-emerald-700">点积 v₁·v₂ = {dot.toFixed(2)}</span>
          <span className="mx-2 text-slate-300">|</span>
          <span className="font-medium text-emerald-700">cosθ = {cosAngle.toFixed(3)}</span>
          <span className="mx-2 text-slate-300">|</span>
          <span className="font-medium text-emerald-700">θ ≈ {angle.toFixed(1)}°</span>
          {Math.abs(dot) < 1e-6 && <span className="ml-2 text-emerald-600">正交 ✓</span>}
        </div>
      )}
    </div>
  );
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  lineWidth: number,
  label?: string
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return;

  const ux = dx / len;
  const uy = dy / len;

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  const arrowSize = Math.min(12, len / 3);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - arrowSize * ux + arrowSize * 0.4 * uy, y2 - arrowSize * uy - arrowSize * 0.4 * ux);
  ctx.lineTo(x2 - arrowSize * ux - arrowSize * 0.4 * uy, y2 - arrowSize * uy + arrowSize * 0.4 * ux);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  if (label) {
    ctx.fillStyle = color;
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "left";
    const lx = x2 + 8 * ux;
    const ly = y2 + 8 * uy;
    ctx.fillText(label, lx, ly);
  }
}
