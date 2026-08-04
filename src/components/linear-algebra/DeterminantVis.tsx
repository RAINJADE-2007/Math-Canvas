"use client";

import { useRef, useEffect, useCallback, useState } from "react";

interface DeterminantVisProps {
  initialMatrix?: number[][];
  height?: number;
}

export function DeterminantVis({
  initialMatrix = [[2, 1], [0.5, 1.5]],
  height = 400,
}: DeterminantVisProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [matrix, setMatrix] = useState(initialMatrix.map((r) => [...r]));

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

    const scale = Math.min(w, h) / 18;
    const cx = w / 2;
    const cy = h / 2;
    const [[a, b], [c, d]] = matrix;
    const det = a * d - b * c;

    const toScreen = (x: number, y: number) => ({ sx: cx + x * scale, sy: cy - y * scale });

    // Grid
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 0.5;
    for (let i = -6; i <= 6; i++) {
      const p1 = toScreen(i, -6);
      const p2 = toScreen(i, 6);
      ctx.beginPath();
      ctx.moveTo(p1.sx, p1.sy);
      ctx.lineTo(p2.sx, p2.sy);
      ctx.stroke();
    }
    for (let i = -6; i <= 6; i++) {
      const p1 = toScreen(-6, i);
      const p2 = toScreen(6, i);
      ctx.beginPath();
      ctx.moveTo(p1.sx, p1.sy);
      ctx.lineTo(p2.sx, p2.sy);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    const origin = toScreen(0, 0);
    ctx.beginPath();
    ctx.moveTo(0, origin.sy);
    ctx.lineTo(w, origin.sy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(origin.sx, 0);
    ctx.lineTo(origin.sx, h);
    ctx.stroke();

    // Vectors making up the matrix columns
    const v1 = toScreen(a, c);
    const v2 = toScreen(b, d);

    // Parallelogram fill
    ctx.fillStyle = det >= 0 ? "rgba(37, 99, 235, 0.12)" : "rgba(220, 38, 38, 0.12)";
    ctx.beginPath();
    ctx.moveTo(origin.sx, origin.sy);
    ctx.lineTo(v1.sx, v1.sy);
    ctx.lineTo(v1.sx + (v2.sx - origin.sx), v1.sy + (v2.sy - origin.sy));
    ctx.lineTo(v2.sx, v2.sy);
    ctx.closePath();
    ctx.fill();

    // Parallelogram outline
    ctx.strokeStyle = det >= 0 ? "#2563eb" : "#dc2626";
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(origin.sx, origin.sy);
    ctx.lineTo(v1.sx, v1.sy);
    ctx.lineTo(v1.sx + (v2.sx - origin.sx), v1.sy + (v2.sy - origin.sy));
    ctx.lineTo(v2.sx, v2.sy);
    ctx.closePath();
    ctx.stroke();

    // Vectors
    drawArrow(ctx, origin.sx, origin.sy, v1.sx, v1.sy, "#2563eb", 2.5, "列1");
    drawArrow(ctx, origin.sx, origin.sy, v2.sx, v2.sy, "#dc2626", 2.5, "列2");

    // Unit square (faded)
    const unitX = toScreen(1, 0);
    const unitY = toScreen(0, 1);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.strokeRect(origin.sx, unitY.sy, unitX.sx - origin.sx, unitY.sy - origin.sy);
    ctx.setLineDash([]);

    // Info
    ctx.fillStyle = "#475569";
    ctx.font = "13px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`det = ${det.toFixed(2)}`, 12, 24);
    ctx.fillText(`面积 = ${Math.abs(det).toFixed(2)}`, 12, 44);
    if (det < -0.001) ctx.fillText("方向已翻转", 12, 64);
    if (Math.abs(det) < 0.001) ctx.fillText("退化: 降维", 12, 64);
  }, [matrix]);

  useEffect(() => {
    draw();
  }, [draw]);

  const updateCell = (r: number, c: number, val: number) => {
    const m = matrix.map((row) => [...row]);
    m[r][c] = val;
    setMatrix(m);
  };

  const presets = [
    { label: "面积=4", m: [[2, 1], [1, 2]] },
    { label: "面积=0", m: [[1, 2], [2, 4]] },
    { label: "翻转", m: [[0, 1], [1, 0]] },
    { label: "零", m: [[0, 0], [0, 0]] },
    { label: "负面积", m: [[-1, 2], [3, 1]] },
  ];

  return (
    <div className="space-y-3">
      <div className="relative rounded-lg border border-slate-200 bg-white" style={{ height }}>
        <canvas
          ref={canvasRef}
          className="h-full w-full touch-none"
          style={{ height: "100%", width: "100%" }}
          aria-label="行列式可视化：平行四边形面积 = |det|"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => setMatrix(p.m.map((r) => [...r]))}
            className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="font-medium text-slate-600">列向量：</span>
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
          value={matrix[1][0]}
          onChange={(e) => updateCell(1, 0, parseFloat(e.target.value) || 0)}
          className="w-14 rounded border border-slate-300 px-1.5 py-0.5 text-center"
          aria-label="a21"
        />
        <span className="mx-1 text-slate-400">|</span>
        <input
          type="number"
          step={0.1}
          value={matrix[0][1]}
          onChange={(e) => updateCell(0, 1, parseFloat(e.target.value) || 0)}
          className="w-14 rounded border border-slate-300 px-1.5 py-0.5 text-center"
          aria-label="a12"
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
