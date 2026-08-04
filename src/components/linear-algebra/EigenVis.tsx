"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import type JXG from "jsxgraph";
import "@/styles/jsxgraph.css";
import { computeEigen22 } from "@/math-engine/linear-algebra/eigenvalues";

type Board = JXG.Board;

interface EigenVisProps {
  initialMatrix?: number[][];
  height?: number;
}

export function EigenVis({ initialMatrix = [[2, 1], [0, 3]], height = 400 }: EigenVisProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<Board | null>(null);
  const elementsRef = useRef<JXG.GeometryElement[]>([]);
  const [ready, setReady] = useState(false);
  const [matrix, setMatrix] = useState(initialMatrix.map((r) => [...r]));
  const [angle, setAngle] = useState(30);
  const [viewLevel, setViewLevel] = useState(100);
  const containerId = useRef(`eig-canvas-${Math.random().toString(36).slice(2, 8)}`).current;

  const redraw = useCallback(() => {
    const board = boardRef.current;
    if (!board) return;

    const old = elementsRef.current;
    for (const el of old) { try { board.removeObject(el); } catch { /* */ } }
    old.length = 0;
    const add = (el: JXG.GeometryElement) => { old.push(el); return el; };

    const [[a, b], [c, d]] = matrix;
    const rad = (angle * Math.PI) / 180;
    const vx = 3 * Math.cos(rad);
    const vy = 3 * Math.sin(rad);
    const tvx = a * vx + b * vy;
    const tvy = c * vx + d * vy;

    // v vector
    const vEnd = add(board.create("point", [vx, vy], { size: 0, withLabel: false, fixed: true }) as JXG.GeometryElement);
    add(board.create("segment", [[0, 0], vEnd], { strokeColor: "#2563eb", strokeWidth: 3 }) as JXG.GeometryElement);
    const vLen = Math.sqrt(vx ** 2 + vy ** 2);
    if (vLen > 0.1) {
      const ux = vx / vLen, uy = vy / vLen;
      const as = Math.min(0.4, vLen / 5);
      add(board.create("segment", [[vx, vy], [vx - as * ux + as * 0.4 * uy, vy - as * uy - as * 0.4 * ux]], { strokeColor: "#2563eb", strokeWidth: 2.5 }) as JXG.GeometryElement);
      add(board.create("segment", [[vx, vy], [vx - as * ux - as * 0.4 * uy, vy - as * uy + as * 0.4 * ux]], { strokeColor: "#2563eb", strokeWidth: 2.5 }) as JXG.GeometryElement);
      add(board.create("text", [vx + 0.3 * ux, vy + 0.3 * uy, "v"], { fontSize: 12, strokeColor: "#2563eb", anchorX: "left" }) as JXG.GeometryElement);
    }

    // Av vector
    const avEnd = add(board.create("point", [tvx, tvy], { size: 0, withLabel: false, fixed: true }) as JXG.GeometryElement);
    add(board.create("segment", [[0, 0], avEnd], { strokeColor: "#dc2626", strokeWidth: 3 }) as JXG.GeometryElement);
    const aLen = Math.sqrt(tvx ** 2 + tvy ** 2);
    if (aLen > 0.1) {
      const ux = tvx / aLen, uy = tvy / aLen;
      const as = Math.min(0.4, aLen / 5);
      add(board.create("segment", [[tvx, tvy], [tvx - as * ux + as * 0.4 * uy, tvy - as * uy - as * 0.4 * ux]], { strokeColor: "#dc2626", strokeWidth: 2.5 }) as JXG.GeometryElement);
      add(board.create("segment", [[tvx, tvy], [tvx - as * ux - as * 0.4 * uy, tvy - as * uy + as * 0.4 * ux]], { strokeColor: "#dc2626", strokeWidth: 2.5 }) as JXG.GeometryElement);
      add(board.create("text", [tvx + 0.3 * ux, tvy + 0.3 * uy, "Av"], { fontSize: 12, strokeColor: "#dc2626", anchorX: "left" }) as JXG.GeometryElement);
    }

    // Eigen directions
    const eigenResult = computeEigen22(matrix);
    eigenResult.eigenvectors.forEach((ev, idx) => {
      const nv = Math.sqrt(ev.vector[0] ** 2 + ev.vector[1] ** 2);
      if (nv < 1e-6) return;
      const eColor = idx === 0 ? "#7c3aed" : "#10b981";
      const ux = (ev.vector[0] / nv) * 5;
      const uy = (ev.vector[1] / nv) * 5;
      const nux = -ux, nuy = -uy;
      add(board.create("segment", [[nux, nuy], [ux, uy]], { strokeColor: eColor, strokeWidth: 1.5, dash: 1 }) as JXG.GeometryElement);
      add(board.create("text", [ux, uy, `λ${idx + 1}=${ev.eigenvalue.toFixed(1)}`], { fontSize: 11, strokeColor: eColor, anchorX: "left" }) as JXG.GeometryElement);
    });

    // Direction change hint
    const cross = tvx * vy - tvy * vx;
    const isEigen = Math.abs(cross) < 0.05;
    const hintStr = isEigen ? "方向一致 → 接近特征向量!" : `角度: ${angle}°`;
    add(board.create("text", [-7.5, 7.6, hintStr], { fontSize: 12, strokeColor: isEigen ? "#059669" : "#475569", anchorX: "left", anchorY: "top", fixed: true }) as JXG.GeometryElement);

    try { board.update(); } catch { /* */ }
  }, [matrix, angle]);

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

  const eigenResult = computeEigen22(matrix);

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

      <div className="flex items-center gap-3 text-xs">
        <span className="text-slate-500">角度: {angle}°</span>
        <input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(parseInt(e.target.value))} className="h-1 flex-1 appearance-none rounded bg-slate-200 accent-primary-600" />
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="font-medium text-slate-600">A =</span>
        <input type="number" step={0.1} value={matrix[0][0]} onChange={(e) => updateCell(0, 0, parseFloat(e.target.value) || 0)} className="w-14 rounded border border-slate-300 px-1.5 py-0.5 text-center" />
        <input type="number" step={0.1} value={matrix[0][1]} onChange={(e) => updateCell(0, 1, parseFloat(e.target.value) || 0)} className="w-14 rounded border border-slate-300 px-1.5 py-0.5 text-center" />
        <span className="mx-1 text-slate-400">|</span>
        <input type="number" step={0.1} value={matrix[1][0]} onChange={(e) => updateCell(1, 0, parseFloat(e.target.value) || 0)} className="w-14 rounded border border-slate-300 px-1.5 py-0.5 text-center" />
        <input type="number" step={0.1} value={matrix[1][1]} onChange={(e) => updateCell(1, 1, parseFloat(e.target.value) || 0)} className="w-14 rounded border border-slate-300 px-1.5 py-0.5 text-center" />
      </div>

      {eigenResult.eigenvalues.length > 0 && (
        <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
          {eigenResult.eigenvalues.map((ev, i) => (
            <div key={i} className="rounded-md bg-slate-50 p-2">
              <span className="font-medium text-primary-700">λ{i + 1}</span>
              <span className="ml-1 text-slate-600">= {ev.latex}</span>
              {i < eigenResult.eigenvectors.length && (
                <span className="ml-2 font-mono text-slate-500">
                  v={eigenResult.eigenvectors[i].vector.map((x) => x.toFixed(2)).join(", ")}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
