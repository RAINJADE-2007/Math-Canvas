"use client";

import { useState, useCallback } from "react";
import type { Exercise } from "@/math-engine/linear-algebra/types";
import {
  generateVectorExercise,
  generateMatrixExercise,
  generateLinearSystemExercise,
  generateDeterminantExercise,
  generateEigenExercise,
} from "@/math-engine/linear-algebra";
import { LatexView } from "@/components/common/LatexView";

type GeneratorMap = Record<string, (diff: "basic" | "comprehension" | "application") => Exercise>;

const generators: GeneratorMap = {
  vectors: generateVectorExercise,
  matrices: generateMatrixExercise,
  "linear-systems": generateLinearSystemExercise,
  determinants: generateDeterminantExercise,
  eigenvalues: generateEigenExercise,
};

interface ExercisePanelProps {
  chapterId: string;
}

export function ExercisePanel({ chapterId }: ExercisePanelProps) {
  const [difficulty, setDifficulty] = useState<"basic" | "comprehension" | "application">("basic");
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);

  const generateExercise = useCallback(() => {
    const gen = generators[chapterId];
    if (!gen) return;
    const ex = gen(difficulty);
    setExercise(ex);
    setSelectedAnswer("");
    setFeedback(null);
    setShowSolution(false);
    setHintLevel(0);
  }, [chapterId, difficulty]);

  const checkAnswer = () => {
    if (!exercise) return;
    if (exercise.options && exercise.options.length > 0) {
      if (selectedAnswer === exercise.answer) {
        setFeedback("correct");
      } else {
        const analysis = exercise.errorAnalysis[selectedAnswer] || "答案不正确，请再试一次。";
        setFeedback(analysis);
      }
    } else {
      const normalized = selectedAnswer.trim().toLowerCase();
      const correct = exercise.answer.trim().toLowerCase();
      if (normalized === correct || normalized.includes(correct) || correct.includes(normalized)) {
        setFeedback("correct");
      } else {
        setFeedback("答案不正确，请检查后再试。");
      }
    }
  };

  const showHint = () => {
    if (!exercise || hintLevel >= exercise.hints.length) return;
    setHintLevel((h) => h + 1);
  };

  const diffLabels: Record<string, string> = {
    basic: "基础",
    comprehension: "理解",
    application: "应用",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h4 className="text-sm font-semibold text-slate-800">练习题</h4>
        <div className="flex rounded border border-slate-300 text-xs">
          {(["basic", "comprehension", "application"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-3 py-1 ${
                difficulty === d
                  ? "bg-primary-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {diffLabels[d]}
            </button>
          ))}
        </div>
        <button
          onClick={generateExercise}
          className="rounded bg-primary-600 px-3 py-1 text-xs font-medium text-white hover:bg-primary-700"
        >
          生成题目
        </button>
      </div>

      {!exercise ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-xs text-slate-400">
          点击「生成题目」开始练习
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-3 flex gap-2">
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium ${
                difficulty === "basic"
                  ? "bg-green-100 text-green-700"
                  : difficulty === "comprehension"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-violet-100 text-violet-700"
              }`}
            >
              {diffLabels[difficulty]}
            </span>
            {exercise.targetConcepts.map((c) => (
              <span key={c} className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                {c}
              </span>
            ))}
          </div>

          <p className="mb-3 text-sm font-medium text-slate-800 whitespace-pre-line">{exercise.question}</p>
          <div className="mb-4">
            <LatexView latex={exercise.questionLatex} displayMode />
          </div>

          {exercise.options && exercise.options.length > 0 ? (
            <div className="mb-4 space-y-2">
              {exercise.options.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex cursor-pointer items-center gap-2 rounded border p-2 text-xs ${
                    selectedAnswer === opt.id ? "border-primary-400 bg-primary-50" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={opt.id}
                    checked={selectedAnswer === opt.id}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    className="accent-primary-600"
                  />
                  <span className="text-slate-600">{opt.text}</span>
                  <LatexView latex={opt.latex} />
                </label>
              ))}
            </div>
          ) : (
            <div className="mb-4">
              <input
                type="text"
                value={selectedAnswer}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                placeholder="输入你的答案..."
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={checkAnswer}
              className="rounded bg-primary-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-primary-700"
            >
              提交
            </button>
            {exercise.hints.length > 0 && (
              <button
                onClick={showHint}
                disabled={hintLevel >= exercise.hints.length}
                className="rounded border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-40"
              >
                提示 {hintLevel > 0 ? `(${hintLevel}/${exercise.hints.length})` : ""}
              </button>
            )}
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="rounded border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50"
            >
              {showSolution ? "隐藏解析" : "显示解析"}
            </button>
            <button
              onClick={generateExercise}
              className="rounded border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50"
            >
              换一题
            </button>
          </div>

          {hintLevel > 0 && (
            <div className="mt-3 space-y-1">
              {exercise.hints.slice(0, hintLevel).map((h, i) => (
                <div key={i} className="rounded bg-amber-50 p-2 text-xs text-amber-800">
                  提示 {i + 1}：{h}
                </div>
              ))}
            </div>
          )}

          {feedback && (
            <div
              className={`mt-3 rounded p-3 text-xs ${
                feedback === "correct"
                  ? "bg-green-50 text-green-800 font-medium"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {feedback === "correct" ? "正确！答得很好。" : feedback}
            </div>
          )}

          {showSolution && (
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h5 className="mb-2 text-xs font-medium text-slate-700">解题步骤</h5>
              <div className="space-y-2">
                {exercise.solution.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[10px] font-semibold text-primary-700">
                      {i + 1}
                    </span>
                    <div>
                      <span className="text-slate-600">{step.description}</span>
                      <div className="mt-0.5">
                        <LatexView latex={step.latex} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 font-medium text-green-700">
                答案：<LatexView latex={exercise.answerLatex} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
