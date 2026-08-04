"use client";

import { useRef, useEffect, useCallback, useState, useMemo } from "react";

interface LeastSquaresCanvasProps {
  height?: number;
}

export function LeastSquaresCanvas({ height = 320 }: LeastSquaresCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Array<{ x: number; y: number }>>([
    { x: 1, y: 1.2 }, { x: 2, y: 1.9 }, { x: 3, y: 2.8 }, { x: 4, y: 4.1 }, { x: 5, y: 4.8 },
  ]);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  const { slope, intercept } = useMemo(() => {
    const n = points.length;
    let sx = 0, sy = 0, sxy = 0, sx2 = 0;
    for (const p of points) {
      sx += p.x;
      sy += p.y;
      sxy += p.x * p.y;
      sx2 += p.x * p.x;
    }
    const m = (n * sxy - sx * sy) / (n * sx2 - sx * sx);
    const b = (sy - m * sx) / n;
    return { slope: m, intercept: b };
  }, [points]);

  const sx = 50;
  const cx = 50;
  const cy = 260;

  const toCanvas = useCallback(
    (x: number, y: number) => ({ x: cx + x * sx, y: cy - y * sx }),
    [sx, cx, cy]
  );

  const toWorld = useCallback(
    (px: number, py: number) => ({ x: (px - cx) / sx, y: (cy - py) / sx }),
    [sx, cx, cy]
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * window.devicePixelRatio;
    canvas.height = h * window.devicePixelRatio;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 6; i++) {
      const p = toCanvas(i, 0);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 5);
      ctx.lineTo(p.x, p.y + 5);
      ctx.stroke();
      ctx.fillStyle = "#64748b";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(i.toString(), p.x, p.y + 16);
    }
    for (let i = 0; i <= 6; i++) {
      const p = toCanvas(0, i);
      ctx.fillText(i.toString(), p.x - 14, p.y + 4);
    }

    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 1.5;
    const orig = toCanvas(0, 0);
    ctx.beginPath();
    ctx.moveTo(orig.x, orig.y);
    ctx.lineTo(toCanvas(6, 0).x, toCanvas(6, 0).y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(orig.x, orig.y);
    ctx.lineTo(toCanvas(0, 6).x, toCanvas(0, 6).y);
    ctx.stroke();

    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const x1 = 0;
    const y1 = slope * x1 + intercept;
    const x2 = 6;
    const y2 = slope * x2 + intercept;
    const p1 = toCanvas(x1, y1);
    const p2 = toCanvas(x2, y2);
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    ctx.fillStyle = "#7c3aed";
    points.forEach((pt) => {
      const p = toCanvas(pt.x, pt.y);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.strokeStyle = "#dc2626";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      const lineY = slope * pt.x + intercept;
      const lp = toCanvas(pt.x, lineY);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(lp.x, lp.y);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    ctx.fillStyle = "#334155";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(
      `拟合直线: y = ${slope.toFixed(3)}x ${intercept >= 0 ? "+" : ""} ${intercept.toFixed(3)}`,
      10,
      20
    );
  }, [points, slope, intercept]);

  useEffect(() => {
    draw();
    const handleResize = () => draw();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [draw]);

  const getEventPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
    const clientY = "touches" in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getEventPos(e);
    if (!pos) return;
    for (let i = 0; i < points.length; i++) {
      const p = toCanvas(points[i].x, points[i].y);
      if (Math.hypot(pos.x - p.x, pos.y - p.y) < 12) {
        setDraggingIdx(i);
        return;
      }
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (draggingIdx === null) return;
    const pos = getEventPos(e);
    if (!pos) return;
    const wp = toWorld(pos.x, pos.y);
    const clamped = {
      x: Math.max(0, Math.min(6, wp.x)),
      y: Math.max(0, Math.min(6, wp.y)),
    };
    setPoints((prev) => {
      const next = [...prev];
      next[draggingIdx] = {
        x: parseFloat(clamped.x.toFixed(2)),
        y: parseFloat(clamped.y.toFixed(2)),
      };
      return next;
    });
  };

  const randomize = () => {
    setPoints(
      Array.from({ length: 5 }, () => ({
        x: parseFloat((Math.random() * 5 + 0.5).toFixed(1)),
        y: parseFloat((Math.random() * 4 + 0.5).toFixed(1)),
      }))
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <span className="text-sm font-semibold text-slate-700">最小二乘拟合</span>
      <p className="mt-1 text-xs text-slate-500">
        拖动数据点观察拟合直线的变化。红色虚线表示每个点的误差（残差）。
      </p>
      <div className="mt-2">
        <button onClick={randomize} className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50">
          随机数据
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="mt-2 w-full rounded-lg border border-slate-100 bg-[#fafbfc]"
        style={{ height, touchAction: "none" }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={() => setDraggingIdx(null)}
        onMouseLeave={() => setDraggingIdx(null)}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={() => setDraggingIdx(null)}
      />
    </div>
  );
}
