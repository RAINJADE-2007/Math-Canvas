"use client";

import { useMathCanvasStore } from "@/store/useMathCanvasStore";
import type { ToolId } from "@/types";

const TOOLS: { id: ToolId; label: string; title: string }[] = [
  { id: "select", label: "选择", title: "选择对象" },
  { id: "pan", label: "拖动", title: "拖动画布" },
  { id: "translate", label: "平移", title: "拖动函数平移图像" },
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
    </div>
  );
}
