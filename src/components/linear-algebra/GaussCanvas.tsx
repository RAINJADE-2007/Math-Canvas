"use client";

import { useState, useCallback } from "react";
import { solveLinearSystem } from "@/math-engine/linear-algebra/gauss";
import { LatexView } from "@/components/common/LatexView";

interface GaussCanvasProps {
  initialEquations?: { coefficients: number[][]; constants: number[] };
}

export function GaussCanvas({ initialEquations }: GaussCanvasProps) {
  const defaultCoeffs = [[2, 1], [1, -3]];
  const defaultConsts = [5, -1];
  const [coeffs, setCoeffs] = useState(initialEquations?.coefficients ?? defaultCoeffs);
  const [consts, setConsts] = useState(initialEquations?.constants ?? defaultConsts);
  const [result, setResult] = useState<ReturnType<typeof solveLinearSystem> | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const solve = useCallback(() => {
    const res = solveLinearSystem(coeffs.map((r) => [...r]), [...consts]);
    setResult(res);
    setStepIndex(0);
    setShowAll(false);
  }, [coeffs, consts]);

  const nextStep = () => {
    if (!result) return;
    setStepIndex((i) => Math.min(i + 1, result.steps.length - 1));
  };
  const prevStep = () => {
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  const addRow = () => {
    const n = coeffs[0]?.length ?? 2;
    setCoeffs([...coeffs, new Array(n).fill(0)]);
    setConsts([...consts, 0]);
  };
  const addCol = () => {
    setCoeffs(coeffs.map((r) => [...r, 0]));
  };

  const updateCell = (r: number, c: number, val: number) => {
    const updated = coeffs.map((row) => [...row]);
    updated[r][c] = val;
    setCoeffs(updated);
  };
  const updateConst = (r: number, val: number) => {
    const updated = [...consts];
    updated[r] = val;
    setConsts(updated);
  };

  const currentMatrix = result && !showAll ? result.steps[stepIndex].matrix : null;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h4 className="mb-3 text-sm font-medium text-slate-700">输入方程组</h4>

        <div className="space-y-2">
          {coeffs.map((row, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs">
              <span className="w-4 text-slate-400">R{i + 1}</span>
              {row.map((val, j) => (
                <span key={j} className="flex items-center">
                  <input
                    type="number"
                    step={0.5}
                    value={val}
                    onChange={(e) => updateCell(i, j, parseFloat(e.target.value) || 0)}
                    className="w-12 rounded border border-slate-300 px-1 py-0.5 text-center"
                    aria-label={`a${i + 1}${j + 1}`}
                  />
                  <span className="ml-0.5 text-slate-400">x<sub>{j + 1}</sub></span>
                  {j < row.length - 1 && <span className="mx-0.5 text-slate-300">+</span>}
                </span>
              ))}
              <span className="mx-1 text-slate-400">=</span>
              <input
                type="number"
                step={0.5}
                value={consts[i]}
                onChange={(e) => updateConst(i, parseFloat(e.target.value) || 0)}
                className="w-14 rounded border border-slate-300 px-1 py-0.5 text-center"
                aria-label={`b${i + 1}`}
              />
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={solve}
            className="rounded bg-primary-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-primary-700"
          >
            求解
          </button>
          <button
            onClick={addCol}
            className="rounded border border-slate-300 px-2.5 py-1.5 text-xs hover:bg-slate-50"
          >
            +变量
          </button>
          <button
            onClick={addRow}
            className="rounded border border-slate-300 px-2.5 py-1.5 text-xs hover:bg-slate-50"
          >
            +方程
          </button>
          <button
            onClick={() => {
              setCoeffs([[2, 1], [1, -3]]);
              setConsts([5, -1]);
              setResult(null);
            }}
            className="rounded border border-slate-300 px-2.5 py-1.5 text-xs hover:bg-slate-50"
          >
            重置
          </button>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {[
            { label: "唯一解", c: [[2, 1], [1, -3]], b: [5, -1] },
            { label: "无解", c: [[1, 2], [2, 4]], b: [5, 8] },
            { label: "无穷多解", c: [[1, 2], [2, 4]], b: [3, 6] },
            { label: "3元", c: [[1, 1, 1], [0, 1, 1], [0, 0, 1]], b: [6, 5, 3] },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                setCoeffs(preset.c.map((r) => [...r]));
                setConsts([...preset.b]);
                setResult(null);
              }}
              className="rounded bg-slate-100 px-2 py-1 text-xs hover:bg-slate-200"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-slate-700">
              求解过程（共 {result.steps.length} 步）
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAll(!showAll)}
                className="rounded border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-50"
              >
                {showAll ? "分步播放" : "全部展开"}
              </button>
            </div>
          </div>

          {!showAll && currentMatrix ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={prevStep}
                  disabled={stepIndex === 0}
                  className="rounded border border-slate-300 px-2 py-0.5 text-xs disabled:opacity-30 hover:bg-slate-50"
                >
                  ←
                </button>
                <span className="text-xs text-slate-500">
                  第 {stepIndex + 1} / {result.steps.length} 步
                </span>
                <button
                  onClick={nextStep}
                  disabled={stepIndex === result.steps.length - 1}
                  className="rounded border border-slate-300 px-2 py-0.5 text-xs disabled:opacity-30 hover:bg-slate-50"
                >
                  →
                </button>
              </div>

              <div className="rounded-md bg-slate-50 p-3">
                <p className="mb-2 text-xs text-slate-600">{result.steps[stepIndex].description}</p>
                {result.steps[stepIndex].rowOps && (
                  <p className="mb-2 font-mono text-xs text-primary-700">
                    {result.steps[stepIndex].rowOps}
                  </p>
                )}
                <table className="border-collapse text-xs">
                  <tbody>
                    {currentMatrix.map((row, ri) => (
                      <tr key={ri} className={ri === result.steps[stepIndex].highlightRow ? "bg-primary-50" : ""}>
                        {row.map((val, ci) => (
                          <td
                            key={ci}
                            className={`px-2 py-0.5 font-mono ${
                              ci === result.steps[stepIndex].highlightCol ? "text-primary-600 font-bold" : "text-slate-700"
                            }`}
                          >
                            {val.toFixed(2)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {result.steps.map((step, i) => (
                <div key={i} className="rounded-md border border-slate-100 p-2 text-xs">
                  <p className="text-slate-600">
                    <span className="font-medium text-slate-700">第{i + 1}步：</span>
                    {step.description}
                  </p>
                  {step.rowOps && (
                    <p className="font-mono text-primary-700">{step.rowOps}</p>
                  )}
                  <table className="mt-1 border-collapse">
                    <tbody>
                      {step.matrix.map((row, ri) => (
                        <tr key={ri}>
                          {row.map((val, ci) => (
                            <td key={ci} className="px-1.5 font-mono text-slate-600">
                              {val.toFixed(2)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 rounded-md bg-green-50 p-3">
            <span className="text-xs font-medium text-green-700">
              结果：{result.solutionType === "unique" ? "唯一解" : result.solutionType === "none" ? "无解" : "无穷多解"}
            </span>
            <span className="ml-3 text-xs text-slate-500">秩={result.rank}</span>
            <div className="mt-1">
              <LatexView latex={result.solutionLatex} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
