"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import type JXG from "jsxgraph";
import "@/styles/jsxgraph.css";

type Board = JXG.Board;

interface DeterminantVisProps {
  initialMatrix?: number[][];
  height?: number;
}

export function DeterminantVis({
  initialMatrix = [[2, 1], [0.5, 1.5]],
  height = 400,
}: DeterminantVisProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<Board | null>(null);
  const elementsRef = useRef<JXG.GeometryElement[]>([]);
  const [ready, setReady] = useState(false);
  const [matrix, setMatrix] = useState(initialMatrix.map((r) => [...r]));
  const [viewLevel, setViewLevel] = useState(100);
  const containerId = useRef(`det-canvas-${Math.random().toString(36).slice(2, 8)}`).current;

  const redraw = useCallback(() => {
    const board = boardRef.current;
    if (!board) return;

    const old = elementsRef.current;
    for (const el of old) { try { board.removeObject(el); } catch { /* */ } }
    old.length = 0;
    const add = (el: JXG.GeometryElement) => { old.push(el); return el; };

    const [[a, b], [c, d]] = matrix;
    const det = a * d - b * c;
    const detColor = Math.abs(det) < 0.001 ? "#f59e0b" : det > 0 ? "#2563eb" : "#dc2626";

    // Parallelogram (transformed unit square)
    add(board.create("polygon", [
      [0, 0], [a, c], [a + b, c + d], [b, d],
    ] as [number, number][], {
      borders: { strokeColor: detColor, strokeWidth: 2.5 },
      fillColor: det > 0 ? "rgba(37,99,235,0.1)" : "rgba(220,38,38,0.1)",
      withLabel: false,
      vertices: { visible: false },
      hasInnerPoints: false,
    }) as JXG.GeometryElement);

    // Column vectors as arrows
    const col1 = add(board.create("point", [a, c], { size: 0, withLabel: false, fixed: true }) as JXG.GeometryElement);
    const col2 = add(board.create("point", [b, d], { size: 0, withLabel: false, fixed: true }) as JXG.GeometryElement);

    // v1
    add(board.create("segment", [[0, 0], col1], { strokeColor: "#2563eb", strokeWidth: 3 }) as JXG.GeometryElement);
    const n1 = Math.sqrt(a ** 2 + c ** 2);
    if (n1 > 0.1) {
      const ux = a / n1, uy = c / n1, as = Math.min(0.4, n1 / 5);
      add(board.create("segment", [[a, c], [a - as * ux + as * 0.4 * uy, c - as * uy - as * 0.4 * ux]], { strokeColor: "#2563eb", strokeWidth: 2.5 }) as JXG.GeometryElement);
      add(board.create("segment", [[a, c], [a - as * ux - as * 0.4 * uy, c - as * uy + as * 0.4 * ux]], { strokeColor: "#2563eb", strokeWidth: 2.5 }) as JXG.GeometryElement);
      add(board.create("text", [a + 0.3 * ux, c + 0.3 * uy, "列1"], { fontSize: 12, strokeColor: "#2563eb", anchorX: "left" }) as JXG.GeometryElement);
    }

    // v2
    add(board.create("segment", [[0, 0], col2], { strokeColor: "#dc2626", strokeWidth: 3 }) as JXG.GeometryElement);
    const n2 = Math.sqrt(b ** 2 + d ** 2);
    if (n2 > 0.1) {
      const ux = b / n2, uy = d / n2, as = Math.min(0.4, n2 / 5);
      add(board.create("segment", [[b, d], [b - as * ux + as * 0.4 * uy, d - as * uy - as * 0.4 * ux]], { strokeColor: "#dc2626", strokeWidth: 2.5 }) as JXG.GeometryElement);
      add(board.create("segment", [[b, d], [b - as * ux - as * 0.4 * uy, d - as * uy + as * 0.4 * ux]], { strokeColor: "#dc2626", strokeWidth: 2.5 }) as JXG.GeometryElement);
      add(board.create("text", [b + 0.3 * ux, d + 0.3 * uy, "列2"], { fontSize: 12, strokeColor: "#dc2626", anchorX: "left" }) as JXG.GeometryElement);
    }

    // Faded unit square reference
    add(board.create("segment", [[0, 0], [1, 0]], { strokeColor: "#cbd5e1", strokeWidth: 1, dash: 1, fixed: true }) as JXG.GeometryElement);
    add(board.create("segment", [[1, 0], [1, 1]], { strokeColor: "#cbd5e1", strokeWidth: 1, dash: 1, fixed: true }) as JXG.GeometryElement);
    add(board.create("segment", [[1, 1], [0, 1]], { strokeColor: "#cbd5e1", strokeWidth: 1, dash: 1, fixed: true }) as JXG.GeometryElement);
    add(board.create("segment", [[0, 1], [0, 0]], { strokeColor: "#cbd5e1", strokeWidth: 1, dash: 1, fixed: true }) as JXG.GeometryElement);

    const dStr = `det = ${det.toFixed(2)} | 面积 = ${Math.abs(det).toFixed(2)} | ${Math.abs(det) < 0.001 ? "退化(降维)" : det > 0 ? "保持方向" : "方向翻转"}`;
    add(board.create("text", [-7.5, 7.6, dStr], { fontSize: 12, strokeColor: "#475569", anchorX: "left", anchorY: "top", fixed: true }) as JXG.GeometryElement);

    try { board.update(); } catch { /* */ }
  }, [matrix]);

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

  const updateCell = (r: number, c: number, val: number) => {
    const m = matrix.map((row) => [...row]); m[r][c] = val; setMatrix(m);
  };

  const presets = [
    { label: "面积=4", m: [[2, 1], [1, 2]] },
    { label: "面积=0", m: [[1, 2], [2, 4]] },
    { label: "翻转", m: [[0, 1], [1, 0]] },
    { label: "负面积", m: [[-1, 2], [3, 1]] },
  ];

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

      <div className="flex flex-wrap gap-1.5 text-xs">
        {presets.map((p) => (
          <button key={p.label} onClick={() => setMatrix(p.m.map((r) => [...r]))} className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50">{p.label}</button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="font-medium text-slate-600">列向量：</span>
        <input type="number" step={0.1} value={matrix[0][0]} onChange={(e) => updateCell(0, 0, parseFloat(e.target.value) || 0)} className="w-14 rounded border border-slate-300 px-1.5 py-0.5 text-center" />
        <input type="number" step={0.1} value={matrix[1][0]} onChange={(e) => updateCell(1, 0, parseFloat(e.target.value) || 0)} className="w-14 rounded border border-slate-300 px-1.5 py-0.5 text-center" />
        <span className="mx-1 text-slate-400">|</span>
        <input type="number" step={0.1} value={matrix[0][1]} onChange={(e) => updateCell(0, 1, parseFloat(e.target.value) || 0)} className="w-14 rounded border border-slate-300 px-1.5 py-0.5 text-center" />
        <input type="number" step={0.1} value={matrix[1][1]} onChange={(e) => updateCell(1, 1, parseFloat(e.target.value) || 0)} className="w-14 rounded border border-slate-300 px-1.5 py-0.5 text-center" />
      </div>
    </div>
  );
}
