"use client";

import { useRef, useEffect, useCallback, useState } from "react";

interface MatrixCanvasProps {
  initialMatrix?: number[][];
  height?: number;
}

export function MatrixCanvas({
  initialMatrix = [[2, 1], [0.5, 1.5]],
  height = 440,
}: MatrixCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [matrix, setMatrix] = useState(initialMatrix.map((r) => [...r]));

  const draw = useCallback(() => {
    const squarePoints = [
      [0, 0], [1, 0], [1, 1], [0, 1],
    ];
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

    const scale = Math.min(w, h) / 20;
    const cx = w / 2;
    const cy = h / 2;
    const [[a, b], [c, d]] = matrix;

    const toScreen = (x: number, y: number) => ({
      sx: cx + x * scale,
      sy: cy - y * scale,
    });

    // Original grid (faded)
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 0.5;
    for (let i = -6; i <= 6; i++) {
      const pt = toScreen(i, -6);
      const pb = toScreen(i, 6);
      ctx.beginPath();
      ctx.moveTo(pt.sx, pt.sy);
      ctx.lineTo(pb.sx, pb.sy);
      ctx.stroke();
    }
    for (let i = -6; i <= 6; i++) {
      const pl = toScreen(-6, i);
      const pr = toScreen(6, i);
      ctx.beginPath();
      ctx.moveTo(pl.sx, pl.sy);
      ctx.lineTo(pr.sx, pr.sy);
      ctx.stroke();
    }

    // Transformed grid
    ctx.strokeStyle = "#93c5fd";
    ctx.lineWidth = 0.8;
    const gridRange = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
    gridRange.forEach((v) => {
      const pts: Array<[number, number]> = [];
      for (let t = -5; t <= 5; t += 0.2) {
        pts.push([a * v + b * t, c * v + d * t]);
      }
      ctx.beginPath();
      pts.forEach(([tx, ty], idx) => {
        const s = toScreen(tx, ty);
        if (idx === 0) ctx.moveTo(s.sx, s.sy);
        else ctx.lineTo(s.sx, s.sy);
      });
      ctx.stroke();
    });
    gridRange.forEach((v) => {
      const pts: Array<[number, number]> = [];
      for (let t = -5; t <= 5; t += 0.2) {
        pts.push([a * t + b * v, c * t + d * v]);
      }
      ctx.beginPath();
      pts.forEach(([tx, ty], idx) => {
        const s = toScreen(tx, ty);
        if (idx === 0) ctx.moveTo(s.sx, s.sy);
        else ctx.lineTo(s.sx, s.sy);
      });
      ctx.stroke();
    });

    // Axes
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    const origin = toScreen(0, 0);
    ctx.beginPath();
    ctx.moveTo(0, origin.sy);
    ctx.lineTo(w, origin.sy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(origin.sx, 0);
    ctx.lineTo(origin.sx, h);
    ctx.stroke();

    // Transformed basis vectors
    const iEnd = toScreen(a, c);
    const jEnd = toScreen(b, d);
    drawArrow(ctx, origin.sx, origin.sy, iEnd.sx, iEnd.sy, "#2563eb", 3, "i'");
    drawArrow(ctx, origin.sx, origin.sy, jEnd.sx, jEnd.sy, "#dc2626", 3, "j'");

    // Original basis vectors (faded)
    const iOrig = toScreen(1, 0);
    const jOrig = toScreen(0, 1);
    ctx.setLineDash([3, 3]);
    drawArrow(ctx, origin.sx, origin.sy, iOrig.sx, iOrig.sy, "#cbd5e1", 1);
    drawArrow(ctx, origin.sx, origin.sy, jOrig.sx, jOrig.sy, "#cbd5e1", 1);
    ctx.setLineDash([]);

    // Unit square transformed
    const sq = squarePoints.map(([x, y]) => {
      const tx = a * x + b * y;
      const ty = c * x + d * y;
      return toScreen(tx, ty);
    });
    ctx.fillStyle = "rgba(124, 58, 237, 0.15)";
    ctx.beginPath();
    ctx.moveTo(sq[0].sx, sq[0].sy);
    for (let i = 1; i < sq.length; i++) ctx.lineTo(sq[i].sx, sq[i].sy);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#7c3aed";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Labels
    const det = a * d - b * c;
    ctx.fillStyle = "#475569";
    ctx.font = "13px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`det = ${det.toFixed(2)}`, 12, 24);
    ctx.fillText(`面积缩放: ${Math.abs(det).toFixed(2)}`, 12, 44);
    if (det < -0.001) ctx.fillText(`方向: 翻转`, 12, 64);
    else if (det > 0.001) ctx.fillText(`方向: 保持`, 12, 64);
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
    { name: "恒等", matrix: [[1, 0], [0, 1]] },
    { name: "旋转90°", matrix: [[0, -1], [1, 0]] },
    { name: "缩放(2,1.5)", matrix: [[2, 0], [0, 1.5]] },
    { name: "剪切", matrix: [[1, 1], [0, 1]] },
    { name: "镜像", matrix: [[1, 0], [0, -1]] },
    { name: "奇异", matrix: [[1, 2], [2, 4]] },
  ];

  return (
    <div className="space-y-3">
      <div className="relative rounded-lg border border-slate-200 bg-white" style={{ height }}>
        <canvas
          ref={canvasRef}
          className="h-full w-full touch-none"
          style={{ height: "100%", width: "100%" }}
          aria-label="矩阵变换可视化：蓝色箭头是变换后的i基向量，红色是j基向量"
        />
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {presets.map((p) => (
          <button
            key={p.name}
            onClick={() => setMatrix(p.matrix.map((r) => [...r]))}
            className="rounded border border-slate-300 px-2.5 py-1 hover:bg-slate-50"
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="font-medium text-slate-600">M =</span>
        <input
          type="number"
          step={0.1}
          value={matrix[0][0]}
          onChange={(e) => updateCell(0, 0, parseFloat(e.target.value) || 0)}
          className="w-14 rounded border border-slate-300 px-1.5 py-0.5 text-center"
          aria-label="m11"
        />
        <input
          type="number"
          step={0.1}
          value={matrix[0][1]}
          onChange={(e) => updateCell(0, 1, parseFloat(e.target.value) || 0)}
          className="w-14 rounded border border-slate-300 px-1.5 py-0.5 text-center"
          aria-label="m12"
        />
        <span className="mx-1 text-slate-400">|</span>
        <input
          type="number"
          step={0.1}
          value={matrix[1][0]}
          onChange={(e) => updateCell(1, 0, parseFloat(e.target.value) || 0)}
          className="w-14 rounded border border-slate-300 px-1.5 py-0.5 text-center"
          aria-label="m21"
        />
        <input
          type="number"
          step={0.1}
          value={matrix[1][1]}
          onChange={(e) => updateCell(1, 1, parseFloat(e.target.value) || 0)}
          className="w-14 rounded border border-slate-300 px-1.5 py-0.5 text-center"
          aria-label="m22"
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
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(label, x2 + 10 * ux, y2 + 10 * uy);
  }
}
