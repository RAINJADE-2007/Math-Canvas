"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import type JXG from "jsxgraph";

type Board = JXG.Board;

interface VectorCanvasProps {
  initialV1?: { x: number; y: number };
  initialV2?: { x: number; y: number };
  showSum?: boolean;
  showDot?: boolean;
  showProjection?: boolean;
  height?: number;
}

export function VectorCanvas({
  initialV1 = { x: 3, y: 2 },
  initialV2 = { x: 1, y: 4 },
  showSum = true,
  showDot = true,
  height = 440,
}: VectorCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<Board | null>(null);
  const jxgRef = useRef<typeof JXG | null>(null);
  const elementsRef = useRef<JXG.GeometryElement[]>([]);
  const [ready, setReady] = useState(false);
  const [v1, setV1] = useState({ ...initialV1 });
  const [v2, setV2] = useState({ ...initialV2 });
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);
  const [viewLevel, setViewLevel] = useState(100);

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

    // Vectors as arrows
    const v1End = add(board.create("point", [v1.x, v1.y], {
      size: 0, withLabel: false, fixed: true,
    }) as JXG.GeometryElement);
    const v2End = add(board.create("point", [v2.x, v2.y], {
      size: 0, withLabel: false, fixed: true,
    }) as JXG.GeometryElement);

    // v1 arrow
    add(board.create("segment", [[0, 0], v1End], {
      strokeColor: "#2563eb", strokeWidth: 3, dash: 0,
    }) as JXG.GeometryElement);
    // v1 arrowhead (small line)
    const a1Len = Math.sqrt(v1.x ** 2 + v1.y ** 2);
    if (a1Len > 0.1) {
      const ux1 = v1.x / a1Len, uy1 = v1.y / a1Len;
      const as = Math.min(0.5, a1Len / 5);
      add(board.create("segment", [[v1.x, v1.y], [v1.x - as * ux1 + as * 0.4 * uy1, v1.y - as * uy1 - as * 0.4 * ux1]], {
        strokeColor: "#2563eb", strokeWidth: 3,
      }) as JXG.GeometryElement);
      add(board.create("segment", [[v1.x, v1.y], [v1.x - as * ux1 - as * 0.4 * uy1, v1.y - as * uy1 + as * 0.4 * ux1]], {
        strokeColor: "#2563eb", strokeWidth: 3,
      }) as JXG.GeometryElement);
      add(board.create("text", [v1.x + 0.3 * ux1, v1.y + 0.3 * uy1, "v₁"], {
        fontSize: 12, strokeColor: "#2563eb", anchorX: "left",
      }) as JXG.GeometryElement);
    }

    // v2 arrow
    add(board.create("segment", [[0, 0], v2End], {
      strokeColor: "#dc2626", strokeWidth: 3, dash: 0,
    }) as JXG.GeometryElement);
    const a2Len = Math.sqrt(v2.x ** 2 + v2.y ** 2);
    if (a2Len > 0.1) {
      const ux2 = v2.x / a2Len, uy2 = v2.y / a2Len;
      const as = Math.min(0.5, a2Len / 5);
      add(board.create("segment", [[v2.x, v2.y], [v2.x - as * ux2 + as * 0.4 * uy2, v2.y - as * uy2 - as * 0.4 * ux2]], {
        strokeColor: "#dc2626", strokeWidth: 3,
      }) as JXG.GeometryElement);
      add(board.create("segment", [[v2.x, v2.y], [v2.x - as * ux2 - as * 0.4 * uy2, v2.y - as * uy2 + as * 0.4 * ux2]], {
        strokeColor: "#dc2626", strokeWidth: 3,
      }) as JXG.GeometryElement);
      add(board.create("text", [v2.x + 0.3 * ux2, v2.y + 0.3 * uy2, "v₂"], {
        fontSize: 12, strokeColor: "#dc2626", anchorX: "left",
      }) as JXG.GeometryElement);
    }

    // v1+v2 sum
    if (showSum) {
      const sx = v1.x + v2.x, sy = v1.y + v2.y;
      const sumEnd = add(board.create("point", [sx, sy], {
        size: 0, withLabel: false, fixed: true,
      }) as JXG.GeometryElement);
      add(board.create("segment", [[0, 0], sumEnd], {
        strokeColor: "#7c3aed", strokeWidth: 3, dash: 0,
      }) as JXG.GeometryElement);
      const sLen = Math.sqrt(sx ** 2 + sy ** 2);
      if (sLen > 0.1) {
        const ux = sx / sLen, uy = sy / sLen;
        const as = Math.min(0.5, sLen / 5);
        add(board.create("segment", [[sx, sy], [sx - as * ux + as * 0.4 * uy, sy - as * uy - as * 0.4 * ux]], {
          strokeColor: "#7c3aed", strokeWidth: 3,
        }) as JXG.GeometryElement);
        add(board.create("segment", [[sx, sy], [sx - as * ux - as * 0.4 * uy, sy - as * uy + as * 0.4 * ux]], {
          strokeColor: "#7c3aed", strokeWidth: 3,
        }) as JXG.GeometryElement);
        add(board.create("text", [sx + 0.3 * ux, sy + 0.3 * uy, "v₁+v₂"], {
          fontSize: 12, strokeColor: "#7c3aed", anchorX: "left",
        }) as JXG.GeometryElement);
      }
      // Dashed parallelogram lines
      add(board.create("segment", [[v1.x, v1.y], [sx, sy]], {
        strokeColor: "#c084fc", strokeWidth: 1, dash: 2,
      }) as JXG.GeometryElement);
      add(board.create("segment", [[v2.x, v2.y], [sx, sy]], {
        strokeColor: "#c084fc", strokeWidth: 1, dash: 2,
      }) as JXG.GeometryElement);
    }

    // Drag handles
    add(board.create("point", [v1.x, v1.y], {
      size: 4, face: "circle", strokeColor: "#2563eb", fillColor: "#2563eb", withLabel: false,
    }) as JXG.GeometryElement);
    add(board.create("point", [v2.x, v2.y], {
      size: 4, face: "circle", strokeColor: "#dc2626", fillColor: "#dc2626", withLabel: false,
    }) as JXG.GeometryElement);

    try { board.update(); } catch { /* */ }
  }, [v1, v2, showSum]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const JXGModule = await import("jsxgraph");
      const JXG = (JXGModule.default ?? JXGModule);
      if (cancelled || !containerRef.current) return;

      jxgRef.current = JXG;
      const board = JXG.JSXGraph.initBoard(containerRef.current, {
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
    const el = containerRef.current;
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

  const sum = { x: v1.x + v2.x, y: v1.y + v2.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const norm1 = Math.sqrt(v1.x ** 2 + v1.y ** 2);
  const norm2 = Math.sqrt(v2.x ** 2 + v2.y ** 2);
  const cosAngle = norm1 > 1e-6 && norm2 > 1e-6 ? dot / (norm1 * norm2) : 0;
  const angle = (Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180) / Math.PI;

  return (
    <div className="space-y-2">
      <div className="relative rounded-lg border border-slate-200 bg-white" style={{ height }}>
        <div
          ref={containerRef}
          className="h-full w-full cursor-grab"
          style={{ height: "100%", width: "100%" }}
        />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/85">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
          </div>
        )}
        {ready && (
          <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-lg border border-slate-200 bg-white/95 px-1.5 py-1 shadow-card">
            <button title="放大" onClick={() => boardRef.current?.zoomOut()} className="flex h-6 w-6 items-center justify-center rounded text-sm font-semibold text-slate-600 hover:bg-primary-50 hover:text-primary-700">＋</button>
            <button title="缩小" onClick={() => boardRef.current?.zoomIn()} className="flex h-6 w-6 items-center justify-center rounded text-sm font-semibold text-slate-600 hover:bg-primary-50 hover:text-primary-700">−</button>
            <button title="重置视图" onClick={() => {
              try { boardRef.current?.setBoundingBox([-8, 8, 8, -8]) } catch { /* */ }
            }} className="rounded px-1.5 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-primary-50 hover:text-primary-700">重置</button>
            <span className="w-9 text-center font-mono text-[10px] text-slate-500">{viewLevel}%</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {hoverCoord && (
          <span className="rounded bg-slate-50 px-2 py-1 font-mono text-slate-500">
            x:{hoverCoord.x.toFixed(2)}, y:{hoverCoord.y.toFixed(2)}
          </span>
        )}
        <button
          onClick={() => {
            setV1({ ...initialV1 }); setV2({ ...initialV2 });
          }}
          className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50"
        >重置</button>
        <button
          onClick={() => setV2({ x: Math.round(Math.random() * 8 - 4), y: Math.round(Math.random() * 8 - 4) })}
          className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50"
        >随机 v₂</button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div className="rounded-md bg-blue-50 p-2">
          <span className="font-medium text-blue-700">v₁</span>
          <span className="ml-1 text-slate-600">({v1.x.toFixed(1)}, {v1.y.toFixed(1)})</span>
        </div>
        <div className="rounded-md bg-red-50 p-2">
          <span className="font-medium text-red-600">v₂</span>
          <span className="ml-1 text-slate-600">({v2.x.toFixed(1)}, {v2.y.toFixed(1)})</span>
        </div>
        <div className="rounded-md bg-violet-50 p-2">
          <span className="font-medium text-violet-600">v₁+v₂</span>
          <span className="ml-1 text-slate-600">({sum.x.toFixed(1)}, {sum.y.toFixed(1)})</span>
        </div>
        <div className="rounded-md bg-slate-50 p-2">
          <span className="text-slate-500">|v₁|</span>
          <span className="ml-1 text-slate-600">{norm1.toFixed(2)}</span>
          <span className="mx-1 text-slate-400">|</span>
          <span className="text-slate-500">|v₂|</span>
          <span className="ml-1 text-slate-600">{norm2.toFixed(2)}</span>
        </div>
      </div>

      {showDot && (
        <div className="rounded-md bg-emerald-50 p-2 text-xs">
          <span className="font-medium text-emerald-700">点积 v₁·v₂ = {dot.toFixed(2)}</span>
          <span className="mx-2 text-slate-300">|</span>
          <span className="font-medium text-emerald-700">cosθ = {cosAngle.toFixed(3)}</span>
          <span className="mx-2 text-slate-300">|</span>
          <span className="font-medium text-emerald-700">θ ≈ {angle.toFixed(1)}°</span>
          {Math.abs(dot) < 1e-6 && <span className="ml-2 text-emerald-600">正交 ✓</span>}
        </div>
      )}
    </div>
  );
}
