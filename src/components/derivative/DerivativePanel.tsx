"use client";

import { useEffect, useMemo, useState } from "react";
import { useMathCanvasStore } from "@/store/useMathCanvasStore";
import { buildDerivativeResult } from "@/math-engine/calculus-intro/derivative/derivativeAnalysis";
import { computeDerivative } from "@/math-engine/calculus-intro/derivative/differentiate";
import { verifyDerivative } from "@/math-engine/calculus-intro/verifier/verifyDerivative";
import { createSafeFunction } from "@/math-engine/core/evaluator/evaluator";
import type { DerivativeVisibility, MathExpression } from "@/types";
import { SolutionStepsView } from "@/components/common/SolutionStepsView";
import { LatexView } from "@/components/common/LatexView";
import { TangentControls } from "@/components/derivative/TangentControls";
import { SecantControls } from "@/components/derivative/SecantControls";
import { MonotonicityPanel } from "@/components/derivative/MonotonicityPanel";

export function DerivativePanel() {
  const expressions = useMathCanvasStore((s) => s.expressions);
  const parameters = useMathCanvasStore((s) => s.parameters);
  const derivativeResults = useMathCanvasStore((s) => s.derivativeResults);
  const derivativeVisibility = useMathCanvasStore((s) => s.derivativeVisibility);
  const setDerivativeResult = useMathCanvasStore((s) => s.setDerivativeResult);
  const toggleDerivative = useMathCanvasStore((s) => s.toggleDerivative);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);

  const withDerivative = expressions.filter((e) => derivativeResults[e.id]);
  const activeId = selectedId && derivativeResults[selectedId] ? selectedId : withDerivative[0]?.id ?? null;
  const activeExpression = expressions.find((e) => e.id === activeId) ?? null;
  const activeResult = activeId ? derivativeResults[activeId] : undefined;

  const parameterValues = useMemo(() => {
    const values: Record<string, number> = {};
    for (const p of Object.values(parameters)) values[p.name] = p.value;
    return values;
  }, [parameters]);

  useEffect(() => {
    if (!activeExpression) return;
    const rebuild = () => {
      const result = buildDerivativeResult({
        expression: activeExpression,
        parameterValues,
        domain: activeExpression.domain ?? { min: -10, max: 10 },
        tangentX: activeResult?.tangent?.x,
        secantH: activeResult?.secant?.h,
      });
      setDerivativeResult(activeExpression.id, result);
    };
    rebuild();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parameters, activeExpression?.id]);

  function updateTangentX(x: number) {
    if (!activeExpression || !activeResult) return;
    const result = buildDerivativeResult({
      expression: activeExpression,
      parameterValues,
      domain: activeExpression.domain ?? { min: -10, max: 10 },
      tangentX: x,
      secantH: activeResult.secant?.h,
    });
    setDerivativeResult(activeExpression.id, result);
  }

  function updateSecantH(h: number) {
    if (!activeExpression || !activeResult) return;
    const result = buildDerivativeResult({
      expression: activeExpression,
      parameterValues,
      domain: activeExpression.domain ?? { min: -10, max: 10 },
      tangentX: activeResult.tangent?.x,
      secantH: h,
    });
    setDerivativeResult(activeExpression.id, result);
  }

  function handleVerify() {
    if (!activeExpression || !activeResult?.derivativeExpression) return;
    const fn = createSafeFunction(activeExpression.normalizedExpression);
    const numericFn = (x: number) => fn.evaluate(x, parameterValues);
    const computed = computeDerivative({
      expression: activeExpression.normalizedExpression,
      fn: numericFn,
      params: parameterValues,
    });
    const verification = verifyDerivative(activeResult.derivativeExpression, numericFn, computed.derivativeAt);
    setVerifyMessage(
      verification.verified
        ? `符号求导结果与数值导数一致（平均误差 ${avg(verification.points.map((p) => p.diff))}）。`
        : "符号求导与数值导数存在偏差，请检查。",
    );
  }

  if (withDerivative.length === 0) {
    return (
      <div className="text-sm text-slate-500">
        <p>尚未开启任何函数的导数分析。</p>
        <p className="mt-1 text-xs text-slate-400">
          请在「表达式」面板中点击函数条目上的「显示导数」按钮，或点击下方按钮开启示例。
        </p>
        <button
          type="button"
          onClick={async () => {
            const s = useMathCanvasStore.getState();
            let exprId: string | null = null;
            if (s.expressions.length === 0) {
              const added = s.addExpression("x^2");
              if (added.expression) exprId = added.expression.id;
            } else {
              exprId = s.expressions[0].id;
            }
            if (exprId) toggleDerivative(exprId);
          }}
          className="mt-3 rounded-md border border-violet-300 bg-violet-50 px-4 py-2 text-sm text-violet-700 hover:bg-violet-100"
        >
          使用示例：对 f(x)=x² 显示导数
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-700">选择函数：</span>
        {withDerivative.map((expr) => (
          <button
            key={expr.id}
            type="button"
            onClick={() => setSelectedId(expr.id)}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              activeId === expr.id
                ? "bg-violet-600 text-white"
                : "border border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-700"
            }`}
          >
            {expr.rawInput}
          </button>
        ))}
      </div>

      {activeExpression && activeResult ? (
        <div className="space-y-3">
          <VisibilityControls
            expressionId={activeExpression.id}
            visible={activeExpression.visible}
            visibility={derivativeVisibility[activeExpression.id]}
          />
          <div className="grid gap-4 xl:grid-cols-2">
            <section className="space-y-3">
              <DerivativeSummary expression={activeExpression} method={activeResult.method} derivativeLatex={activeResult.derivativeLatex} warning={activeResult.warning} />
              {activeResult.derivativeExpression ? (
                <button
                  type="button"
                  onClick={handleVerify}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-primary-300 hover:text-primary-700"
                >
                  数值验证导数
                </button>
              ) : null}
              {verifyMessage ? <p className="text-xs text-green-700">{verifyMessage}</p> : null}

              <TangentControls expressionId={activeExpression.id} result={activeResult} onSetTangentX={updateTangentX} />
              <SecantControls expressionId={activeExpression.id} result={activeResult} onSetSecantH={updateSecantH} />
              <MonotonicityPanel result={activeResult} />
            </section>

            <section>
              <p className="mb-2 text-sm font-medium text-slate-700">求导过程（分步）</p>
              {activeResult.steps.length > 0 ? (
                <SolutionStepsView steps={activeResult.steps} problemLatex={activeExpression.latex} />
              ) : (
                <p className="text-sm text-slate-500">没有可展示的求导步骤。</p>
              )}
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function VisibilityControls({
  expressionId,
  visible,
  visibility,
}: {
  expressionId: string;
  visible: boolean;
  visibility: DerivativeVisibility | undefined;
}) {
  const toggleExpressionVisibility = useMathCanvasStore((s) => s.toggleExpressionVisibility);
  const setDerivativeVisibility = useMathCanvasStore((s) => s.setDerivativeVisibility);

  const items: { key: keyof DerivativeVisibility | "original"; label: string; checked: boolean }[] = [
    { key: "original", label: "原函数", checked: visible },
    { key: "derivative", label: "导函数", checked: visibility?.derivative !== false },
    { key: "tangent", label: "切线", checked: visibility?.tangent !== false },
    { key: "secant", label: "割线", checked: visibility?.secant !== false },
    { key: "criticalPoints", label: "临界点", checked: visibility?.criticalPoints !== false },
  ];

  function toggle(key: keyof DerivativeVisibility | "original") {
    if (key === "original") {
      toggleExpressionVisibility(expressionId);
      return;
    }
    const checked = visibility?.[key] !== false;
    setDerivativeVisibility(expressionId, { [key]: !checked });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <span className="text-sm font-medium text-slate-700">显示内容：</span>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => toggle(item.key)}
          className={`rounded-md px-3 py-1 text-xs transition-colors ${
            item.checked
              ? "bg-primary-600 text-white hover:bg-primary-700"
              : "border border-slate-300 bg-white text-slate-500 hover:border-primary-300 hover:text-primary-700"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function avg(values: number[]): string {
  if (values.length === 0) return "—";
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  return mean.toExponential(2);
}

function DerivativeSummary({
  expression,
  method,
  derivativeLatex,
  warning,
}: {
  expression: MathExpression;
  method: string;
  derivativeLatex?: string;
  warning?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-sm font-medium text-slate-700">原函数与导函数联合绘制</p>
      <div className="mt-2 flex items-center gap-3 text-sm">
        <span className="text-slate-500">原函数</span>
        <LatexView latex={expression.latex} />
        <span className="text-slate-300">→</span>
        <span className="text-violet-700">导函数</span>
        <LatexView latex={derivativeLatex ?? "f'(x) \\approx \\frac{f(x+h)-f(x-h)}{2h}"} />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        求导方式：{method === "symbolic" ? "符号求导" : "数值导数（数值近似）"}
      </p>
      {warning ? <p className="mt-1 text-xs text-amber-600">{warning}</p> : null}
      <p className="mt-2 text-xs text-slate-400">
        导函数以紫色虚线绘制；观察原函数递增时导函数为正、递减时导函数为负、极值点附近导函数接近 0。
      </p>
    </div>
  );
}
