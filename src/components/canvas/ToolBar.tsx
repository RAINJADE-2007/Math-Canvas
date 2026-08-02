"use client";

import { useMemo, useState } from "react";
import { useMathCanvasStore } from "@/store/useMathCanvasStore";
import { rotateFunctionExpression } from "@/math-engine/middle-school/functions/rotate";
import { LatexView } from "@/components/common/LatexView";
import type { ToolId } from "@/types";

const TOOLS: { id: ToolId; label: string; title: string }[] = [
  { id: "select", label: "选择", title: "选择对象" },
  { id: "pan", label: "拖动", title: "拖动画布" },
  { id: "translate", label: "平移", title: "拖动函数或几何图形平移" },
  { id: "add-point", label: "点", title: "添加点" },
  { id: "add-line", label: "线", title: "添加直线" },
  { id: "add-circle", label: "圆", title: "添加圆" },
];

const BUTTON_BASE =
  "flex h-8 min-w-8 flex-1 items-center justify-center rounded-md px-1.5 text-xs transition-colors lg:h-7 lg:min-w-0 lg:flex-none lg:w-full lg:px-0";

export function ToolBar() {
  const activeTool = useMathCanvasStore((s) => s.activeTool);
  const setActiveTool = useMathCanvasStore((s) => s.setActiveTool);
  const resetView = useMathCanvasStore((s) => s.resetView);
  const clearAll = useMathCanvasStore((s) => s.clearAll);
  const canUndo = useMathCanvasStore((s) => s.past.length > 0);
  const canRedo = useMathCanvasStore((s) => s.future.length > 0);
  const undo = useMathCanvasStore((s) => s.undo);
  const redo = useMathCanvasStore((s) => s.redo);

  const expressions = useMathCanvasStore((s) => s.expressions);
  const selectedObjectId = useMathCanvasStore((s) => s.selectedObjectId);
  const setExpressionRotation = useMathCanvasStore((s) => s.setExpressionRotation);
  const addExpression = useMathCanvasStore((s) => s.addExpression);

  const [modalOpen, setModalOpen] = useState(false);
  const [added, setAdded] = useState(false);

  const selectedExpr = expressions.find((e) => e.id === selectedObjectId) ?? null;
  const angle = selectedExpr?.rotation?.angle ?? 0;

  const rotatedResult = useMemo(() => {
    if (!selectedExpr) return null;
    return rotateFunctionExpression(selectedExpr.normalizedExpression, angle);
  }, [selectedExpr, angle]);

  function rotateBy(delta: number) {
    if (!selectedExpr) return;
    const next = (((angle + delta) % 360) + 360) % 360;
    setExpressionRotation(selectedExpr.id, next);
  }

  function handleAddRotated() {
    if (!rotatedResult?.ok || !rotatedResult.expression) return;
    const res = addExpression(rotatedResult.expression);
    if (res.ok) {
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1500);
    }
  }

  return (
    <div className="panel-scroll flex max-h-full flex-row gap-0.5 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-card lg:flex-col lg:overscroll-contain">
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          type="button"
          title={tool.title}
          onClick={() => setActiveTool(tool.id)}
          className={`${BUTTON_BASE} ${
            activeTool === tool.id
              ? "bg-primary-600 text-white"
              : "text-slate-600 hover:bg-primary-50"
          }`}
        >
          {tool.label}
        </button>
      ))}
      <div className="hidden h-px w-full shrink-0 bg-slate-200 lg:block" aria-hidden="true" />
      <button
        type="button"
        title="重置视图"
        onClick={resetView}
        className={`${BUTTON_BASE} text-slate-600 hover:bg-primary-50`}
      >
        重置
      </button>
      <button
        type="button"
        title="撤销"
        onClick={undo}
        disabled={!canUndo}
        className={`${BUTTON_BASE} text-slate-600 hover:bg-primary-50 disabled:opacity-40`}
      >
        撤销
      </button>
      <button
        type="button"
        title="重做"
        onClick={redo}
        disabled={!canRedo}
        className={`${BUTTON_BASE} text-slate-600 hover:bg-primary-50 disabled:opacity-40`}
      >
        重做
      </button>
      <button
        type="button"
        title="清空画布"
        onClick={clearAll}
        className={`${BUTTON_BASE} text-red-500 hover:bg-red-50`}
      >
        清空
      </button>

      <div className="hidden h-px w-full shrink-0 bg-slate-200 lg:block" aria-hidden="true" />
      <span className="hidden py-0.5 text-center text-[10px] leading-none text-slate-400 lg:block">旋转</span>
      <button
        type="button"
        title="逆时针旋转 15°"
        disabled={!selectedExpr}
        onClick={() => rotateBy(15)}
        className={`${BUTTON_BASE} text-slate-600 hover:bg-primary-50 disabled:opacity-40`}
      >
        ⟲
      </button>
      <button
        type="button"
        title="顺时针旋转 15°"
        disabled={!selectedExpr}
        onClick={() => rotateBy(-15)}
        className={`${BUTTON_BASE} text-slate-600 hover:bg-primary-50 disabled:opacity-40`}
      >
        ⟳
      </button>
      <button
        type="button"
        title="再旋转 90°"
        disabled={!selectedExpr}
        onClick={() => rotateBy(90)}
        className={`${BUTTON_BASE} text-slate-600 hover:bg-primary-50 disabled:opacity-40`}
      >
        90°
      </button>
      <button
        type="button"
        title="再旋转 180°"
        disabled={!selectedExpr}
        onClick={() => rotateBy(180)}
        className={`${BUTTON_BASE} text-slate-600 hover:bg-primary-50 disabled:opacity-40`}
      >
        180°
      </button>
      <button
        type="button"
        title="生成当前旋转角度下的解析式"
        disabled={!selectedExpr}
        onClick={() => {
          setAdded(false);
          setModalOpen(true);
        }}
        className={`${BUTTON_BASE} text-primary-600 hover:bg-primary-50 disabled:opacity-40`}
      >
        解析式
      </button>

      {modalOpen && selectedExpr ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">旋转后的解析式</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded p-1 text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ×
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              函数 <span className="font-mono text-primary-700">{selectedExpr.rawInput}</span> 绕原点旋转{" "}
              <span className="font-mono">{angle}°</span>
            </p>

            {rotatedResult?.ok ? (
              <div className="mt-3 space-y-2">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">旋转后的解析式：</p>
                  <div className="mt-1 text-sm">
                    <LatexView latex={rotatedResult.latex} />
                  </div>
                  <p className="mt-1 font-mono text-xs text-slate-600">y = {rotatedResult.expression}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleAddRotated}
                    className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-700"
                  >
                    {added ? "已添加" : "添加为新函数"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                  >
                    关闭
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-700">
                  {rotatedResult?.error ?? "暂无法生成旋转后的解析式。"}
                </p>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                  >
                    关闭
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
