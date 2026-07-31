"use client";

import { useMemo, useState } from "react";
import { evaluate, parse } from "mathjs";
import type { MathNode } from "mathjs";
import { useMathCanvasStore } from "@/store/useMathCanvasStore";
import { uid } from "@/store/useMathCanvasStore";
import { validateExpressionAst } from "@/math-engine/core/validator/validateNode";
import { asNode } from "@/math-engine/core/validator/astAccess";
import { ALLOWED_CONSTANT_SET } from "@/constants/math";
import { LatexView } from "@/components/common/LatexView";

const QUICK_KEYS = [
  "2+3*4",
  "(5+3)/2",
  "sqrt(16)",
  "2^10",
  "sin(pi/2)",
  "log10(100)",
  "abs(-5)",
  "pi",
];

function walkSymbols(node: MathNode, out: string[]): void {
  const n = asNode(node);
  if (n.type === "SymbolNode") {
    if (!ALLOWED_CONSTANT_SET.has(n.name ?? "")) out.push(n.name ?? "");
    return;
  }
  if (n.type === "FunctionNode") {
    for (const arg of n.args ?? []) walkSymbols(arg, out);
    return;
  }
  if (n.type === "ParenthesisNode") {
    walkSymbols(n.content!, out);
    return;
  }
  for (const arg of n.args ?? []) walkSymbols(arg, out);
}

function validateCalculatorAst(expression: string): string | null {
  try {
    const node = parse(expression);
    const validation = validateExpressionAst(node);
    if (!validation.ok) return validation.errors[0];
    const badSymbols: string[] = [];
    walkSymbols(node, badSymbols);
    if (badSymbols.length > 0) {
      return `计算器不支持变量：${Array.from(new Set(badSymbols)).join(", ")}`;
    }
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : "表达式解析失败";
  }
}

function formatResult(value: unknown): { result: string; approximation: string; error?: string } {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return { result: "无定义", approximation: "", error: "结果为无穷或未定义" };
    }
    const approximation = (Math.round(value * 1e6) / 1e6).toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
    return { result: String(value), approximation: `≈ ${approximation}` };
  }
  if (value !== null && typeof value === "object") {
    const re = (value as { re?: unknown }).re;
    const im = (value as { im?: unknown }).im;
    if (typeof re === "number" && typeof im === "number") {
      if (Math.abs(im) < 1e-10) {
        return formatResult(re);
      }
      const imPart = Math.abs(im) === 1 ? "i" : `${im}i`;
      return {
        result: `${re} ${im >= 0 ? "+" : "-"} ${imPart}`,
        approximation: "结果为复数（当前版本仅显示复数形式）",
      };
    }
  }
  return { result: String(value), approximation: "" };
}

export function CalculatorPanel() {
  const calculatorHistory = useMathCanvasStore((s) => s.calculatorHistory);
  const addCalculatorRecord = useMathCanvasStore((s) => s.addCalculatorRecord);
  const clearCalculatorHistory = useMathCanvasStore((s) => s.clearCalculatorHistory);

  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<{ input: string; latex: string; result: string; approximation: string } | null>(null);

  const latexPreview = useMemo(() => {
    if (!input.trim()) return null;
    try {
      const node = parse(input);
      const validation = validateExpressionAst(node);
      if (!validation.ok) return null;
      return node.toTex();
    } catch {
      return null;
    }
  }, [input]);

  function calculate(expression?: string) {
    const value = (expression ?? input).trim();
    if (!value) return;
    const validationError = validateCalculatorAst(value);
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      const result = evaluate(value, {});
      const formatted = formatResult(result);
      setError(formatted.error ?? null);
      let latex = value;
      try {
        latex = parse(value).toTex();
      } catch {
        latex = value;
      }
      setCurrent({
        input: value,
        latex,
        result: formatted.result,
        approximation: formatted.approximation,
      });
      addCalculatorRecord({
        id: uid("calc"),
        input: value,
        latex,
        result: formatted.result,
        approximation: formatted.approximation,
        error: formatted.error,
        createdAt: Date.now(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "计算失败");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") calculate();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="输入计算式，例如 2+3*4、sin(pi/2)、sqrt(16)"
            className="min-w-[240px] flex-1 rounded-md border border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
          <button
            type="button"
            onClick={() => calculate()}
            className="rounded-md bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            计算
          </button>
        </div>
        {latexPreview ? (
          <div className="mt-2 flex items-center gap-2 rounded-md bg-primary-50 px-3 py-1.5 text-sm">
            <span className="text-xs text-slate-400">预览：</span>
            <LatexView latex={latexPreview} />
          </div>
        ) : null}
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        {current ? (
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4">
            <div className="text-xs text-slate-400">输入：{current.input}</div>
            <div className="mt-1 text-lg">
              <LatexView latex={current.latex} displayMode />
            </div>
            <div className="mt-2 text-2xl font-semibold text-primary-700">{current.result}</div>
            {current.approximation ? <div className="mt-1 text-sm text-slate-500">{current.approximation}</div> : null}
          </div>
        ) : null}

        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-slate-400">快速示例</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setInput(key);
                  setError(null);
                }}
                className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-600 hover:border-primary-300 hover:text-primary-700"
              >
                {key}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400">
            支持四则运算、乘方（^）、括号、平方根（sqrt）、绝对值（abs）、三角与反三角函数、指数（exp）、对数（log / log10）、圆周率 pi 与自然常数 e。
          </p>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700">历史记录</p>
          <button
            type="button"
            onClick={clearCalculatorHistory}
            className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-slate-50"
          >
            清空记录
          </button>
        </div>
        {calculatorHistory.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 p-4 text-center text-xs text-slate-400">
            暂无历史记录
          </p>
        ) : (
          <ul className="space-y-2">
            {calculatorHistory.slice().reverse().slice(0, 30).map((record) => (
              <li key={record.id} className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
                <div className="text-xs text-slate-500">{record.input}</div>
                <div className="mt-0.5 font-mono text-sm text-slate-800">{record.result}</div>
                {record.approximation ? (
                  <div className="text-xs text-slate-400">{record.approximation}</div>
                ) : null}
                {record.error ? <div className="text-xs text-red-500">{record.error}</div> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
