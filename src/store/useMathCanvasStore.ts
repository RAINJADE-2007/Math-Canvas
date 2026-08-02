import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PersistStorage } from "zustand/middleware";
import type {
  CalculatorRecord,
  CanvasSettings,
  DerivativeResult,
  DerivativeVisibility,
  GeometryObject,
  MathCanvasData,
  MathCanvasState,
  MathDataset,
  MathExpression,
  MathParameter,
  PinnedPoint,
  SavedMathCanvasDocument,
  SolutionRecord,
  SubjectId,
  ToolId,
} from "@/types";
import { DEFAULT_CANVAS_BOUNDS, MAX_EXPRESSIONS, MAX_PARAMETERS, PROJECT_VERSION, SCHEMA_VERSION, STORAGE_KEY } from "@/constants/app";
import { colorForIndex } from "@/constants/colors";
import { parseExpressionInput } from "@/math-engine/core/parser/parseExpression";
import { buildDerivativeResult } from "@/math-engine/calculus-intro/derivative/derivativeAnalysis";

const MAX_HISTORY = 50;

export function uid(prefix = "id"): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function defaultCanvasSettings(): CanvasSettings {
  return {
    xMin: DEFAULT_CANVAS_BOUNDS.xMin,
    xMax: DEFAULT_CANVAS_BOUNDS.xMax,
    yMin: DEFAULT_CANVAS_BOUNDS.yMin,
    yMax: DEFAULT_CANVAS_BOUNDS.yMax,
    showGrid: true,
    showAxes: true,
    showLabels: true,
    showMonotonicityHint: false,
    canvasRatio: "1:1",
    customRatio: 1.6,
    viewVersion: 0,
  };
}

function snapshotData(state: MathCanvasState): MathCanvasData {
  const { past: _past, future: _future, ...data } = state;
  return JSON.parse(JSON.stringify(data)) as MathCanvasData;
}

function withHistory(state: MathCanvasState): Pick<MathCanvasState, "past" | "future"> {
  return {
    past: [...state.past, snapshotData(state)].slice(-MAX_HISTORY),
    future: [],
  };
}

function defaultState(): Omit<MathCanvasState, "past" | "future"> {
  return {
    currentSubject: "middle-school",
    documentName: "未命名文档",
    expressions: [],
    geometryObjects: [],
    datasets: [],
    pinnedPoints: [],
    parameters: {},
    derivativeResults: {},
    derivativeVisibility: {},
    selectedObjectId: null,
    activeTool: "select",
    canvasSettings: defaultCanvasSettings(),
    calculatorHistory: [],
    solutionHistory: [],
  };
}

export interface AddExpressionResult {
  ok: boolean;
  error?: string;
  expression?: MathExpression;
}

function ensureParameters(
  state: MathCanvasState,
  expression: MathExpression,
): Record<string, MathParameter> {
  const params = { ...state.parameters };
  for (const name of expression.parameters) {
    if (!params[name]) {
      params[name] = {
        id: name,
        name,
        value: 1,
        min: -100,
        max: 100,
        step: 0.1,
      };
    }
  }
  if (Object.keys(params).length > MAX_PARAMETERS) {
    const keys = Object.keys(params).slice(0, MAX_PARAMETERS);
    for (const key of Object.keys(params)) {
      if (!keys.includes(key)) delete params[key];
    }
  }
  return params;
}

function pruneUnusedParameters(expressions: MathExpression[], parameters: Record<string, MathParameter>): Record<string, MathParameter> {
  const used = new Set<string>();
  for (const expression of expressions) {
    for (const name of expression.parameters) used.add(name);
  }
  const result: Record<string, MathParameter> = {};
  for (const [name, param] of Object.entries(parameters)) {
    if (used.has(name)) result[name] = param;
  }
  return result;
}

interface MathCanvasActions {
  setCurrentSubject: (subject: SubjectId) => void;
  setDocumentName: (name: string) => void;

  addExpression: (rawInput: string) => AddExpressionResult;
  updateExpression: (id: string, patch: Partial<MathExpression>) => void;
  removeExpression: (id: string) => void;
  toggleExpressionVisibility: (id: string) => void;
  setExpressionColor: (id: string, color: string) => void;

  addGeometryObject: (obj: GeometryObject) => void;
  updateGeometryObject: (id: string, patch: Partial<GeometryObject>) => void;
  moveGeometryObject: (id: string, patch: Partial<GeometryObject>) => void;
  removeGeometryObject: (id: string) => void;
  toggleGeometryVisibility: (id: string) => void;

  addDataset: (dataset: MathDataset) => void;
  removeDataset: (id: string) => void;

  addPinnedPoint: (expressionId: string, x: number) => void;
  updatePinnedPoint: (id: string, patch: Partial<PinnedPoint>) => void;
  removePinnedPoint: (id: string) => void;
  clearPinnedPoints: () => void;

  setParameterValue: (name: string, value: number) => void;
  resetParameters: () => void;

  setExpressionTranslation: (id: string, translation: { dx: number; dy: number }) => void;
  setExpressionRotation: (id: string, angle: number) => void;

  setDerivativeResult: (expressionId: string, result: DerivativeResult) => void;
  removeDerivativeResult: (expressionId: string) => void;
  toggleDerivative: (expressionId: string) => void;
  setDerivativeVisibility: (expressionId: string, patch: Partial<DerivativeVisibility>) => void;

  selectObject: (id: string | null) => void;
  setActiveTool: (tool: ToolId) => void;
  updateCanvasSettings: (patch: Partial<CanvasSettings>) => void;
  resetView: () => void;

  addCalculatorRecord: (record: CalculatorRecord) => void;
  clearCalculatorHistory: () => void;

  addSolutionRecord: (record: SolutionRecord) => void;
  clearSolutionHistory: () => void;

  clearAll: () => void;
  restoreDocument: (data: MathCanvasData) => void;
  undo: () => void;
  redo: () => void;
}

export type MathCanvasStore = MathCanvasState & MathCanvasActions;

function wrapDocument(data: MathCanvasData): SavedMathCanvasDocument {
  return {
    schemaVersion: SCHEMA_VERSION,
    projectVersion: PROJECT_VERSION,
    savedAt: Date.now(),
    subjectId: data.currentSubject,
    data,
  };
}

const storage: PersistStorage<unknown> = {
  getItem: (name) => {
    try {
      const raw = window.localStorage.getItem(name);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<SavedMathCanvasDocument>;
      if (
        parsed &&
        parsed.schemaVersion === SCHEMA_VERSION &&
        parsed.data &&
        Array.isArray(parsed.data.expressions)
      ) {
        return { state: parsed.data as MathCanvasStore, version: SCHEMA_VERSION };
      }
      return null;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      const data = value.state as unknown as MathCanvasData;
      window.localStorage.setItem(name, JSON.stringify(wrapDocument(data)));
    } catch {
      /* 忽略写入异常，避免影响页面 */
    }
  },
  removeItem: (name) => {
    try {
      window.localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

export const useMathCanvasStore = create<MathCanvasStore>()(
  persist(
    (set, get) => ({
      ...defaultState(),
      past: [],
      future: [],

      setCurrentSubject: (subject) => set((state) => ({ ...withHistory(state), currentSubject: subject })),

      setDocumentName: (name) => set((state) => ({ ...withHistory(state), documentName: name })),

      addExpression: (rawInput) => {
        const result = parseExpressionInput(rawInput);
        if (!result.ok || !result.normalizedExpression) {
          return { ok: false, error: result.error ?? "无法解析该表达式" };
        }
        let outcome: AddExpressionResult = { ok: false, error: "添加失败" };
        set((state) => {
          if (state.expressions.length >= MAX_EXPRESSIONS) {
            outcome = { ok: false, error: `最多只能添加 ${MAX_EXPRESSIONS} 个函数` };
            return {};
          }
          const expression: MathExpression = {
            id: uid("fn"),
            subjectId: "middle-school",
            type: "function",
            rawInput: rawInput.trim(),
            latex: result.latex,
            normalizedExpression: result.normalizedExpression,
            color: colorForIndex(state.expressions.length),
            visible: true,
            parameters: result.parameters,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          outcome = { ok: true, expression };
          return {
            ...withHistory(state),
            expressions: [...state.expressions, expression],
            parameters: ensureParameters(state, expression),
          };
        });
        return outcome;
      },

      updateExpression: (id, patch) =>
        set((state) => {
          const existing = state.expressions.find((e) => e.id === id);
          const updatedExpressions = state.expressions.map((e) =>
            e.id === id ? { ...e, ...patch, updatedAt: Date.now() } : e,
          );
          let parameters = state.parameters;
          if (existing && (patch.parameters || patch.normalizedExpression)) {
            const updated = updatedExpressions.find((e) => e.id === id) as MathExpression;
            parameters = ensureParameters(state, updated);
          }
          parameters = pruneUnusedParameters(updatedExpressions, parameters);
          return {
            ...withHistory(state),
            expressions: updatedExpressions,
            parameters,
          };
        }),

      removeExpression: (id) =>
        set((state) => {
          const remainingExpressions = state.expressions.filter((e) => e.id !== id);
          const next = {
            ...withHistory(state),
            expressions: remainingExpressions,
            parameters: pruneUnusedParameters(remainingExpressions, state.parameters),
          } as Partial<MathCanvasState>;
          const derivativeResults = { ...state.derivativeResults };
          delete derivativeResults[id];
          next.derivativeResults = derivativeResults;
          const derivativeVisibility = { ...state.derivativeVisibility };
          delete derivativeVisibility[id];
          next.derivativeVisibility = derivativeVisibility;
          if (state.selectedObjectId === id) next.selectedObjectId = null;
          next.pinnedPoints = state.pinnedPoints.filter((p) => p.expressionId !== id);
          return next;
        }),

      toggleExpressionVisibility: (id) =>
        set((state) => ({
          ...withHistory(state),
          expressions: state.expressions.map((e) =>
            e.id === id ? { ...e, visible: !e.visible, updatedAt: Date.now() } : e,
          ),
        })),

      setExpressionColor: (id, color) =>
        set((state) => ({
          ...withHistory(state),
          expressions: state.expressions.map((e) =>
            e.id === id ? { ...e, color, updatedAt: Date.now() } : e,
          ),
        })),

      addGeometryObject: (obj) =>
        set((state) => ({ ...withHistory(state), geometryObjects: [...state.geometryObjects, obj] })),

      updateGeometryObject: (id, patch) =>
        set((state) => ({
          ...withHistory(state),
          geometryObjects: state.geometryObjects.map((g) =>
            g.id === id ? { ...g, ...patch, updatedAt: Date.now() } : g,
          ),
        })),

      moveGeometryObject: (id, patch) =>
        set((state) => ({
          geometryObjects: state.geometryObjects.map((g) =>
            g.id === id ? { ...g, ...patch, updatedAt: Date.now() } : g,
          ),
        })),

      removeGeometryObject: (id) =>
        set((state) => {
          const next = {
            ...withHistory(state),
            geometryObjects: state.geometryObjects.filter((g) => g.id !== id),
          } as Partial<MathCanvasState>;
          if (state.selectedObjectId === id) next.selectedObjectId = null;
          return next;
        }),

      toggleGeometryVisibility: (id) =>
        set((state) => ({
          ...withHistory(state),
          geometryObjects: state.geometryObjects.map((g) =>
            g.id === id ? { ...g, visible: !g.visible } : g,
          ),
        })),

      addDataset: (dataset) => set((state) => ({ ...withHistory(state), datasets: [...state.datasets, dataset] })),

      removeDataset: (id) =>
        set((state) => ({
          ...withHistory(state),
          datasets: state.datasets.filter((d) => d.id !== id),
        })),

      addPinnedPoint: (expressionId, x) =>
        set((state) => {
          if (!Number.isFinite(x)) return {};
          const expression = state.expressions.find((e) => e.id === expressionId);
          if (!expression) return {};
          const duplicate = state.pinnedPoints.some(
            (p) => p.expressionId === expressionId && Math.abs(p.x - x) < 0.08,
          );
          if (duplicate) return {};
          const point: PinnedPoint = { id: uid("pt"), expressionId, x, createdAt: Date.now() };
          return { ...withHistory(state), pinnedPoints: [...state.pinnedPoints, point] };
        }),

      updatePinnedPoint: (id, patch) =>
        set((state) => ({
          pinnedPoints: state.pinnedPoints.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),

      removePinnedPoint: (id) =>
        set((state) => ({
          ...withHistory(state),
          pinnedPoints: state.pinnedPoints.filter((p) => p.id !== id),
        })),

      clearPinnedPoints: () =>
        set((state) => ({ ...withHistory(state), pinnedPoints: [] })),

      setParameterValue: (name, value) =>
        set((state) => {
          const param = state.parameters[name];
          if (!param) return {};
          return {
            parameters: {
              ...state.parameters,
              [name]: { ...param, value },
            },
          };
        }),

      resetParameters: () =>
        set((state) => {
          const parameters: Record<string, MathParameter> = {};
          for (const p of Object.values(state.parameters)) {
            parameters[p.name] = { ...p, value: 1 };
          }
          return { ...withHistory(state), parameters };
        }),

      setExpressionTranslation: (id, translation) =>
        set((state) => ({
          expressions: state.expressions.map((e) =>
            e.id === id ? { ...e, translation, updatedAt: Date.now() } : e,
          ),
        })),

      setExpressionRotation: (id, angle) =>
        set((state) => ({
          expressions: state.expressions.map((e) =>
            e.id === id ? { ...e, rotation: { angle }, updatedAt: Date.now() } : e,
          ),
        })),

      setDerivativeResult: (expressionId, result) =>
        set((state) => ({
          derivativeResults: {
            ...state.derivativeResults,
            [expressionId]: result,
          },
        })),

      removeDerivativeResult: (expressionId) =>
        set((state) => {
          const derivativeResults = { ...state.derivativeResults };
          delete derivativeResults[expressionId];
          return { derivativeResults };
        }),

      setDerivativeVisibility: (expressionId, patch) =>
        set((state) => {
          const current = state.derivativeVisibility[expressionId] ?? {
            derivative: true,
            tangent: true,
            secant: true,
            criticalPoints: true,
          };
          return {
            derivativeVisibility: {
              ...state.derivativeVisibility,
              [expressionId]: { ...current, ...patch },
            },
          };
        }),

      toggleDerivative: (expressionId) => {
        const state = get();
        const expression = state.expressions.find((e) => e.id === expressionId);
        if (!expression) return;
        if (state.derivativeResults[expressionId]) {
          set((s) => {
            const derivativeResults = { ...s.derivativeResults };
            delete derivativeResults[expressionId];
            const derivativeVisibility = { ...s.derivativeVisibility };
            delete derivativeVisibility[expressionId];
            return { derivativeResults, derivativeVisibility };
          });
          return;
        }
        const parameterValues: Record<string, number> = {};
        for (const p of expression.parameters) {
          const v = state.parameters[p]?.value;
          if (typeof v === "number") parameterValues[p] = v;
        }
        const result = buildDerivativeResult({
          expression,
          parameterValues,
          domain: expression.domain ?? { min: -10, max: 10 },
        });
        set((s) => ({
          derivativeResults: {
            ...s.derivativeResults,
            [expressionId]: result,
          },
          derivativeVisibility: {
            ...s.derivativeVisibility,
            [expressionId]: {
              derivative: true,
              tangent: true,
              secant: true,
              criticalPoints: true,
            },
          },
        }));
      },

      selectObject: (id) => set({ selectedObjectId: id }),

      setActiveTool: (tool) => set((state) => ({ ...withHistory(state), activeTool: tool })),

      updateCanvasSettings: (patch) =>
        set((state) => ({ ...withHistory(state), canvasSettings: { ...state.canvasSettings, ...patch } })),

      resetView: () =>
        set((state) => ({
          ...withHistory(state),
          canvasSettings: {
            ...state.canvasSettings,
            xMin: DEFAULT_CANVAS_BOUNDS.xMin,
            xMax: DEFAULT_CANVAS_BOUNDS.xMax,
            yMin: DEFAULT_CANVAS_BOUNDS.yMin,
            yMax: DEFAULT_CANVAS_BOUNDS.yMax,
            viewVersion: state.canvasSettings.viewVersion + 1,
          },
        })),

      addCalculatorRecord: (record) =>
        set((state) => ({
          calculatorHistory: [...state.calculatorHistory.slice(-49), record],
        })),

      clearCalculatorHistory: () => set({ calculatorHistory: [] }),

      addSolutionRecord: (record) =>
        set((state) => ({
          solutionHistory: [...state.solutionHistory.slice(-49), record],
        })),

      clearSolutionHistory: () => set({ solutionHistory: [] }),

      clearAll: () =>
        set((state) => ({
          ...withHistory(state),
          ...defaultState(),
          canvasSettings: state.canvasSettings,
        })),

      restoreDocument: (data) =>
        set((state) => ({
          ...withHistory(state),
          ...data,
          past: [],
          future: [],
        })),

      undo: () =>
        set((state) => {
          if (state.past.length === 0) return state;
          const prev = state.past[state.past.length - 1];
          const current = snapshotData(state);
          return {
            ...prev,
            past: state.past.slice(0, -1),
            future: [current, ...state.future].slice(0, MAX_HISTORY),
          };
        }),

      redo: () =>
        set((state) => {
          if (state.future.length === 0) return state;
          const next = state.future[0];
          const current = snapshotData(state);
          return {
            ...next,
            past: [...state.past, current].slice(-MAX_HISTORY),
            future: state.future.slice(1),
          };
        }),
    }),
    {
      name: STORAGE_KEY,
      storage,
      version: SCHEMA_VERSION,
      partialize: (state) => {
        const { past: _past, future: _future, ...data } = state;
        return data as MathCanvasData;
      },
    },
  ),
);
