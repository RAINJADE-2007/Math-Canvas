"use client";

import { useState } from "react";
import { useMathCanvasStore } from "@/store/useMathCanvasStore";
import { parseMultivariateInput } from "@/math-engine/middle-school/multivariate/parse";
import { LatexView } from "@/components/common/LatexView";
import { SurfaceView } from "@/components/multivariate/SurfaceView";
import type { MultivariateFunction } from "@/types";

export function MultivariatePanel() {
  const items = useMathCanvasStore((s) => s.multivariateFunctions);
  const addMultivariateFunction = useMathCanvasStore((s) => s.addMultivariateFunction);
  const removeMultivariateFunction = useMathCanvasStore((s) => s.removeMultivariateFunction);
  const toggleMultivariateVisibility = useMathCanvasStore((s) => s.toggleMultivariateVisibility);
  const setMultivariateColor = useMathCanvasStore((s) => s.setMultivariateColor);

  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ ok: boolean; latex?: string; error?: string } | null>(null);
  const [viewing, setViewing] = useState<MultivariateFunction | null>(null);

  function handleInputChange(value: string) {
    setInput(value);
    setError(null);
    if (!value.trim()) {
      setPreview(null);
      return;
    }
    setPreview(parseMultivariateInput(value));
  }

  function handleAdd() {
    if (!input.trim()) {
      setError("请输入多元函数表达式");
      return;
    }
    const result = addMultivariateFunction(input);
    if (!result.ok) {
      setError(result.error ?? "添加失败");
      return;
    }
    setInput("");
    setPreview(null);
    setError(null);
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
            placeholder="输入 z=f(x,y)，例如 x^2+y^2、sin(x)*cos(y)、x*y"
            className="min-w-[260px] flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-md bg-primary-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            添加函数
          </button>
        </div>
        {preview && preview.ok ? (
          <div className="mt-2 flex items-center gap-2 rounded-md bg-primary-50 px-3 py-1.5 text-sm">
            <span className="text-xs text-slate-400">公式预览：</span>
            <LatexView latex={preview.latex ?? ""} />
          </div>
        ) : preview && !preview.ok ? (
          <p className="mt-2 text-sm text-amber-600">{preview.error}</p>
        ) : null}
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <p className="mt-2 text-xs text-slate-400">
          支持 x、y 两个自变量，可用常量 π/e 与函数 sin、cos、sqrt 等；默认绘制范围 x、y ∈ [-4, 4]。
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
          还没有多元函数。试试输入 x^2+y^2 或 sin(x)*cos(y) 吧。
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li
              key={item.id}
              className={`rounded-lg border p-3 transition-colors ${
                item.visible ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-50 opacity-70"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="h-4 w-4 shrink-0 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-medium text-slate-400">#{index + 1}</span>
                <span className="rounded bg-primary-100 px-1.5 py-0.5 text-xs text-primary-700">多元函数</span>
                <div className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    title={item.visible ? "隐藏" : "显示"}
                    onClick={() => toggleMultivariateVisibility(item.id)}
                    className="rounded p-1 text-sm text-slate-500 hover:bg-slate-100"
                  >
                    {item.visible ? "隐藏" : "显示"}
                  </button>
                  <button
                    type="button"
                    title="删除"
                    onClick={() => removeMultivariateFunction(item.id)}
                    className="rounded p-1 text-sm text-red-500 hover:bg-red-50"
                  >
                    删除
                  </button>
                </div>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-slate-400">z =</span>
                <LatexView latex={item.latex} />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input
                  type="color"
                  value={item.color}
                  onChange={(e) => setMultivariateColor(item.id, e.target.value)}
                  className="h-6 w-9 cursor-pointer rounded border border-slate-200"
                  title="修改颜色"
                />
                <button
                  type="button"
                  onClick={() => setViewing(item)}
                  className="rounded-md bg-primary-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-primary-700"
                >
                  查看 3D 图像
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {viewing ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => setViewing(null)}
        >
          <div
            className="flex h-[85vh] w-full max-w-4xl flex-col rounded-lg border border-slate-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div className="min-w-0">
                <span className="text-sm font-semibold text-slate-700">3D 曲面图像</span>
                {items.filter((f) => f.visible).map((f) => (
                  <span key={f.id} className="ml-2 font-mono text-xs text-slate-500">
                    z = {f.expression}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setViewing(null)}
                className="rounded p-1 text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ×
              </button>
            </div>
            <div className="min-h-0 flex-1 bg-slate-50 p-2">
              <SurfaceView functions={items} className="h-full w-full" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
