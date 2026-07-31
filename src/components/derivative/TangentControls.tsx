"use client";

import type { DerivativeResult } from "@/types";
import { formatNumber } from "@/utils/katex";

interface TangentControlsProps {
  expressionId: string;
  result: DerivativeResult;
  onSetTangentX: (x: number) => void;
}

export function TangentControls({ expressionId, result, onSetTangentX }: TangentControlsProps) {
  const tangent = result.tangent;
  if (!tangent) {
    return <p className="text-sm text-slate-500">当前切点处函数无定义，无法计算切线。</p>;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="mb-2 text-sm font-medium text-slate-700">动态切线</p>
      <div className="flex items-center gap-2 text-sm">
        <label htmlFor={`tangent-x-${expressionId}`} className="shrink-0 text-xs text-slate-400">
          切点横坐标 a
        </label>
        <input
          id={`tangent-x-${expressionId}`}
          type="number"
          step="0.1"
          value={Number.isFinite(tangent.x) ? Math.round(tangent.x * 100) / 100 : 0}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (Number.isFinite(value)) onSetTangentX(value);
          }}
          className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm outline-none focus:border-primary-500"
        />
        <span className="text-xs text-slate-400">或在画布中拖动点 P</span>
      </div>
      <ul className="mt-2 space-y-1 text-sm">
        <li className="text-slate-600">
          当前点：<span className="font-mono text-slate-800">P({formatNumber(tangent.x)}, {formatNumber(tangent.y)})</span>
        </li>
        <li className="text-slate-600">
          导数值：<span className="font-mono text-slate-800">{"f'"}({formatNumber(tangent.x)}) = {formatNumber(tangent.slope)}</span>
        </li>
        <li className="text-slate-600">
          切线斜率：<span className="font-mono text-slate-800">{formatNumber(tangent.slope)}</span>
        </li>
        <li className="text-slate-600">
          切线方程：<span className="font-mono text-slate-800">{"y - f(a) = f'(a)(x - a)"}　→　{tangent.equation}</span>
        </li>
      </ul>
    </div>
  );
}
