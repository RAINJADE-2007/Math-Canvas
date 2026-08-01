"use client";

import { useEffect, useMemo, useState } from "react";
import { useMathCanvasStore } from "@/store/useMathCanvasStore";
import { useHoverPointStore } from "@/store/useHoverPointStore";
import { usePinnedPointsData } from "@/store/usePinnedPointsData";
import { analyzeMiddleSchoolFunction } from "@/math-engine/middle-school/functions/analyze";
import { describeTranslation, translateFunction } from "@/math-engine/middle-school/functions/translate";
import { geometryEquation, parseGeometryEquation } from "@/math-engine/middle-school/geometry/equation";
import { RatioControls } from "@/components/canvas/RatioControls";
import { LatexView } from "@/components/common/LatexView";
import type { GeometryObject, MathExpression } from "@/types";

export function RightPanel() {
  const selectedObjectId = useMathCanvasStore((s) => s.selectedObjectId);
  const expressions = useMathCanvasStore((s) => s.expressions);
  const geometryObjects = useMathCanvasStore((s) => s.geometryObjects);
  const parameters = useMathCanvasStore((s) => s.parameters);
  const canvasSettings = useMathCanvasStore((s) => s.canvasSettings);
  const updateCanvasSettings = useMathCanvasStore((s) => s.updateCanvasSettings);
  const setExpressionColor = useMathCanvasStore((s) => s.setExpressionColor);
  const toggleExpressionVisibility = useMathCanvasStore((s) => s.toggleExpressionVisibility);
  const toggleGeometryVisibility = useMathCanvasStore((s) => s.toggleGeometryVisibility);
  const derivativeResults = useMathCanvasStore((s) => s.derivativeResults);
  const removePinnedPoint = useMathCanvasStore((s) => s.removePinnedPoint);
  const pinnedData = usePinnedPointsData();

  const selectedExpression = expressions.find((e) => e.id === selectedObjectId);
  const selectedGeometry = geometryObjects.find((g) => g.id === selectedObjectId);

  const selectedPinnedPoints = useMemo(
    () => (selectedExpression ? pinnedData.filter((info) => info.expression.id === selectedExpression.id) : []),
    [pinnedData, selectedExpression],
  );

  const parameterValues = useMemo(() => {
    const values: Record<string, number> = {};
    for (const p of Object.values(parameters)) values[p.name] = p.value;
    return values;
  }, [parameters]);

  const analysis = useMemo(() => {
    if (!selectedExpression) return null;
    return analyzeMiddleSchoolFunction(
      selectedExpression,
      parameters,
      parameterValues,
      selectedExpression.domain ?? { min: -10, max: 10 },
    );
  }, [selectedExpression, parameters, parameterValues]);

  return (
    <div className="hidden flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card lg:flex">
      <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
        属性面板
      </div>
      <div className="panel-scroll flex-1 space-y-5 overflow-y-auto p-4">
        {selectedExpression ? (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              函数属性
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-400">表达式：</span>
                <LatexView latex={selectedExpression.latex} />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-400">颜色：</span>
                <input
                  type="color"
                  value={selectedExpression.color}
                  onChange={(e) => setExpressionColor(selectedExpression.id, e.target.value)}
                  className="h-6 w-10 rounded border border-slate-200"
                />
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={selectedExpression.visible}
                    onChange={() => toggleExpressionVisibility(selectedExpression.id)}
                  />
                  <span className="text-xs text-slate-500">显示</span>
                </label>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                  函数性质分析
                </div>
                {analysis ? (
                  <>
                    <p className="mb-2 text-xs text-slate-500">{analysis.summary}</p>
                    <ul className="space-y-1.5">
                      {analysis.properties.map((property) => (
                        <li key={property.key} className="flex items-start gap-2 text-xs">
                          <span className="mt-0.5 shrink-0 text-slate-400">{property.label}：</span>
                          <span className="text-slate-700">
                            {property.latex ? <LatexView latex={property.latex} /> : property.value}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {analysis.warning ? (
                      <p className="mt-2 rounded bg-amber-50 px-2 py-1 text-xs text-amber-700">
                        {analysis.warning}
                      </p>
                    ) : null}
                  </>
                ) : null}
              </div>

              {derivativeResults[selectedExpression.id] ? (
                <p className="rounded bg-violet-50 px-3 py-2 text-xs text-violet-700">
                  已开启导数分析，切线、割线与单调性信息请查看「导数分析」面板。
                </p>
              ) : null}

              <PointDataSection
                expressionId={selectedExpression.id}
                label={selectedExpression.rawInput}
                color={selectedExpression.color}
                hasDerivative={!!derivativeResults[selectedExpression.id]}
              />

              <TranslationSection expression={selectedExpression} />

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: selectedExpression.color }} />
                  已选取的点{selectedPinnedPoints.length > 0 ? `（${selectedPinnedPoints.length}）` : ""}
                </div>
                {selectedPinnedPoints.length > 0 ? (
                  <ul className="space-y-1.5">
                    {selectedPinnedPoints.map((info) => {
                      const p = info.point;
                      return (
                        <li key={p.id} className="flex items-start gap-2 text-xs">
                          <div className="min-w-0 flex-1">
                            <p className="font-mono text-slate-700">
                              P({fmtNum(p.x)}, {info.valid ? fmtNum(info.y) : "无定义"})
                            </p>
                            <p className="mt-0.5 text-slate-600">
                              函数值：
                              <span className={`font-mono font-medium ${info.valid ? "text-primary-700" : "text-amber-600"}`}>
                                {info.valid ? fmtNum(info.y) : "无定义"}
                              </span>
                            </p>
                            {derivativeResults[selectedExpression.id] ? (
                              <p className="mt-0.5 text-slate-600">
                                {"导数值 f'："}
                                <span className={`font-mono font-medium ${info.derivativeValid ? "text-violet-700" : "text-amber-600"}`}>
                                  {info.derivativeValid && info.derivative !== undefined ? fmtNum(info.derivative) : "无定义"}
                                </span>
                              </p>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            title="移除该点"
                            onClick={() => removePinnedPoint(p.id)}
                            className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            ×
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400">
                    点击画布中该函数的曲线可选取点并固定显示其数据，拖动标记可移动。
                  </p>
                )}
              </div>
            </div>
          </section>
        ) : selectedGeometry ? (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              几何对象属性
            </h3>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedGeometry.visible}
                onChange={() => toggleGeometryVisibility(selectedGeometry.id)}
              />
              <span className="text-slate-600">显示对象</span>
            </label>
            <div className="mt-3 space-y-2 text-xs text-slate-600">
              <p>使用「平移」工具在画布上拖动该对象可整体平移，数据与方程将随之更新。</p>
            </div>
            <GeometryEquationEditor obj={selectedGeometry} />
          </section>
        ) : (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              画布设置
            </h3>
            <div className="space-y-3 text-sm">
              <label className="flex items-center justify-between">
                <span className="text-slate-600">显示网格</span>
                <input
                  type="checkbox"
                  checked={canvasSettings.showGrid}
                  onChange={(e) => updateCanvasSettings({ showGrid: e.target.checked })}
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-slate-600">显示坐标轴</span>
                <input
                  type="checkbox"
                  checked={canvasSettings.showAxes}
                  onChange={(e) => updateCanvasSettings({ showAxes: e.target.checked })}
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-slate-600">显示函数名称</span>
                <input
                  type="checkbox"
                  checked={canvasSettings.showLabels}
                  onChange={(e) => updateCanvasSettings({ showLabels: e.target.checked })}
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-slate-600">显示单调性提示</span>
                <input
                  type="checkbox"
                  checked={canvasSettings.showMonotonicityHint}
                  onChange={(e) => updateCanvasSettings({ showMonotonicityHint: e.target.checked })}
                />
              </label>
              <div>
                <p className="mb-1.5 text-slate-600">画布比例</p>
                <RatioControls />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              点击画布中的函数或下方列表项即可选中并查看性质分析。
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

function PointDataSection({
  expressionId,
  label,
  color,
  hasDerivative,
}: {
  expressionId: string;
  label: string;
  color: string;
  hasDerivative: boolean;
}) {
  const hover = useHoverPointStore((s) => s.data);
  const item = hover?.values.find((v) => v.id === expressionId);

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
        点的数据
      </div>
      {hover && item ? (
        <ul className="space-y-1.5 text-sm">
          <li className="text-slate-600">
            当前点：
            <span className="font-mono text-slate-800">
              P({fmtNum(hover.x)}, {fmtNum(hover.y)})
            </span>
          </li>
          <li className="text-slate-600">
            函数值 {label}：
            <span className={`font-mono font-medium ${item.valid ? "text-primary-700" : "text-amber-600"}`}>
              {item.valid ? fmtNum(item.value) : "无定义"}
            </span>
          </li>
          {hasDerivative ? (
            <li className="text-slate-600">
              {"导数值 f'："}
              <span className={`font-mono font-medium ${item.derivativeValid ? "text-violet-700" : "text-amber-600"}`}>
                {item.derivativeValid && item.derivative !== undefined ? fmtNum(item.derivative) : "无定义"}
              </span>
            </li>
          ) : null}
        </ul>
      ) : (
        <p className="text-xs text-slate-400">
          将鼠标移动到画布上，此处会实时显示该函数在当前点的坐标与取值；点击曲线可固定选取该点。
        </p>
      )}
    </div>
  );
}

function fmtNum(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return Number.isInteger(n) ? String(n) : n.toFixed(3);
}

function GeometryEquationEditor({ obj }: { obj: GeometryObject }) {
  const updateGeometryObject = useMathCanvasStore((s) => s.updateGeometryObject);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const equation = useMemo(() => geometryEquation(obj), [obj]);

  useEffect(() => {
    setValue(equation?.equation ?? "");
    setError(null);
  }, [equation]);

  function handleApply() {
    if (obj.type === "point") return;
    const result = parseGeometryEquation(obj, value);
    if (!result.ok) {
      setError(result.error ?? "解析失败");
      return;
    }
    updateGeometryObject(obj.id, result.patch ?? {});
    setError(null);
  }

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
        <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
        方程
      </div>
      {obj.type === "point" ? (
        <p className="text-xs text-slate-500">
          点 {obj.label}：({fmtNum(obj.x ?? 0)}, {fmtNum(obj.y ?? 0)})
        </p>
      ) : equation ? (
        <>
          <p className="font-mono text-xs text-slate-700">{equation.equation}</p>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleApply();
              }}
              placeholder="如 y = 2x + 1 或 (x-1)^2+(y-2)^2=9"
              className="min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-1 font-mono text-xs outline-none focus:border-primary-500"
            />
            <button
              type="button"
              onClick={handleApply}
              className="shrink-0 rounded-md bg-primary-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-primary-700"
            >
              更新
            </button>
          </div>
          {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
          <p className="mt-1.5 text-[10px] leading-relaxed text-slate-400">
            支持格式：直线 y = kx + b / x = c；圆 (x-a)^2 + (y-b)^2 = r^2。
          </p>
        </>
      ) : null}
    </div>
  );
}

function TranslationSection({ expression }: { expression: MathExpression }) {
  const setExpressionTranslation = useMathCanvasStore((s) => s.setExpressionTranslation);
  const addExpression = useMathCanvasStore((s) => s.addExpression);
  const [hValue, setHValue] = useState("");
  const [kValue, setKValue] = useState("");
  const [copied, setCopied] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const dx = expression.translation?.dx ?? 0;
  const dy = expression.translation?.dy ?? 0;
  const hasTranslation = dx !== 0 || dy !== 0;

  useEffect(() => {
    setHValue(String(dx));
    setKValue(String(dy));
  }, [dx, dy]);

  const result = useMemo(
    () => translateFunction(expression.normalizedExpression, dx, dy),
    [expression.normalizedExpression, dx, dy],
  );

  function updateTranslation(nextDx: number, nextDy: number) {
    setExpressionTranslation(expression.id, {
      dx: Number.isFinite(nextDx) ? nextDx : 0,
      dy: Number.isFinite(nextDy) ? nextDy : 0,
    });
  }

  async function handleCopy() {
    if (!result.ok || !result.expression) return;
    try {
      await navigator.clipboard.writeText(result.expression);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  function handleApply() {
    setApplyError(null);
    if (!result.ok) {
      setApplyError(result.error ?? "无法生成解析式");
      return;
    }
    const res = addExpression(result.expression);
    if (!res.ok) {
      setApplyError(res.error ?? "添加失败");
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
        <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
        图像平移
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-slate-500">
          水平
          <input
            type="number"
            step="0.1"
            value={hValue}
            onChange={(e) => {
              setHValue(e.target.value);
              updateTranslation(parseFloat(e.target.value), dy);
            }}
            className="w-20 rounded border border-slate-300 px-2 py-1 font-mono text-xs outline-none focus:border-primary-500"
          />
        </label>
        <label className="flex items-center gap-1.5 text-xs text-slate-500">
          垂直
          <input
            type="number"
            step="0.1"
            value={kValue}
            onChange={(e) => {
              setKValue(e.target.value);
              updateTranslation(dx, parseFloat(e.target.value));
            }}
            className="w-20 rounded border border-slate-300 px-2 py-1 font-mono text-xs outline-none focus:border-primary-500"
          />
        </label>
      </div>
      <p className="mt-2 text-xs text-slate-500">{describeTranslation(dx, dy)}</p>
      <div className="mt-2 rounded bg-white p-2">
        <p className="text-xs text-slate-400">平移后的解析式：</p>
        <div className="mt-1 text-sm">
          <LatexView latex={result.latex} />
        </div>
        <p className="mt-1 font-mono text-xs text-slate-600">y = {result.expression || "—"}</p>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleApply}
          className="rounded-md bg-primary-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-primary-700"
        >
          应用为新函数
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:border-primary-300 hover:text-primary-700"
        >
          {copied ? "已复制" : "复制解析式"}
        </button>
        {hasTranslation ? (
          <button
            type="button"
            onClick={() => setExpressionTranslation(expression.id, { dx: 0, dy: 0 })}
            className="rounded-md px-3 py-1 text-xs text-slate-500 hover:bg-slate-100"
          >
            重置
          </button>
        ) : null}
      </div>
      {applyError ? <p className="mt-2 text-xs text-red-600">{applyError}</p> : null}
      <p className="mt-2 text-xs text-slate-400">
        使用工具栏「平移」工具拖动该函数曲线即可实时平移图像。
      </p>
    </div>
  );
}
