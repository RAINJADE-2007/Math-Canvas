import { useRef, useEffect, useCallback, useState } from "react";
import { determinantVsArea } from "@/math-engine/linear-algebra/determinant";
import { EXPRESSION_COLORS } from "@/constants/colors";

interface DetCanvasProps {
  height?: number;
}

export function DetCanvas({ height = 350 }: DetCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [a, setA] = useState(2);
  const [b, setB] = useState(0.5);
  const [c2, setC2] = useState(0.5);
  const [d, setD] = useState(1.5);

  const matrix = [[a, b], [c2, d]];
  const { det, basis1, basis2, orientation } = determinantVsArea(matrix);

  const scale = 50;
  const cx = 200;
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
    for (let i = -4; i <= 4; i++) {
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

    const u1 = toCanvas(1, 0);
    const u2 = toCanvas(0, 1);

    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(orig.x, orig.y);
    ctx.lineTo(u1.x, u1.y);
    ctx.lineTo(toCanvas(1, 1).x, toCanvas(1, 1).y);
    ctx.lineTo(u2.x, u2.y);
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = "#94a3b8";
    ctx.fill();

    ctx.globalAlpha = 1;

    const v1 = toCanvas(basis1.x, basis1.y);
    const v2 = toCanvas(basis2.x, basis2.y);
    const sum = toCanvas(basis1.x + basis2.x, basis1.y + basis2.y);

    ctx.beginPath();
    ctx.moveTo(orig.x, orig.y);
    ctx.lineTo(v1.x, v1.y);
    ctx.lineTo(sum.x, sum.y);
    ctx.lineTo(v2.x, v2.y);
    ctx.closePath();

    const areaColor = orientation === "reversed" ? "#fef2f2" : orientation === "degenerate" ? "#f8fafc" : "#f0fdf4";
    ctx.fillStyle = areaColor;
    ctx.fill();

    ctx.strokeStyle = orientation === "reversed" ? "#dc2626" : orientation === "degenerate" ? "#94a3b8" : "#059669";
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.stroke();

    const drawArrow = (fromX: number, fromY: number, toX: number, toY: number, color: string, label: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      const angle = Math.atan2(-(toY - fromY), toX - fromX);
      const r = 8;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(
        toX - r * Math.cos(angle - Math.PI / 6),
        toY - r * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        toX - r * Math.cos(angle + Math.PI / 6),
        toY - r * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();

      ctx.font = "bold 13px sans-serif";
      ctx.fillText(label, toX + 6, toY - 6);
    };

    drawArrow(orig.x, orig.y, v1.x, v1.y, EXPRESSION_COLORS[0], "v₁");
    drawArrow(orig.x, orig.y, v2.x, v2.y, EXPRESSION_COLORS[1], "v₂");

    ctx.fillStyle = "#0f172a";
    ctx.font = "13px sans-serif";
    ctx.textAlign = "left";
    const area = Math.abs(det);
    ctx.fillText(
      `面积 = |det(A)| = |${det.toFixed(2)}| = ${area.toFixed(2)}`,
      10,
      h - 40
    );
    const orientText =
      orientation === "preserved" ? "定向保持 (det > 0)" :
      orientation === "reversed" ? "定向翻转 (det < 0)" :
      "退化 (det = 0)";
    ctx.fillStyle = orientation === "reversed" ? "#dc2626" : orientation === "degenerate" ? "#94a3b8" : "#059669";
    ctx.fillText(orientText, 10, h - 20);
  }, [a, b, c2, d, det, basis1, basis2, orientation]);

  useEffect(() => {
    draw();
    const handleResize = () => draw();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [draw]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <span className="text-sm font-semibold text-slate-700">行列式与面积</span>
      <p className="mt-1 text-xs text-slate-500">
        拖动滑块调整矩阵元素，观察平行四边形面积和行列式的关系。
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
      <div className="mt-2 flex gap-2 flex-wrap">
        <button onClick={() => { setA(2); setB(0); setC2(0); setD(2); }} className="rounded-md border border-slate-300 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-50">
          det=4
        </button>
        <button onClick={() => { setA(2); setB(1); setC2(1); setD(2); }} className="rounded-md border border-slate-300 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-50">
          det=3
        </button>
        <button onClick={() => { setA(1); setB(2); setC2(2); setD(4); }} className="rounded-md border border-slate-300 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-50">
          det≈0
        </button>
        <button onClick={() => { setA(-2); setB(0); setC2(0); setD(1); }} className="rounded-md border border-slate-300 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-50">
          det=-2
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="mt-3 w-full rounded-lg border border-slate-100 bg-[#fafbfc]"
        style={{ height }}
      />
      <p className="mt-2 text-xs text-slate-400">
        灰色虚线 = 原单位正方形，彩色箭头 = 列向量v₁,v₂，彩色平行四边形面积 = |det|
      </p>
    </div>
  );
}
