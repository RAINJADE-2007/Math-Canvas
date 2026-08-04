"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import type JXG from "jsxgraph";
import "@/styles/jsxgraph.css";

type Board = JXG.Board;

interface MatrixCanvasProps {
  initialMatrix?: number[][];
  height?: number;
}

export function MatrixCanvas({
  initialMatrix = [[2, 1], [0.5, 1.5]],
  height = 440,
}: MatrixCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<Board | null>(null);
  const jxgRef = useRef<typeof JXG | null>(null);
  const elementsRef = useRef<JXG.GeometryElement[]>([]);
  const [ready, setReady] = useState(false);
  const [matrix, setMatrix] = useState(initialMatrix.map((r) => [...r]));
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);
  const [viewLevel, setViewLevel] = useState(100);
  const containerId = useRef(`mat-canvas-${Math.random().toString(36).slice(2, 8)}`).current;

  const redraw = useCallback(() => {
    const board = boardRef.current;
    const JXG = jxgRef.current;
    if (!board || !JXG) return;

    const old = elementsRef.current;
    for (const el of old) {
      try { board.removeObject(el); } catch { /* */ }
    }
    old.length = 0;
    const add = (el: JXG.GeometryElement) => { old.push(el); return el; };

    const [[a, b], [c, d]] = matrix;
    const det = a * d - b * c;

    // Transformed grid lines (as curves sampled at points)
    const range = Array.from({ length: 21 }, (_, i) => -5 + i * 0.5);

    // Vertical grid lines: x = const, vary y
    range.forEach((x0) => {
      if (x0 === 0) return;
      const pts: [number, number][] = [];
      for (let t = -5; t <= 5; t += 0.2) {
        pts.push([a * x0 + b * t, c * x0 + d * t]);
      }
      if (pts.length >= 2) {
        const xs = pts.map((p) => p[0]);
        const ys = pts.map((p) => p[1]);
        add(board.create("curve", [xs, ys], {
          strokeColor: "#93c5fd", strokeWidth: 0.8, withLabel: false, fixed: true,
        }) as JXG.GeometryElement);
      }
    });

    // Horizontal grid lines: y = const, vary x
    range.forEach((y0) => {
      if (y0 === 0) return;
      const pts: [number, number][] = [];
      for (let t = -5; t <= 5; t += 0.2) {
        pts.push([a * t + b * y0, c * t + d * y0]);
      }
      if (pts.length >= 2) {
        const xs = pts.map((p) => p[0]);
        const ys = pts.map((p) => p[1]);
        add(board.create("curve", [xs, ys], {
          strokeColor: "#93c5fd", strokeWidth: 0.8, withLabel: false, fixed: true,
        }) as JXG.GeometryElement);
      }
    });

    // Basis vectors as arrows
    const iEnd = add(board.create("point", [a, c], { size: 0, withLabel: false, fixed: true }) as JXG.GeometryElement);
    const jEnd = add(board.create("point", [b, d], { size: 0, withLabel: false, fixed: true }) as JXG.GeometryElement);

    add(board.create("segment", [[0, 0], iEnd], { strokeColor: "#2563eb", strokeWidth: 3 }) as JXG.GeometryElement);
    add(board.create("segment", [[0, 0], jEnd], { strokeColor: "#dc2626", strokeWidth: 3 }) as JXG.GeometryElement);

    // Arrowheads simplified as small lines
    const aLen = Math.sqrt(a ** 2 + c ** 2);
    if (aLen > 0.1) {
      const ux = a / aLen, uy = c / aLen;
      const as = Math.min(0.4, aLen / 5);
      add(board.create("segment", [[a, c], [a - as * ux + as * 0.4 * uy, c - as * uy - as * 0.4 * ux]], { strokeColor: "#2563eb", strokeWidth: 2.5 }) as JXG.GeometryElement);
      add(board.create("segment", [[a, c], [a - as * ux - as * 0.4 * uy, c - as * uy + as * 0.4 * ux]], { strokeColor: "#2563eb", strokeWidth: 2.5 }) as JXG.GeometryElement);
      add(board.create("text", [a + 0.3 * ux, c + 0.3 * uy, "i'"], { fontSize: 12, strokeColor: "#2563eb", anchorX: "left" }) as JXG.GeometryElement);
    }
    const bLen = Math.sqrt(b ** 2 + d ** 2);
    if (bLen > 0.1) {
      const ux = b / bLen, uy = d / bLen;
      const as = Math.min(0.4, bLen / 5);
      add(board.create("segment", [[b, d], [b - as * ux + as * 0.4 * uy, d - as * uy - as * 0.4 * ux]], { strokeColor: "#dc2626", strokeWidth: 2.5 }) as JXG.GeometryElement);
      add(board.create("segment", [[b, d], [b - as * ux - as * 0.4 * uy, d - as * uy + as * 0.4 * ux]], { strokeColor: "#dc2626", strokeWidth: 2.5 }) as JXG.GeometryElement);
      add(board.create("text", [b + 0.3 * ux, d + 0.3 * uy, "j'"], { fontSize: 12, strokeColor: "#dc2626", anchorX: "left" }) as JXG.GeometryElement);
    }

    // Unit square transformed to parallelogram
    const sq = [
      [0, 0],
      [a, c],
      [a + b, c + d],
      [b, d],
    ] as [number, number][];
    add(board.create("polygon", sq, {
      borders: { strokeColor: "#7c3aed", strokeWidth: 2 },
      fillColor: "rgba(124,58,237,0.12)",
      withLabel: false,
      vertices: { visible: false },
      hasInnerPoints: false,
    }) as JXG.GeometryElement);

    // Faded original basis (dashed)
    add(board.create("segment", [[0, 0], [1, 0]], {
      strokeColor: "#cbd5e1", strokeWidth: 1, dash: 1, fixed: true,
    }) as JXG.GeometryElement);
    add(board.create("segment", [[0, 0], [0, 1]], {
      strokeColor: "#cbd5e1", strokeWidth: 1, dash: 1, fixed: true,
    }) as JXG.GeometryElement);

    // Info text
    const detStr = `det = ${det.toFixed(2)} | 面积:${Math.abs(det).toFixed(2)} | ${det < -0.001 ? "翻转" : det > 0.001 ? "保持" : "退化"}`;
    add(board.create("text", [-7.5, 7.6, detStr], {
      fontSize: 12, strokeColor: "#475569", anchorX: "left", anchorY: "top", fixed: true,
    }) as JXG.GeometryElement);

    try { board.update(); } catch { /* */ }
  }, [matrix]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const JXGModule = await import("jsxgraph");
      const JXG = (JXGModule.default ?? JXGModule);
      if (cancelled) return;
      jxgRef.current = JXG;

      const el = document.getElementById(containerId);
      if (!el) return;

      const board = JXG.JSXGraph.initBoard(el, {
        boundingbox: [-8, 8, 8, -8],
        axis: false, grid: false,
        pan: { needTwoFingers: false },
        zoom: { factorX: 1.2, factorY: 1.2 },
        showNavigation: false,
        keepaspectratio: false,
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

      try {
        board.on("move", (evt: unknown) => {
          const b = board as unknown as { getUsrCoordsOfMouse?: (e: unknown) => [number, number] };
          if (b.getUsrCoordsOfMouse) {
            const coords = b.getUsrCoordsOfMouse(evt as MouseEvent);
            if (coords) setHoverCoord({ x: coords[0], y: coords[1] });
          }
        });
      } catch { /* */ }

      boardRef.current = board;
      setReady(true);
    })();

    return () => {
      cancelled = true;
      try {
        const jxg = jxgRef.current;
        const b = boardRef.current;
        if (jxg && b && (jxg as unknown as { JSXGraph?: { freeBoard?: (b: Board) => void } }).JSXGraph?.freeBoard) {
          (jxg as unknown as { JSXGraph: { freeBoard: (b: Board) => void } }).JSXGraph.freeBoard(b);
        }
      } catch { /* */ }
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const el = document.getElementById(containerId);
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const b = boardRef.current;
      if (!b) return;
      if (e.deltaY < 0) b.zoomOut(); else b.zoomIn();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    redraw();
  }, [ready, redraw]);

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
    <div className="space-y-2">
      <div className="relative rounded-lg border border-slate-200 bg-white" style={{ height }}>
        <div id={containerId} ref={containerRef} className="h-full w-full cursor-grab" style={{ height: "100%", width: "100%" }} />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/85">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
          </div>
        )}
        {ready && (
          <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-lg border border-slate-200 bg-white/95 px-1.5 py-1 shadow-card">
            <button title="放大" onClick={() => boardRef.current?.zoomOut()} className="flex h-6 w-6 items-center justify-center rounded text-sm font-semibold text-slate-600 hover:bg-primary-50 hover:text-primary-700">＋</button>
            <button title="缩小" onClick={() => boardRef.current?.zoomIn()} className="flex h-6 w-6 items-center justify-center rounded text-sm font-semibold text-slate-600 hover:bg-primary-50 hover:text-primary-700">−</button>
            <button title="重置视图" onClick={() => { try { boardRef.current?.setBoundingBox([-8, 8, 8, -8]) } catch { /* */ } }} className="rounded px-1.5 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-primary-50 hover:text-primary-700">重置</button>
            <span className="w-9 text-center font-mono text-[10px] text-slate-500">{viewLevel}%</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs">
        {hoverCoord && (
          <span className="rounded bg-slate-50 px-2 py-1 font-mono text-slate-500">
            x:{hoverCoord.x.toFixed(2)}, y:{hoverCoord.y.toFixed(2)}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 text-xs">
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
        {[0, 1].map((r) =>
          [0, 1].map((c) => (
            <input
              key={`${r}${c}`}
              type="number"
              step={0.1}
              value={matrix[r][c]}
              onChange={(e) => updateCell(r, c, parseFloat(e.target.value) || 0)}
              className="w-14 rounded border border-slate-300 px-1.5 py-0.5 text-center"
              aria-label={`m${r + 1}${c + 1}`}
            />
          ))
        )}
        {matrix.length > 1 && <span className="mx-0.5 text-slate-300">|</span>}
      </div>
    </div>
  );
}
