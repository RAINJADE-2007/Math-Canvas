"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import type JXG from "jsxgraph";
import "@/styles/jsxgraph.css";

type Board = JXG.Board;

interface VectorSpaceVisProps {
  height?: number;
}

export function VectorSpaceVis({ height = 420 }: VectorSpaceVisProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<Board | null>(null);
  const elementsRef = useRef<JXG.GeometryElement[]>([]);
  const [ready, setReady] = useState(false);
  const [v1, setV1] = useState({ x: 3, y: 1 });
  const [v2, setV2] = useState({ x: 1, y: 2.5 });
  const [viewLevel, setViewLevel] = useState(100);
  const containerId = useRef(`sp-canvas-${Math.random().toString(36).slice(2, 8)}`).current;

  const redraw = useCallback(() => {
    const board = boardRef.current;
    if (!board) return;

    const old = elementsRef.current;
    for (const el of old) { try { board.removeObject(el); } catch { /* */ } }
    old.length = 0;
    const add = (el: JXG.GeometryElement) => { old.push(el); return el; };

    const det = v1.x * v2.y - v1.y * v2.x;
    const independent = Math.abs(det) > 0.01;

    // Span visualization
    if (independent) {
      // Shade entire plane with faint color
      add(board.create("polygon", [[-20, -20], [20, -20], [20, 20], [-20, 20], [-20, -20]] as [number, number][], {
        borders: { visible: false },
        fillColor: "rgba(37,99,235,0.03)",
        withLabel: false,
        vertices: { visible: false },
        hasInnerPoints: false,
      }) as JXG.GeometryElement);

      // Parallelogram
      add(board.create("polygon", [[0, 0], [v1.x, v1.y], [v1.x + v2.x, v1.y + v2.y], [v2.x, v2.y]] as [number, number][], {
        borders: { strokeColor: "#2563eb", strokeWidth: 1.5 },
        fillColor: "rgba(37,99,235,0.08)",
        withLabel: false,
        vertices: { visible: false },
        hasInnerPoints: false,
      }) as JXG.GeometryElement);
    } else {
      // Span is a line
      const len = 10;
      const n = Math.sqrt(v1.x ** 2 + v1.y ** 2) || 1;
      const ux = v1.x / n, uy = v1.y / n;
      add(board.create("segment", [[-ux * len, -uy * len], [ux * len, uy * len]], {
        strokeColor: "#f87171", strokeWidth: 2, dash: 2,
      }) as JXG.GeometryElement);
    }

    // v1 arrow
    const v1End = add(board.create("point", [v1.x, v1.y], { size: 0, withLabel: false, fixed: true }) as JXG.GeometryElement);
    add(board.create("segment", [[0, 0], v1End], { strokeColor: "#2563eb", strokeWidth: 3 }) as JXG.GeometryElement);
    const n1 = Math.sqrt(v1.x ** 2 + v1.y ** 2);
    if (n1 > 0.1) {
      const ux = v1.x / n1, uy = v1.y / n1, as = Math.min(0.4, n1 / 5);
      add(board.create("segment", [[v1.x, v1.y], [v1.x - as * ux + as * 0.4 * uy, v1.y - as * uy - as * 0.4 * ux]], { strokeColor: "#2563eb", strokeWidth: 2.5 }) as JXG.GeometryElement);
      add(board.create("segment", [[v1.x, v1.y], [v1.x - as * ux - as * 0.4 * uy, v1.y - as * uy + as * 0.4 * ux]], { strokeColor: "#2563eb", strokeWidth: 2.5 }) as JXG.GeometryElement);
      add(board.create("text", [v1.x + 0.3 * ux, v1.y + 0.3 * uy, "v₁"], { fontSize: 12, strokeColor: "#2563eb", anchorX: "left" }) as JXG.GeometryElement);
    }

    // v2 arrow
    const v2End = add(board.create("point", [v2.x, v2.y], { size: 0, withLabel: false, fixed: true }) as JXG.GeometryElement);
    add(board.create("segment", [[0, 0], v2End], { strokeColor: "#dc2626", strokeWidth: 3 }) as JXG.GeometryElement);
    const n2 = Math.sqrt(v2.x ** 2 + v2.y ** 2);
    if (n2 > 0.1) {
      const ux = v2.x / n2, uy = v2.y / n2, as = Math.min(0.4, n2 / 5);
      add(board.create("segment", [[v2.x, v2.y], [v2.x - as * ux + as * 0.4 * uy, v2.y - as * uy - as * 0.4 * ux]], { strokeColor: "#dc2626", strokeWidth: 2.5 }) as JXG.GeometryElement);
      add(board.create("segment", [[v2.x, v2.y], [v2.x - as * ux - as * 0.4 * uy, v2.y - as * uy + as * 0.4 * ux]], { strokeColor: "#dc2626", strokeWidth: 2.5 }) as JXG.GeometryElement);
      add(board.create("text", [v2.x + 0.3 * ux, v2.y + 0.3 * uy, "v₂"], { fontSize: 12, strokeColor: "#dc2626", anchorX: "left" }) as JXG.GeometryElement);
    }

    const infoStr = `${independent ? "线性无关 (满秩)" : "线性相关 (秩=1)"} | det = ${det.toFixed(2)} | span = ${independent ? "R² (整个平面)" : "一条直线 (1维)"}`;
    add(board.create("text", [-7.5, 7.6, infoStr], { fontSize: 12, strokeColor: independent ? "#059669" : "#dc2626", anchorX: "left", anchorY: "top", fixed: true }) as JXG.GeometryElement);

    try { board.update(); } catch { /* */ }
  }, [v1, v2]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const JXGModule = await import("jsxgraph");
      const JXG = (JXGModule.default ?? JXGModule);
      if (cancelled) return;
      const el = document.getElementById(containerId);
      if (!el) return;

      const board = JXG.JSXGraph.initBoard(el, {
        boundingbox: [-8, 8, 8, -8],
        axis: false, grid: false,
        pan: { needTwoFingers: false },
        zoom: { factorX: 1.2, factorY: 1.2 },
        showNavigation: false, keepaspectratio: false,
        registerEvents: { wheel: false } as unknown as boolean,
      }) as unknown as Board;

      board.create("grid", [], { strokeColor: "#e2e8f0", fixed: true });
      board.create("axis", [[-1000, 0], [1000, 0]], { strokeColor: "#94a3b8", strokeWidth: 1.2 });
      board.create("axis", [[0, -1000], [0, 1000]], { strokeColor: "#94a3b8", strokeWidth: 1.2 });

      board.on("update", () => {
        const bb = board.getBoundingBox();
        const w = Math.max(bb[2] - bb[0], 1e-6);
        setViewLevel(Math.max(1, Math.round((20 / w) * 100)));
      });

      boardRef.current = board;
      setReady(true);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const el = document.getElementById(containerId);
    if (!el) return;
    const onWheel = (e: WheelEvent) => { e.preventDefault(); boardRef.current?.[e.deltaY < 0 ? "zoomOut" : "zoomIn"](); };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [ready]);

  useEffect(() => { if (ready) redraw(); }, [ready, redraw]);

  const det = v1.x * v2.y - v1.y * v2.x;
  const independent = Math.abs(det) > 0.01;

  return (
    <div className="space-y-2">
      <div className="relative rounded-lg border border-slate-200 bg-white" style={{ height }}>
        <div id={containerId} ref={containerRef} className="h-full w-full cursor-grab" style={{ height: "100%", width: "100%" }} />
        {!ready && <div className="absolute inset-0 flex items-center justify-center bg-white/85"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" /></div>}
        {ready && (
          <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-lg border border-slate-200 bg-white/95 px-1.5 py-1 shadow-card">
            <button title="放大" onClick={() => boardRef.current?.zoomOut()} className="flex h-6 w-6 items-center justify-center rounded text-sm font-semibold text-slate-600 hover:bg-primary-50 hover:text-primary-700">＋</button>
            <button title="缩小" onClick={() => boardRef.current?.zoomIn()} className="flex h-6 w-6 items-center justify-center rounded text-sm font-semibold text-slate-600 hover:bg-primary-50 hover:text-primary-700">−</button>
            <button title="重置" onClick={() => { try { boardRef.current?.setBoundingBox([-8, 8, 8, -8]); } catch { /* */ } }} className="rounded px-1.5 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-primary-50 hover:text-primary-700">重置</button>
            <span className="w-9 text-center font-mono text-[10px] text-slate-500">{viewLevel}%</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <button onClick={() => { setV1({ x: 3, y: 1 }); setV2({ x: 1, y: 2.5 }); }} className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50">重置</button>
        <button onClick={() => setV2({ x: v1.x * 2, y: v1.y * 2 })} className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50">共线(线性相关)</button>
        <button onClick={() => setV2({ x: -v1.y, y: v1.x })} className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50">正交</button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div className="rounded-md bg-blue-50 p-2">
          <span className="text-slate-500">v₁</span>
          <span className="ml-1 font-mono text-slate-700">({v1.x.toFixed(1)},{v1.y.toFixed(1)})</span>
        </div>
        <div className="rounded-md bg-red-50 p-2">
          <span className="text-slate-500">v₂</span>
          <span className="ml-1 font-mono text-slate-700">({v2.x.toFixed(1)},{v2.y.toFixed(1)})</span>
        </div>
        <div className="rounded-md bg-slate-50 p-2">
          <span className={`font-medium ${independent ? "text-green-700" : "text-red-600"}`}>
            {independent ? "线性无关" : "线性相关"}
          </span>
        </div>
        <div className="rounded-md bg-slate-50 p-2">
          <span className="text-slate-500">span = </span>
          <span className="font-medium text-slate-700">{independent ? "R² (整个平面)" : "一条直线 (1维)"}</span>
        </div>
      </div>
    </div>
  );
}
