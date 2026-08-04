import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import { eigenvalues2x2, applyMatrixToShape } from "@/math-engine/linear-algebra/eigenvalues";

interface EigenCanvasProps {
  height?: number;
}

const EIGEN_SHAPE: Array<{ x: number; y: number }> = [
  { x: -1.5, y: -1.5 },
  { x: 1.5, y: -1.5 },
  { x: 1.5, y: 1.5 },
  { x: -1.5, y: 1.5 },
  { x: -1.5, y: -1.5 },
];

export function EigenCanvas({ height = 350 }: EigenCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [a, setA] = useState(2);
  const [b, setB] = useState(1);
  const [c2, setC2] = useState(1);
  const [d, setD] = useState(2);
  const [showEigen, setShowEigen] = useState(true);

  const matrix = useMemo(() => [[a, b], [c2, d]], [a, b, c2, d]);
  const evResult = useMemo(() => eigenvalues2x2(matrix), [matrix]);

  const scale = 55;
  const cx = 220;
  const cy = 185;

  const toCanvas = useCallback(
    (x: number, y: number) => ({ x: cx + x * scale, y: cy - y * scale }),
    [scale, cx, cy]
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
    for (let i = -3; i <= 3; i++) {
      const p = toCanvas(i, 0);
      ctx.beginPath();
      ctx.moveTo(p.x, 0);
      ctx.lineTo(p.x, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, p.y);
      ctx.lineTo(w, p.y);
      ctx.stroke();
    }

    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    const orig = toCanvas(0, 0);
    ctx.beginPath();
    ctx.moveTo(0, orig.y);
    ctx.lineTo(w, orig.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(orig.x, 0);
    ctx.lineTo(orig.x, h);
    ctx.stroke();

    const transformed = applyMatrixToShape(matrix, EIGEN_SHAPE);
    ctx.strokeStyle = "#cbd5e1";
    ctx.fillStyle = "rgba(148, 163, 184, 0.1)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    const sp = toCanvas(EIGEN_SHAPE[0].x, EIGEN_SHAPE[0].y);
    ctx.moveTo(sp.x, sp.y);
    for (let i = 1; i < EIGEN_SHAPE.length; i++) {
      const p = toCanvas(EIGEN_SHAPE[i].x, EIGEN_SHAPE[i].y);
      ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = "#0f172a";
    ctx.fillStyle = "rgba(37, 99, 235, 0.12)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const fp = toCanvas(transformed[0].x, transformed[0].y);
    ctx.moveTo(fp.x, fp.y);
    for (let i = 1; i < transformed.length; i++) {
      const p = toCanvas(transformed[i].x, transformed[i].y);
      ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (showEigen && evResult.eigenvectors.length > 0) {
      evResult.eigenvectors.forEach((ev, i) => {
        const color = i === 0 ? "#7c3aed" : "#db2777";
        const [vx, vy] = ev.vector;
        const norm = Math.sqrt(vx * vx + vy * vy);
        if (norm < 1e-6) return;
        const ux = vx / norm;
        const uy = vy / norm;
        const length = 2.5;
        const sx = toCanvas(-ux * length, -uy * length);
        const tx = toCanvas(ux * length, uy * length);

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(sx.x, sx.y);
        ctx.lineTo(tx.x, tx.y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = "bold 12px sans-serif";
        ctx.fillStyle = color;
        ctx.fillText(
          `λ${i + 1}=${ev.eigenvalue.toFixed(2)}`,
          tx.x + 5,
          tx.y - 8
        );
      });
    }

    ctx.textAlign = "left";
    ctx.fillStyle = "#334155";
    ctx.font = "12px sans-serif";
    ctx.fillText("灰色虚线 = 原正方形", 10, h - 50);
    ctx.fillText("蓝色实线 = 变换后的平行四边形", 10, h - 33);
    if (showEigen && evResult.eigenvectors.length > 0) {
      ctx.fillText("紫色/粉色虚线 = 特征方向（变换前后方向不变）", 10, h - 16);
    }
  }, [a, b, c2, d, evResult, showEigen]);

  useEffect(() => {
    draw();
    const handleResize = () => draw();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [draw]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <span className="text-sm font-semibold text-slate-700">特征值与特征向量</span>
      <p className="mt-1 text-xs text-slate-500">
        观察正方形变换后的形状，特征方向上的点变换后仍在这条线上。
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        {[
          { label: "a", val: a, set: setA },
          { label: "b", val: b, set: setB },
          { label: "c", val: c2, set: setC2 },
          { label: "d", val: d, set: setD },
        ].map(({ label, val, set }) => (
          <div key={label} className="flex items-center gap-1">
            <span className="text-xs text-slate-500 w-3">{label}:</span>
            <input
              type="range"
              min="-3"
              max="3"
              step="0.1"
              value={val}
              onChange={(e) => set(parseFloat(e.target.value))}
              className="w-16"
            />
            <span className="text-xs font-mono w-10">{val.toFixed(1)}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2 flex-wrap">
        <button onClick={() => { setA(2); setB(0); setC2(0); setD(3); }} className="rounded-md border border-slate-300 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-50">
          对角
        </button>
        <button onClick={() => { setA(0); setB(-1); setC2(1); setD(0); }} className="rounded-md border border-slate-300 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-50">
          旋转90°
        </button>
        <button onClick={() => { setA(2); setB(1); setC2(1); setD(2); }} className="rounded-md border border-slate-300 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-50">
          对称
        </button>
        <button onClick={() => { setA(1); setB(1); setC2(0); setD(1); }} className="rounded-md border border-slate-300 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-50">
          剪切
        </button>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <label className="flex items-center gap-1.5 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={showEigen}
            onChange={(e) => setShowEigen(e.target.checked)}
          />
          显示特征方向
        </label>
      </div>
      <canvas
        ref={canvasRef}
        className="mt-3 w-full rounded-lg border border-slate-100 bg-[#fafbfc]"
        style={{ height }}
      />
      {evResult.eigenvalues.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
          {evResult.eigenvalues.map((ev, i) => (
            <span key={i}>
              <span className="font-medium">λ{i + 1}</span> = {ev.value.toFixed(2)}
              {ev.multiplicity > 1 ? ` (重数 ${ev.multiplicity})` : ""}
              {i < evResult.eigenvalues.length - 1 && "，"}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
