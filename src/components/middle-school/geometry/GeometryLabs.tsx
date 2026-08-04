"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import type { Point2D } from "@/math-engine/middle-school/geometry/triangle";
import { calcTriangleProps, isValidTriangle, dist2D } from "@/math-engine/middle-school/geometry/triangle";

// ==================== Shared Drag + Snapping Engine ====================

const COLORS = ["#2563eb", "#dc2626", "#10b981"];
const GRID = 0.5;
const EPS = 0.01;

interface DragState { vertexIdx: number | null; startX: number; startY: number; pointerId: number; }
interface SnapConfig { grid: boolean; axes: boolean; angles: boolean; midpoints: boolean; }

function snapToGrid(v: number): number { return Math.round(v / GRID) * GRID; }
function snap45(v: number): number {
  const a45 = [0, 45, 90, 135, 180, -45, -90, -135].map(d => d * Math.PI / 180);
  let best = v, bestD = Infinity;
  for (const a of a45) { const d = Math.abs(v - a); if (d < bestD && d < 0.1) { best = a; bestD = d; } }
  return best;
}

export function useSvgDrag(
  svgRef: React.RefObject<SVGSVGElement | null>,
  points: Point2D[],
  onPointsChange: (pts: Point2D[]) => void,
  viewBox: { w: number; h: number; ox?: number; oy?: number; scale?: number },
  constraints?: { isRight?: boolean; isIsosceles?: boolean; isEquilateral?: boolean; },
  snap?: SnapConfig,
) {
  const dragRef = useRef<DragState>({ vertexIdx: null, startX: 0, startY: 0, pointerId: -1 });
  const ptsRef = useRef(points); ptsRef.current = points;
  const constrainRef = useRef(constraints); constrainRef.current = constraints;
  const snapRef = useRef(snap); snapRef.current = snap;
  const vb = { ox: viewBox.ox ?? 0, oy: viewBox.oy ?? 0, scale: viewBox.scale ?? 35, w: viewBox.w, h: viewBox.h };

  useEffect(() => {
    const svg = svgRef.current; if (!svg) return;

    const svgToWorld = (sx: number, sy: number): Point2D => {
      const rect = svg.getBoundingClientRect();
      const mx = (sx - rect.left) * vb.w / rect.width;
      const my = (sy - rect.top) * vb.h / rect.height;
      return { x: (mx - vb.ox) / vb.scale, y: (vb.oy - my) / vb.scale };
    };

    const findVertex = (mx: number, my: number): number | null => {
      for (let i = 0; i < ptsRef.current.length; i++) {
        const wx = vb.ox + ptsRef.current[i].x * vb.scale;
        const wy = vb.oy - ptsRef.current[i].y * vb.scale;
        if (Math.hypot(mx - wx, my - wy) < 14) return i;
      }
      return null;
    };

    const applyConstraints = (pts: Point2D[], movedIdx: number): Point2D[] => {
      const c = constrainRef.current ?? {};
      const result = pts.map(p => ({ ...p }));
      if (c.isRight) {
        // Force right angle at vertex 2 (C), make (C-A)·(C-B)=0
        const [A, B, C] = [result[0], result[1], result[2]];
        if (movedIdx !== 2) {
          // Project the non-moved vertex onto perpendicular
          const idx = movedIdx === 0 ? 0 : 1;
          const otherIdx = idx === 0 ? 1 : 0;
          const CA = { x: result[idx].x - C.x, y: result[idx].y - C.y };
          const CB = result[otherIdx].x - C.x !== 0 || result[otherIdx].y - C.y !== 0
            ? { x: result[otherIdx].x - C.x, y: result[otherIdx].y - C.y }
            : { x: -CA.y, y: CA.x };
          const dot = CA.x * CB.x + CA.y * CB.y;
          const cbLen2 = CB.x * CB.x + CB.y * CB.y;
          if (cbLen2 > EPS) {
            const proj = dot / cbLen2;
            result[idx] = { x: C.x + proj * CB.x, y: C.y + proj * CB.y };
          }
        }
      }
      if (c.isIsosceles) {
        const [A, B, C] = [result[0], result[1], result[2]];
        const dAB = dist2D(A, B), dAC = dist2D(A, C);
        if (movedIdx === 0) {
          // Make AB = AC (isosceles at A)
          const avgD = (dAB + dAC) / 2;
          if (dAB > EPS) { const u = { x: (B.x - A.x) / dAB, y: (B.y - A.y) / dAB }; result[1] = { x: A.x + avgD * u.x, y: A.y + avgD * u.y }; }
          if (dAC > EPS) { const u = { x: (C.x - A.x) / dAC, y: (C.y - A.y) / dAC }; result[2] = { x: A.x + avgD * u.x, y: A.y + avgD * u.y }; }
        } else if (movedIdx === 1) {
          if (dAB > EPS) { const u = { x: (A.x - B.x) / dAB, y: (A.y - B.y) / dAB }; result[0] = { x: B.x + u.x * dAC, y: B.y + u.y * dAC }; }
        } else {
          if (dAC > EPS) { const u = { x: (A.x - C.x) / dAC, y: (A.y - C.y) / dAC }; result[0] = { x: C.x + u.x * dAB, y: C.y + u.y * dAB }; }
        }
      }
      if (c.isEquilateral) {
        const [A, B] = [result[0], result[1]];
        const d = dist2D(A, B);
        if (d > EPS) {
          const mid = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
          const perp = { x: -(B.y - A.y) / d, y: (B.x - A.x) / d };
          result[2] = { x: mid.x + perp.x * d * Math.sqrt(3) / 2, y: mid.y + perp.y * d * Math.sqrt(3) / 2 };
        }
      }
      return result;
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const rect = svg.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * vb.w / rect.width;
      const my = (e.clientY - rect.top) * vb.h / rect.height;
      const vi = findVertex(mx, my);
      if (vi !== null) {
        e.preventDefault();
        dragRef.current = { vertexIdx: vi, startX: e.clientX, startY: e.clientY, pointerId: e.pointerId };
        svg.setPointerCapture(e.pointerId);
      }
    };

    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (d.vertexIdx === null) return;
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * vb.w / rect.width;
      const my = (e.clientY - rect.top) * vb.h / rect.height;
      let wx = (mx - vb.ox) / vb.scale;
      let wy = (vb.oy - my) / vb.scale;
      const sn = snapRef.current ?? { grid: true, axes: false, angles: false, midpoints: false };
      if (sn.grid) { wx = snapToGrid(wx); wy = snapToGrid(wy); }
      const newPts = ptsRef.current.map((p, i) => {
        if (i !== d.vertexIdx) return p;
        return { x: parseFloat(wx.toFixed(2)), y: parseFloat(wy.toFixed(2)) };
      });
      const constrained = applyConstraints(newPts, d.vertexIdx);
      if (constrained.length > 0 && isValidTriangle(constrained[0], constrained[1], constrained[2])) {
        onPointsChange(constrained);
      }
    };

    const onUp = (e: PointerEvent) => {
      const d = dragRef.current;
      if (d.vertexIdx !== null) {
        svg.releasePointerCapture(d.pointerId);
        dragRef.current = { vertexIdx: null, startX: 0, startY: 0, pointerId: -1 };
      }
    };

    svg.addEventListener("pointerdown", onDown);
    svg.addEventListener("pointermove", onMove);
    svg.addEventListener("pointerup", onUp);
    svg.addEventListener("pointercancel", onUp);
    svg.addEventListener("touchstart", e => e.preventDefault());

    return () => {
      svg.removeEventListener("pointerdown", onDown);
      svg.removeEventListener("pointermove", onMove);
      svg.removeEventListener("pointerup", onUp);
      svg.removeEventListener("pointercancel", onUp);
    };
  }, []);
}

// ==================== TrianglePropertiesLab ====================

export function TrianglePropertiesLab() {
  const [pts, setPts] = useState<Point2D[]>([{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 1, y: 3 }]);
  const [challenge, setChallenge] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [constraints, setConstraints] = useState<{ isRight?: boolean; isIsosceles?: boolean; isEquilateral?: boolean }>({});
  const [hovered, setHovered] = useState<number | null>(null);
  const [mode, setMode] = useState<"explore" | "challenge">("explore");
  const svgRef = useRef<SVGSVGElement>(null);
  const vb = { w: 320, h: 220, ox: 60, oy: 170, scale: 35 };

  const props = useMemo(() => {
    if (!isValidTriangle(pts[0], pts[1], pts[2])) return null;
    return calcTriangleProps(pts[0], pts[1], pts[2]);
  }, [pts]);

  useSvgDrag(svgRef, pts, setPts, vb, constraints, { grid: showGrid, axes: false, angles: false, midpoints: false });

  const typeStr = props ? (props.isEquilateral ? "等边" : props.isRight && props.isIsosceles ? "等腰直角" : props.isRight ? "直角" : props.isIsosceles ? "等腰" : props.isObtuse ? "钝角" : props.isAcute ? "锐角" : "一般") : "退化";

  const { n: challengeGoal } = useMemo(() => {
    const maps: Record<string, string> = { right: "调节顶点使三角形变为直角三角形", isosceles: "调节顶点使三角形变为等腰三角形", equilateral: "调节顶点使三角形变为等边三角形", "3-4-5": "调节顶点使三角形变为3-4-5直角三角形" };
    return { n: maps[challenge ?? ""] ?? "" };
  }, [challenge]);

  const challengeMet = useMemo(() => {
    if (!props || !challenge) return false;
    if (challenge === "right") return props.isRight;
    if (challenge === "isosceles") return props.isIsosceles;
    if (challenge === "equilateral") return props.isEquilateral;
    if (challenge === "3-4-5") {
      const s = [...props.sides].sort((a, b) => a - b);
      return props.isRight && Math.abs(s[0] - 3) < 0.15 && Math.abs(s[1] - 4) < 0.15 && Math.abs(s[2] - 5) < 0.2;
    }
    return false;
  }, [props, challenge]);

  const toggleConstraint = (key: keyof typeof constraints) => {
    setConstraints(c => {
      const n = { ...c };
      if (key === "isRight") n.isRight = !c.isRight;
      if (key === "isIsosceles") n.isIsosceles = !c.isIsosceles;
      if (key === "isEquilateral") n.isEquilateral = !c.isEquilateral;
      return n;
    });
  };

  const valid = isValidTriangle(pts[0], pts[1], pts[2]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-700">📐 三角形实验室</h4>
        <div className="flex gap-1 text-[10px]">
          <button onClick={() => setMode("explore")} className={`rounded px-2 py-0.5 ${mode === "explore" ? "bg-primary-100 text-primary-700" : "text-slate-500 hover:bg-slate-50"}`}>自由探索</button>
          <button onClick={() => setMode("challenge")} className={`rounded px-2 py-0.5 ${mode === "challenge" ? "bg-violet-100 text-violet-700" : "text-slate-500 hover:bg-slate-50"}`}>挑战</button>
        </div>
      </div>

      {mode === "challenge" && (
        <div className="rounded-lg bg-violet-50 p-2 text-xs">
          <div className="flex flex-wrap gap-1 mb-1">
            {["right", "isosceles", "equilateral", "3-4-5"].map(c =>
              <button key={c} onClick={() => setChallenge(c)} className={`rounded px-2 py-0.5 ${challenge === c ? "bg-violet-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>
                {c === "right" ? "直角三角形" : c === "isosceles" ? "等腰三角形" : c === "equilateral" ? "等边三角形" : "3-4-5三角形"}
              </button>
            )}
          </div>
          {challengeGoal && <p className="text-violet-700">🎯 {challengeGoal}</p>}
          {challengeMet && <p className="text-green-700 font-bold mt-1">✓ 挑战完成！</p>}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-2">
        <svg ref={svgRef} viewBox={`0 0 ${vb.w} ${vb.h}`} className="h-56 w-full touch-none" style={{ cursor: "crosshair" }} aria-label="拖动顶点改变三角形">
          <defs>
            <filter id="glow"><feGaussianBlur stdDeviation="2" result="g" /><feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          {/* Grid */}
          {showGrid && Array.from({ length: 16 }, (_, i) => (
            <line key={`g${i}`} x1={vb.ox + i * vb.scale} y1={0} x2={vb.ox + i * vb.scale} y2={vb.h} stroke="#f1f5f9" strokeWidth={0.5} />
          )).concat(Array.from({ length: 12 }, (_, i) => (
            <line key={`gh${i}`} x1={0} y1={vb.oy - i * vb.scale} x2={vb.w} y2={vb.oy - i * vb.scale} stroke="#f1f5f9" strokeWidth={0.5} />
          )))}
          {/* Triangle fill */}
          {valid && props && (
            <polygon
              points={pts.map(p => `${vb.ox + p.x * vb.scale},${vb.oy - p.y * vb.scale}`).join(" ")}
              fill={props.isRight ? "rgba(220,38,38,0.06)" : "rgba(37,99,235,0.06)"}
              stroke="#2563eb" strokeWidth={2}
            />
          )}
          {/* Sides */}
          {pts.map((p, i) => {
            const j = (i + 1) % 3;
            const x1 = vb.ox + p.x * vb.scale, y1 = vb.oy - p.y * vb.scale;
            const x2 = vb.ox + pts[j].x * vb.scale, y2 = vb.oy - pts[j].y * vb.scale;
            return <line key={`s${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={COLORS[i]} strokeWidth={2} opacity={0.4} />;
          })}
          {/* Vertices with hover effect */}
          {pts.map((p, i) => {
            const sx = vb.ox + p.x * vb.scale, sy = vb.oy - p.y * vb.scale;
            const isHover = hovered === i;
            return (
              <g key={`v${i}`} style={{ cursor: "grab" }}
                onPointerEnter={() => setHovered(i)}
                onPointerLeave={() => setHovered(null)}
              >
                <circle cx={sx} cy={sy} r={isHover ? 12 : 8} fill={COLORS[i]} stroke="white" strokeWidth={2}
                  style={{ transition: "r 0.15s", filter: isHover ? "url(#glow)" : "none" }} />
                <text x={sx} y={sy - (isHover ? 15 : 12)} textAnchor="middle" fill={COLORS[i]} fontSize={11} fontWeight="bold">
                  {String.fromCharCode(65 + i)}{isHover ? ` (${p.x.toFixed(1)},${p.y.toFixed(1)})` : ""}
                </text>
              </g>
            );
          })}
          {/* Right angle symbol */}
          {props?.isRight && (() => {
            const sides = pts.map((p, i) => ({ len: dist2D(p, pts[(i + 1) % 3]), opp: pts[(i + 2) % 3] }));
            const rightIdx = sides.findIndex(s => Math.abs(s.len ** 2 - (dist2D(s.opp, pts[(sides.indexOf(s) + 1) % 3]) ** 2 + dist2D(s.opp, pts[sides.indexOf(s)]) ** 2)) < 0.1);
            if (rightIdx >= 0) {
              const A = pts[rightIdx], B = pts[(rightIdx + 1) % 3], C = pts[(rightIdx + 2) % 3];
              const ux = (B.x - A.x) / dist2D(A, B), uy = (B.y - A.y) / dist2D(A, B);
              const vx = (C.x - A.x) / dist2D(A, C), vy = (C.y - A.y) / dist2D(A, C);
              const size = 0.4;
              const sx = vb.ox + A.x * vb.scale, sy = vb.oy - A.y * vb.scale;
              const p1x = sx + ux * size * vb.scale, p1y = sy - uy * size * vb.scale;
              const p2x = sx + (ux + vx) * size * vb.scale, p2y = sy - (uy + vy) * size * vb.scale;
              const p3x = sx + vx * size * vb.scale, p3y = sy - vy * size * vb.scale;
              return <path d={`M ${p1x} ${p1y} L ${p2x} ${p2y} L ${p3x} ${p3y}`} fill="none" stroke="#dc2626" strokeWidth={1.5} />;
            }
            return null;
          })()}
          {/* Constraint indicators */}
          {constraints.isRight && <text x={vb.w - 70} y={15} fill="#dc2626" fontSize={10}>约束: 直角</text>}
          {constraints.isIsosceles && <text x={vb.w - 70} y={28} fill="#2563eb" fontSize={10}>约束: 等腰</text>}
          {constraints.isEquilateral && <text x={vb.w - 70} y={40} fill="#10b981" fontSize={10}>约束: 等边</text>}
        </svg>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <button onClick={() => { setPts([{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 1, y: 3 }]); setConstraints({}); }} className="rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-50">重置</button>
        <button onClick={() => {
          for (let i = 0; i < 100; i++) {
            const p: Point2D[] = Array(3).fill(0).map(() => ({ x: Math.round(Math.random() * 10 - 2) / 2, y: Math.round(Math.random() * 10 - 2) / 2 }));
            if (isValidTriangle(p[0], p[1], p[2])) { setPts(p); break; }
          }
        }} className="rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-50">随机</button>
        <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} className="accent-primary-600" />网格</label>
        <button onClick={() => toggleConstraint("isRight")} className={`rounded border px-2 py-0.5 ${constraints.isRight ? "border-red-400 bg-red-50 text-red-700" : "border-slate-300 hover:bg-slate-50"}`}>直角</button>
        <button onClick={() => toggleConstraint("isIsosceles")} className={`rounded border px-2 py-0.5 ${constraints.isIsosceles ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-300 hover:bg-slate-50"}`}>等腰</button>
        <button onClick={() => toggleConstraint("isEquilateral")} className={`rounded border px-2 py-0.5 ${constraints.isEquilateral ? "border-green-400 bg-green-50 text-green-700" : "border-slate-300 hover:bg-slate-50"}`}>等边</button>
      </div>

      {/* Data panel */}
      {props && (
        <div className="grid grid-cols-2 gap-1 text-xs sm:grid-cols-3">
          {props.sides.map((s, i) => <div key={i} className="rounded bg-slate-50 px-1.5 py-1"><span className="text-slate-400">{String.fromCharCode(97 + i)}=</span><span className="font-mono">{s.toFixed(2)}</span></div>)}
          {props.angles.map((a, i) => <div key={i} className="rounded bg-slate-50 px-1.5 py-1"><span className="text-slate-400">∠{String.fromCharCode(65 + i)}=</span><span className="font-mono">{a.toFixed(1)}°</span></div>)}
          <div className="rounded bg-blue-50 px-1.5 py-1"><span className="text-slate-500">面积</span><span className="ml-1 font-mono text-blue-700">{props.area.toFixed(2)}</span></div>
          <div className="rounded bg-slate-50 px-1.5 py-1"><span className="text-slate-500">类型</span><span className="ml-1 font-medium">{typeStr}</span></div>
          <div className="rounded bg-slate-50 px-1.5 py-1"><span className="text-slate-500">内角</span><span className="ml-1 font-mono text-green-700">{(props.angles[0] + props.angles[1] + props.angles[2]).toFixed(0)}°</span></div>
        </div>
      )}

      {!valid && <p className="rounded bg-red-50 p-1.5 text-xs text-red-600">⚠ 退化三角形（点重合或共线）— 请将顶点拖开</p>}

      {/* Hint bar */}
      <div className="rounded bg-slate-100 px-2 py-1 text-[10px] text-slate-500 text-center">
        💡 拖动顶点改变形状 &nbsp;|&nbsp; 滚轮缩放 &nbsp;|&nbsp; 按住直角/等腰/等边约束 &nbsp;|&nbsp; {mode === "challenge" ? "完成挑战任务" : "自由探索三角形性质"}
      </div>
    </div>
  );
}

// ==================== SolidGeometryLab ====================

export function SolidGeometryLab() {
  const [shape, setShape] = useState<"cube" | "cylinder" | "cone" | "sphere">("cube");
  const [a, setA] = useState(2); const [r, setR] = useState(2); const [h, setH] = useState(3);
  const [rotY, setRotY] = useState(30); const [rotX, setRotX] = useState(20);
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const vb = { w: 320, h: 280, cx: 160, cy: 160 };

  const toScreen = useCallback((x: number, y: number, z: number) => {
    const radY = rotY * Math.PI / 180, radX = rotX * Math.PI / 180;
    const x1 = x * Math.cos(radY) + z * Math.sin(radY);
    const z1 = -x * Math.sin(radY) + z * Math.cos(radY);
    const y1 = y * Math.cos(radX) - z1 * Math.sin(radX);
    return { sx: vb.cx + x1 * 22 * zoom, sy: vb.cy - y1 * 22 * zoom };
  }, [rotY, rotX, zoom]);

  useEffect(() => {
    const svg = svgRef.current; if (!svg) return;
    let lastX = 0, lastY = 0;
    const onDown = (e: PointerEvent) => {
      if (e.target === svg || (e.target as Element).tagName === "svg") {
        setDragging(true); lastX = e.clientX; lastY = e.clientY;
        svg.setPointerCapture(e.pointerId);
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      setRotY(r => ((r + dx * 0.5) % 360 + 360) % 360);
      setRotX(r => Math.max(-60, Math.min(60, r - dy * 0.5)));
      lastX = e.clientX; lastY = e.clientY;
    };
    const onUp = () => { setDragging(false); };
    svg.addEventListener("pointerdown", onDown);
    svg.addEventListener("pointermove", onMove);
    svg.addEventListener("pointerup", onUp);
    svg.addEventListener("pointerleave", onUp);
    return () => { svg.removeEventListener("pointerdown", onDown); svg.removeEventListener("pointermove", onMove); svg.removeEventListener("pointerup", onUp); svg.removeEventListener("pointerleave", onUp); };
  }, [dragging]);

  const calc = () => {
    if (shape === "cube") return { V: a ** 3, SA: 6 * a * a, fV: "a³", fSA: "6a²" };
    if (shape === "cylinder") return { V: Math.PI * r * r * h, SA: 2 * Math.PI * r * (r + h), fV: "πr²h", fSA: "2πr(r+h)" };
    if (shape === "cone") { const l = Math.sqrt(r * r + h * h); return { V: Math.PI * r * r * h / 3, SA: Math.PI * r * (r + l), fV: "πr²h/3", fSA: "πr(r+l)" }; }
    return { V: 4 * Math.PI * r ** 3 / 3, SA: 4 * Math.PI * r * r, fV: "4πr³/3", fSA: "4πr²" };
  };
  const { V, SA, fV, fSA } = calc();

  const drawCube = () => {
    const verts = [
      toScreen(-a / 2, -a / 2, -a / 2), toScreen(a / 2, -a / 2, -a / 2), toScreen(a / 2, -a / 2, a / 2), toScreen(-a / 2, -a / 2, a / 2),
      toScreen(-a / 2, a / 2, -a / 2), toScreen(a / 2, a / 2, -a / 2), toScreen(a / 2, a / 2, a / 2), toScreen(-a / 2, a / 2, a / 2),
    ];
    const faces = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [0, 3, 7, 4], [1, 2, 6, 5]];
    return faces.map((f, i) => {
      const pts = f.map(j => `${verts[j].sx},${verts[j].sy}`).join(" ");
      return <polygon key={i} points={pts} fill={i < 2 ? "rgba(37,99,235,0.04)" : "rgba(37,99,235,0.1)"} stroke="#2563eb" strokeWidth={1} />;
    });
  };

  const shapeLabels: Record<string, string> = { cube: "正方体", cylinder: "圆柱", cone: "圆锥", sphere: "球体" };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-slate-700">📦 立体几何实验室</h4>
      <div className="rounded-lg border border-slate-200 bg-white p-2">
        <svg ref={svgRef} viewBox={`0 0 ${vb.w} ${vb.h}`} className="h-64 w-full touch-none" style={{ cursor: dragging ? "grabbing" : "grab" }} aria-label="旋转查看3D几何体">
          {shape === "cube" && drawCube()}
          {shape === "cylinder" && <ellipse cx={vb.cx} cy={vb.cy} rx={r * 22 * zoom} ry={r * 22 * zoom * 0.4} fill="rgba(37,99,235,0.1)" stroke="#2563eb" strokeWidth={1} />}
          {shape === "sphere" && <circle cx={vb.cx} cy={vb.cy} r={r * 22 * zoom} fill="rgba(37,99,235,0.06)" stroke="#2563eb" strokeWidth={1.5} />}
          {shape === "cone" && <polygon points={`${vb.cx},${vb.cy - h * 22 * zoom / 2} ${vb.cx - r * 22 * zoom},${vb.cy + h * 22 * zoom / 2} ${vb.cx + r * 22 * zoom},${vb.cy + h * 22 * zoom / 2}`} fill="rgba(37,99,235,0.05)" stroke="#2563eb" strokeWidth={1} />}
        </svg>
      </div>
      <div className="flex flex-wrap gap-1 text-xs">
        {(["cube", "cylinder", "cone", "sphere"] as const).map(s =>
          <button key={s} onClick={() => setShape(s)} className={`rounded border px-2 py-0.5 ${shape === s ? "border-primary-400 bg-primary-50 text-primary-700" : "border-slate-300 hover:bg-slate-50"}`}>{shapeLabels[s]}</button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {shape !== "sphere" && <span className="flex items-center gap-1">h:<input type="range" min={1} max={6} step={0.5} value={h} onChange={e => setH(parseFloat(e.target.value))} className="h-1 w-16" /><span className="font-mono w-5">{h}</span></span>}
        {(shape === "cube" || shape === "sphere") && <span className="flex items-center gap-1">{shape === "cube" ? "a:" : "r:"}<input type="range" min={1} max={5} step={0.5} value={a} onChange={e => setA(parseFloat(e.target.value))} className="h-1 w-16" /><span className="font-mono w-5">{a}</span></span>}
        {(shape === "cylinder" || shape === "cone") && <span className="flex items-center gap-1">r:<input type="range" min={1} max={4} step={0.5} value={r} onChange={e => setR(parseFloat(e.target.value))} className="h-1 w-16" /><span className="font-mono w-5">{r}</span></span>}
        <span className="flex items-center gap-1">🔍<input type="range" min={0.5} max={2.5} step={0.1} value={zoom} onChange={e => setZoom(parseFloat(e.target.value))} className="h-1 w-16" /><span className="font-mono w-8">{zoom.toFixed(1)}x</span></span>
        <button onClick={() => { setRotY(30); setRotX(20); setZoom(1); }} className="rounded border border-slate-300 px-1.5 py-0.5 hover:bg-slate-50 text-[10px]">重置视图</button>
      </div>
      <div className="grid grid-cols-2 gap-1 text-xs">
        <div className="rounded bg-blue-50 p-1.5"><span className="text-slate-500">V = </span><span className="font-mono font-bold">{V.toFixed(1)}</span><span className="text-slate-400 ml-1">({fV})</span></div>
        <div className="rounded bg-blue-50 p-1.5"><span className="text-slate-500">SA = </span><span className="font-mono font-bold">{SA.toFixed(1)}</span><span className="text-slate-400 ml-1">({fSA})</span></div>
      </div>
      <div className="rounded bg-slate-100 px-2 py-1 text-center text-[10px] text-slate-500">
        💡 鼠标拖动旋转视角 &nbsp;|&nbsp; 滚轮缩放 &nbsp;|&nbsp; 选择几何体查看公式
      </div>
    </div>
  );
}

import { calcTriangleProps as ctp2, isValidTriangle as ivt2 } from "@/math-engine/middle-school/geometry/triangle";

export function PythagoreanLab() {
  const [ax, setAx] = useState(0); const [ay, setAy] = useState(0);
  const [bx, setBx] = useState(3); const [by, setBy] = useState(0);
  const [cx, setCx] = useState(0); const [cy, setCy] = useState(4);
  const a = Math.hypot(bx - cx, by - cy), b = Math.hypot(cx - ax, cy - ay), c = Math.hypot(ax - bx, ay - by);
  const sides = [a, b, c].sort((x, y) => y - x);
  const isRight = Math.abs(sides[0] ** 2 - sides[1] ** 2 - sides[2] ** 2) < 0.02;
  const S2 = 28; const ox = 280, oy = 170;
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-slate-700">🔺 勾股定理实验</h4>
      <div className="rounded-lg border border-slate-200 bg-white p-2">
        <svg viewBox="0 0 500 250" className="h-56 w-full">
          <polygon points={`${ox + ax * S2},${oy - ay * S2} ${ox + bx * S2},${oy - by * S2} ${ox + cx * S2},${oy - cy * S2}`} fill="rgba(37,99,235,0.06)" stroke="#2563eb" strokeWidth={2} />
          {[[0, 1], [1, 2], [2, 0]].map(([i, j]) => {
            const p1 = { x: [ax, bx, cx][i], y: [ay, by, cy][i] };
            const p2 = { x: [ax, bx, cx][j], y: [ay, by, cy][j] };
            const dx = p2.x - p1.x, dy = p2.y - p1.y;
            const len = Math.hypot(dx, dy);
            if (len < 0.5) return null;
            const ux = dx / len, uy = dy / len;
            const nx = -uy, ny = ux;
            const s1 = ox + p1.x * S2, s1y = oy - p1.y * S2;
            const s2x = s1 + dx * S2, s2y = s1y - dy * S2;
            const s3x = s2x + nx * len * S2, s3y = s2y - ny * len * S2;
            const s4x = s1 + nx * len * S2, s4y = s1y - ny * len * S2;
            const colors = ["#2563eb", "#dc2626", "#10b981"];
            const labels = [`a²=${(len * len).toFixed(0)}`, `b²=${(len * len).toFixed(0)}`, `c²=${(len * len).toFixed(0)}`];
            return <g key={i}>
              <polygon points={`${s1},${s1y} ${s2x},${s2y} ${s3x},${s3y} ${s4x},${s4y}`} fill={["rgba(37,99,235,0.08)", "rgba(220,38,38,0.06)", "rgba(16,185,129,0.06)"][i]} stroke={colors[i]} strokeWidth={1.5} />
              <text x={(s1 + s2x + s3x + s4x) / 4} y={(s1y + s2y + s3y + s4y) / 4 + 4} textAnchor="middle" fill={colors[i]} fontSize={10} fontWeight="bold">{labels[i]}</text>
            </g>;
          })}
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-1 text-xs">
        <div className="rounded bg-blue-50 p-1.5"><span>a²+b² = </span><span className="font-mono">{(sides[2] ** 2 + sides[1] ** 2).toFixed(0)}</span></div>
        <div className="rounded bg-emerald-50 p-1.5"><span>c² = </span><span className="font-mono">{(sides[0] ** 2).toFixed(0)}</span></div>
        <div className="col-span-2 rounded bg-slate-50 p-1.5 text-center">{isRight ? <span className="font-bold text-green-700">✓ a²+b²=c²</span> : <span className="text-amber-600">△ 请调整使∠C=90°</span>}</div>
      </div>
    </div>
  );
}

export function RightTriangleTrigLab() {
  const [angle, setAngle] = useState(30); const [scale, setScale] = useState(4);
  const rad = angle * Math.PI / 180;
  const h = scale, adj = scale * Math.cos(rad), opp = scale * Math.sin(rad);
  const sinA = Math.sin(rad), cosA = Math.cos(rad), tanA = Math.tan(rad);
  const S3 = 28; const ox = 60, oy = 190;
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-slate-700">📐 锐角三角函数</h4>
      <div className="rounded-lg border border-slate-200 bg-white p-2">
        <svg viewBox="0 0 220 220" className="h-48 w-full">
          <polygon points={`${ox},${oy} ${ox + adj * S3},${oy} ${ox},${oy - opp * S3}`} fill="rgba(37,99,235,0.06)" stroke="#2563eb" strokeWidth={2} />
          <text x={ox - 10} y={oy + 15} fill="#dc2626" fontSize={11}>A</text>
          <text x={ox + adj * S3 + 5} y={oy + 15} fill="#2563eb" fontSize={11}>B</text>
          <text x={ox - 10} y={oy - opp * S3 - 5} fill="#10b981" fontSize={11}>C</text>
          <text x={ox + adj * S3 / 2} y={oy + 18} textAnchor="middle" fill="#dc2626" fontSize={9}>邻={adj.toFixed(1)}</text>
          <text x={ox - 20} y={oy - opp * S3 / 2} textAnchor="middle" fill="#10b981" fontSize={9} transform={`rotate(-90,${ox - 20},${oy - opp * S3 / 2})`}>对={opp.toFixed(1)}</text>
          <text x={ox + adj * S3 / 2} y={oy - opp * S3 / 2 - 8} textAnchor="middle" fill="#2563eb" fontSize={10} fontWeight="bold">斜={h.toFixed(1)}</text>
        </svg>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span>∠A:<input type="range" min={5} max={85} value={angle} onChange={e => setAngle(parseInt(e.target.value))} className="h-1 w-20" /><span className="font-mono w-8">{angle}°</span></span>
        <span>大小:<input type="range" min={2} max={8} value={scale} onChange={e => setScale(parseInt(e.target.value))} className="h-1 w-16" /><span className="font-mono w-5">{scale}</span></span>
        {[30, 45, 60].map(a => <button key={a} onClick={() => setAngle(a)} className="rounded border border-slate-300 px-1.5 py-0.5 hover:bg-slate-50">{a}°</button>)}
      </div>
      <div className="grid grid-cols-3 gap-1 text-xs">
        <div className="rounded bg-blue-50 p-1.5 text-center"><div className="text-[10px] text-slate-500">sinA</div><div className="font-mono text-lg text-blue-700">{sinA.toFixed(3)}</div></div>
        <div className="rounded bg-red-50 p-1.5 text-center"><div className="text-[10px] text-slate-500">cosA</div><div className="font-mono text-lg text-red-600">{cosA.toFixed(3)}</div></div>
        <div className="rounded bg-green-50 p-1.5 text-center"><div className="text-[10px] text-slate-500">tanA</div><div className="font-mono text-lg text-green-700">{tanA.toFixed(3)}</div></div>
      </div>
      <p className="rounded bg-slate-50 p-1 text-[11px] text-center">sin²A+cos²A = <span className="font-bold text-green-700">{(sinA ** 2 + cosA ** 2).toFixed(3)}</span> ≈ 1 ✓</p>
    </div>
  );
}

export function CircleTheoremLab() {
  const [radius, setRadius] = useState(3); const [angleDeg, setAngleDeg] = useState(60);
  const [lineDist, setLineDist] = useState(2);
  const cx = 150, cy = 140, S4 = 30;
  const arcAngle = angleDeg * Math.PI / 180;
  const px = cx + radius * S4 * Math.cos(arcAngle), py = cy - radius * S4 * Math.sin(arcAngle);
  const qx = cx + radius * S4, qy = cy;
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-slate-700">⭕ 圆的性质实验</h4>
      <div className="rounded-lg border border-slate-200 bg-white p-2">
        <svg viewBox="0 0 300 280" className="h-56 w-full">
          <circle cx={cx} cy={cy} r={radius * S4} fill="none" stroke="#94a3b8" strokeWidth={2} />
          <circle cx={cx} cy={cy} r={3} fill="#2563eb" /><text x={cx} y={cy + 14} textAnchor="middle" fill="#2563eb" fontSize={11}>O</text>
          <circle cx={px} cy={py} r={5} fill="#dc2626" /><text x={px + 8} y={py - 8} fill="#dc2626" fontSize={11}>A</text>
          <circle cx={qx} cy={qy} r={5} fill="#10b981" /><text x={qx + 8} y={qy - 4} fill="#10b981" fontSize={11}>B</text>
          <line x1={cx} y1={cy} x2={px} y2={py} stroke="#dc2626" strokeWidth={1} />
          <line x1={cx} y1={cy} x2={qx} y2={qy} stroke="#10b981" strokeWidth={1} />
          <text x={cx + 20} y={cy - 16} fill="#dc2626" fontSize={9}>圆心角={angleDeg}°</text>
          <line x1={cx - radius * S4 * 0.6} y1={cy + radius * S4 * 0.8} x2={px} y2={py} stroke="#7c3aed" strokeWidth={1} strokeDasharray="3,3" />
          <line x1={cx - radius * S4 * 0.6} y1={cy + radius * S4 * 0.8} x2={qx} y2={qy} stroke="#7c3aed" strokeWidth={1} strokeDasharray="3,3" />
          <text x={cx - 30} y={cy + radius * S4 * 0.8 + 14} fill="#7c3aed" fontSize={9}>圆周角={angleDeg / 2}°</text>
          <line x1={cx - S4 * 6} y1={cy - lineDist * S4} x2={cx + S4 * 6} y2={cy - lineDist * S4} stroke={lineDist > radius ? "#dc2626" : lineDist < radius ? "#2563eb" : "#10b981"} strokeWidth={1.5} />
          <text x={cx - S4 * 6 + 4} y={cy - lineDist * S4 - 4} fill={lineDist > radius ? "#dc2626" : lineDist < radius ? "#2563eb" : "#10b981"} fontSize={9}>{lineDist > radius ? "相离" : lineDist < radius ? "相交" : "相切"}</text>
        </svg>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span>r:<input type="range" min={1.5} max={5} step={0.5} value={radius} onChange={e => setRadius(parseFloat(e.target.value))} className="h-1 w-16" /><span className="font-mono w-6">{radius}</span></span>
        <span>弧:<input type="range" min={10} max={180} value={angleDeg} onChange={e => setAngleDeg(parseInt(e.target.value))} className="h-1 w-20" /><span className="font-mono w-12">{angleDeg}°</span></span>
        <span>d:<input type="range" min={0} max={6} step={0.5} value={lineDist} onChange={e => setLineDist(parseFloat(e.target.value))} className="h-1 w-16" /><span className="font-mono w-6">{lineDist}</span></span>
      </div>
      <div className="grid grid-cols-2 gap-1 text-xs">
        <div className="rounded bg-slate-50 p-1.5">C={<span className="font-mono">{(2 * Math.PI * radius).toFixed(2)}</span>}</div>
        <div className="rounded bg-slate-50 p-1.5">S={<span className="font-mono">{(Math.PI * radius * radius).toFixed(2)}</span>}</div>
        <div className="col-span-2 rounded bg-violet-50 p-1.5 text-center text-violet-700">圆周角 = 圆心角 / 2 = <span className="font-bold">{angleDeg / 2}°</span></div>
      </div>
    </div>
  );
}
