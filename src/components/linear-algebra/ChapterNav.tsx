"use client";

import type { ChapterId, Chapter, LearningProgress } from "@/math-engine/linear-algebra";
import { COURSE_CHAPTERS } from "@/math-engine/linear-algebra";
import { useMemo } from "react";

interface ChapterNavProps {
  currentChapter: ChapterId;
  onSelectChapter: (id: ChapterId) => void;
  progress: LearningProgress;
}

export function ChapterNav({ currentChapter, onSelectChapter, progress }: ChapterNavProps) {
  const chapters: Chapter[] = useMemo(() => COURSE_CHAPTERS, []);

  return (
    <nav className="space-y-1" aria-label="章节目录">
      {chapters.map((ch: Chapter) => {
        const completed: number = progress.chapterProgress[ch.id] ?? 0;
        const isActive = currentChapter === ch.id;
        return (
          <button
            key={ch.id}
            onClick={() => onSelectChapter(ch.id)}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              isActive
                ? "bg-primary-50 text-primary-700 font-medium"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                completed >= 1
                  ? "bg-green-100 text-green-700"
                  : completed > 0
                  ? "bg-primary-100 text-primary-600"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {ch.number}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate">{ch.title}</div>
              <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-primary-400 transition-all"
                  style={{ width: `${Math.round(completed * 100)}%` }}
                />
              </div>
            </div>
          </button>
        );
      })}
    </nav>
  );
}
