"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { computeEigen22 } from "@/math-engine/linear-algebra/eigenvalues";

interface EigenVisProps {
  initialMatrix?: number[][];
  height?: number;
}

export function EigenVis({ initialMatrix = [[2, 1], [0, 3]], height = 400 }: EigenVisProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [matrix, setMatrix] = useState(initialMatrix.map((r) => [...r]));
  const [angle, setAngle] = useState(30);
  const dragging = useRef(false);

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

    const scale = Math.min(w, h) / 16;
    const cx = w / 2;
    const cy = h / 2;
    const [[a, b], [c, d]] = matrix;

    const toScreen = (x: number, y: number) => ({ sx: cx + x * scale, sy: cy - y * scale });

    // Grid
    ctx.strokeStyle = "#f1f5f9";
    ctx.lineWidth = 0.5;
    for (let i = -8; i <= 8; i++) {
      const p1 = toScreen(i, -8);
      const p2 = toScreen(i, 8);
      ctx.beginPath();
      ctx.moveTo(p1.sx, p1.sy);
      ctx.lineTo(p2.sx, p2.sy);
      ctx.stroke();
      const p3 = toScreen(-8, i);
      const p4 = toScreen(8, i);
      ctx.beginPath();
      ctx.moveTo(p3.sx, p3.sy);
      ctx.lineTo(p4.sx, p4.sy);
      ctx.stroke();
    }

    const origin = toScreen(0, 0);

    // Axes
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, origin.sy);
    ctx.lineTo(w, origin.sy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(origin.sx, 0);
    ctx.lineTo(origin.sx, h);
    ctx.stroke();

    // User-draggable vector
    const rad = (angle * Math.PI) / 180;
    const vx = 3 * Math.cos(rad);
    const vy = 3 * Math.sin(rad);
    const tvx = a * vx + b * vy;
    const tvy = c * vx + d * vy;

    const vScreen = toScreen(vx, vy);
    const tvScreen = toScreen(tvx, tvy);

    // Original vector
    drawArrow(ctx, origin.sx, origin.sy, vScreen.sx, vScreen.sy, "#2563eb", 2.5, "v");

    // Transformed vector
    drawArrow(ctx, origin.sx, origin.sy, tvScreen.sx, tvScreen.sy, "#dc2626", 2.5, "Av");

    // Angle arc
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(origin.sx, origin.sy, 30, -rad, -Math.atan2(tvy, tvx), true);
    ctx.stroke();
    ctx.setLineDash([]);

    // Eigen info
    const eigenResult = computeEigen22(matrix);
    const evs = eigenResult.eigenvectors.filter((ev) => ev.vector[0] !== 0 || ev.vector[1] !== 0);

    // Draw eigenvector directions
    evs.forEach((ev, idx) => {
      const eColor = idx === 0 ? "#7c3aed" : "#10b981";
      const len = 5;
      const nv = Math.sqrt(ev.vector[0] ** 2 + ev.vector[1] ** 2);
      if (nv < 1e-6) return;
      const ux = (ev.vector[0] / nv) * len;
      const uy = (ev.vector[1] / nv) * len;
      const tux = a * ux + b * uy;
      const tuy = c * ux + d * uy;

      const s1 = toScreen(ux, uy);
      const s2 = toScreen(tux, tuy);

      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = eColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(origin.sx, origin.sy);
      ctx.lineTo(s1.sx, s1.sy);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.strokeStyle = eColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(origin.sx, origin.sy);
      ctx.lineTo(s2.sx, s2.sy);
      ctx.stroke();

      ctx.fillStyle = eColor;
      ctx.font = "11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`λ${idx + 1}=${ev.eigenvalue.toFixed(1)}`, s1.sx + 6, s1.sy);
    });

    // Info
    ctx.fillStyle = "#475569";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("拖动滑块改变输入向量方向", 12, 24);
    ctx.fillText("蓝色=v, 红色=Av", 12, 44);
    if (Math.abs(tvx * vy - tvy * vx) < 0.01) {
      ctx.fillStyle = "#059669";
      ctx.fillText("方向一致 → 接近特征向量!", 12, 64);
    }
  }, [matrix, angle]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handlePointerDown = () => {
    dragging.current = true;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const rect = canvas.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dx = e.clientX - rect.left - cx;
      const dy = cy - (e.clientY - rect.top);
      setAngle((Math.atan2(dy, dx) * 180) / Math.PI);
    };
    const handleUp = () => {
      dragging.current = false;
    };

    canvas.addEventListener("pointermove", handleMove);
    canvas.addEventListener("pointerup", handleUp);
    canvas.addEventListener("pointerleave", handleUp);

    return () => {
      canvas.removeEventListener("pointermove", handleMove);
      canvas.removeEventListener("pointerup", handleUp);
      canvas.removeEventListener("pointerleave", handleUp);
    };
  }, []);

  const eigenResult = computeEigen22(matrix);
  const updateCell = (r: number, c: number, val: number) => {
    const m = matrix.map((row) => [...row]);
    m[r][c] = val;
    setMatrix(m);
  };

  return (
    <div className="space-y-3">
      <div className="relative rounded-lg border border-slate-200 bg-white" style={{ height }}>
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          className="h-full w-full cursor-grab touch-none"
          style={{ height: "100%", width: "100%" }}
          aria-label="特征向量可视化：拖动方向找出方向不变的向量"
        />
      </div>

      <div className="flex items-center gap-3 text-xs">
        <span className="text-slate-500">角度: {angle.toFixed(0)}°</span>
        <input
          type="range"
          min={0}
          max={360}
          value={angle}
          onChange={(e) => setAngle(parseInt(e.target.value))}
          className="h-1 flex-1 appearance-none rounded bg-slate-200 accent-primary-600"
          aria-label="调整向量角度"
        />
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="font-medium text-slate-600">A =</span>
        <input
          type="number"
          step={0.1}
          value={matrix[0][0]}
          onChange={(e) => updateCell(0, 0, parseFloat(e.target.value) || 0)}
          className="w-14 rounded border border-slate-300 px-1.5 py-0.5 text-center"
          aria-label="a11"
        />
        <input
          type="number"
          step={0.1}
          value={matrix[0][1]}
          onChange={(e) => updateCell(0, 1, parseFloat(e.target.value) || 0)}
          className="w-14 rounded border border-slate-300 px-1.5 py-0.5 text-center"
          aria-label="a12"
        />
        <span className="mx-1 text-slate-400">|</span>
        <input
          type="number"
          step={0.1}
          value={matrix[1][0]}
          onChange={(e) => updateCell(1, 0, parseFloat(e.target.value) || 0)}
          className="w-14 rounded border border-slate-300 px-1.5 py-0.5 text-center"
          aria-label="a21"
        />
        <input
          type="number"
          step={0.1}
          value={matrix[1][1]}
          onChange={(e) => updateCell(1, 1, parseFloat(e.target.value) || 0)}
          className="w-14 rounded border border-slate-300 px-1.5 py-0.5 text-center"
          aria-label="a22"
        />
      </div>

      {eigenResult.eigenvalues.length > 0 && (
        <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
          {eigenResult.eigenvalues.map((ev, i) => (
            <div key={i} className="rounded-md bg-slate-50 p-2">
              <span className="font-medium text-primary-700">λ{i + 1}</span>
              <span className="ml-1 text-slate-600">= {ev.latex}</span>
              {i < eigenResult.eigenvectors.length && (
                <span className="ml-2 font-mono text-slate-500">
                  v={eigenResult.eigenvectors[i].vector.map((x) => x.toFixed(2)).join(", ")}
                </span>
              )}
            </div>
          ))}
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
  if (len < 2 && label) {
    ctx.fillStyle = color;
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(label, x2, y2);
    return;
  }
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
    ctx.fillText(label, x2 + 10 * ux, y2 + 10 * uy);
  }
}
