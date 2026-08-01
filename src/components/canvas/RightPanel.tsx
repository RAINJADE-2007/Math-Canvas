"use client";

import { useMemo } from "react";
import { useMathCanvasStore } from "@/store/useMathCanvasStore";
import { useHoverPointStore } from "@/store/useHoverPointStore";
import { analyzeMiddleSchoolFunction } from "@/math-engine/middle-school/functions/analyze";
import { LatexView } from "@/components/common/LatexView";

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

  const selectedExpression = expressions.find((e) => e.id === selectedObjectId);
  const selectedGeometry = geometryObjects.find((g) => g.id === selectedObjectId);

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
            </div>
          </section>
        ) : selectedGeometry ? (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              几何对象属性
            </h3>
            <p className="text-sm text-slate-600">
              对象「{selectedGeometry.label}」的相关计算请见「几何」面板。
            </p>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedGeometry.visible}
                onChange={() => toggleGeometryVisibility(selectedGeometry.id)}
              />
              <span className="text-slate-600">显示对象</span>
            </label>
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
          将鼠标移动到画布上，此处会实时显示该函数在当前点的坐标与取值。
        </p>
      )}
    </div>
  );
}

function fmtNum(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return Number.isInteger(n) ? String(n) : n.toFixed(3);
}
