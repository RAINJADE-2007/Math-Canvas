"use client";

import { useRef, useState } from "react";
import { useMathCanvasStore } from "@/store/useMathCanvasStore";
import { CANVAS_RATIO_OPTIONS } from "@/constants/canvas";

export function RatioControls() {
  const canvasSettings = useMathCanvasStore((s) => s.canvasSettings);
  const updateCanvasSettings = useMathCanvasStore((s) => s.updateCanvasSettings);
  const [ratioLocked, setRatioLocked] = useState(false);
  const lastRatioSliderCommit = useRef(0);
  const sliderValueRef = useRef(1.6);

  function applyRatio(patch: Partial<typeof canvasSettings>) {
    if (ratioLocked) return;
    setRatioLocked(true);
    updateCanvasSettings(patch);
    window.setTimeout(() => setRatioLocked(false), 500);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {CANVAS_RATIO_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => applyRatio({ canvasRatio: option.id })}
            disabled={ratioLocked}
            title="调整画布长宽比，坐标轴单位长度始终一致（保证圆是圆）"
            className={`rounded-md px-2 py-1 text-xs transition-colors ${
              canvasSettings.canvasRatio === option.id
                ? "bg-primary-600 text-white"
                : "border border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-700"
            } ${ratioLocked ? "opacity-50" : ""}`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="mt-2">
        <label className="flex items-center gap-2">
          <span className="shrink-0 text-xs text-slate-500">自定义（宽:高）</span>
          <input
            type="range"
            min="0.25"
            max="4"
            step="0.05"
            value={canvasSettings.canvasRatio === "custom" ? canvasSettings.customRatio : 1.6}
            onChange={(e) => {
              const v = Number(e.target.value);
              sliderValueRef.current = v;
              const now = Date.now();
              if (now - lastRatioSliderCommit.current >= 120) {
                lastRatioSliderCommit.current = now;
                updateCanvasSettings({ canvasRatio: "custom", customRatio: v });
              }
            }}
            onPointerUp={() =>
              updateCanvasSettings({
                canvasRatio: "custom",
                customRatio: sliderValueRef.current,
              })
            }
            className="min-w-0 flex-1"
          />
          <span className="w-10 shrink-0 text-right font-mono text-xs text-slate-600">
            {canvasSettings.canvasRatio === "custom"
              ? Number(canvasSettings.customRatio.toFixed(2))
              : "—"}
          </span>
        </label>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-slate-500">两坐标轴单位长度 1:1</span>
        <button
          type="button"
          onClick={() => applyRatio({ canvasRatio: "1:1" })}
          disabled={ratioLocked}
          className={`rounded-md px-3 py-1 text-xs transition-colors ${
            canvasSettings.canvasRatio === "1:1"
              ? "bg-primary-600 text-white"
              : "border border-slate-300 text-slate-600 hover:border-primary-300 hover:text-primary-700"
          } ${ratioLocked ? "opacity-50" : ""}`}
        >
          设为 1:1
        </button>
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
        在画布上滚动鼠标滚轮可快速调整画布宽高比例；比例按钮连续点击时自动节流，避免页面卡顿。
      </p>
    </div>
  );
}
