"use client";

import { useState } from "react";
import { useMathCanvasStore } from "@/store/useMathCanvasStore";
import { uid } from "@/store/useMathCanvasStore";
import { solveMiddleSchoolProblem } from "@/math-engine/middle-school/solver/solve";
import { toLatex } from "@/math-engine/middle-school/solver/polyMath";
import type { ProblemType, SolutionResult } from "@/types";
import { SolutionStepsView } from "@/components/common/SolutionStepsView";
import { LatexView } from "@/components/common/LatexView";

const PROBLEM_TYPES: { id: ProblemType; label: string; placeholder: string; examples: string[] }[] = [
  {
    id: "linear-equation",
    label: "一元一次方程",
    placeholder: "例如 2*x+3=7",
    examples: ["2*x+3=7", "5*x-2=3*x+6"],
  },
  {
    id: "quadratic-equation",
    label: "一元二次方程",
    placeholder: "例如 x^2-5*x+6=0",
    examples: ["x^2-5*x+6=0", "2*x^2+3*x-2=0"],
  },
  {
    id: "linear-inequality",
    label: "一元一次不等式",
    placeholder: "例如 2*x+3>7",
    examples: ["2*x+3>7", "3*x-1<=8", "-2*x+4>0"],
  },
];

export function SolverPanel() {
  const solutionHistory = useMathCanvasStore((s) => s.solutionHistory);
  const addSolutionRecord = useMathCanvasStore((s) => s.addSolutionRecord);
  const clearSolutionHistory = useMathCanvasStore((s) => s.clearSolutionHistory);

  const [problemType, setProblemType] = useState<ProblemType>("linear-equation");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<SolutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeType = PROBLEM_TYPES.find((p) => p.id === problemType) ?? PROBLEM_TYPES[0];

  function solve() {
    const value = input.trim();
    if (!value) {
      setError("请输入方程或不等式");
      return;
    }
    const problem = {
      id: uid("problem"),
      subjectId: "middle-school" as const,
      problemType,
      text: value,
      input: value,
    };
    const solution = solveMiddleSchoolProblem(problem);
    setResult(solution);
    setError(solution.warning && solution.steps.length === 0 ? solution.warning : null);
    if (solution.steps.length > 0 || solution.resultText) {
      addSolutionRecord({
        id: uid("sol"),
        problemType,
        problem: value,
        problemLatex: toLatex(value),
        steps: solution.steps,
        resultLatex: solution.resultLatex,
        resultText: solution.resultText,
        verified: solution.verified,
        createdAt: Date.now(),
      });
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="flex flex-wrap items-center gap-1.5">
          {PROBLEM_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => {
                setProblemType(type.id);
                setResult(null);
                setError(null);
              }}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                problemType === type.id
                  ? "bg-primary-600 text-white"
                  : "border border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-700"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") solve();
            }}
            placeholder={activeType.placeholder}
            className="min-w-[240px] flex-1 rounded-md border border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
          <button
            type="button"
            onClick={solve}
            className="rounded-md bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            分步求解
          </button>
        </div>
        {error ? <p className="mt-2 text-sm text-amber-600">{error}</p> : null}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {activeType.examples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                setInput(example);
                setError(null);
              }}
              className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-600 hover:border-primary-300 hover:text-primary-700"
            >
              {example}
            </button>
          ))}
        </div>

        {result ? (
          <div className="mt-4 space-y-3">
            {result.warning ? (
              <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">{result.warning}</p>
            ) : null}
            {result.steps.length > 0 ? (
              <SolutionStepsView steps={result.steps} problemLatex={toLatex(input)} />
            ) : (
              <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                {result.resultText}
              </p>
            )}
            {result.resultLatex ? (
              <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3">
                <p className="mb-1 text-xs font-medium text-green-700">最终结果</p>
                <div className="text-lg font-semibold text-green-800">
                  <LatexView latex={result.resultLatex} displayMode />
                </div>
                {!result.verified ? (
                  <p className="mt-1 text-xs text-amber-700">未能验证通过，请检查输入是否正确。</p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700">解题记录</p>
          <button
            type="button"
            onClick={clearSolutionHistory}
            className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-slate-50"
          >
            清空记录
          </button>
        </div>
        {solutionHistory.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 p-4 text-center text-xs text-slate-400">
            暂无解题记录
          </p>
        ) : (
          <ul className="space-y-2">
            {solutionHistory.slice().reverse().slice(0, 20).map((record) => (
              <li key={record.id} className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
                <div className="font-mono text-sm text-slate-700">{record.problem}</div>
                <div className="mt-0.5 text-xs text-primary-700">{record.resultText}</div>
                <div className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
                  <span>{record.problemType}</span>
                  {record.verified ? (
                    <span className="rounded bg-green-100 px-1 text-green-700">已验证</span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
