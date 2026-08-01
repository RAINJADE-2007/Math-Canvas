"use client";

import { useEffect, useRef, useState } from "react";
import type JXG from "jsxgraph";
import "@/styles/jsxgraph.css";
import { useMathCanvasStore, uid } from "@/store/useMathCanvasStore";
import { colorForIndex } from "@/constants/colors";
import { resolveCanvasRatio } from "@/constants/canvas";
import { createSafeFunction } from "@/math-engine/core/evaluator/evaluator";
import type { SafeFunction } from "@/math-engine/core/evaluator/evaluator";
import { sampleFunction } from "@/math-engine/core/evaluator/sampler";
import type { SampleChunk } from "@/math-engine/core/evaluator/sampler";
import { computeDerivative } from "@/math-engine/calculus-intro/derivative/differentiate";
import { calculateSecant, calculateTangent } from "@/math-engine/calculus-intro/tangent/calculateTangent";
import type { DerivativeResult, GeometryObject, GeometryObjectType, MathExpression, MathParameter } from "@/types";
import type { NumericFunction } from "@/math-engine/calculus-intro/derivative/numericalDerivative";
import { useHoverPointStore } from "@/store/useHoverPointStore";
import type { HoverValue } from "@/store/useHoverPointStore";
import { usePinnedPointsData } from "@/store/usePinnedPointsData";

type Board = JXG.Board;
type El = JXG.GeometryElement;
type JXGNamespace = typeof JXG;

const DERIVATIVE_COLOR = "#7c3aed";
const SAMPLE_STEPS = 800;

function makeRawNumericFn(expression: MathExpression, parameters: Record<string, MathParameter>): NumericFunction {
  const fn = createSafeFunction(expression.normalizedExpression);
  const paramValues: Record<string, number> = {};
  for (const p of expression.parameters) {
    const value = parameters[p]?.value;
    if (typeof value === "number") paramValues[p] = value;
  }
  return (x: number) => fn.evaluate(x, paramValues);
}

function makeNumericFn(expression: MathExpression, parameters: Record<string, MathParameter>): NumericFunction {
  const raw = makeRawNumericFn(expression, parameters);
  const dx = expression.translation?.dx ?? 0;
  const dy = expression.translation?.dy ?? 0;
  if (dx === 0 && dy === 0) return raw;
  return (x: number) => {
    const v = raw(x - dx);
    return Number.isFinite(v) ? v + dy : v;
  };
}

function makeTranslatedSafeFunction(
  expression: MathExpression,
  parameters: Record<string, MathParameter>,
): SafeFunction {
  const base = createSafeFunction(expression.normalizedExpression);
  const paramValues: Record<string, number> = {};
  for (const p of expression.parameters) {
    const value = parameters[p]?.value;
    if (typeof value === "number") paramValues[p] = value;
  }
  const dx = expression.translation?.dx ?? 0;
  const dy = expression.translation?.dy ?? 0;
  return {
    node: base.node,
    expression: base.expression,
    evaluate: (x: number, params?: Record<string, number>) => {
      const v = base.evaluate(x - dx, params ?? paramValues);
      return Number.isFinite(v) ? v + dy : v;
    },
    toString: () => base.toString(),
  };
}

function clearElements(board: Board, elements: El[]): void {
  for (const el of elements) {
    try {
      board.removeObject(el);
    } catch {
      /* ignore */
    }
  }
  elements.length = 0;
}

interface CurveInfo {
  elements: El[];
  chunks: SampleChunk[];
  numericFn: NumericFunction;
}

interface TangentInfo {
  glider?: JXG.Point;
  tangentLine: JXG.Line;
  secantLine?: JXG.Line;
  secantPoint?: El;
  text: JXG.Text;
  expressionId: string;
}

interface BoardController {
  board: Board;
  jxg: typeof JXG;
  curves: Map<string, CurveInfo>;
  derivativeCurves: El[];
  geometryElements: El[];
  criticalElements: El[];
  tangentElements: Map<string, TangentInfo>;
  pinnedPointElements: Map<string, El[]>;
  coordinateText: JXG.Text | null;
  lastCurveSignature: string;
  dragging: boolean;
  translateDrag: {
    expressionId: string;
    startUserX: number;
    startUserY: number;
    baseDx: number;
    baseDy: number;
  } | null;
  geometryPlacement: {
    type: "line" | "circle";
    startX: number;
    startY: number;
    elements: El[];
  } | null;
  geometryDrag: {
    id: string;
    type: GeometryObjectType;
    startUserX: number;
    startUserY: number;
    base: Partial<GeometryObject>;
  } | null;
  fns: Map<string, NumericFunction>;
  derivativeFns: Map<string, (x: number) => number>;
  redraw: () => void;
  autoFit: () => void;
  fitView: () => void;
  getViewInfo: () => ViewInfo;
}

interface ViewInfo {
  level: number;
  range: string;
}

function computeViewInfo(board: Board): ViewInfo {
  const bb = board.getBoundingBox();
  const width = Math.max(bb[2] - bb[0], 1e-6);
  const level = Math.max(1, Math.round((20 / width) * 100));
  const fmt = (n: number): string =>
    Math.abs(n) < 1e6 ? String(Number(n.toFixed(2))) : n.toExponential(2);
  const range = `x:[${fmt(bb[0])}, ${fmt(bb[2])}]  y:[${fmt(bb[3])}, ${fmt(bb[1])}]`;
  return { level, range };
}

function curveSignature(): string {
  const s = useMathCanvasStore.getState();
  const params = Object.keys(s.parameters)
    .sort()
    .map((k) => `${k}=${s.parameters[k].value}`)
    .join(",");
  const exprs = s.expressions
    .map((e) => `${e.id}|${e.normalizedExpression}|${e.visible}|${e.color}|${e.translation?.dx ?? 0}|${e.translation?.dy ?? 0}`)
    .join(";");
  const derivs = Object.keys(s.derivativeResults)
    .sort()
    .map((id) => `${id}|${s.derivativeResults[id].derivativeExpression ?? ""}|${s.derivativeResults[id].method}`)
    .join(";");
  const derivVis = Object.keys(s.derivativeVisibility)
    .sort()
    .map((id) => {
      const v = s.derivativeVisibility[id];
      return `${id}|${v.derivative}|${v.tangent}|${v.secant}|${v.criticalPoints}`;
    })
    .join(";");
  const geo = s.geometryObjects.map((g) => `${g.id}|${g.visible}|${g.type}|${g.x ?? ""}|${g.y ?? ""}|${g.x1 ?? ""}|${g.y1 ?? ""}|${g.x2 ?? ""}|${g.y2 ?? ""}|${g.centerX ?? ""}|${g.centerY ?? ""}|${g.radius ?? ""}`).join(";");
  const pinned = s.pinnedPoints.map((p) => `${p.id}|${p.expressionId}|${p.x}`).join(";");
  const settings = `${s.canvasSettings.showGrid}|${s.canvasSettings.showAxes}|${s.canvasSettings.showLabels}|${s.canvasSettings.showMonotonicityHint}`;
  return `${params}|${exprs}|${derivs}|${derivVis}|${geo}|${pinned}|${settings}`;
}

export function MathCanvasBoard() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<BoardController | null>(null);
  const [ready, setReady] = useState(false);
  const [viewInfo, setViewInfo] = useState<ViewInfo>({ level: 100, range: "" });
  const [canvasSize, setCanvasSize] = useState<{ w: number; h: number } | null>(null);
  const hoverData = useHoverPointStore((s) => s.data);

  const expressions = useMathCanvasStore((s) => s.expressions);
  const parameters = useMathCanvasStore((s) => s.parameters);
  const derivativeResults = useMathCanvasStore((s) => s.derivativeResults);
const derivativeVisibility = useMathCanvasStore((s) => s.derivativeVisibility);
  const geometryObjects = useMathCanvasStore((s) => s.geometryObjects);
  const pinnedPoints = useMathCanvasStore((s) => s.pinnedPoints);
  const removePinnedPoint = useMathCanvasStore((s) => s.removePinnedPoint);
  const clearPinnedPoints = useMathCanvasStore((s) => s.clearPinnedPoints);
  const showGrid = useMathCanvasStore((s) => s.canvasSettings.showGrid);
  const showAxes = useMathCanvasStore((s) => s.canvasSettings.showAxes);
  const showLabels = useMathCanvasStore((s) => s.canvasSettings.showLabels);
  const showMonotonicityHint = useMathCanvasStore((s) => s.canvasSettings.showMonotonicityHint);
  const canvasRatio = useMathCanvasStore((s) => s.canvasSettings.canvasRatio);
  const customRatio = useMathCanvasStore((s) => s.canvasSettings.customRatio);
  const updateCanvasSettings = useMathCanvasStore((s) => s.updateCanvasSettings);
  const viewVersion = useMathCanvasStore((s) => s.canvasSettings.viewVersion);
  const activeTool = useMathCanvasStore((s) => s.activeTool);
  const pinnedData = usePinnedPointsData();

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const updateSize = () => {
      const rect = wrapper.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      const ratio = resolveCanvasRatio(canvasRatio, customRatio);
      if (ratio === null) {
        setCanvasSize({ w: rect.width, h: rect.height });
        return;
      }
      const cellRatio = rect.width / rect.height;
      if (ratio > cellRatio) {
        setCanvasSize({ w: rect.width, h: rect.width / ratio });
      } else {
        setCanvasSize({ w: rect.height * ratio, h: rect.height });
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, [canvasRatio, customRatio]);

  useEffect(() => {
    let cancelled = false;
    let controller: BoardController | null = null;
    let cleanupListeners: (() => void) | null = null;
    let fitObserver: ResizeObserver | null = null;

    (async () => {
      const JXGModule = await import("jsxgraph");
      const JXG = (JXGModule.default ?? JXGModule) as JXGNamespace;
      if (cancelled || !containerRef.current) return;

      const containerId = "math-canvas-board";
      if (!containerRef.current.id) containerRef.current.id = containerId;

      const board = JXG.JSXGraph.initBoard(containerRef.current, {
        boundingbox: [-10, 10, 10, -10],
        axis: false,
        grid: false,
        pan: { needTwoFingers: false },
        zoom: { factorX: 1.2, factorY: 1.2 },
        showNavigation: false,
        keepaspectratio: false,
        resize: { enabled: true, throttle: 100 },
      }) as unknown as Board;

      const gridEl = board.create("grid", [], { strokeColor: "#e2e8f0", fixed: true }) as El;
      const xAxis = board.create("axis", [[-1000, 0], [1000, 0]], { strokeColor: "#94a3b8", strokeWidth: 1.2 }) as El;
      const yAxis = board.create("axis", [[0, -1000], [0, 1000]], { strokeColor: "#94a3b8", strokeWidth: 1.2 }) as El;

      const coordinateText = board.create(
        "text",
        [-9.8, 9.6, "x: 0.00, y: 0.00"],
        { fixed: true, anchorX: "left", anchorY: "top", fontSize: 12, strokeColor: "#64748b" },
      ) as JXG.Text;

      let lastHoverTime = 0;
      const updateHover = (x: number, y: number) => {
        const now = Date.now();
        if (now - lastHoverTime < 80) return;
        lastHoverTime = now;
        const s = useMathCanvasStore.getState();
        const values: HoverValue[] = [];
        for (const expr of s.expressions) {
          if (!expr.visible) continue;
          let fn = controller!.fns.get(expr.id);
          if (!fn) {
            fn = makeNumericFn(expr, s.parameters);
            controller!.fns.set(expr.id, fn);
          }
          const v = fn(x);
          let derivative: number | undefined;
          let derivativeValid = false;
          if (s.derivativeResults[expr.id]) {
            const dAt = derivativeAtFor(board, controller!, expr.id);
            if (dAt) {
              const dv = dAt(x);
              if (Number.isFinite(dv)) {
                derivative = dv;
                derivativeValid = true;
              }
            }
          }
          values.push({
            id: expr.id,
            label: expr.rawInput,
            color: expr.color,
            value: v,
            valid: Number.isFinite(v),
            derivative,
            derivativeValid,
          });
        }
        useHoverPointStore.getState().setData({ x, y, values });
      };

      try {
        board.on("move", (evt) => {
          if (board.getUsrCoordsOfMouse) {
            const coords = board.getUsrCoordsOfMouse(evt as MouseEvent);
            if (coords) {
              if (coordinateText.setText) {
                coordinateText.setText(`x: ${coords[0].toFixed(2)}, y: ${coords[1].toFixed(2)}`);
              }
              updateHover(coords[0], coords[1]);
            }
          }
        });
      } catch {
        /* 坐标提示为可选功能 */
      }

      const containerEl = containerRef.current;
      let panState: { startX: number; startY: number; bbox: number[] } | null = null;
      let lastTranslateTime = 0;
      let lastGeometryDragTime = 0;
      let pendingClick: {
        x: number;
        y: number;
        startClientX: number;
        startClientY: number;
        moved: boolean;
      } | null = null;

      const getUsrFromEvent = (e: PointerEvent): [number, number] | undefined => {
        try {
          const usr = board.getUsrCoordsOfMouse(e);
          return [usr[0], usr[1]];
        } catch {
          return undefined;
        }
      };

      const hasDraggableUnder = (scrX: number, scrY: number): boolean => {
        const list = (board as unknown as { objectsList: unknown[] }).objectsList;
        if (!list) return false;
        for (const raw of list) {
          const el = raw as {
            elType?: string;
            hasPoint?: (x: number, y: number) => boolean;
            isDraggable?: boolean;
            draggable?: () => boolean;
            visPropCalc?: { visible?: boolean };
          };
          const isDraggableEl = typeof el.draggable === "function"
            ? (() => {
                try {
                  return !!el.draggable();
                } catch {
                  return !!el.isDraggable;
                }
              })()
            : !!el.isDraggable;
          if (!el.hasPoint || !isDraggableEl) continue;
          const type = el.elType ?? "";
          if (type !== "point" && type !== "glider") continue;
          if (el.visPropCalc && el.visPropCalc.visible === false) continue;
          try {
            if (el.hasPoint(scrX, scrY)) return true;
          } catch {
            /* ignore */
          }
        }
        return false;
      };

      const onPointerDown = (e: PointerEvent) => {
        if (e.button !== 0) return;
        if (controller?.translateDrag) return;
        const tool = useMathCanvasStore.getState().activeTool;
        if (tool === "translate") return;
        if (tool === "add-point" || tool === "add-line" || tool === "add-circle") {
          const usr = getUsrFromEvent(e);
          if (!usr) return;
          pendingClick = { x: usr[0], y: usr[1], startClientX: e.clientX, startClientY: e.clientY, moved: false };
          e.preventDefault();
          return;
        }
        const boardAny = board as unknown as { getMousePosition?: (ev: PointerEvent) => [number, number] };
        let scr: [number, number] | undefined;
        try {
          scr = boardAny.getMousePosition ? boardAny.getMousePosition(e) : undefined;
        } catch {
          /* ignore */
        }
        if (!scr) return;
        if (hasDraggableUnder(scr[0], scr[1])) return;
        panState = { startX: e.clientX, startY: e.clientY, bbox: board.getBoundingBox().slice() };
        try {
          containerEl.style.cursor = "grabbing";
        } catch {
          /* ignore */
        }
        e.preventDefault();
      };

      const onPointerMove = (e: PointerEvent) => {
        const translateDrag = controller?.translateDrag;
        if (translateDrag) {
          const now = Date.now();
          if (now - lastTranslateTime >= 40) {
            lastTranslateTime = now;
            try {
              const coords = controller!.board.getUsrCoordsOfMouse(e as MouseEvent);
              if (coords) {
                const dx = translateDrag.baseDx + (coords[0] - translateDrag.startUserX);
                const dy = translateDrag.baseDy + (coords[1] - translateDrag.startUserY);
                useMathCanvasStore.getState().setExpressionTranslation(translateDrag.expressionId, { dx, dy });
              }
            } catch {
              /* ignore */
            }
          }
          e.preventDefault();
          return;
        }
        const geometryDrag = controller?.geometryDrag;
        if (geometryDrag) {
          const now = Date.now();
          if (now - lastGeometryDragTime >= 40) {
            lastGeometryDragTime = now;
            try {
              const usr = getUsrFromEvent(e);
              if (usr) {
                const dx = usr[0] - geometryDrag.startUserX;
                const dy = usr[1] - geometryDrag.startUserY;
                const patch = translateGeometryPatch(geometryDrag.type, geometryDrag.base, dx, dy);
                useMathCanvasStore.getState().moveGeometryObject(geometryDrag.id, patch);
              }
            } catch {
              /* ignore */
            }
          }
          e.preventDefault();
          return;
        }
        if (pendingClick) {
          if (!pendingClick.moved) {
            const moved =
              Math.abs(e.clientX - pendingClick.startClientX) > 4 || Math.abs(e.clientY - pendingClick.startClientY) > 4;
            if (moved) pendingClick.moved = true;
          }
          if (!pendingClick.moved && controller) {
            const usr = getUsrFromEvent(e);
            if (usr) updateGeometryPreview(board, controller, usr[0], usr[1]);
          }
          return;
        }
        if (controller?.geometryPlacement) {
          const usr = getUsrFromEvent(e);
          if (usr) updateGeometryPreview(board, controller, usr[0], usr[1]);
        }
        if (!panState) return;
        const rect = containerEl.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const dx = e.clientX - panState.startX;
        const dy = e.clientY - panState.startY;
        const bb = panState.bbox;
        const upx = (bb[2] - bb[0]) / rect.width;
        const upy = (bb[1] - bb[3]) / rect.height;
        const xShift = dx * upx;
        const yShift = dy * upy;
        try {
          board.setBoundingBox([bb[0] - xShift, bb[1] + yShift, bb[2] - xShift, bb[3] + yShift]);
        } catch {
          /* ignore */
        }
        e.preventDefault();
      };

      const onPointerUp = () => {
        if (controller?.translateDrag) {
          controller.translateDrag = null;
          lastTranslateTime = 0;
          try {
            containerEl.style.cursor = "";
          } catch {
            /* ignore */
          }
          try {
            controller.redraw();
          } catch {
            /* ignore */
          }
          return;
        }
        if (controller?.geometryDrag) {
          controller.geometryDrag = null;
          lastGeometryDragTime = 0;
          try {
            containerEl.style.cursor = "";
          } catch {
            /* ignore */
          }
          try {
            controller.redraw();
          } catch {
            /* ignore */
          }
          return;
        }
        if (pendingClick) {
          if (!pendingClick.moved && controller) {
            try {
              handleGeometryClick(board, controller, pendingClick.x, pendingClick.y);
            } catch {
              /* ignore */
            }
          }
          pendingClick = null;
          return;
        }
        if (!panState) return;
        panState = null;
        try {
          containerEl.style.cursor = "";
        } catch {
          /* ignore */
        }
        controller?.redraw();
      };

      const onLeave = () => {
        useHoverPointStore.getState().setData(null);
      };

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key !== "Escape") return;
        if (controller?.geometryPlacement) {
          clearGeometryPlacement(board, controller);
          try {
            controller.redraw();
          } catch {
            /* ignore */
          }
        }
        pendingClick = null;
      };

      containerEl.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
      containerEl.addEventListener("mouseleave", onLeave);
      window.addEventListener("keydown", onKeyDown);

      cleanupListeners = () => {
        containerEl.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerUp);
        containerEl.removeEventListener("mouseleave", onLeave);
        window.removeEventListener("keydown", onKeyDown);
      };

      controller = {
        board,
        jxg: JXG,
        curves: new Map(),
        derivativeCurves: [],
        geometryElements: [],
        criticalElements: [],
        tangentElements: new Map(),
        pinnedPointElements: new Map(),
        coordinateText,
        lastCurveSignature: "",
        dragging: false,
        translateDrag: null,
        geometryPlacement: null,
        geometryDrag: null,
        fns: new Map(),
        derivativeFns: new Map(),
        redraw: () => {
          /* implemented below */
        },
        autoFit: () => {
          const s = useMathCanvasStore.getState();
          const bb = board.getBoundingBox();
          const xMin = bb[0];
          const xMax = bb[2];
          let minY = Infinity;
          let maxY = -Infinity;
          for (const expr of s.expressions) {
            if (!expr.visible) continue;
            const fn = makeNumericFn(expr, s.parameters);
            for (let i = 0; i <= 300; i++) {
              const x = xMin + ((xMax - xMin) * i) / 300;
              const y = fn(x);
              if (Number.isFinite(y)) {
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              }
            }
          }
          if (!Number.isFinite(minY) || !Number.isFinite(maxY)) return;
          const span = maxY - minY;
          const pad = span > 0 ? span * 0.12 : 1;
          const centerX = (xMin + xMax) / 2;
          const centerY = (minY + maxY) / 2;
          const halfH = (span + pad * 2) / 2;
          const rect = containerEl.getBoundingClientRect();
          const ratio = rect.width / rect.height;
          const halfW = halfH * ratio;
          try {
            board.setBoundingBox([centerX - halfW, centerY + halfH, centerX + halfW, centerY - halfH]);
          } catch {
            /* ignore */
          }
        },
        fitView: () => {
          const rect = containerEl.getBoundingClientRect();
          if (rect.width < 2 || rect.height < 2) return;
          const bb = board.getBoundingBox();
          const halfH = (bb[1] - bb[3]) / 2;
          if (!Number.isFinite(halfH) || halfH <= 1e-9) return;
          const currentRatio = (bb[2] - bb[0]) / (bb[1] - bb[3]);
          const targetRatio = rect.width / rect.height;
          if (Math.abs(currentRatio - targetRatio) / Math.max(targetRatio, 1e-9) < 0.02) return;
          const centerX = (bb[0] + bb[2]) / 2;
          const centerY = (bb[1] + bb[3]) / 2;
          const halfW = halfH * targetRatio;
          try {
            board.setBoundingBox([centerX - halfW, centerY + halfH, centerX + halfW, centerY - halfH]);
          } catch {
            /* ignore */
          }
        },
        getViewInfo: () => computeViewInfo(board),
      };

      const applyVisibility = () => {
        const s = useMathCanvasStore.getState();
        try {
          gridEl.setAttribute({ visible: s.canvasSettings.showGrid });
          xAxis.setAttribute({ visible: s.canvasSettings.showAxes });
          yAxis.setAttribute({ visible: s.canvasSettings.showAxes });
        } catch {
          /* ignore */
        }
      };

      let lastBBox = "";
      board.on("update", () => {
        applyVisibility();
        const bb = board.getBoundingBox().join(",");
        if (bb === lastBBox) return;
        lastBBox = bb;
        setViewInfo(computeViewInfo(board));
        if (!panState) {
          window.setTimeout(() => controller?.redraw(), 120);
        }
      });

      controller.redraw = () => {
        const s = useMathCanvasStore.getState();
        applyVisibility();

        const sig = curveSignature();
        const curvesChanged = sig !== controller!.lastCurveSignature;

        if (curvesChanged) {
          controller!.lastCurveSignature = sig;
          controller!.dragging = false;

          clearElements(board, controller!.derivativeCurves);
          clearElements(board, controller!.geometryElements);
          clearElements(board, controller!.criticalElements);
          clearPinnedPointElements(board, controller!);

          for (const [_id, info] of controller!.curves) {
            for (const el of info.elements) {
              try {
                board.removeObject(el);
              } catch {
                /* ignore */
              }
            }
          }
          controller!.curves.clear();
          controller!.fns.clear();
          controller!.derivativeFns.clear();

          const bb = board.getBoundingBox();
          const xMin = bb[0];
          const xMax = bb[2];

          for (const expr of s.expressions) {
            if (!expr.visible) continue;
            const numericFn = makeNumericFn(expr, s.parameters);
            const safeFn = makeTranslatedSafeFunction(expr, s.parameters);
            const sampled = sampleFunction(safeFn, { min: xMin, max: xMax, steps: SAMPLE_STEPS });

            const elements: El[] = [];
            for (const chunk of sampled.chunks) {
              const el = board.create("curve", [chunk.xs, chunk.ys], {
                strokeColor: expr.color,
                strokeWidth: 2.5,
                name: expr.rawInput,
                withLabel: false,
                highlightStrokeColor: expr.color,
                highlightStrokeWidth: 3,
              }) as El;
              try {
                el.on("down", (evt) => {
                  const st = useMathCanvasStore.getState();
                  const tool = st.activeTool;
                  if (tool === "translate") {
                    try {
                      const coords = board.getUsrCoordsOfMouse(evt as MouseEvent);
                      if (coords) {
                        controller!.translateDrag = {
                          expressionId: expr.id,
                          startUserX: coords[0],
                          startUserY: coords[1],
                          baseDx: expr.translation?.dx ?? 0,
                          baseDy: expr.translation?.dy ?? 0,
                        };
                        containerEl.style.cursor = "grabbing";
                      }
                    } catch {
                      /* ignore */
                    }
                    return;
                  }
                  if (tool === "add-point" || tool === "add-line" || tool === "add-circle") return;
                  st.selectObject(expr.id);
                  try {
                    const coords = board.getUsrCoordsOfMouse(evt as MouseEvent);
                    if (coords && Number.isFinite(coords[0])) {
                      st.addPinnedPoint(expr.id, coords[0]);
                    }
                  } catch {
                    /* ignore */
                  }
                });
              } catch {
                /* ignore */
              }
              elements.push(el);
            }

            if (s.canvasSettings.showLabels && sampled.chunks.length > 0) {
              const lastChunk = sampled.chunks[sampled.chunks.length - 1];
              const lastIndex = lastChunk.xs.length - 1;
              const labelX = lastChunk.xs[lastIndex];
              const labelY = lastChunk.ys[lastIndex];
              try {
                const textEl = board.create("text", [labelX, labelY, expr.rawInput], {
                  fontSize: 11,
                  strokeColor: expr.color,
                  anchorX: "right",
                }) as El;
                elements.push(textEl);
              } catch {
                /* ignore */
              }
            }

            controller!.curves.set(expr.id, { elements, chunks: sampled.chunks, numericFn });
            controller!.fns.set(expr.id, numericFn);
          }

          for (const expr of s.expressions) {
            if (!expr.visible) continue;
            const derivative = s.derivativeResults[expr.id];
            if (!derivative?.derivativeExpression) continue;
            if (s.derivativeVisibility[expr.id]?.derivative === false) continue;
            const paramValues: Record<string, number> = {};
            for (const p of expr.parameters) {
              const v = s.parameters[p]?.value;
              if (typeof v === "number") paramValues[p] = v;
            }
            const dFn = createSafeFunction(derivative.derivativeExpression);
            const dx = expr.translation?.dx ?? 0;
            const dSafe: SafeFunction = {
              ...dFn,
              evaluate: (x: number, params?: Record<string, number>) => dFn.evaluate(x - dx, params ?? {}),
            };
            const sampled = sampleFunction(dSafe, { min: xMin, max: xMax, steps: SAMPLE_STEPS }, paramValues);
            for (const chunk of sampled.chunks) {
              const el = board.create("curve", [chunk.xs, chunk.ys], {
                strokeColor: DERIVATIVE_COLOR,
                strokeWidth: 2,
                dash: 1,
                name: `f'(${expr.rawInput})`,
                withLabel: false,
              }) as El;
              try {
                el.on("down", () => {
                  useMathCanvasStore.getState().selectObject(expr.id);
                });
              } catch {
                /* ignore */
              }
              controller!.derivativeCurves.push(el);
            }
          }

          drawGeometry(board, controller!, s.geometryObjects, s.canvasSettings.showLabels);
          drawCriticalPoints(board, controller!, s);
          drawPinnedPoints(board, controller!, s);
        }

        drawTangents(board, controller!);
        
        try {
          board.update();
        } catch {
          /* ignore */
        }
        lastBBox = board.getBoundingBox().join(",");
      };

      controller.redraw();
      setViewInfo(computeViewInfo(board));
      setReady(true);
      controllerRef.current = controller;
      try {
        controller.fitView();
      } catch {
        /* ignore */
      }

      if (typeof ResizeObserver !== "undefined") {
        fitObserver = new ResizeObserver(() => {
          try {
            controller?.fitView();
          } catch {
            /* ignore */
          }
        });
        if (containerEl) fitObserver.observe(containerEl);
      }
    })();

    return () => {
      cancelled = true;
      try {
        cleanupListeners?.();
      } catch {
        /* ignore */
      }
      try {
        fitObserver?.disconnect();
      } catch {
        /* ignore */
      }
      try {
        if (controllerRef.current) {
          const board = controllerRef.current.board;
          const jxg = controllerRef.current.jxg;
          if (jxg && jxg.JSXGraph.freeBoard && board) {
            jxg.JSXGraph.freeBoard(board);
          }
        }
      } catch {
        /* ignore */
      }
      controllerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready || !controllerRef.current) return;
    controllerRef.current.redraw();
  }, [ready, expressions, parameters, derivativeResults, derivativeVisibility, geometryObjects, pinnedPoints, showGrid, showAxes, showLabels, showMonotonicityHint]);

  useEffect(() => {
    if (!ready || !controllerRef.current) return;
    clearGeometryPlacement(controllerRef.current.board, controllerRef.current);
  }, [ready, activeTool]);

  useEffect(() => {
    if (!ready || !controllerRef.current) return;
    const s = useMathCanvasStore.getState();
    try {
      controllerRef.current.board.setBoundingBox([
        s.canvasSettings.xMin,
        s.canvasSettings.yMax,
        s.canvasSettings.xMax,
        s.canvasSettings.yMin,
      ]);
    } catch {
      /* ignore */
    }
    try {
      controllerRef.current.fitView();
    } catch {
      /* ignore */
    }
  }, [ready, viewVersion]);

  return (
    <div ref={wrapperRef} className="flex h-full w-full items-center justify-center">
      <div
        className="relative h-full w-full"
        style={canvasSize ? { width: canvasSize.w, height: canvasSize.h } : undefined}
      >
        <div
          ref={containerRef}
          className={`h-full w-full ${
            activeTool === "pan"
              ? "cursor-grab"
              : activeTool === "add-point" || activeTool === "add-line" || activeTool === "add-circle"
                ? "cursor-crosshair"
                : ""
          }`}
        />
      {activeTool === "add-point" || activeTool === "add-line" || activeTool === "add-circle" ? (
        <div className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-primary-600/90 px-2.5 py-1 text-xs text-white shadow-card">
          {activeTool === "add-point"
            ? "点击画布添加点"
            : activeTool === "add-line"
              ? "点击两点创建直线（Esc 取消）"
              : "先点击圆心，再点击圆周上一点（Esc 取消）"}
        </div>
      ) : null}
      {!ready ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/85">
          <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-primary-200 border-t-primary-600" />
          <p className="mt-3 text-sm text-slate-500">正在初始化坐标画布…</p>
        </div>
      ) : (
        <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white/95 px-1.5 py-1 shadow-card">
            <button
              type="button"
              title="放大"
              onClick={() => controllerRef.current?.board.zoomIn()}
              className="flex h-7 w-7 items-center justify-center rounded-md text-base font-semibold text-slate-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
            >
              ＋
            </button>
            <button
              type="button"
              title="缩小"
              onClick={() => controllerRef.current?.board.zoomOut()}
              className="flex h-7 w-7 items-center justify-center rounded-md text-base font-semibold text-slate-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
            >
              −
            </button>
            <button
              type="button"
              title="自动适配：按当前横坐标范围调整纵坐标，使函数图像完整可见"
              onClick={() => controllerRef.current?.autoFit()}
              className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
            >
              适配
            </button>
            <button
              type="button"
              title="将两坐标轴单位长度调整为 1:1（正方形画布）"
              onClick={() => updateCanvasSettings({ canvasRatio: "1:1" })}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                canvasRatio === "1:1"
                  ? "bg-primary-600 text-white"
                  : "text-slate-600 hover:bg-primary-50 hover:text-primary-700"
              }`}
            >
              1:1
            </button>
            <span className="w-11 text-center font-mono text-xs text-slate-600">{viewInfo.level}%</span>
          </div>
          <div className="rounded-md bg-white/85 px-2 py-0.5 font-mono text-[10px] text-slate-500">
            {viewInfo.range}
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute bottom-3 right-3 z-10 w-72 max-w-[80%] rounded-lg border border-slate-200 bg-white/95 p-3 shadow-card">
        <p className="text-xs font-semibold text-slate-500">点的数据</p>
        {hoverData ? (
          <>
            <p className="mt-1 font-mono text-xs text-slate-700">
              P({fmt2(hoverData.x)}, {fmt2(hoverData.y)})
            </p>
            {hoverData.values.length > 0 ? (
              <ul className="mt-1.5 space-y-1">
                {hoverData.values.map((v) => (
                  <li key={v.id} className="flex items-center gap-1.5 text-xs">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: v.color }} />
                    <span className="max-w-[80px] truncate text-slate-500" title={v.label}>
                      {v.label}
                    </span>
                    <span className="ml-auto font-mono text-slate-700">{v.valid ? fmt2(v.value) : "无定义"}</span>
                    {v.derivativeValid && v.derivative !== undefined ? (
                      <span className="font-mono text-violet-600">{"f'="}{fmt2(v.derivative)}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-xs text-slate-400">添加函数后，此处会显示各函数在该点的取值。</p>
            )}
          </>
        ) : (
          <p className="mt-1 text-xs text-slate-400">将鼠标移动到画布上，查看各点的坐标与函数值。</p>
        )}

        <div className="mt-2 border-t border-slate-100 pt-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-500">
              已选取的点{pinnedData.length > 0 ? `（${pinnedData.length}）` : ""}
            </p>
            {pinnedData.length > 0 ? (
              <button
                type="button"
                onClick={clearPinnedPoints}
                className="pointer-events-auto rounded px-1.5 py-0.5 text-[10px] text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                清空
              </button>
            ) : null}
          </div>
          {pinnedData.length > 0 ? (
            <ul className="panel-scroll mt-1 max-h-40 space-y-1 overflow-y-auto">
              {pinnedData.map((info) => {
                const p = info.point;
                return (
                  <li key={p.id} className="flex items-center gap-1.5 text-xs">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: info.expression.color }}
                    />
                    <span className="max-w-[64px] truncate text-slate-500" title={info.expression.rawInput}>
                      {info.expression.rawInput}
                    </span>
                    <span className="font-mono text-slate-700">
                      ({fmt2(p.x)}, {info.valid ? fmt2(info.y) : "无定义"})
                    </span>
                    {info.derivativeValid && info.derivative !== undefined ? (
                      <span className="font-mono text-violet-600">{"f'="}{fmt2(info.derivative)}</span>
                    ) : null}
                    <button
                      type="button"
                      title="移除该点"
                      onClick={() => removePinnedPoint(p.id)}
                      className="pointer-events-auto ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-1 text-xs text-slate-400">点击曲线可选取该点并固定显示数据，拖动标记可移动。</p>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

function fmt2(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return Number.isInteger(n) ? String(n) : n.toFixed(3);
}

function clearPinnedPointElements(board: Board, controller: BoardController): void {
  for (const [_id, elements] of controller.pinnedPointElements) {
    for (const el of elements) {
      try {
        board.removeObject(el);
      } catch {
        /* ignore */
      }
    }
  }
  controller.pinnedPointElements.clear();
}

function chunkForX(curveInfo: CurveInfo, x: number): SampleChunk | undefined {
  for (const chunk of curveInfo.chunks) {
    if (x >= chunk.xs[0] && x <= chunk.xs[chunk.xs.length - 1]) return chunk;
  }
  return undefined;
}

function drawPinnedPoints(
  board: Board,
  controller: BoardController,
  s: ReturnType<typeof useMathCanvasStore.getState>,
): void {
  for (const point of s.pinnedPoints) {
    const expr = s.expressions.find((e) => e.id === point.expressionId);
    if (!expr || !expr.visible) continue;
    const curveInfo = controller.curves.get(expr.id);
    if (!curveInfo) continue;
    const numericFn = curveInfo.numericFn;
    const y = numericFn(point.x);
    if (!Number.isFinite(y)) continue;
    const chunk = chunkForX(curveInfo, point.x);
    const curveEl = chunk ? findCurveForX(curveInfo, point.x) : undefined;
    if (!chunk || !curveEl) continue;

    const elements: El[] = [];
    let glider: JXG.Point | undefined;
    try {
      glider = board.create("glider", [point.x, y, curveEl], {
        size: 4,
        face: "circle",
        strokeColor: expr.color,
        fillColor: "#ffffff",
        withLabel: false,
      }) as JXG.Point;
      elements.push(glider);
    } catch {
      glider = undefined;
    }

    let text: JXG.Text | undefined;
    try {
      text = board.create("text", [point.x, y + 0.45, `(${fmt(point.x)}, ${fmt(y)})`], {
        fontSize: 10,
        strokeColor: expr.color,
        anchorY: "bottom",
        fixed: false,
      }) as JXG.Text;
      elements.push(text);
    } catch {
      text = undefined;
    }

    if (glider) {
      try {
        glider.on("drag", () => {
          const gx = glider?.X ? glider.X() : point.x;
          if (!Number.isFinite(gx)) return;
          const gy = numericFn(gx);
          if (Number.isFinite(gy) && text && text.setText) {
            text.setText(`(${fmt(gx)}, ${fmt(gy)})`);
          }
        });
        glider.on("up", () => {
          const gx = glider?.X ? glider.X() : point.x;
          if (!Number.isFinite(gx)) return;
          useMathCanvasStore.getState().updatePinnedPoint(point.id, { x: gx });
        });
      } catch {
        /* ignore */
      }
    }

    controller.pinnedPointElements.set(point.id, elements);
  }
}

const PLACEMENT_COLOR = "#2563eb";

function nextGeometryLabel(objects: GeometryObject[], type: GeometryObjectType): string {
  if (type === "point") {
    const used = new Set(objects.filter((o) => o.type === "point").map((o) => o.label));
    for (let i = 0; i < 26; i++) {
      const letter = String.fromCharCode(65 + i);
      if (!used.has(letter)) return letter;
    }
    return `P${objects.length + 1}`;
  }
  const count = objects.filter((o) => o.type === type).length + 1;
  return type === "line" ? `l${count}` : `c${count}`;
}

function clearGeometryPlacement(board: Board, controller: BoardController): void {
  const placement = controller.geometryPlacement;
  if (!placement) return;
  for (const el of placement.elements) {
    try {
      board.removeObject(el);
    } catch {
      /* ignore */
    }
  }
  controller.geometryPlacement = null;
}

function startGeometryPlacement(
  board: Board,
  controller: BoardController,
  type: "line" | "circle",
  x: number,
  y: number,
): void {
  clearGeometryPlacement(board, controller);
  const elements: El[] = [];
  try {
    elements.push(
      board.create("point", [x, y], {
        size: 2,
        face: "circle",
        strokeColor: PLACEMENT_COLOR,
        fillColor: PLACEMENT_COLOR,
        withLabel: false,
      }) as El,
    );
  } catch {
    /* ignore */
  }
  try {
    if (type === "line") {
      elements.push(
        board.create("line", [[x, y], [x, y]], {
          strokeColor: PLACEMENT_COLOR,
          strokeWidth: 1.5,
          dash: 1,
          withLabel: false,
        }) as El,
      );
    } else {
      elements.push(
        board.create("circle", [[x, y], 0.001], {
          strokeColor: PLACEMENT_COLOR,
          strokeWidth: 1.5,
          dash: 1,
          withLabel: false,
        }) as El,
      );
    }
  } catch {
    /* ignore */
  }
  controller.geometryPlacement = { type, startX: x, startY: y, elements };
}

function updateGeometryPreview(board: Board, controller: BoardController, x: number, y: number): void {
  const placement = controller.geometryPlacement;
  if (!placement) return;
  try {
    if (placement.type === "line") {
      const line = placement.elements.find(
        (el) => (el as JXG.Line).point1 && (el as JXG.Line).point2,
      ) as JXG.Line | undefined;
      if (line?.point1?.setPosition) line.point1.setPosition(1, [placement.startX, placement.startY]);
      if (line?.point2?.setPosition) line.point2.setPosition(1, [x, y]);
    } else {
      const circle = placement.elements.find(
        (el) => typeof (el as { setRadius?: (r: number) => void }).setRadius === "function",
      ) as (El & { setRadius?: (r: number) => void }) | undefined;
      if (circle?.setRadius) circle.setRadius(Math.hypot(x - placement.startX, y - placement.startY));
    }
    try {
      board.update();
    } catch {
      /* ignore */
    }
  } catch {
    /* ignore */
  }
}

function handleGeometryClick(board: Board, controller: BoardController, x: number, y: number): void {
  const s = useMathCanvasStore.getState();
  const tool = s.activeTool;
  if (tool === "add-point") {
    const obj: GeometryObject = {
      id: uid("geo"),
      type: "point",
      label: nextGeometryLabel(s.geometryObjects, "point"),
      color: colorForIndex(s.geometryObjects.length),
      visible: true,
      x,
      y,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    s.addGeometryObject(obj);
    s.selectObject(obj.id);
    return;
  }
  if (tool === "add-line") {
    const placement = controller.geometryPlacement;
    if (!placement) {
      startGeometryPlacement(board, controller, "line", x, y);
      return;
    }
    const obj: GeometryObject = {
      id: uid("geo"),
      type: "line",
      label: nextGeometryLabel(s.geometryObjects, "line"),
      color: colorForIndex(s.geometryObjects.length),
      visible: true,
      x1: placement.startX,
      y1: placement.startY,
      x2: x,
      y2: y,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    clearGeometryPlacement(board, controller);
    s.addGeometryObject(obj);
    s.selectObject(obj.id);
    return;
  }
  if (tool === "add-circle") {
    const placement = controller.geometryPlacement;
    if (!placement) {
      startGeometryPlacement(board, controller, "circle", x, y);
      return;
    }
    const radius = Math.hypot(x - placement.startX, y - placement.startY);
    clearGeometryPlacement(board, controller);
    if (!Number.isFinite(radius) || radius <= 1e-9) return;
    const obj: GeometryObject = {
      id: uid("geo"),
      type: "circle",
      label: nextGeometryLabel(s.geometryObjects, "circle"),
      color: colorForIndex(s.geometryObjects.length),
      visible: true,
      centerX: placement.startX,
      centerY: placement.startY,
      radius,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    s.addGeometryObject(obj);
    s.selectObject(obj.id);
  }
}

function translateGeometryPatch(
  type: GeometryObjectType,
  base: Partial<GeometryObject>,
  dx: number,
  dy: number,
): Partial<GeometryObject> {
  if (type === "point") {
    return { x: (base.x ?? 0) + dx, y: (base.y ?? 0) + dy };
  }
  if (type === "line" || type === "segment") {
    return {
      x1: (base.x1 ?? 0) + dx,
      y1: (base.y1 ?? 0) + dy,
      x2: (base.x2 ?? 0) + dx,
      y2: (base.y2 ?? 0) + dy,
    };
  }
  return {
    centerX: (base.centerX ?? 0) + dx,
    centerY: (base.centerY ?? 0) + dy,
  };
}

function bindGeometryDown(board: Board, controller: BoardController, el: El, g: GeometryObject): void {
  try {
    el.on("down", (evt) => {
      const st = useMathCanvasStore.getState();
      st.selectObject(g.id);
      if (st.activeTool === "translate") {
        try {
          const coords = board.getUsrCoordsOfMouse(evt as MouseEvent);
          if (coords) {
            controller.geometryDrag = {
              id: g.id,
              type: g.type,
              startUserX: coords[0],
              startUserY: coords[1],
              base: {
                x: g.x,
                y: g.y,
                x1: g.x1,
                y1: g.y1,
                x2: g.x2,
                y2: g.y2,
                centerX: g.centerX,
                centerY: g.centerY,
                radius: g.radius,
              },
            };
          }
        } catch {
          /* ignore */
        }
      }
    });
  } catch {
    /* ignore */
  }
}

function drawGeometry(board: Board, controller: BoardController, geometryObjects: GeometryObject[], showLabels: boolean): void {
  for (const g of geometryObjects) {
    if (!g.visible) continue;
    try {
      if (g.type === "point" && g.x !== undefined && g.y !== undefined) {
        const el = board.create("point", [g.x, g.y], {
          name: g.label,
          withLabel: showLabels,
          size: 3,
          strokeColor: g.color,
          fillColor: g.color,
          fixed: true,
        }) as El;
        bindGeometryDown(board, controller, el, g);
        controller.geometryElements.push(el);
      } else if (g.type === "line" && g.x1 !== undefined) {
        const el = board.create("line", [[g.x1, g.y1], [g.x2, g.y2]], {
          strokeColor: g.color,
          strokeWidth: 2,
          name: g.label,
          withLabel: showLabels,
          fixed: true,
        }) as El;
        bindGeometryDown(board, controller, el, g);
        controller.geometryElements.push(el);
      } else if (g.type === "segment" && g.x1 !== undefined) {
        const el = board.create("segment", [[g.x1, g.y1], [g.x2, g.y2]], {
          strokeColor: g.color,
          strokeWidth: 2.5,
          name: g.label,
          withLabel: showLabels,
          fixed: true,
        }) as El;
        bindGeometryDown(board, controller, el, g);
        controller.geometryElements.push(el);
      } else if (g.type === "circle" && g.centerX !== undefined && g.radius !== undefined) {
        const el = board.create("circle", [[g.centerX, g.centerY], g.radius], {
          strokeColor: g.color,
          strokeWidth: 2,
          name: g.label,
          withLabel: showLabels,
          fixed: true,
        }) as El;
        bindGeometryDown(board, controller, el, g);
        controller.geometryElements.push(el);
      }
    } catch {
      /* 单个几何对象绘制失败不影响整体 */
    }
  }
}

function drawCriticalPoints(board: Board, controller: BoardController, s: ReturnType<typeof useMathCanvasStore.getState>): void {
  for (const expr of s.expressions) {
    const derivative = s.derivativeResults[expr.id];
    if (!derivative) continue;
    if (s.derivativeVisibility[expr.id]?.criticalPoints === false) continue;
    const fn = controller.fns.get(expr.id);
    if (!fn) continue;
    const dx = expr.translation?.dx ?? 0;
    for (const cp of derivative.criticalPoints) {
      const x = cp + dx;
      const y = fn(x);
      if (!Number.isFinite(y)) continue;
      const el = board.create("point", [x, y], {
        size: 2.5,
        face: "cross",
        strokeColor: "#475569",
      }) as El;
      controller.criticalElements.push(el);

      if (s.canvasSettings.showMonotonicityHint) {
        try {
          const text = board.create("text", [x, y, `${x.toFixed(2)}`], {
            fontSize: 10,
            strokeColor: "#475569",
            anchorY: "bottom",
          }) as El;
          controller.criticalElements.push(text);
        } catch {
          /* ignore */
        }
      }
    }

    if (s.canvasSettings.showMonotonicityHint) {
      for (const interval of derivative.monotonicIntervals) {
        if (interval.type === "unknown") continue;
        const start = interval.start ?? s.canvasSettings.xMin;
        const end = interval.end ?? s.canvasSettings.xMax;
        const mid = (start + end) / 2;
        const label = interval.type === "increasing" ? "↗ 递增" : interval.type === "decreasing" ? "↘ 递减" : "→ 恒定";
        try {
          const text = board.create("text", [mid, -8.6, label], {
            fontSize: 11,
            strokeColor: "#94a3b8",
            anchorY: "top",
          }) as El;
          controller.criticalElements.push(text);
        } catch {
          /* ignore */
        }
      }
    }
  }
}

function derivativeAtFor(board: Board, controller: BoardController, exprId: string): ((x: number) => number) | undefined {
  if (controller.derivativeFns.has(exprId)) return controller.derivativeFns.get(exprId);
  const s = useMathCanvasStore.getState();
  const expr = s.expressions.find((e) => e.id === exprId);
  if (!expr) return undefined;
  const rawFn = makeRawNumericFn(expr, s.parameters);
  const computed = computeDerivative({ expression: expr.normalizedExpression, fn: rawFn });
  const dx = expr.translation?.dx ?? 0;
  const derivativeAt = dx === 0 ? computed.derivativeAt : (x: number) => computed.derivativeAt(x - dx);
  controller.derivativeFns.set(exprId, derivativeAt);
  return derivativeAt;
}

function drawTangents(board: Board, controller: BoardController): void {
  const s = useMathCanvasStore.getState();

  for (const [exprId, info] of controller.tangentElements) {
    if (!s.derivativeResults[exprId]) {
      removeTangentElements(board, info);
      controller.tangentElements.delete(exprId);
    }
  }

  for (const expr of s.expressions) {
    const derivative = s.derivativeResults[expr.id];
    if (!derivative) continue;
    const vis = s.derivativeVisibility[expr.id];
    const showTangent = vis?.tangent !== false;
    const showSecant = vis?.secant !== false;

    if (!showTangent) {
      const existing = controller.tangentElements.get(expr.id);
      if (existing) {
        removeTangentElements(board, existing);
        controller.tangentElements.delete(expr.id);
      }
      continue;
    }

    const tangent = derivative.tangent;
    const curveInfo = controller.curves.get(expr.id);
    if (!curveInfo || !tangent) continue;

    const derivativeAt = derivativeAtFor(board, controller, expr.id);
    const secant = derivative.secant;
    const baseY = Number.isFinite(curveInfo.numericFn(tangent.x)) ? curveInfo.numericFn(tangent.x) : tangent.y;
    const baseSlope =
      derivativeAt && Number.isFinite(derivativeAt(tangent.x)) ? derivativeAt(tangent.x) : tangent.slope;

    let tangentInfo = controller.tangentElements.get(expr.id);
    const curveEl = findCurveForX(curveInfo, tangent.x);
    const shouldRebuild = !tangentInfo || !tangentInfo.glider || (curveEl !== undefined && !controller.dragging);

    if (shouldRebuild) {
      if (tangentInfo) {
        removeTangentElements(board, tangentInfo);
        controller.tangentElements.delete(expr.id);
      }

      let glider: JXG.Point | undefined;
      if (curveEl) {
        try {
          glider = board.create("glider", [tangent.x, baseY, curveEl], {
            name: "P",
            size: 4,
            face: "circle",
            strokeColor: expr.color,
            fillColor: "#ffffff",
            withLabel: true,
          }) as JXG.Point;
          try {
            glider.on("drag", () => {
              controller.dragging = true;
              const gx = glider?.X ? glider.X() : tangent.x;
              if (!Number.isFinite(gx) || !derivativeAt) return;
              const numericFn = curveInfo.numericFn;
              const newTangent = calculateTangent(gx, numericFn, derivativeAt);
              const newSecant = calculateSecant(gx, derivative.secant?.h ?? 2, numericFn);
              const st = useMathCanvasStore.getState();
              st.setDerivativeResult(expr.id, {
                ...st.derivativeResults[expr.id],
                tangent: newTangent,
                secant: newSecant,
              });
            });
            glider.on("up", () => {
              controller.dragging = false;
            });
          } catch {
            /* ignore */
          }
        } catch {
          glider = undefined;
        }
      }

      const tangentLine = board.create("line", [[tangent.x, baseY], [tangent.x + 1, baseY + (Number.isFinite(baseSlope) ? baseSlope : 0)]], {
        strokeColor: "#dc2626",
        strokeWidth: 2,
        dash: 2,
        name: "切线",
        withLabel: false,
      }) as JXG.Line;

      const secantLine = showSecant
        ? (board.create("line", [[tangent.x, baseY], [secant?.x2 ?? tangent.x + 2, secant?.y2 ?? baseY]], {
            strokeColor: "#d97706",
            strokeWidth: 1.8,
            name: "割线",
            withLabel: false,
          }) as JXG.Line)
        : undefined;

      let secantPoint: El | undefined;
      if (showSecant && secant && Number.isFinite(secant.x2) && Number.isFinite(secant.y2)) {
        secantPoint = board.create("point", [secant.x2, secant.y2], {
          name: "Q",
          size: 3,
          face: "square",
          strokeColor: "#d97706",
          fillColor: "#ffffff",
          withLabel: true,
        }) as El;
      }

      const text = board.create("text", [0, 0, ""], {
        fixed: true,
        anchorX: "left",
        anchorY: "bottom",
        fontSize: 12,
        strokeColor: "#1e293b",
      }) as JXG.Text;

      tangentInfo = {
        glider,
        tangentLine,
        secantLine,
        secantPoint,
        text,
        expressionId: expr.id,
      };
      controller.tangentElements.set(expr.id, tangentInfo);
    }

    const info = tangentInfo!;
    const activeX = info.glider ? info.glider.X() : tangent.x;
    const numericFn = curveInfo.numericFn;
    const currentTangent = calculateTangent(activeX, numericFn, derivativeAt ?? ((_x: number) => Number.NaN));
    const currentSecant = calculateSecant(activeX, derivative.secant?.h ?? 2, numericFn);

    try {
      const lineEndX = activeX + 1;
      const slope = Number.isFinite(currentTangent.slope) ? currentTangent.slope : 0;
      const lineEndY = currentTangent.y + slope;
      if (info.tangentLine.point1 && info.tangentLine.point1.setPosition) {
        info.tangentLine.point1.setPosition(1, [activeX, currentTangent.y]);
      }
      if (info.tangentLine.point2 && info.tangentLine.point2.setPosition) {
        info.tangentLine.point2.setPosition(1, [lineEndX, lineEndY]);
      }
    } catch {
      /* ignore */
    }

    try {
      if (showSecant && info.secantLine && currentSecant && Number.isFinite(currentSecant.x2) && Number.isFinite(currentSecant.y2)) {
        if (info.secantLine.point1 && info.secantLine.point1.setPosition) {
          info.secantLine.point1.setPosition(1, [activeX, currentTangent.y]);
        }
        if (info.secantLine.point2 && info.secantLine.point2.setPosition) {
          info.secantLine.point2.setPosition(1, [currentSecant.x2, currentSecant.y2]);
        }
      }
    } catch {
      /* ignore */
    }

    try {
      if (showSecant && info.secantPoint && currentSecant && Number.isFinite(currentSecant.x2) && Number.isFinite(currentSecant.y2)) {
        info.secantPoint.setPosition(1, [currentSecant.x2, currentSecant.y2]);
      }
    } catch {
      /* ignore */
    }

    try {
      info.text.setText(buildTangentText(currentTangent, showSecant ? currentSecant : undefined));
    } catch {
      /* ignore */
    }
  }
}

function removeTangentElements(board: Board, info: TangentInfo): void {
  try {
    if (info.glider) board.removeObject(info.glider);
  } catch {
    /* ignore */
  }
  try {
    board.removeObject(info.tangentLine);
  } catch {
    /* ignore */
  }
  try {
    if (info.secantLine) board.removeObject(info.secantLine);
  } catch {
    /* ignore */
  }
  try {
    if (info.secantPoint) board.removeObject(info.secantPoint);
  } catch {
    /* ignore */
  }
  try {
    board.removeObject(info.text);
  } catch {
    /* ignore */
  }
}

function findCurveForX(curveInfo: CurveInfo, x: number): El | undefined {
  for (let i = 0; i < curveInfo.chunks.length; i++) {
    const chunk = curveInfo.chunks[i];
    if (x >= chunk.xs[0] && x <= chunk.xs[chunk.xs.length - 1]) {
      return curveInfo.elements[i];
    }
  }
  return curveInfo.elements[0];
}

function buildTangentText(tangent: DerivativeResult["tangent"], secant: DerivativeResult["secant"]): string {
  if (!tangent) return "";
  const parts = [
    `P(${fmt(tangent.x)}, ${fmt(tangent.y)})`,
    `f'(${fmt(tangent.x)}) = ${fmt(tangent.slope)}`,
    `切线：${tangent.equation}`,
  ];
  if (secant && Number.isFinite(secant.slope)) {
    parts.push(`割线斜率 k_h = ${fmt(secant.slope)}，|k_h − f'(a)| = ${fmt(Math.abs(secant.slope - tangent.slope))}`);
  }
  return parts.join("　");
}

function fmt(n: number): string {
  if (!Number.isFinite(n)) return "无法计算";
  return Number.isInteger(n) ? String(n) : n.toFixed(4);
}


