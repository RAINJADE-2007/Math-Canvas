"use client";

import type { ChapterId } from "@/math-engine/linear-algebra/types";
import { CHAPTER_LIST } from "@/math-engine/linear-algebra/course-data";

interface ProgressTrackerProps {
  progress: Record<ChapterId, number>;
  completedPoints: Set<string>;
  completedExercises: Set<string>;
}

export function ProgressTracker({
  progress,
  completedPoints,
  completedExercises,
}: ProgressTrackerProps) {
  const totalChapters = CHAPTER_LIST.length;
  const avgProgress =
    totalChapters > 0
      ? Math.round(
          CHAPTER_LIST.reduce((sum, ch) => sum + (progress[ch.id] ?? 0), 0) /
            totalChapters
        )
      : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-700">学习进度</h3>
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>总进度</span>
          <span className="font-medium text-primary-600">{avgProgress}%</span>
        </div>
        <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-primary-500 transition-all duration-500"
            style={{ width: `${avgProgress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500">
        <div className="rounded-lg bg-slate-50 p-2 text-center">
          <div className="font-bold text-slate-700">{completedPoints.size}</div>
          <div>知识点完成</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-2 text-center">
          <div className="font-bold text-slate-700">{completedExercises.size}</div>
          <div>练习题完成</div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {CHAPTER_LIST.map((ch) => {
          const prog = progress[ch.id] ?? 0;
          return (
            <div key={ch.id}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  {ch.number}. {ch.title}
                </span>
                <span
                  className={`font-medium ${
                    prog >= 100 ? "text-green-600" : prog > 0 ? "text-primary-600" : "text-slate-400"
                  }`}
                >
                  {prog}%
                </span>
              </div>
              <div className="mt-0.5 h-1.5 rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all ${
                    prog >= 100 ? "bg-green-500" : "bg-primary-400"
                  }`}
                  style={{ width: `${prog}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
