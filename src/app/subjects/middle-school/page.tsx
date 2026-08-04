"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import type { MiddleStage, MiddleChapter } from "@/math-engine/middle-school/course/types";
import { JUNIOR_STAGE } from "@/math-engine/middle-school/course/junior-course-data";
import { LatexView } from "@/components/common/LatexView";
import { VectorCanvas } from "@/components/linear-algebra/VectorCanvas";
import { GaussCanvas } from "@/components/linear-algebra/GaussCanvas";
import { LeastSquaresVis } from "@/components/linear-algebra/LeastSquaresVis";

const LS_KEY = "math-canvas-middle-school-progress-v2";

interface StageProgress {
  completedPoints: string[];
  completedExercises: string[];
  chapterProgress: Record<string, number>;
  lastChapter: string;
  lastPointIndex: number;
}
interface FullProgress {
  junior: StageProgress;
  senior: StageProgress;
  activeStage: MiddleStage;
}

function initStageProgress(): StageProgress {
  return { completedPoints: [], completedExercises: [], chapterProgress: {}, lastChapter: "", lastPointIndex: 0 };
}
function initProgress(): FullProgress {
  return { junior: initStageProgress(), senior: initStageProgress(), activeStage: "junior" };
}
function loadProgress(): FullProgress {
  if (typeof window === "undefined") return initProgress();
  try { const r = localStorage.getItem(LS_KEY); if (r) return JSON.parse(r); } catch {}
  return initProgress();
}
function saveProgress(p: FullProgress) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(LS_KEY, JSON.stringify(p)); } catch {}
}

type StageData = { chapters: MiddleChapter[]; name: string; description: string; goals: string[] };

export default function MiddleSchoolPage() {
  const [progress, setProgress] = useState<FullProgress>(() => loadProgress());
  const [stage, setStage] = useState<MiddleStage>(progress.activeStage);
  const [teacherMode, setTeacherMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showVisual, setShowVisual] = useState(true);

  const sp = progress.junior;
  const chapters = useMemo(() => (stage === "junior" ? JUNIOR_STAGE.chapters : []), [stage]);
  const [currentChId, setCurrentChId] = useState(sp.lastChapter || chapters[0]?.id || "");
  const [pointIdx, setPointIdx] = useState(sp.lastPointIndex);

  const chapter = useMemo(() => chapters.find((c) => c.id === currentChId), [chapters, currentChId]);
  const point = useMemo(() => chapter?.knowledgePoints[pointIdx], [chapter, pointIdx]);

  useEffect(() => { saveProgress(progress); }, [progress]);

  useEffect(() => {
    const id = chapters[0]?.id; if (id && !currentChId) setCurrentChId(id);
  }, [chapters, currentChId]);

  const switchStage = (s: MiddleStage) => {
    if (s === "senior") return; // handled by separate page
    setStage(s);
    const st = s === "junior" ? progress.junior : progress.senior;
    const chs = s === "junior" ? JUNIOR_STAGE.chapters : [];
    setCurrentChId(st.lastChapter || chs[0]?.id || "");
    setPointIdx(st.lastPointIndex);
    setProgress({ ...progress, activeStage: s });
  };

  const selectChapter = useCallback((id: string) => {
    setCurrentChId(id); setPointIdx(0); setSidebarOpen(false);
    const updated = stage === "junior" ? { ...progress.junior, lastChapter: id, lastPointIndex: 0 } : { ...progress.senior, lastChapter: id, lastPointIndex: 0 };
    setProgress({ ...progress, [stage]: updated });
  }, [stage, progress]);

  const markComplete = useCallback(() => {
    if (!point || !chapter) return;
    const sp2 = stage === "junior" ? { ...progress.junior } : { ...progress.senior };
    const done = sp2.completedPoints.includes(point.id);
    const newDone = done ? sp2.completedPoints.filter((id) => id !== point.id) : [...sp2.completedPoints, point.id];
    const total = chapter.knowledgePoints.length;
    const cnt = newDone.filter((id) => chapter.knowledgePoints.some((p) => p.id === id)).length;
    sp2.completedPoints = newDone;
    sp2.chapterProgress = { ...sp2.chapterProgress, [currentChId]: total > 0 ? cnt / total * 100 : 0 };
    sp2.lastChapter = currentChId;
    sp2.lastPointIndex = pointIdx;
    setProgress({ ...progress, [stage]: sp2 });
  }, [point, chapter, currentChId, pointIdx, stage, progress]);

  const renderVisual = () => {
    switch (stage + "-" + currentChId) {
      case "junior-jr-numbers": return getNumberLine();
      case "junior-jr-equations": return getEquationBalance();
      case "junior-jr-inequalities": return getNumberLine();
      case "junior-jr-functions": return getFunctionGraph();
      case "junior-jr-geometry": case "junior-jr-triangle-circle": return <VectorCanvas height={380} showSum showDot />;
      case "junior-jr-statistics": return <LeastSquaresVis height={420} />;
      case "junior-jr-applications": return <GaussCanvas />;
      default: return <VectorCanvas height={380} showSum showDot />;
    }
  };

  const Section = ({ title, children, color = "slate" }: { title: string; children: React.ReactNode; color?: string }) => {
    const colors: Record<string, string> = { slate: "border-slate-200 bg-slate-50 text-slate-700", blue: "border-blue-200 bg-blue-50 text-blue-700", green: "border-green-200 bg-green-50 text-green-700", red: "border-red-200 bg-red-50 text-red-700", violet: "border-violet-200 bg-violet-50 text-violet-700", amber: "border-amber-200 bg-amber-50 text-amber-700" };
    return <div className={`rounded-lg border ${colors[color] ?? colors.slate}`}><div className="px-4 py-2.5 text-sm font-medium">{title}</div><div className="px-4 pb-3 text-xs leading-relaxed text-slate-600">{children}</div></div>;
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-108px)] max-w-[1600px] flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
        <div className="flex items-center gap-3">
          <Link href="/subjects" className="text-xs text-primary-600 hover:underline">← 学科模块</Link>
          <span className="h-4 w-px bg-slate-200" />
          <span className="rounded border border-primary-300 bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700">初中数学</span>
          <Link href="/subjects/middle-school/senior" className="rounded border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">高中数学</Link>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowVisual(!showVisual)} className={`rounded border px-2.5 py-1 text-xs ${showVisual ? "border-primary-300 bg-primary-50 text-primary-700" : "border-slate-300 text-slate-600"}`}>{showVisual ? "隐藏可视化" : "显示可视化"}</button>
          <button onClick={() => setTeacherMode(!teacherMode)} className={`rounded border px-2.5 py-1 text-xs ${teacherMode ? "border-violet-300 bg-violet-50 text-violet-700" : "border-slate-300 text-slate-600"}`}>{teacherMode ? "演示模式" : "学生模式"}</button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded border border-slate-300 px-2.5 py-1 text-xs text-slate-600 lg:hidden">目录</button>
        </div>
      </div>

      <div className="flex flex-1">
        <aside className={`${sidebarOpen ? "block" : "hidden"} fixed inset-0 top-[108px] z-30 w-64 border-r border-slate-200 bg-white p-3 lg:static lg:block lg:w-56 lg:shrink-0`}>
          <nav className="space-y-1">
            {chapters.map((ch) => {
              const pct = sp.chapterProgress[ch.id] ?? 0;
              const isActive = currentChId === ch.id;
              return (
                <button key={ch.id} onClick={() => selectChapter(ch.id)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${isActive ? "bg-primary-50 text-primary-700 font-medium" : "text-slate-600 hover:bg-slate-50"}`}>
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${pct >= 100 ? "bg-green-100 text-green-700" : pct > 0 ? "bg-primary-100 text-primary-600" : "bg-slate-100 text-slate-500"}`}>
                    {ch.number}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{ch.title}</div>
                    <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-primary-400" style={{ width: `${Math.round(pct)}%` }} /></div>
                  </div>
                </button>
              );
            })}
          </nav>
          {chapter && (
            <div className="mt-4 border-t border-slate-100 pt-3">
              <h5 className="mb-2 text-xs font-medium text-slate-500">本章知识点</h5>
              {chapter.knowledgePoints.map((kp: { id: string; title: string }, idx: number) => {
                const done = sp.completedPoints.includes(kp.id);
                return (
                  <button key={kp.id} onClick={() => setPointIdx(idx)}
                    className={`mb-1 flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-xs ${idx === pointIdx ? "bg-primary-50 text-primary-700" : "text-slate-600 hover:bg-slate-50"}`}>
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${done ? "bg-green-500" : "bg-slate-300"}`} />
                    <span className="truncate">{kp.title}</span>
                  </button>
                );
              })}
            </div>
          )}
          {sidebarOpen && <div className="fixed inset-0 top-[108px] -z-10 bg-black/20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
          <div className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
            {chapter ? (
              <>
                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">第{chapter.number}章</span>
                    <h1 className="text-2xl font-bold text-slate-900">{chapter.title}</h1>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{chapter.description}</p>
                  {chapter.prerequisites.length > 0 && <div className="mt-2 text-xs text-slate-400">前置知识：{chapter.prerequisites.join("、")}</div>}
                  {teacherMode && (
                    <div className="mt-3 rounded-lg border border-violet-200 bg-violet-50 p-3 text-xs">
                      <div className="font-medium text-violet-700">教学要点：</div>
                      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-violet-600">{chapter.teachingPoints.map((t, i) => <li key={i}>{t}</li>)}</ul>
                      <div className="mt-2 font-medium text-red-700">常见误区：</div>
                      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-red-600">{chapter.commonMisconceptions.map((m, i) => <li key={i}>{m}</li>)}</ul>
                      <div className="mt-2 font-medium text-violet-700">讨论问题：</div>
                      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-violet-600">{chapter.discussionQuestions.map((q, i) => <li key={i}>{q}</li>)}</ul>
                    </div>
                  )}
                </div>
                {point && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-900">{point.title}</h3>
                    <Section title="🎯 学习目标" color="blue"><ul className="list-disc space-y-1 pl-4">{point.objectives.map((o, i) => <li key={i}>{o}</li>)}</ul></Section>
                    <Section title="💡 为什么需要这个概念？">{point.motivation}</Section>
                    <Section title="🔍 直觉理解" color="blue">{point.intuition}</Section>
                    <Section title="📖 严谨定义" color="violet">{point.definition}</Section>
                    <Section title="📐 公式与说明" color="amber">
                      <div className="overflow-x-auto"><LatexView latex={point.formulaLatex} displayMode /></div>
                      <p className="mt-2">{point.formulaExplanation}</p>
                      {point.conditions && <p className="mt-1 text-slate-500">⚠ 适用条件：{point.conditions}</p>}
                    </Section>
                    <Section title="✏️ 分步例题" color="green">
                      <p className="mb-2 font-medium text-slate-700">题目：{point.example.problem}</p>
                      <div className="space-y-2">{point.example.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-3 rounded border border-slate-100 p-2">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-700">{i + 1}</span>
                          <div><span className="text-slate-600">{step.description}</span><div className="mt-1"><LatexView latex={step.latex} /></div></div>
                        </div>
                      ))}</div>
                      <div className="mt-2 font-medium text-green-700">答案：<LatexView latex={point.example.answerLatex} /></div>
                    </Section>
                    <Section title="⚠ 常见错误" color="red"><ul className="space-y-2">{point.commonMistakes.map((m, i) => (
                      <li key={i} className="rounded border border-red-100 bg-red-50/50 p-2"><div className="font-medium text-red-700">错误：{m.mistake}</div><div className="mt-0.5 text-slate-600">纠正：{m.correction}</div></li>
                    ))}</ul></Section>
                    <Section title="📋 本节总结" color="blue"><ul className="list-disc space-y-1 pl-4">{point.summary.map((s, i) => <li key={i}>{s}</li>)}</ul></Section>
                    <Section title="✅ 自学检查"><ul className="list-disc space-y-1 pl-4">{point.selfCheck.map((q, i) => <li key={i} className="italic">{q}</li>)}</ul></Section>
                    <div className="flex items-center justify-between pt-4">
                      <div className="flex gap-2">
                        {pointIdx > 0 && <button onClick={() => setPointIdx(pointIdx - 1)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">← 上一节</button>}
                        <button onClick={markComplete} className={`rounded-lg border px-4 py-2 text-sm ${sp.completedPoints.includes(point.id) ? "border-green-400 bg-green-50 text-green-700" : "border-slate-300 hover:bg-slate-50"}`}>
                          {sp.completedPoints.includes(point.id) ? "✓ 已完成" : "标记完成"}
                        </button>
                      </div>
                      {pointIdx < chapter.knowledgePoints.length - 1 ? (
                        <button onClick={() => setPointIdx(pointIdx + 1)} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">下一节 →</button>
                      ) : <span className="text-xs text-slate-400">本章已完成</span>}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-slate-400">请从左侧选择章节</div>
            )}
          </div>
          <div className="border-t border-slate-200 lg:w-[420px] lg:shrink-0 lg:border-l lg:border-t-0">
            {showVisual && <div className="border-b border-slate-200 p-4"><h4 className="mb-3 text-sm font-medium text-slate-700">交互可视化</h4>{renderVisual()}</div>}
            <div className="p-4"><div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-xs text-slate-400">练习题功能可通过数学画布进行实际操作练习。<br /><Link href="/subjects/math-canvas" className="mt-2 inline-block text-primary-600 hover:underline">前往数学画布 →</Link></div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getNumberLine() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h4 className="mb-2 text-sm font-medium text-slate-700">数轴与绝对值</h4>
      <div className="flex items-center justify-center"><svg viewBox="0 0 600 120" className="h-28 w-full"><line x1={20} y1={60} x2={580} y2={60} stroke="#94a3b8" strokeWidth={2} />{[0,1,2,3,4,5,-1,-2,-3,-4,-5].map(n => (<g key={n}><line x1={300+n*50} y1={55} x2={300+n*50} y2={65} stroke="#64748b" strokeWidth={1.5} /><text x={300+n*50} y={80} textAnchor="middle" fill="#475569" fontSize={11}>{n}</text></g>))}<circle cx={300} cy={60} r={4} fill="#2563eb" /><text x={300} y={100} textAnchor="middle" fill="#2563eb" fontSize={12}>0(原点)</text></svg></div>
      <p className="mt-1 text-center text-xs text-slate-500">每个实数对应数轴上的唯一点。向右越大，向左越小。</p>
    </div>
  );
}
function getEquationBalance() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h4 className="mb-2 text-sm font-medium text-slate-700">方程天平</h4>
      <div className="flex items-center justify-center gap-4">
        <div className="flex flex-col items-center"><div className="rounded-lg border-2 border-slate-300 bg-amber-50 p-3 text-center text-sm"><span className="font-bold text-blue-700">3x + 2</span></div><div className="my-1 h-8 w-1 bg-slate-400" /><div className="h-2 w-16 rounded-full bg-slate-400" /><div className="text-center text-[10px] text-slate-500">左边</div></div>
        <div className="text-2xl font-bold text-slate-500">=</div>
        <div className="flex flex-col items-center"><div className="rounded-lg border-2 border-slate-300 bg-emerald-50 p-3 text-center text-sm"><span className="font-bold text-emerald-700">11</span></div><div className="my-1 h-8 w-1 bg-slate-400" /><div className="h-2 w-16 rounded-full bg-slate-400" /><div className="text-center text-[10px] text-slate-500">右边</div></div>
      </div>
      <p className="mt-2 text-center text-xs text-slate-500">等式两边同加/减/乘/除（非零），天平保持平衡。</p>
    </div>
  );
}
function getFunctionGraph() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h4 className="mb-2 text-sm font-medium text-slate-700">函数图像</h4>
      <p className="text-xs text-slate-500">请前往数学画布工具，输入表达式体验完整的函数图像绘制、参数滑块和导数分析。</p>
      <Link href="/subjects/math-canvas" className="mt-2 inline-block rounded bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700">前往数学画布 →</Link>
    </div>
  );
}
