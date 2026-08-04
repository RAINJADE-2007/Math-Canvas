"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import type { SeniorChapter, SeniorProgress } from "@/math-engine/middle-school/senior";
import { SENIOR_CHAPTERS } from "@/math-engine/middle-school/senior";
import { LatexView } from "@/components/common/LatexView";
import { renderVisualByKp } from "@/components/middle-school/visuals/VisualSystem";

const LS_KEY = "math-canvas-senior-math-progress";

function load(): SeniorProgress {
  if (typeof window === "undefined") return init();
  try { const r = localStorage.getItem(LS_KEY); if (r) return JSON.parse(r); } catch {}
  return init();
}
function save(p: SeniorProgress) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(LS_KEY, JSON.stringify(p)); } catch {}
}
function init(): SeniorProgress {
  return {
    completedPoints: [], completedExercises: [],
    chapterProgress: SENIOR_CHAPTERS.reduce((a,c)=>({...a,[c.id]:0}),{} as Record<string,number>),
    lastChapter: SENIOR_CHAPTERS[0]?.id??"", lastPointIndex: 0,
  };
}

function renderVis(kpId: string) {
  return renderVisualByKp(kpId);
}

export default function SeniorMathPage() {
  const [progress, setProgress] = useState<SeniorProgress>(() => load());
  const [chId, setChId] = useState(progress.lastChapter);
  const [pIdx, setPIdx] = useState(progress.lastPointIndex);
  const [teacher, setTeacher] = useState(false);
  const [showVis, setShowVis] = useState(true);
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => { save(progress); }, [progress]);

  const chapter = useMemo(() => SENIOR_CHAPTERS.find(c=>c.id===chId), [chId]);
  const point = useMemo(() => chapter?.knowledgePoints[pIdx], [chapter, pIdx]);

  useEffect(() => {
    if (!chId && SENIOR_CHAPTERS[0]) { setChId(SENIOR_CHAPTERS[0].id); }
  }, [chId]);

  const selCh = useCallback((id:string)=>{setChId(id);setPIdx(0);setSideOpen(false);setProgress(p=>({...p,lastChapter:id,lastPointIndex:0}));},[]);
  const markDone = useCallback(()=>{
    if(!point||!chapter)return;
    const done=progress.completedPoints.includes(point.id);
    const n=done?progress.completedPoints.filter(i=>i!==point.id):[...progress.completedPoints,point.id];
    const t=chapter.knowledgePoints.length;
    const c=n.filter(i=>chapter.knowledgePoints.some(kp=>kp.id===i)).length;
    setProgress({...progress,completedPoints:n,chapterProgress:{...progress.chapterProgress,[chId]:t>0?c/t*100:0},lastChapter:chId,lastPointIndex:pIdx});
  },[point,chapter,chId,pIdx,progress]);

  const Sec = ({title,children,color="slate"}:{title:string;children:React.ReactNode;color?:string})=>{
    const cm:Record<string,string>={slate:"border-slate-200 bg-slate-50 text-slate-700",blue:"border-blue-200 bg-blue-50 text-blue-700",green:"border-green-200 bg-green-50 text-green-700",red:"border-red-200 bg-red-50 text-red-700",violet:"border-violet-200 bg-violet-50 text-violet-700",amber:"border-amber-200 bg-amber-50 text-amber-700"};
    return <div className={`rounded-lg border ${cm[color]??cm.slate}`}><div className="px-4 py-2.5 text-sm font-medium">{title}</div><div className="px-4 pb-3 text-xs leading-relaxed text-slate-600">{children}</div></div>;
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-108px)] max-w-[1600px] flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
        <div className="flex items-center gap-3">
          <Link href="/subjects" className="text-xs text-primary-600 hover:underline">← 学科模块</Link>
          <span className="h-4 w-px bg-slate-200" />
          <Link href="/subjects/middle-school" className={`rounded border px-2.5 py-1 text-xs font-medium border-slate-300 text-slate-600 hover:bg-slate-50`}>初中数学</Link>
          <span className="rounded border border-primary-300 bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700">高中数学</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setShowVis(!showVis)} className={`rounded border px-2.5 py-1 text-xs ${showVis?"border-primary-300 bg-primary-50 text-primary-700":"border-slate-300 text-slate-600"}`}>{showVis?"隐藏可视化":"显示可视化"}</button>
          <button onClick={()=>setTeacher(!teacher)} className={`rounded border px-2.5 py-1 text-xs ${teacher?"border-violet-300 bg-violet-50 text-violet-700":"border-slate-300 text-slate-600"}`}>{teacher?"演示模式":"学生模式"}</button>
          <button onClick={()=>setSideOpen(!sideOpen)} className="rounded border border-slate-300 px-2.5 py-1 text-xs text-slate-600 lg:hidden">目录</button>
        </div>
      </div>
      <div className="flex flex-1">
        <aside className={`${sideOpen?"block":"hidden"} fixed inset-0 top-[108px] z-30 w-64 border-r border-slate-200 bg-white p-3 lg:static lg:block lg:w-56 lg:shrink-0`}>
          <nav className="space-y-1">
            {SENIOR_CHAPTERS.map((ch:SeniorChapter)=>{
              const pct=progress.chapterProgress[ch.id]??0;
              const active=chId===ch.id;
              return <button key={ch.id} onClick={()=>selCh(ch.id)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${active?"bg-primary-50 text-primary-700 font-medium":"text-slate-600 hover:bg-slate-50"}`}>
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${pct>=100?"bg-green-100 text-green-700":pct>0?"bg-primary-100 text-primary-600":"bg-slate-100 text-slate-500"}`}>{ch.number}</span>
                <div className="min-w-0 flex-1"><div className="truncate">{ch.title}</div><div className="mt-0.5 h-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-primary-400" style={{width:`${Math.round(pct)}%`}}/></div></div>
              </button>;
            })}
          </nav>
          {chapter&&<div className="mt-4 border-t border-slate-100 pt-3"><h5 className="mb-2 text-xs font-medium text-slate-500">本章知识点</h5>
            {chapter.knowledgePoints.map((kp,idx)=>{const done=progress.completedPoints.includes(kp.id);
              return <button key={kp.id} onClick={()=>setPIdx(idx)} className={`mb-1 flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-xs ${idx===pIdx?"bg-primary-50 text-primary-700":"text-slate-600 hover:bg-slate-50"}`}>
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${done?"bg-green-500":"bg-slate-300"}`}/><span className="truncate">{kp.title}</span></button>;
            })}</div>}
          {sideOpen&&<div className="fixed inset-0 top-[108px] -z-10 bg-black/20 lg:hidden" onClick={()=>setSideOpen(false)}/>}
        </aside>
        <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
          <div className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
            {chapter?<>
              <div className="mb-6"><div className="flex items-center gap-2"><span className="rounded bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">第{chapter.number}章</span><h1 className="text-2xl font-bold text-slate-900">{chapter.title}</h1></div>
                <p className="mt-2 text-sm text-slate-500">{chapter.description}</p>
                {chapter.prerequisites.length>0&&<div className="mt-2 text-xs text-slate-400">前置知识：{chapter.prerequisites.join("、")}</div>}
                {teacher&&<div className="mt-3 rounded-lg border border-violet-200 bg-violet-50 p-3 text-xs"><div className="font-medium text-violet-700">教学要点：</div><ul className="mt-1 list-disc space-y-0.5 pl-4 text-violet-600">{chapter.teachingPoints.map((t,i)=><li key={i}>{t}</li>)}</ul><div className="mt-2 font-medium text-red-700">常见误区：</div><ul className="mt-1 list-disc space-y-0.5 pl-4 text-red-600">{chapter.commonMisconceptions.map((m,i)=><li key={i}>{m}</li>)}</ul><div className="mt-2 font-medium text-violet-700">讨论问题：</div><ul className="mt-1 list-disc space-y-0.5 pl-4 text-violet-600">{chapter.discussionQuestions.map((q,i)=><li key={i}>{q}</li>)}</ul></div>}
              </div>
              {point&&<div className="space-y-4"><h3 className="text-xl font-semibold text-slate-900">{point.title}</h3>
                <Sec title="🎯 学习目标" color="blue"><ul className="list-disc space-y-1 pl-4">{point.objectives.map((o,i)=><li key={i}>{o}</li>)}</ul></Sec>
                <Sec title="💡 为什么需要这个概念？">{point.motivation}</Sec>
                <Sec title="🔍 直觉理解" color="blue">{point.intuition}</Sec>
                <Sec title="📖 严谨定义" color="violet">{point.definition}</Sec>
                <Sec title="📐 公式与说明" color="amber"><div className="overflow-x-auto"><LatexView latex={point.formulaLatex} displayMode/></div><p className="mt-2">{point.formulaExplanation}</p>{point.applicableConditions&&<p className="mt-1 text-slate-500">⚠ 适用条件：{point.applicableConditions}</p>}</Sec>
                <Sec title="✏️ 分步例题" color="green"><p className="mb-2 font-medium text-slate-700">题目：{point.example.problem}</p><div className="space-y-2">{point.example.steps.map((s,i)=><div key={i} className="flex items-start gap-3 rounded border border-slate-100 p-2"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-700">{i+1}</span><div><span className="text-slate-600">{s.description}</span><div className="mt-1"><LatexView latex={s.latex}/></div></div></div>)}</div><div className="mt-2 font-medium text-green-700">答案：<LatexView latex={point.example.answerLatex}/></div></Sec>
                <Sec title="⚠ 常见错误" color="red"><ul className="space-y-2">{point.commonMistakes.map((m,i)=><li key={i} className="rounded border border-red-100 bg-red-50/50 p-2"><div className="font-medium text-red-700">错误：{m.mistake}</div><div className="mt-0.5 text-slate-600">纠正：{m.correction}</div></li>)}</ul></Sec>
                <Sec title="📋 本节总结" color="blue"><ul className="list-disc space-y-1 pl-4">{point.summary.map((s,i)=><li key={i}>{s}</li>)}</ul></Sec>
                <Sec title="✅ 自学检查"><ul className="list-disc space-y-1 pl-4">{point.selfCheck.map((q,i)=><li key={i} className="italic">{q}</li>)}</ul></Sec>
                <div className="flex items-center justify-between pt-4"><div className="flex gap-2">{pIdx>0&&<button onClick={()=>setPIdx(pIdx-1)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">← 上一节</button>}<button onClick={markDone} className={`rounded-lg border px-4 py-2 text-sm ${progress.completedPoints.includes(point.id)?"border-green-400 bg-green-50 text-green-700":"border-slate-300 hover:bg-slate-50"}`}>{progress.completedPoints.includes(point.id)?"✓ 已完成":"标记完成"}</button></div>{pIdx<chapter.knowledgePoints.length-1?<button onClick={()=>setPIdx(pIdx+1)} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">下一节 →</button>:<span className="text-xs text-slate-400">本章已完成</span>}</div>
              </div>}
            </>:<div className="flex h-64 items-center justify-center text-sm text-slate-400">请从左侧选择章节</div>}
          </div>
          <div className="border-t border-slate-200 lg:w-[420px] lg:shrink-0 lg:border-l lg:border-t-0">
            {showVis&&<div className="border-b border-slate-200 p-4"><h4 className="mb-3 text-sm font-medium text-slate-700">交互可视化</h4>{renderVis(point?.id??"")}</div>}
            <div className="p-4"><div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-xs text-slate-400">练习题功能可通过数学画布进行实际操作练习。<br/><Link href="/subjects/math-canvas" className="mt-2 inline-block text-primary-600 hover:underline">前往数学画布 →</Link></div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
