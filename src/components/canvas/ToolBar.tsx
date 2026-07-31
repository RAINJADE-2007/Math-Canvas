"use client";

import { useMathCanvasStore } from "@/store/useMathCanvasStore";
import type { ToolId } from "@/types";

const TOOLS: { id: ToolId; label: string; title: string }[] = [
  { id: "select", label: "选择", title: "选择对象" },
  { id: "pan", label: "平移", title: "拖动画布" },
  { id: "add-point", label: "点", title: "添加点" },
  { id: "add-line", label: "线", title: "添加直线" },
  { id: "add-circle", label: "圆", title: "添加圆" },
];

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
    <div className="flex flex-row gap-1 rounded-lg border border-slate-200 bg-white p-1.5 shadow-card lg:flex-col">
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          type="button"
          title={tool.title}
          onClick={() => setActiveTool(tool.id)}
          className={`rounded-md px-2.5 py-2 text-xs transition-colors lg:px-2 ${
            activeTool === tool.id
              ? "bg-primary-600 text-white"
              : "text-slate-600 hover:bg-primary-50"
          }`}
        >
          {tool.label}
        </button>
      ))}
      <button
        type="button"
        title="重置视图"
        onClick={resetView}
        className="rounded-md px-2.5 py-2 text-xs text-slate-600 hover:bg-primary-50 lg:px-2"
      >
        重置
      </button>
      <button
        type="button"
        title="撤销"
        onClick={undo}
        disabled={!canUndo}
        className="rounded-md px-2.5 py-2 text-xs text-slate-600 hover:bg-primary-50 disabled:opacity-40 lg:px-2"
      >
        撤销
      </button>
      <button
        type="button"
        title="重做"
        onClick={redo}
        disabled={!canRedo}
        className="rounded-md px-2.5 py-2 text-xs text-slate-600 hover:bg-primary-50 disabled:opacity-40 lg:px-2"
      >
        重做
      </button>
      <button
        type="button"
        title="清空画布"
        onClick={clearAll}
        className="rounded-md px-2.5 py-2 text-xs text-red-500 hover:bg-red-50 lg:px-2"
      >
        清空
      </button>
    </div>
  );
}
