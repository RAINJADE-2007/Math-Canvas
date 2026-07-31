"use client";

import type { DerivativeResult } from "@/types";
import { formatNumber } from "@/utils/katex";

interface SecantControlsProps {
  expressionId: string;
  result: DerivativeResult;
  onSetSecantH: (h: number) => void;
}

export function SecantControls({ expressionId, result, onSetSecantH }: SecantControlsProps) {
  const tangent = result.tangent;
  const secant = result.secant;
  if (!tangent || !secant) {
    return <p className="text-sm text-slate-500">无法计算割线（请先设置有效切点）。</p>;
  }

  const h = secant.h;
  const difference = Math.abs(secant.slope - tangent.slope);

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="mb-2 text-sm font-medium text-slate-700">割线逼近切线</p>
      <div className="flex items-center gap-2 text-sm">
        <label htmlFor={`secant-h-${expressionId}`} className="shrink-0 text-xs text-slate-400">
          步长 h
        </label>
        <input
          id={`secant-h-${expressionId}`}
          type="range"
          min={0.01}
          max={5}
          step={0.01}
          value={Number.isFinite(h) ? h : 2}
          onChange={(e) => onSetSecantH(Number(e.target.value))}
          className="w-full accent-amber-600"
        />
        <span className="w-14 shrink-0 font-mono text-xs text-slate-600">{Number.isFinite(h) ? h.toFixed(2) : "2.00"}</span>
      </div>
      <p className="mt-1 text-xs text-slate-400">当 h 减小时，点 Q 向点 P 靠近，割线逐渐逼近切线。</p>
      <ul className="mt-2 space-y-1 text-sm">
        <li className="text-slate-600">
          点 Q：<span className="font-mono text-slate-800">Q({formatNumber(secant.x2)}, {formatNumber(secant.y2)})</span>
        </li>
        <li className="text-slate-600">
          割线斜率：<span className="font-mono text-slate-800">k_h = {formatNumber(secant.slope, 4)}</span>
        </li>
        <li className="text-slate-600">
          切线斜率：<span className="font-mono text-slate-800">k = {formatNumber(tangent.slope, 4)}</span>
        </li>
        <li className="text-slate-600">
          斜率差值：<span className="font-mono text-amber-700">|k_h − k| = {formatNumber(difference, 4)}</span>
        </li>
      </ul>
    </div>
  );
}
