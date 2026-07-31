"use client";

import type { SolutionStep } from "@/types";
import { LatexView } from "@/components/common/LatexView";

interface SolutionStepsViewProps {
  steps: SolutionStep[];
  problemLatex?: string;
}

export function SolutionStepsView({ steps, problemLatex }: SolutionStepsViewProps) {
  return (
    <ol className="space-y-2">
      {problemLatex ? (
        <li className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="mt-0.5 w-6 shrink-0 text-xs font-semibold text-slate-400">题目</span>
          <div className="min-w-0 flex-1 text-sm">
            <LatexView latex={problemLatex} />
          </div>
        </li>
      ) : null}
      {steps.map((step, index) => (
        <li key={step.id} className="flex items-start gap-3 rounded-md border border-slate-200 px-3 py-2">
          <span className="mt-0.5 w-6 shrink-0 rounded-full bg-primary-50 text-center text-xs font-semibold text-primary-700">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {step.afterLatex ? (
                <LatexView latex={step.afterLatex} />
              ) : step.beforeLatex ? (
                <LatexView latex={step.beforeLatex} />
              ) : null}
              {step.verified ? (
                <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                  已验证
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-slate-500">{step.explanation}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
