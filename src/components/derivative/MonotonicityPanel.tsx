"use client";

import type { DerivativeResult } from "@/types";
import { formatNumber } from "@/utils/katex";

interface MonotonicityPanelProps {
  result: DerivativeResult;
}

export function classifyCriticalPoints(result: DerivativeResult): { x: number; label: string }[] {
  const intervals = result.monotonicIntervals;
  return result.criticalPoints.map((cp) => {
    let label = "临界点";
    for (let i = 0; i < intervals.length; i++) {
      const prev = intervals[i - 1];
      const next = intervals[i];
      if (prev && next && prev.end !== null && Math.abs(prev.end - cp) < 1e-6 && next.start !== null && Math.abs(next.start - cp) < 1e-6) {
        if (prev.type === "decreasing" && next.type === "increasing") label = "极小值点";
        else if (prev.type === "increasing" && next.type === "decreasing") label = "极大值点";
        break;
      }
    }
    return { x: cp, label };
  });
}

export function MonotonicityPanel({ result }: MonotonicityPanelProps) {
  const criticalPoints = classifyCriticalPoints(result);

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="mb-2 text-sm font-medium text-slate-700">单调性与极值</p>

      {result.criticalPoints.length === 0 && result.monotonicIntervals.length === 0 ? (
        <p className="text-sm text-slate-500">未发现明显临界点。</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {result.monotonicIntervals.map((interval, index) => {
            const start = interval.start === null ? "(-∞" : `(${formatNumber(interval.start)}`;
            const end = interval.end === null ? "+∞)" : `${formatNumber(interval.end)})`;
            const label =
              interval.type === "increasing" ? "递增" : interval.type === "decreasing" ? "递减" : interval.type === "constant" ? "恒定" : "未知";
            return (
              <li key={index} className="text-slate-600">
                <span className="font-mono text-slate-800">
                  {start}, {end}
                </span>
                ：{label}
              </li>
            );
          })}
        </ul>
      )}

      {criticalPoints.length > 0 ? (
        <ul className="mt-2 space-y-1 text-sm">
          {criticalPoints.map((cp, index) => (
            <li key={index} className="text-slate-600">
              <span className="font-mono text-slate-800">x = {formatNumber(cp.x)}</span>：{cp.label}
            </li>
          ))}
        </ul>
      ) : null}

      {result.method === "numeric" ? (
        <p className="mt-2 text-xs text-amber-600">数值分析发现可能的临界点（非严格证明）。</p>
      ) : null}
    </div>
  );
}
