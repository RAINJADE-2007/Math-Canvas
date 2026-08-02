"use client";

import { useState } from "react";
import { useMathCanvasStore } from "@/store/useMathCanvasStore";
import { parseMultivariateInput } from "@/math-engine/middle-school/multivariate/parse";
import { sliceTo2D } from "@/math-engine/middle-school/multivariate/slice";
import { LatexView } from "@/components/common/LatexView";
import type { MultivariateFunction } from "@/types";

export function MultivariatePanel() {
  const items = useMathCanvasStore((s) => s.multivariateFunctions);
  const addMultivariateFunction = useMathCanvasStore((s) => s.addMultivariateFunction);
  const removeMultivariateFunction = useMathCanvasStore((s) => s.removeMultivariateFunction);
  const toggleMultivariateVisibility = useMathCanvasStore((s) => s.toggleMultivariateVisibility);

  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ ok: boolean; latex?: string; error?: string } | null>(null);

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
          支持 x、y 两个自变量，可用常量 π/e 与函数 sin、cos、sqrt 等；默认绘制范围 x、y ∈ [-4, 4]。3D 图像请在画布右上角切换到「3D」查看。
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

              <SliceControls item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SliceControls({ item }: { item: MultivariateFunction }) {
  const addExpression = useMathCanvasStore((s) => s.addExpression);
  const setMultivariateColor = useMathCanvasStore((s) => s.setMultivariateColor);
  const [axis, setAxis] = useState<"x" | "y">("y");
  const [value, setValue] = useState("0");
  const [result, setResult] = useState<{ ok: boolean; latex?: string; expression?: string; error?: string } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function handleSlice() {
    const v = parseFloat(value);
    if (!Number.isFinite(v)) {
      setResult(null);
      setNotice("请输入有效的数值");
      return;
    }
    const replacements: Record<string, string> =
      axis === "y" ? { y: String(v) } : { x: String(v), y: "x" };
    const res = sliceTo2D(item.expression, replacements);
    setResult(res);
    setNotice(null);
    if (!res.ok) {
      setNotice(res.error ?? "切片失败");
      return;
    }
    const added = addExpression(res.expression);
    setNotice(added.ok ? "已生成切片曲线并添加到 2D 画布" : (added.error ?? "添加切片曲线失败"));
  }

  return (
    <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500">切片为二维：</span>
        <select
          value={axis}
          onChange={(e) => {
            setAxis(e.target.value as "x" | "y");
            setResult(null);
            setNotice(null);
          }}
          className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-primary-500"
        >
          <option value="y">固定 y（沿 x 方向）</option>
          <option value="x">固定 x（沿 y 方向）</option>
        </select>
        <label className="flex items-center gap-1 text-xs text-slate-500">
          {axis === "y" ? "y" : "x"}
          <input
            type="number"
            step="0.1"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setResult(null);
              setNotice(null);
            }}
            className="w-20 rounded border border-slate-300 px-2 py-1 font-mono text-xs outline-none focus:border-primary-500"
          />
        </label>
        <button
          type="button"
          onClick={handleSlice}
          className="rounded-md bg-primary-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-primary-700"
        >
          切片为 2D
        </button>
        <input
          type="color"
          value={item.color}
          onChange={(e) => setMultivariateColor(item.id, e.target.value)}
          className="h-6 w-8 cursor-pointer rounded border border-slate-200"
          title="修改颜色"
        />
      </div>
      {result && result.ok ? (
        <div className="mt-2 flex flex-wrap items-center gap-2 rounded bg-white px-2 py-1.5 text-xs">
          <span className="text-slate-400">
            切片曲线 {axis === "y" ? `y=${value}` : `x=${value}`}：
          </span>
          <LatexView latex={result.latex ?? ""} />
        </div>
      ) : null}
      {notice ? (
        <p className={`mt-1.5 text-xs ${notice.startsWith("已") ? "text-green-700" : "text-amber-700"}`}>{notice}</p>
      ) : null}
    </div>
  );
}
