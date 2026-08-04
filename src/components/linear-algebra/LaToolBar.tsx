"use client";

export type LaToolId = "select" | "pan" | "translate" | "rotate";

const TOOLS: { id: LaToolId; label: string; title: string }[] = [
  { id: "select", label: "选择", title: "选择向量/对象" },
  { id: "pan", label: "拖动", title: "拖动画布视角" },
  { id: "translate", label: "平移", title: "拖动向量端点改变位置" },
  { id: "rotate", label: "旋转", title: "旋转选中的向量" },
];

interface LaToolBarProps {
  activeTool: LaToolId;
  onToolChange: (tool: LaToolId) => void;
  onRotate?: (degrees: number) => void;
  canRotate?: boolean;
  onReset?: () => void;
}

export function LaToolBar({
  activeTool,
  onToolChange,
  onRotate,
  canRotate = false,
  onReset,
}: LaToolBarProps) {
  return (
    <div className="panel-scroll flex max-h-full flex-row gap-0.5 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-card lg:flex-col lg:overscroll-contain">
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          type="button"
          title={tool.title}
          onClick={() => onToolChange(tool.id)}
          className={`flex h-8 min-w-8 flex-1 items-center justify-center rounded-md px-1.5 text-xs transition-colors lg:h-7 lg:min-w-0 lg:flex-none lg:w-full lg:px-0 ${
            activeTool === tool.id
              ? "bg-primary-600 text-white"
              : "text-slate-600 hover:bg-primary-50"
          }`}
        >
          {tool.label}
        </button>
      ))}

      {activeTool === "rotate" && (
        <div className="hidden flex-col gap-0.5 border-t border-slate-200 pt-1 lg:flex">
          <button
            type="button"
            title="逆时针旋转 15°"
            disabled={!canRotate}
            onClick={() => onRotate?.(15)}
            className="flex h-7 w-full items-center justify-center rounded-md text-xs text-slate-600 hover:bg-primary-50 disabled:opacity-40"
          >
            ⟲ 15°
          </button>
          <button
            type="button"
            title="顺时针旋转 15°"
            disabled={!canRotate}
            onClick={() => onRotate?.(-15)}
            className="flex h-7 w-full items-center justify-center rounded-md text-xs text-slate-600 hover:bg-primary-50 disabled:opacity-40"
          >
            ⟳ 15°
          </button>
          <button
            type="button"
            title="旋转 90°"
            disabled={!canRotate}
            onClick={() => onRotate?.(90)}
            className="flex h-7 w-full items-center justify-center rounded-md text-xs text-slate-600 hover:bg-primary-50 disabled:opacity-40"
          >
            90°
          </button>
          <button
            type="button"
            title="旋转 180°"
            disabled={!canRotate}
            onClick={() => onRotate?.(180)}
            className="flex h-7 w-full items-center justify-center rounded-md text-xs text-slate-600 hover:bg-primary-50 disabled:opacity-40"
          >
            180°
          </button>
          <button
            type="button"
            title="旋转 -90°"
            disabled={!canRotate}
            onClick={() => onRotate?.(-90)}
            className="flex h-7 w-full items-center justify-center rounded-md text-xs text-slate-600 hover:bg-primary-50 disabled:opacity-40"
          >
            -90°
          </button>
        </div>
      )}

      <div className="hidden h-px w-full shrink-0 bg-slate-200 lg:block" aria-hidden="true" />
      <button
        type="button"
        title="重置画布"
        onClick={onReset}
        className="flex h-8 min-w-8 flex-1 items-center justify-center rounded-md px-1.5 text-xs text-slate-600 transition-colors hover:bg-primary-50 lg:h-7 lg:min-w-0 lg:flex-none lg:w-full lg:px-0"
      >
        重置
      </button>
    </div>
  );
}
