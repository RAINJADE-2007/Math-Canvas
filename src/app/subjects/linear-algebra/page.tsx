"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import type { ChapterId, Chapter, LearningProgress } from "@/math-engine/linear-algebra";
import { COURSE_CHAPTERS } from "@/math-engine/linear-algebra";
import { ChapterNav } from "@/components/linear-algebra/ChapterNav";
import { KnowledgeSection } from "@/components/linear-algebra/KnowledgeSection";
import { ExercisePanel } from "@/components/linear-algebra/ExercisePanel";
import { VectorCanvas } from "@/components/linear-algebra/VectorCanvas";
import { MatrixCanvas } from "@/components/linear-algebra/MatrixCanvas";
import { GaussCanvas } from "@/components/linear-algebra/GaussCanvas";
import { DeterminantVis } from "@/components/linear-algebra/DeterminantVis";
import { EigenVis } from "@/components/linear-algebra/EigenVis";
import { VectorSpaceVis } from "@/components/linear-algebra/VectorSpaceVis";
import { LeastSquaresVis } from "@/components/linear-algebra/LeastSquaresVis";

type VisComponent = React.FC<{ knowledgePointId?: string }>;

const VISUAL_MAP: Record<string, VisComponent> = {
  vectors: VectorsVis,
  matrices: MatrixVis,
  "linear-systems": GaussVis,
  "linear-transforms": MatrixVis,
  determinants: DetVis,
  eigenvalues: EigenVis_,
  "vector-spaces": SpaceVis,
  applications: LSVis,
};

function VectorsVis() {
  return <VectorCanvas height={380} showSum showDot />;
}
function MatrixVis() {
  return <MatrixCanvas height={380} />;
}
function GaussVis() {
  return <GaussCanvas />;
}
function DetVis() {
  return <DeterminantVis height={380} />;
}
function EigenVis_() {
  return <EigenVis height={380} />;
}
function SpaceVis() {
  return <VectorSpaceVis height={420} />;
}
function LSVis() {
  return <LeastSquaresVis height={420} />;
}
function NoVis() {
  return (
    <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-400">
      综合应用章节无独立可视化，请使用前面的交互工具
    </div>
  );
}

const LS_KEY = "math-canvas-la-progress";

function loadProgress(): LearningProgress {
  if (typeof window === "undefined") return makeEmptyProgress();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as LearningProgress;
  } catch { /* ignore */ }
  return makeEmptyProgress();
}

function saveProgress(p: LearningProgress) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(p));
  } catch { /* ignore */ }
}

function makeEmptyProgress(): LearningProgress {
  return {
    completedPoints: [],
    completedExercises: [],
    chapterProgress: COURSE_CHAPTERS.reduce<Record<ChapterId, number>>(
      (acc, ch) => ({ ...acc, [ch.id]: 0 }),
      {} as Record<ChapterId, number>
    ),
    selfCheckResults: {},
  };
}
export default function LinearAlgebraPage() {
  const [currentChapterId, setCurrentChapterId] = useState<ChapterId>("vectors");
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [teacherMode, setTeacherMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showVisual, setShowVisual] = useState(true);

  const [progress, setProgress] = useState<LearningProgress>(() => {
    const saved = loadProgress();
    if (saved.chapterProgress && Object.keys(saved.chapterProgress).length > 0) {
      return saved;
    }
    return {
      ...saved,
      chapterProgress: COURSE_CHAPTERS.reduce<Record<ChapterId, number>>(
        (acc, ch) => ({ ...acc, [ch.id]: 0 }),
        {} as Record<ChapterId, number>
      ),
    };
  });

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const currentChapter = useMemo(
    () => COURSE_CHAPTERS.find((c: Chapter) => c.id === currentChapterId),
    [currentChapterId]
  );

  const currentPoint = useMemo(
    () => currentChapter?.knowledgePoints[currentPointIndex],
    [currentChapter, currentPointIndex]
  );

  const selectChapter = useCallback((id: ChapterId) => {
    setCurrentChapterId(id);
    setCurrentPointIndex(0);
    setSidebarOpen(false);
  }, []);

  const navigatePoint = useCallback(
    (direction: "prev" | "next") => {
      if (!currentChapter) return;
      const max = currentChapter.knowledgePoints.length;
      if (direction === "prev" && currentPointIndex > 0) {
        setCurrentPointIndex(currentPointIndex - 1);
      } else if (direction === "next") {
        if (currentPointIndex < max - 1) {
          setCurrentPointIndex(currentPointIndex + 1);
        } else {
          const chIdx = COURSE_CHAPTERS.findIndex((c: Chapter) => c.id === currentChapterId);
          if (chIdx < COURSE_CHAPTERS.length - 1) {
            setCurrentChapterId(COURSE_CHAPTERS[chIdx + 1].id);
            setCurrentPointIndex(0);
          }
        }
      }
    },
    [currentChapter, currentPointIndex, currentChapterId]
  );

  const markComplete = useCallback(() => {
    if (!currentPoint || !currentChapter) return;
    const ptId = currentPoint.id;
    const completed = progress.completedPoints.includes(ptId);
    const newCompleted = completed
      ? progress.completedPoints.filter((id: string) => id !== ptId)
      : [...progress.completedPoints, ptId];
    const total = currentChapter.knowledgePoints.length;
    const done = newCompleted.filter((id: string) =>
      currentChapter.knowledgePoints.some((p: { id: string }) => p.id === id)
    ).length;
    const newProgress: LearningProgress = {
      ...progress,
      completedPoints: newCompleted,
      chapterProgress: {
        ...progress.chapterProgress,
        [currentChapterId]: total > 0 ? done / total : 0,
      },
    };
    setProgress(newProgress);
  }, [currentPoint, currentChapter, currentChapterId, progress]);

  const VisComponent = VISUAL_MAP[currentChapterId] ?? NoVis;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-108px)] max-w-[1600px] flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
        <div className="flex items-center gap-3">
          <Link href="/subjects" className="text-xs text-primary-600 hover:underline">
            ← 学科模块
          </Link>
          <span className="h-4 w-px bg-slate-200" />
          <span className="text-sm font-semibold text-slate-800">线性代数</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVisual(!showVisual)}
            className={`rounded border px-2.5 py-1 text-xs ${
              showVisual ? "border-primary-300 bg-primary-50 text-primary-700" : "border-slate-300 text-slate-600"
            }`}
          >
            {showVisual ? "隐藏可视化" : "显示可视化"}
          </button>
          <button
            onClick={() => setTeacherMode(!teacherMode)}
            className={`rounded border px-2.5 py-1 text-xs ${
              teacherMode ? "border-violet-300 bg-violet-50 text-violet-700" : "border-slate-300 text-slate-600"
            }`}
          >
            {teacherMode ? "演示模式" : "学生模式"}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded border border-slate-300 px-2.5 py-1 text-xs text-slate-600 lg:hidden"
          >
            目录
          </button>
        </div>
      </div>

      <div className="flex flex-1">
        <aside
          className={`${
            sidebarOpen ? "block" : "hidden"
          } fixed inset-0 top-[108px] z-30 w-64 border-r border-slate-200 bg-white p-3 lg:static lg:block lg:w-56 lg:shrink-0`}
        >
          <ChapterNav
            currentChapter={currentChapterId}
            onSelectChapter={selectChapter}
            progress={progress}
          />

          {currentChapter && (
            <div className="mt-4 border-t border-slate-100 pt-3">
              <h5 className="mb-2 text-xs font-medium text-slate-500">本章知识点</h5>
              {currentChapter.knowledgePoints.map((kp: { id: string; title: string }, idx: number) => {
                const done = progress.completedPoints.includes(kp.id);
                const isActive = idx === currentPointIndex;
                return (
                  <button
                    key={kp.id}
                    onClick={() => setCurrentPointIndex(idx)}
                    className={`mb-1 flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-xs transition-colors ${
                      isActive
                        ? "bg-primary-50 text-primary-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        done ? "bg-green-500" : "bg-slate-300"
                      }`}
                    />
                    <span className="truncate">{kp.title}</span>
                  </button>
                );
              })}
            </div>
          )}

          {sidebarOpen && (
            <div
              className="fixed inset-0 top-[108px] -z-10 bg-black/20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
          <div className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
            {currentChapter && (
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                    第{currentChapter.number}章
                  </span>
                  <h1 className="text-2xl font-bold text-slate-900">{currentChapter.title}</h1>
                </div>
                <p className="mt-2 text-sm text-slate-500">{currentChapter.description}</p>

                {currentChapter.prerequisites.length > 0 && (
                  <div className="mt-2 text-xs text-slate-400">
                    前置知识：{currentChapter.prerequisites.join("、")}
                  </div>
                )}

                {teacherMode && (
                  <div className="mt-3 rounded-lg border border-violet-200 bg-violet-50 p-3 text-xs">
                    <div className="font-medium text-violet-700">教学要点：</div>
                    <ul className="mt-1 list-disc space-y-0.5 pl-4 text-violet-600">
                      {currentChapter.teachingPoints.map((tp: string, i: number) => (
                        <li key={i}>{tp}</li>
                      ))}
                    </ul>
                    <div className="mt-2 font-medium text-violet-700">课堂讨论：</div>
                    <ul className="mt-1 list-disc space-y-0.5 pl-4 text-violet-600">
                      {currentChapter.discussionQuestions.map((q: string, i: number) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {currentPoint && (
              <>
                <KnowledgeSection point={currentPoint} teacherMode={teacherMode} />

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex gap-2">
                    {currentChapter && currentPointIndex > 0 && (
                      <button
                        onClick={() => navigatePoint("prev")}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
                      >
                        ← 上一节
                      </button>
                    )}
                    <button
                      onClick={markComplete}
                      className={`rounded-lg border px-4 py-2 text-sm ${
                        progress.completedPoints.includes(currentPoint.id)
                          ? "border-green-400 bg-green-50 text-green-700"
                          : "border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {progress.completedPoints.includes(currentPoint.id) ? "✓ 已完成" : "标记完成"}
                    </button>
                  </div>
                  {currentChapter &&
                    currentPointIndex < currentChapter.knowledgePoints.length - 1 ? (
                      <button
                        onClick={() => navigatePoint("next")}
                        className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                      >
                        下一节 →
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">本章已完成</span>
                    )}
                </div>
              </>
            )}
          </div>

          <div className="border-t border-slate-200 lg:w-[420px] lg:shrink-0 lg:border-l lg:border-t-0">
            {showVisual && (
              <div className="border-b border-slate-200 p-4">
                <h4 className="mb-3 text-sm font-medium text-slate-700">交互可视化</h4>
                <VisComponent knowledgePointId={currentPoint?.id} />
              </div>
            )}

            <div className="p-4">
              <ExercisePanel chapterId={currentChapterId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
