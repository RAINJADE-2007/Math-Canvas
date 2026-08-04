"use client";

import { useState } from "react";

interface TeacherControlsProps {
  onRevealStep?: () => void;
  onHideAll?: () => void;
  onReset?: () => void;
  isActive?: boolean;
}

export function TeacherControls({
  onRevealStep,
  onHideAll,
  onReset,
  isActive = false,
}: TeacherControlsProps) {
  const [active, setActive] = useState(isActive);
  const [hidden, setHidden] = useState(false);

  if (!active) {
    return (
      <button
        onClick={() => setActive(true)}
        className="rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-50"
        title="教师演示模式"
      >
        演示模式
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-primary-200 bg-primary-50/50 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-primary-700">教师演示模式</span>
        <button
          onClick={() => setActive(false)}
          className="text-xs text-slate-400 hover:text-slate-600"
        >
          关闭
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onRevealStep?.()}
          className="rounded-md border border-primary-300 bg-white px-2.5 py-1 text-xs text-primary-700 hover:bg-primary-100"
        >
          逐步揭示
        </button>
        <button
          onClick={() => {
            setHidden(!hidden);
            if (hidden) onRevealStep?.();
            else onHideAll?.();
          }}
          className={`rounded-md border px-2.5 py-1 text-xs ${
            hidden
              ? "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
              : "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
          }`}
        >
          {hidden ? "显示全部" : "隐藏定义/答案"}
        </button>
        <button
          onClick={onReset}
          className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
        >
          重置状态
        </button>
      </div>
      <p className="mt-2 text-xs text-primary-600">
        适用场景：课堂投影演示。可隐藏定义和答案，让学生先思考，再逐步揭示。
      </p>
    </div>
  );
}
