"use client";

import { useMemo, useState } from "react";
import { useMathCanvasStore } from "@/store/useMathCanvasStore";
import { parseMultivariateInput } from "@/math-engine/middle-school/multivariate/parse";
import { sliceTo2D } from "@/math-engine/middle-school/multivariate/slice";
import { partialDerivative } from "@/math-engine/middle-school/multivariate/derivative";
import { MULTIVARIATE_EXAMPLES } from "@/math-engine/middle-school/multivariate/examples";
import { LatexView } from "@/components/common/LatexView";
import { KnowledgeSection } from "@/components/multivariate/KnowledgeSection";
import {
  DEFAULT_MULTIVARIATE_DOMAIN,
  DEFAULT_MULTIVARIATE_GRID,
  type MultivariateDomain,
} from "@/components/multivariate/SurfaceView";
import type { MultivariateFunction } from "@/types";

const GRID_OPTIONS = [
  { value: 50, label: "标准 (50×50)" },
  { value: 100, label: "精细 (100×100)" },
];

export function MultivariatePanel({
  domain = DEFAULT_MULTIVARIATE_DOMAIN,
  grid = DEFAULT_MULTIVARIATE_GRID,
  onApplyDomain,
  onApplyGrid,
}: {
  domain?: MultivariateDomain;
  grid?: number;
  onApplyDomain?: (domain: MultivariateDomain) => void;
  onApplyGrid?: (grid: number) => void;
}) {
  const items = useMathCanvasStore((s) => s.multivariateFunctions);
  const addMultivariateFunction = useMathCanvasStore((s) => s.addMultivariateFunction);
  const removeMultivariateFunction = useMathCanvasStore((s) => s.removeMultivariateFunction);
  const toggleMultivariateVisibility = useMathCanvasStore((s) => s.toggleMultivariateVisibility);

  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ ok: boolean; latex?: string; error?: string } | null>(null);
  const [domainDraft, setDomainDraft] = useState<MultivariateDomain>(domain);
  const [gridDraft, setGridDraft] = useState(grid);
  const [viewNotice, setViewNotice] = useState<string | null>(null);

  function handleInputChange(value: string) {
    setInput(value);
    setError(null);
    setNotice(null);
    if (!value.trim()) {
      setPreview(null);
      return;
    }
    setPreview(parseMultivariateInput(value));
  }

  function handleAdd(raw: string) {
    if (!raw.trim()) {
      setError("请输入多元函数表达式");
      return;
    }
    const result = addMultivariateFunction(raw);
    if (!result.ok) {
      setError(result.error ?? "添加失败");
      return;
    }
    setInput("");
    setPreview(null);
    setError(null);
    setNotice(`已添加多元函数：${raw.trim()}`);
    window.setTimeout(() => setNotice(null), 2000);
  }

  function handleDraw() {
    const next: MultivariateDomain = {
      xMin: Number(domainDraft.xMin),
      xMax: Number(domainDraft.xMax),
      yMin: Number(domainDraft.yMin),
      yMax: Number(domainDraft.yMax),
    };
    if (
      !Number.isFinite(next.xMin) ||
      !Number.isFinite(next.xMax) ||
      !Number.isFinite(next.yMin) ||
      !Number.isFinite(next.yMax)
    ) {
      setViewNotice("取值范围必须是有效数字");
      return;
    }
    if (next.xMin >= next.xMax || next.yMin >= next.yMax) {
      setViewNotice("取值范围需满足 min < max");
      return;
    }
    setDomainDraft(next);
    setGridDraft(gridDraft);
    onApplyDomain?.(next);
    onApplyGrid?.(gridDraft);
    setViewNotice(`已更新绘制范围：x ∈ [${next.xMin}, ${next.xMax}]，y ∈ [${next.yMin}, ${next.yMax}]，精度 ${gridDraft}×${gridDraft}`);
    window.setTimeout(() => setViewNotice(null), 2500);
  }

  function handleClear() {
    items.forEach((item) => removeMultivariateFunction(item.id));
    setNotice("已清空全部多元函数");
    window.setTimeout(() => setNotice(null), 2000);
  }

  function patchDomain(patch: Partial<MultivariateDomain>) {
    setDomainDraft((prev) => ({ ...prev, ...patch }));
    setViewNotice(null);
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
              if (e.key === "Enter") handleAdd(input);
            }}
            placeholder="输入 z=f(x,y)，例如 x²+y²、sin(x)+cos(y)、x*y"
            className="min-w-[260px] flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
          <button
            type="button"
            onClick={() => handleAdd(input)}
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
        {notice ? <p className="mt-2 text-sm text-green-700">{notice}</p> : null}
        <p className="mt-2 text-xs text-slate-400">
          支持 x、y 两个自变量，可用常量 π/e 与函数 sin、cos、tan、sqrt、log、exp 等；3D 图像请在画布右上角切换到「3D」查看。
        </p>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
        <p className="mb-2 text-xs font-medium text-slate-500">变量范围与精度（点击「绘制」应用到 3D/等高线）</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 lg:grid-cols-4">
          <label className="flex items-center gap-1 text-xs text-slate-500">
            x:
            <input
              type="number"
              step="0.5"
              value={domainDraft.xMin}
              onChange={(e) => patchDomain({ xMin: Number(e.target.value) })}
              className="w-full min-w-0 rounded border border-slate-300 px-2 py-1 font-mono text-xs outline-none focus:border-primary-500"
            />
            ~
            <input
              type="number"
              step="0.5"
              value={domainDraft.xMax}
              onChange={(e) => patchDomain({ xMax: Number(e.target.value) })}
              className="w-full min-w-0 rounded border border-slate-300 px-2 py-1 font-mono text-xs outline-none focus:border-primary-500"
            />
          </label>
          <label className="flex items-center gap-1 text-xs text-slate-500">
            y:
            <input
              type="number"
              step="0.5"
              value={domainDraft.yMin}
              onChange={(e) => patchDomain({ yMin: Number(e.target.value) })}
              className="w-full min-w-0 rounded border border-slate-300 px-2 py-1 font-mono text-xs outline-none focus:border-primary-500"
            />
            ~
            <input
              type="number"
              step="0.5"
              value={domainDraft.yMax}
              onChange={(e) => patchDomain({ yMax: Number(e.target.value) })}
              className="w-full min-w-0 rounded border border-slate-300 px-2 py-1 font-mono text-xs outline-none focus:border-primary-500"
            />
          </label>
          <label className="flex items-center gap-1 text-xs text-slate-500">
            精度:
            <select
              value={gridDraft}
              onChange={(e) => {
                setGridDraft(Number(e.target.value));
                setViewNotice(null);
              }}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-primary-500"
            >
              {GRID_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDraw}
            className="rounded-md bg-primary-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-700"
          >
            绘制
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="rounded-md border border-slate-300 bg-white px-4 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-red-300 hover:text-red-600"
          >
            清空
          </button>
          {viewNotice ? <p className="text-xs text-green-700">{viewNotice}</p> : null}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium text-slate-500">示例函数（点击自动填充并绘制）：</p>
        <div className="flex flex-wrap gap-1.5">
          {MULTIVARIATE_EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              type="button"
              title={ex.description}
              onClick={() => {
                setInput(ex.expression);
                handleAdd(ex.expression);
              }}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 transition-colors hover:border-primary-300 hover:text-primary-700"
            >
              {ex.name}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
          还没有多元函数。试试输入 x^2+y^2 或点击上方示例。
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

              <DerivativeInfo expression={item.expression} />

              <SliceControls item={item} />
            </li>
          ))}
        </ul>
      )}

      <KnowledgeSection />
    </div>
  );
}

function domainNote(expression: string): string | null {
  if (expression.includes("sqrt")) {
    return "定义域：需保证根号内表达式 ≥ 0（如 √(1−x²−y²) 的定义域为 x²+y²≤1）。";
  }
  if (expression.includes("log")) {
    return "定义域：需保证对数真数 > 0。";
  }
  if (expression.includes("/")) {
    return "定义域：需保证分母不为 0。";
  }
  return null;
}

function DerivativeInfo({ expression }: { expression: string }) {
  const dx = useMemo(() => partialDerivative(expression, "x"), [expression]);
  const dy = useMemo(() => partialDerivative(expression, "y"), [expression]);
  const note = domainNote(expression);
  return (
    <div className="mt-1.5 rounded-md bg-violet-50/70 px-2.5 py-1.5 text-xs">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="text-slate-500">偏导数：</span>
        <span className="flex items-center gap-1">
          <span className="text-slate-400">∂f/∂x =</span>
          {dx.ok ? <LatexView latex={dx.latex} /> : <span className="text-amber-600">{dx.error}</span>}
        </span>
        <span className="flex items-center gap-1">
          <span className="text-slate-400">∂f/∂y =</span>
          {dy.ok ? <LatexView latex={dy.latex} /> : <span className="text-amber-600">{dy.error}</span>}
        </span>
      </div>
      {note ? <p className="mt-1 text-amber-600">{note}</p> : null}
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
