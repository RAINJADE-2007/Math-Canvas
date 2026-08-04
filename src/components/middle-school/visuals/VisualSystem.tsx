"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";

import { getVisConfig, type GeometryVisualType } from "@/math-engine/middle-school/geometry/visual-config";
import { TrianglePropertiesLab, PythagoreanLab, RightTriangleTrigLab, CircleTheoremLab, SolidGeometryLab } from "@/components/middle-school/geometry/GeometryLabs";

export type VisualType =
  | "number-line"
  | "algebra-tiles"
  | "inequality-line"
  | "function-graph"
  | "geometry-board"
  | "unit-circle"
  | "vector-plane"
  | "statistics-chart"
  | "probability-sim"
  | "derivative-lab"
  | "logic-diagram"
  | "conic-section"
  | "trig-graph"
  | "equation-balance"
  | "counting-tree";

export interface VisConfig {
  type: VisualType;
  title: string;
  learningGoal: string;
  instructions: string[];
  observations: string[];
  questions: string[];
  conclusion: string;
}

// ===================== Number Line Lab =====================

export function NumberLineLab() {
  const [a, setA] = useState(-2);
  const [b, setB] = useState(3);

  return (
    <div className="space-y-3">
      <div className="relative rounded-lg border border-slate-200 bg-white p-4">
        <h4 className="mb-2 text-sm font-medium text-slate-700">🔢 数轴交互实验</h4>
        <div className="mt-3 flex items-center justify-center">
          <svg viewBox="0 0 600 100" className="h-20 w-full" aria-label="交互数轴">
            <line x1={20} y1={50} x2={580} y2={50} stroke="#94a3b8" strokeWidth={2} />
            {[-5,-4,-3,-2,-1,0,1,2,3,4,5].map(n => (
              <g key={n}><line x1={300+n*50} y1={45} x2={300+n*50} y2={55} stroke="#64748b" strokeWidth={1.5} />
                <text x={300+n*50} y={70} textAnchor="middle" fill="#475569" fontSize={11}>{n}</text></g>
            ))}
            {/* Point A */}
            <circle cx={300+a*50} cy={50} r={6} fill="#2563eb" />
            <text x={300+a*50} y={38} textAnchor="middle" fill="#2563eb" fontSize={12} fontWeight="bold">A({a})</text>
            {/* Point B */}
            <circle cx={300+b*50} cy={50} r={6} fill="#dc2626" />
            <text x={300+b*50} y={38} textAnchor="middle" fill="#dc2626" fontSize={12} fontWeight="bold">B({b})</text>
            {/* Distance */}
            <line x1={300+Math.min(a,b)*50} y1={42} x2={300+Math.max(a,b)*50} y2={42} stroke="#10b981" strokeWidth={2} />
            <text x={300+(a+b)/2*50} y={85} textAnchor="middle" fill="#059669" fontSize={11}>|A-B|={Math.abs(a-b)}</text>
          </svg>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-blue-600 font-medium">A:</span>
          <input type="range" min={-5} max={5} step={0.5} value={a} onChange={e => setA(parseFloat(e.target.value))} className="h-1 w-24 accent-blue-600" />
          <span className="w-8 font-mono text-slate-700">{a}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-red-600 font-medium">B:</span>
          <input type="range" min={-5} max={5} step={0.5} value={b} onChange={e => setB(parseFloat(e.target.value))} className="h-1 w-24 accent-red-600" />
          <span className="w-8 font-mono text-slate-700">{b}</span>
        </div>
        <button onClick={() => { setA(-2); setB(3); }} className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50">重置</button>
        <button onClick={() => { setA(Math.round(Math.random()*10-5)); setB(Math.round(Math.random()*10-5)); }} className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50">随机</button>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-md bg-slate-50 p-2"><span className="text-slate-500">|A| = </span><span className="font-mono text-slate-700">{Math.abs(a)}</span></div>
        <div className="rounded-md bg-slate-50 p-2"><span className="text-slate-500">|B| = </span><span className="font-mono text-slate-700">{Math.abs(b)}</span></div>
        <div className="rounded-md bg-emerald-50 p-2"><span className="text-emerald-700">距离 = {Math.abs(a-b)}</span></div>
      </div>
      {a < b
        ? <p className="rounded-md bg-blue-50 p-2 text-xs text-blue-700">{a} &lt; {b} — 数轴上右边的数更大 ✓</p>
        : a > b
        ? <p className="rounded-md bg-blue-50 p-2 text-xs text-blue-700">{a} &gt; {b} — 数轴上右边的数更大 ✓</p>
        : <p className="rounded-md bg-amber-50 p-2 text-xs text-amber-700">A = B — 两个数相等</p>
      }
    </div>
  );
}

// ===================== Algebra Tiles Lab =====================

export function AlgebraTilesLab() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(3);
  const unit = 18;
  const aSq = a*a * unit*unit;
  const bSq = b*b * unit*unit;
  const ab = a*b * unit*unit;
  const totalW = (a+b) * unit;
  const totalArea = (a+b)*(a+b);

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h4 className="mb-2 text-sm font-medium text-slate-700">🧩 代数积木 — (a+b)² 的面积模型</h4>
        <div className="flex items-center justify-center">
          <svg viewBox={`0 0 ${totalW+4} ${totalW+20}`} className="h-48" aria-label="代数面积模型">
            {/* a² block */}
            <rect x={0} y={0} width={a*unit} height={a*unit} fill="rgba(37,99,235,0.25)" stroke="#2563eb" strokeWidth={1.5} />
            <text x={a*unit/2} y={a*unit/2+4} textAnchor="middle" fill="#1d4ed8" fontSize={13} fontWeight="bold">a²</text>
            {/* a*b block (top-right) */}
            <rect x={a*unit} y={0} width={b*unit} height={a*unit} fill="rgba(220,38,38,0.2)" stroke="#dc2626" strokeWidth={1.5} />
            <text x={a*unit+b*unit/2} y={a*unit/2+4} textAnchor="middle" fill="#b91c1c" fontSize={13} fontWeight="bold">ab</text>
            {/* a*b block (bottom-left) */}
            <rect x={0} y={a*unit} width={a*unit} height={b*unit} fill="rgba(220,38,38,0.2)" stroke="#dc2626" strokeWidth={1.5} />
            <text x={a*unit/2} y={a*unit+b*unit/2+4} textAnchor="middle" fill="#b91c1c" fontSize={13} fontWeight="bold">ab</text>
            {/* b² block */}
            <rect x={a*unit} y={a*unit} width={b*unit} height={b*unit} fill="rgba(16,185,129,0.2)" stroke="#10b981" strokeWidth={1.5} />
            <text x={a*unit+b*unit/2} y={a*unit+b*unit/2+4} textAnchor="middle" fill="#047857" fontSize={13} fontWeight="bold">b²</text>
            {/* Labels */}
            <text x={totalW/2} y={totalW+14} textAnchor="middle" fill="#475569" fontSize={11}>a+b = {a+b}</text>
            <text x={totalW+10} y={totalW/2} textAnchor="middle" fill="#475569" fontSize={11} transform={`rotate(90,${totalW+10},${totalW/2})`}>a+b = {a+b}</text>
          </svg>
        </div>
        <p className="mt-2 text-center text-xs text-slate-600">
          (a+b)² = a² + 2ab + b² = {a}² + 2×{a}×{b} + {b}² = {a*a} + {2*a*b} + {b*b} = <span className="font-bold text-primary-700">{totalArea}</span>
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-2"><span className="font-medium">a:</span><input type="range" min={1} max={8} value={a} onChange={e=>setA(parseInt(e.target.value))} className="h-1 w-20 accent-blue-600"/><span className="w-6 font-mono">{a}</span></div>
        <div className="flex items-center gap-2"><span className="font-medium">b:</span><input type="range" min={1} max={8} value={b} onChange={e=>setB(parseInt(e.target.value))} className="h-1 w-20 accent-red-600"/><span className="w-6 font-mono">{b}</span></div>
        <button onClick={()=>{setA(2);setB(3);}} className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50">重置</button>
      </div>
    </div>
  );
}

// ===================== Inequality Line Lab =====================

export function InequalityLineLab() {
  const [lower, setLower] = useState(-3);
  const [upper, setUpper] = useState(4);
  const [showEq, setShowEq] = useState(false);

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h4 className="mb-2 text-sm font-medium text-slate-700">📏 不等式数轴演示</h4>
        <div className="flex items-center justify-center">
          <svg viewBox="0 0 600 100" className="h-24 w-full" aria-label="不等式数轴">
            <line x1={20} y1={50} x2={580} y2={50} stroke="#94a3b8" strokeWidth={2} />
            {[-5,-4,-3,-2,-1,0,1,2,3,4,5].map(n => (
              <g key={n}><line x1={300+n*50} y1={45} x2={300+n*50} y2={55} stroke="#64748b" strokeWidth={1.5} />
                <text x={300+n*50} y={70} textAnchor="middle" fill="#475569" fontSize={11}>{n}</text></g>
            ))}
            {/* Solution interval highlight */}
            <line x1={300+lower*50} y1={50} x2={300+upper*50+2} y2={50} stroke="#7c3aed" strokeWidth={6} strokeLinecap="round" opacity={0.4} />
            {/* Endpoints */}
            <circle cx={300+lower*50} cy={50} r={showEq?5:4} fill={showEq?"#7c3aed":"white"} stroke="#7c3aed" strokeWidth={2} />
            <text x={300+lower*50} y={38} textAnchor="middle" fill="#7c3aed" fontSize={11}>{lower}{showEq?"≤":""}</text>
            <circle cx={300+upper*50} cy={50} r={showEq?5:4} fill={showEq?"#7c3aed":"white"} stroke="#7c3aed" strokeWidth={2} />
            <text x={300+upper*50} y={38} textAnchor="middle" fill="#7c3aed" fontSize={11}>{showEq?"≤":""}{upper}</text>
          </svg>
        </div>
        <p className="mt-2 text-center text-xs font-medium text-violet-700">
          {lower} {showEq?"≤":""} x {showEq?"≤":""} {upper}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-2"><span>下限:</span><input type="range" min={-5} max={5} value={lower} onChange={e=>setLower(parseInt(e.target.value))} className="h-1 w-20 accent-violet-600"/><span className="w-6 font-mono">{lower}</span></div>
        <div className="flex items-center gap-2"><span>上限:</span><input type="range" min={-5} max={5} value={upper} onChange={e=>setUpper(parseInt(e.target.value))} className="h-1 w-20 accent-violet-600"/><span className="w-6 font-mono">{upper}</span></div>
        <label className="flex cursor-pointer items-center gap-1.5"><input type="checkbox" checked={showEq} onChange={e=>setShowEq(e.target.checked)} className="accent-violet-600"/><span>包含等号</span></label>
        <button onClick={()=>{setLower(-3);setUpper(4);setShowEq(false);}} className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50">重置</button>
      </div>
      {lower === upper && showEq && <p className="text-xs text-amber-700">x = {lower} — 退化为单点</p>}
      {lower > upper && <p className="text-xs text-red-600 font-medium">⚠ 下限 {lower} &gt; 上限 {upper}，集合为空</p>}
    </div>
  );
}

// ===================== Geometry Lab =====================

export function GeometryLab() {
  const [ax, setAx] = useState(0);
  const [ay, setAy] = useState(0);
  const [bx, setBx] = useState(4);
  const [by, setBy] = useState(0);
  const [cx, setCx] = useState(1);
  const [cy, setCy] = useState(3);
  const [dragPt, setDragPt] = useState<number|null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const scale = 30; const ox = 60; const oy = 180;

  const pts = useMemo(() => [{x:ax,y:ay},{x:bx,y:by},{x:cx,y:cy}], [ax,ay,bx,by,cx,cy]);
  const sides = useMemo(() => [
    Math.hypot(ax-bx, ay-by), Math.hypot(bx-cx, by-cy), Math.hypot(cx-ax, cy-ay)
  ], [ax,ay,bx,by,cx,cy]);
  const angles = useMemo(() => {
    const rad = (i:number,j:number,k:number) => Math.acos(((pts[i].x-pts[j].x)*(pts[k].x-pts[j].x)+(pts[i].y-pts[j].y)*(pts[k].y-pts[j].y))/(Math.hypot(pts[i].x-pts[j].x,pts[i].y-pts[j].y)*Math.hypot(pts[k].x-pts[j].x,pts[k].y-pts[j].y)));
    return [rad(2,0,1), rad(0,1,2), rad(1,2,0)].map(r=>(r*180/Math.PI));
  }, [pts, sides]);
  const area = Math.abs((ax*by+bx*cy+cx*ay-ay*bx-by*cx-cy*ax)/2);
  const isRight = sides.some((_,i) => Math.abs(sides[i]**2 - (sides[(i+1)%3]**2 + sides[(i+2)%3]**2)) < 0.1);
  const isIsosceles = Math.abs(sides[0]-sides[1])<0.3 || Math.abs(sides[1]-sides[2])<0.3 || Math.abs(sides[2]-sides[0])<0.3;

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    const onMove = (e: PointerEvent) => {
      if (dragPt===null) return;
      const rect = svg.getBoundingClientRect();
      const x = (e.clientX - rect.left - ox) / scale;
      const y = (oy - (e.clientY - rect.top)) / scale;
      const nx = Math.round(x*10)/10;
      const ny = Math.round(y*10)/10;
      if (dragPt===0) { setAx(nx); setAy(ny); }
      if (dragPt===1) { setBx(nx); setBy(ny); }
      if (dragPt===2) { setCx(nx); setCy(ny); }
    };
    const onUp = () => setDragPt(null);
    svg.addEventListener("pointermove", onMove);
    svg.addEventListener("pointerup", onUp);
    svg.addEventListener("pointerleave", onUp);
    return () => { svg.removeEventListener("pointermove",onMove); svg.removeEventListener("pointerup",onUp); svg.removeEventListener("pointerleave",onUp); };
  }, [dragPt]);

  const colors = ["#2563eb","#dc2626","#10b981"];
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h4 className="mb-2 text-sm font-medium text-slate-700">📐 几何实验 — 可拖动三角形</h4>
        <svg ref={svgRef} viewBox="0 0 320 220" className="h-48 w-full cursor-crosshair touch-none" aria-label="拖动三角形顶点">
          <line x1={ox+ax*scale} y1={oy-ay*scale} x2={ox+bx*scale} y2={oy-by*scale} stroke="#94a3b8" strokeWidth={1.5} />
          <line x1={ox+bx*scale} y1={oy-by*scale} x2={ox+cx*scale} y2={oy-cy*scale} stroke="#94a3b8" strokeWidth={1.5} />
          <line x1={ox+cx*scale} y1={oy-cy*scale} x2={ox+ax*scale} y2={oy-ay*scale} stroke="#94a3b8" strokeWidth={1.5} />
          <polygon points={`${ox+ax*scale},${oy-ay*scale} ${ox+bx*scale},${oy-by*scale} ${ox+cx*scale},${oy-cy*scale}`} fill="rgba(37,99,235,0.1)" stroke="#2563eb" strokeWidth={2} />
          {pts.map((p,i)=><circle key={i} cx={ox+p.x*scale} cy={oy-p.y*scale} r={7} fill={colors[i]} stroke="white" strokeWidth={2} style={{cursor:"grab"}} onPointerDown={()=>setDragPt(i)} />)}
        </svg>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <button onClick={()=>{setAx(0);setAy(0);setBx(4);setBy(0);setCx(1);setCy(3);}} className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50">重置</button>
        <button onClick={()=>{const r=()=>Math.round(Math.random()*5);setAx(r());setAy(r());setBx(r());setBy(r());setCx(r());setCy(r());}} className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50">随机</button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
        {sides.map((s,i)=><div key={i} className="rounded-md bg-slate-50 p-2"><span className="text-slate-500">边{i+1}</span><span className="ml-1 font-mono text-slate-700">{s.toFixed(1)}</span></div>)}
        {angles.map((a,i)=><div key={i} className="rounded-md bg-slate-50 p-2"><span className="text-slate-500">∠{i+1}</span><span className="ml-1 font-mono text-slate-700">{a.toFixed(0)}°</span></div>)}
        <div className="rounded-md bg-blue-50 p-2"><span className="text-slate-500">面积</span><span className="ml-1 font-mono text-blue-700">{area.toFixed(1)}</span></div>
        <div className="rounded-md bg-slate-50 p-2"><span className="text-slate-500">内角和</span><span className="ml-1 font-mono text-slate-700">{angles.reduce((a,b)=>a+b,0).toFixed(0)}°</span></div>
        <div className="rounded-md bg-slate-50 p-2">
          {isRight && <span className="text-green-700 font-medium">直角三角形 ✓</span>}
          {isIsosceles && <span className="text-amber-700 font-medium">等腰三角形</span>}
          {!isRight && !isIsosceles && <span className="text-slate-500">一般三角形</span>}
        </div>
      </div>
    </div>
  );
}

// ===================== Function Graph Lab (reuses math canvas) =====================

export function FunctionGraphLab() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h4 className="mb-2 text-sm font-medium text-slate-700">📈 函数图像</h4>
      <p className="text-xs text-slate-500 mb-3">完整的函数绘制、参数滑块和导数分析请在数学画布工具中进行。</p>
      <Link href="/subjects/math-canvas" className="rounded bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700">前往数学画布 →</Link>
    </div>
  );
}

// ===================== Visual Registry =====================

export const VISUAL_COMPONENTS: Record<VisualType, React.FC> = {
  "number-line": NumberLineLab,
  "algebra-tiles": AlgebraTilesLab,
  "inequality-line": InequalityLineLab,
  "function-graph": FunctionGraphLab,
  "geometry-board": GeometryLab,
  "unit-circle": FunctionGraphLab,
  "vector-plane": FunctionGraphLab,
  "statistics-chart": FunctionGraphLab,
  "probability-sim": FunctionGraphLab,
  "derivative-lab": FunctionGraphLab,
  "logic-diagram": FunctionGraphLab,
  "conic-section": FunctionGraphLab,
  "trig-graph": FunctionGraphLab,
  "equation-balance": FunctionGraphLab,
  "counting-tree": FunctionGraphLab,
};

// ===================== Visual Router =====================

export function renderVisualByKp(kpId: string) {
  const cfg = getVisConfig(kpId);
  if (!cfg) return <FallbackVis kpId={kpId} />;
  switch (cfg.type) {
    case "number-line": return <NumberLineLab />;
    case "algebra-tiles": return <AlgebraTilesLab />;
    case "inequality-line": return <InequalityLineLab />;
    case "function-graph": return <FunctionGraphLab />;
    case "geometry-board": case "triangle-properties": return <TrianglePropertiesLab />;
    case "pythagorean-lab": return <PythagoreanLab />;
    case "right-triangle-trig": return <RightTriangleTrigLab />;
    case "circle-theorem": return <CircleTheoremLab />;
    case "solid-geometry": return <SolidGeometryLab />;
    case "similarity-lab": case "congruence-lab": return <TrianglePropertiesLab />;
    default: return <FallbackVis kpId={kpId} />;
  }
}

function FallbackVis({ kpId }: { kpId: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-xs text-slate-400">
      <p>该知识点（{kpId}）的可视化实验正在开发中</p>
      <p className="mt-2">如需函数绘图、参数滑块和导数分析，请前往数学画布</p>
      <Link href="/subjects/math-canvas" className="mt-2 inline-block rounded bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700">前往数学画布 →</Link>
    </div>
  );
}

export function renderVisual(type: GeometryVisualType) {
  switch (type) {
    case "number-line": return <NumberLineLab />;
    case "algebra-tiles": return <AlgebraTilesLab />;
    case "inequality-line": return <InequalityLineLab />;
    case "function-graph": return <FunctionGraphLab />;
    case "triangle-properties": return <TrianglePropertiesLab />;
    case "pythagorean-lab": return <PythagoreanLab />;
    case "right-triangle-trig": return <RightTriangleTrigLab />;
    case "circle-theorem": return <CircleTheoremLab />;
    case "solid-geometry": return <SolidGeometryLab />;
    default: return <FunctionGraphLab />;
  }
}
