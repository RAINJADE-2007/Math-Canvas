"use client";

import { useRef, useEffect, useCallback, useState } from "react";

interface LeastSquaresVisProps {
  height?: number;
}

interface Point {
  x: number;
  y: number;
}

export function LeastSquaresVis({ height = 420 }: LeastSquaresVisProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Point[]>([
    { x: -3, y: -2 }, { x: -1, y: 0 }, { x: 0, y: 1.5 },
    { x: 1, y: 1 }, { x: 2, y: 3 }, { x: 3, y: 4 },
  ]);
  const [slope, setSlope] = useState(1);
  const [intercept, setIntercept] = useState(1.2);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const pointsRef = useRef(points);
  pointsRef.current = points;

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

    const { scale: _s, sx: cx, sy: cy } = toCanvas(0, 0, w, h);

    // Grid
    ctx.strokeStyle = "#f1f5f9";
    ctx.lineWidth = 0.5;
    for (let i = -7; i <= 7; i++) {
      const p1 = toCanvas(i, -7, w, h);
      const p2 = toCanvas(i, 7, w, h);
      ctx.beginPath(); ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy); ctx.stroke();
      const p3 = toCanvas(-7, i, w, h);
      const p4 = toCanvas(7, i, w, h);
      ctx.beginPath(); ctx.moveTo(p3.sx, p3.sy); ctx.lineTo(p4.sx, p4.sy); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();

    // Fit line
    const xMin = -6, xMax = 6;
    const y1 = slope * xMin + intercept;
    const y2 = slope * xMax + intercept;
    const p1 = toCanvas(xMin, y1, w, h);
    const p2 = toCanvas(xMax, y2, w, h);

    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p1.sx, p1.sy);
    ctx.lineTo(p2.sx, p2.sy);
    ctx.stroke();

    // Data points and residuals
    let sse = 0;
    points.forEach((pt) => {
      const pred = slope * pt.x + intercept;
      const residual = pt.y - pred;
      sse += residual * residual;

      const sp = toCanvas(pt.x, pt.y, w, h);
      const pp = toCanvas(pt.x, pred, w, h);

      // Residual line
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = residual > 0 ? "#059669" : "#dc2626";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sp.sx, sp.sy);
      ctx.lineTo(pp.sx, pp.sy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point
      ctx.beginPath();
      ctx.arc(sp.sx, sp.sy, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#7c3aed";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Info
    ctx.fillStyle = "#475569";
    ctx.font = "13px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`y = ${slope.toFixed(2)}x + ${intercept.toFixed(2)}`, 12, 22);
    ctx.fillText(`误差平方和(SSE) = ${sse.toFixed(2)}`, 12, 44);
    ctx.fillText("拖动数据点或调整滑块", 12, 66);
  }, [points, slope, intercept, toCanvas]);

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const wp = fromCanvas(e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height);
      for (let i = 0; i < pointsRef.current.length; i++) {
        const d = Math.hypot(wp.x - pointsRef.current[i].x, wp.y - pointsRef.current[i].y);
        if (d < 0.8) {
          setDraggingIdx(i);
          return;
        }
      }
    };
    const onMove = (e: PointerEvent) => {
      if (draggingIdx === null) return;
      const rect = canvas.getBoundingClientRect();
      const wp = fromCanvas(e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height);
      const newPoints = [...pointsRef.current];
      newPoints[draggingIdx] = { x: wp.x, y: wp.y };
      setPoints(newPoints);
    };
    const onUp = () => setDraggingIdx(null);

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
  }, [draggingIdx, fromCanvas]);

  const autoFit = () => {
    const n = points.length;
    if (n < 2) return;
    let sx = 0, sy = 0, sxx = 0, sxy = 0;
    points.forEach(({ x, y }) => {
      sx += x; sy += y; sxx += x * x; sxy += x * y;
    });
    const denom = n * sxx - sx * sx;
    if (Math.abs(denom) < 1e-10) return;
    const k = (n * sxy - sx * sy) / denom;
    const b = (sy - k * sx) / n;
    setSlope(k);
    setIntercept(b);
  };

  return (
    <div className="space-y-3">
      <div className="relative rounded-lg border border-slate-200 bg-white" style={{ height }}>
        <canvas
          ref={canvasRef}
          className="h-full w-full cursor-crosshair touch-none"
          style={{ height: "100%", width: "100%" }}
          aria-label="最小二乘法可视化：拖动点和直线观察误差变化"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={autoFit}
          className="rounded bg-primary-600 px-3 py-1 text-xs font-medium text-white hover:bg-primary-700"
        >
          自动拟合
        </button>
        <button
          onClick={() => {
            setPoints([
              { x: -3, y: -2 }, { x: -1, y: 0 }, { x: 0, y: 1.5 },
              { x: 1, y: 1 }, { x: 2, y: 3 }, { x: 3, y: 4 },
            ]);
            setSlope(1);
            setIntercept(1.2);
          }}
          className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
        >
          重置
        </button>
        <button
          onClick={() => {
            const newPts: Point[] = [];
            for (let i = 0; i < 8; i++) {
              const x = Math.round(Math.random() * 10 - 5);
              const y = Math.round(x * 0.8 + 1 + (Math.random() - 0.5) * 4);
              newPts.push({ x, y });
            }
            setPoints(newPts);
          }}
          className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
        >
          随机数据
        </button>
        <button
          onClick={() => {
            if (points.length < 2) return;
            setPoints(points.slice(0, -1));
          }}
          className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
        >
          删除点
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">斜率</span>
          <input
            type="range"
            min={-3}
            max={3}
            step={0.05}
            value={slope}
            onChange={(e) => setSlope(parseFloat(e.target.value))}
            className="h-1 w-24 accent-primary-600"
            aria-label="调整斜率"
          />
          <span className="w-10 font-mono text-slate-700">{slope.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500">截距</span>
          <input
            type="range"
            min={-5}
            max={5}
            step={0.05}
            value={intercept}
            onChange={(e) => setIntercept(parseFloat(e.target.value))}
            className="h-1 w-24 accent-primary-600"
            aria-label="调整截距"
          />
          <span className="w-10 font-mono text-slate-700">{intercept.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
