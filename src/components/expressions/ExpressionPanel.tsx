"use client";

import { useMemo, useState } from "react";
import { useMathCanvasStore } from "@/store/useMathCanvasStore";
import { parseExpressionInput } from "@/math-engine/core/parser/parseExpression";
import { guessFunctionType } from "@/math-engine/middle-school/functions/describeType";
import { LatexView } from "@/components/common/LatexView";
import { MAX_EXPRESSIONS, MAX_EXPRESSION_LENGTH } from "@/constants/app";

export function ExpressionPanel() {
  const expressions = useMathCanvasStore((s) => s.expressions);
  const parameters = useMathCanvasStore((s) => s.parameters);
  const derivativeResults = useMathCanvasStore((s) => s.derivativeResults);
  const selectedObjectId = useMathCanvasStore((s) => s.selectedObjectId);

  const addExpression = useMathCanvasStore((s) => s.addExpression);
  const updateExpression = useMathCanvasStore((s) => s.updateExpression);
  const removeExpression = useMathCanvasStore((s) => s.removeExpression);
  const toggleExpressionVisibility = useMathCanvasStore((s) => s.toggleExpressionVisibility);
  const setExpressionColor = useMathCanvasStore((s) => s.setExpressionColor);
  const selectObject = useMathCanvasStore((s) => s.selectObject);
  const toggleDerivative = useMathCanvasStore((s) => s.toggleDerivative);
  const setActiveTool = useMathCanvasStore((s) => s.setActiveTool);

  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const preview = useMemo(() => {
    if (!input.trim()) return null;
    const result = parseExpressionInput(input);
    return result;
  }, [input]);

  function handleAdd() {
    if (!input.trim()) {
      setError("请输入函数表达式");
      return;
    }
    const result = addExpression(input);
    if (!result.ok) {
      setError(result.error ?? "添加失败");
      return;
    }
    setInput("");
    setError(null);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleAdd();
  }

  function startEdit(expressionId: string, rawInput: string) {
    setEditId(expressionId);
    setEditValue(rawInput);
    setEditError(null);
  }

  function saveEdit() {
    if (editId === null) return;
    if (!editValue.trim()) {
      setEditError("表达式不能为空");
      return;
    }
    const result = parseExpressionInput(editValue);
    if (!result.ok) {
      setEditError(result.error ?? "无效表达式");
      return;
    }
    updateExpression(editId, {
      rawInput: editValue.trim(),
      latex: result.latex,
      normalizedExpression: result.normalizedExpression,
      parameters: result.parameters,
    });
    setEditId(null);
    setEditError(null);
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="输入函数，例如 x^2、sin(x)、a*x+b、y=x^3"
            maxLength={MAX_EXPRESSION_LENGTH}
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
            <LatexView latex={preview.latex} />
          </div>
        ) : preview && !preview.ok ? (
          <p className="mt-2 text-sm text-amber-600">{preview.error}</p>
        ) : null}
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <p className="mt-2 text-xs text-slate-400">
          支持 y=、f(x)= 前缀；最多 {MAX_EXPRESSIONS} 个函数，单个表达式最多 {MAX_EXPRESSION_LENGTH} 个字符。
        </p>
      </div>

      {expressions.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
          还没有函数。试试输入 x^2 或 sin(x) 吧。
        </div>
      ) : (
        <ul className="space-y-2">
          {expressions.map((expr, index) => {
            const isSelected = selectedObjectId === expr.id;
            const hasDerivative = !!derivativeResults[expr.id];
            const typeLabel = guessFunctionType(expr);
            return (
              <li
                key={expr.id}
                className={`rounded-lg border p-3 transition-colors ${
                  isSelected
                    ? "border-primary-400 bg-primary-50/60"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
                onClick={() => selectObject(isSelected ? null : expr.id)}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="h-4 w-4 shrink-0 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: expr.color }}
                  />
                  <span className="text-xs font-medium text-slate-400">#{index + 1}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs ${
                      expr.visible ? "bg-slate-100 text-slate-600" : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {typeLabel}
                  </span>
                  {hasDerivative ? (
                    <span className="rounded bg-violet-100 px-1.5 py-0.5 text-xs text-violet-700">导数</span>
                  ) : null}
                  {expr.translation && (expr.translation.dx !== 0 || expr.translation.dy !== 0) ? (
                    <span className="rounded bg-primary-100 px-1.5 py-0.5 text-xs text-primary-700">平移</span>
                  ) : null}
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      type="button"
                      title={expr.visible ? "隐藏函数" : "显示函数"}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpressionVisibility(expr.id);
                      }}
                      className="rounded p-1 text-sm text-slate-500 hover:bg-slate-100"
                    >
                      {expr.visible ? "隐藏" : "显示"}
                    </button>
                    <button
                      type="button"
                      title="编辑表达式"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(expr.id, expr.rawInput);
                      }}
                      className="rounded p-1 text-sm text-slate-500 hover:bg-slate-100"
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      title="删除函数"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeExpression(expr.id);
                      }}
                      className="rounded p-1 text-sm text-red-500 hover:bg-red-50"
                    >
                      删除
                    </button>
                  </div>
                </div>

                {editId === expr.id ? (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => {
                          setEditValue(e.target.value);
                          setEditError(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") setEditId(null);
                        }}
                        maxLength={MAX_EXPRESSION_LENGTH}
                        className="min-w-[200px] flex-1 rounded-md border border-slate-300 px-2 py-1 text-sm outline-none focus:border-primary-500"
                      />
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="rounded-md bg-primary-600 px-3 py-1 text-xs text-white hover:bg-primary-700"
                      >
                        保存
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditId(null)}
                        className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
                      >
                        取消
                      </button>
                    </div>
                    {editError ? <p className="mt-1 text-xs text-red-600">{editError}</p> : null}
                  </div>
                ) : (
                  <>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
                      <LatexView latex={expr.latex} />
                      {expr.parameters.length > 0 ? (
                        <span className="text-xs text-slate-400">参数：{expr.parameters.join(", ")}</span>
                      ) : null}
                    </div>
                    {expr.error ? (
                      <p className="mt-1 text-xs text-red-500">{expr.error}</p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <input
                        type="color"
                        value={expr.color}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setExpressionColor(expr.id, e.target.value)}
                        className="h-6 w-9 cursor-pointer rounded border border-slate-200"
                        title="修改颜色"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectObject(expr.id);
                          setActiveTool("select");
                        }}
                        className="rounded-md border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-primary-300 hover:text-primary-700"
                      >
                        分析函数
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDerivative(expr.id);
                        }}
                        className={`rounded-md px-3 py-1 text-xs transition-colors ${
                          hasDerivative
                            ? "bg-violet-600 text-white hover:bg-violet-700"
                            : "border border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-700"
                        }`}
                      >
                        {hasDerivative ? "隐藏导数" : "显示导数"}
                      </button>
                      <span className="text-xs text-slate-400">
                        {hasDerivative
                          ? parameters && Object.keys(parameters).length > 0
                            ? "拖动参数时图像与导数实时刷新"
                            : ""
                          : ""}
                      </span>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
