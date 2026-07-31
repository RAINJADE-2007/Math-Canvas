"use client";

import { useMathCanvasStore } from "@/store/useMathCanvasStore";
import { MAX_PARAMETERS } from "@/constants/app";

export function ParameterPanel() {
  const parameters = useMathCanvasStore((s) => s.parameters);
  const setParameterValue = useMathCanvasStore((s) => s.setParameterValue);
  const resetParameters = useMathCanvasStore((s) => s.resetParameters);

  const entries = Object.values(parameters);

  if (entries.length === 0) {
    return (
      <div className="text-sm text-slate-500">
        <p>尚未识别到函数参数。</p>
        <p className="mt-1 text-xs text-slate-400">
          输入含参数的一次函数或二次函数，例如 a*x+b、a*x^2+b*x+c、k/x、A*sin(x)，此处会自动生成参数滑块。
        </p>
        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-500">
          a*x+b　a*x^2+b*x+c　k/x　A*sin(w*x+p)
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700">函数参数（{entries.length}/{MAX_PARAMETERS}）</p>
          <p className="mt-0.5 text-xs text-slate-400">
            同一个参数在多个函数中共享，拖动滑块可实时更新图像与性质。
          </p>
        </div>
        <button
          type="button"
          onClick={resetParameters}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
        >
          全部重置为 1
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {entries.map((param) => (
          <div key={param.id} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-semibold text-primary-700">{param.name}</span>
              <span className="font-mono text-sm text-slate-600">{param.value.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={param.min}
              max={param.max}
              step={param.step}
              value={param.value}
              onChange={(e) => setParameterValue(param.name, Number(e.target.value))}
              className="mt-2 w-full accent-primary-600"
            />
            <div className="mt-1 flex justify-between text-xs text-slate-400">
              <span>{param.min}</span>
              <span>步长 {param.step}</span>
              <span>{param.max}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
