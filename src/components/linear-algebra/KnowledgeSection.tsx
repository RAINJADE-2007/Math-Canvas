"use client";

import { useState } from "react";
import type { KnowledgePoint } from "@/math-engine/linear-algebra/types";
import { LatexView } from "@/components/common/LatexView";

interface KnowledgeSectionProps {
  point: KnowledgePoint;
  teacherMode?: boolean;
}

export function KnowledgeSection({ point, teacherMode = false }: KnowledgeSectionProps) {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setRevealed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const revealAll = () => {
    const all: Record<string, boolean> = {};
    ["objectives", "motivation", "intuition", "definition", "formula", "example", "mistakes", "summary", "selfCheck"].forEach(
      (k) => (all[k] = true)
    );
    setRevealed(all);
  };

  const SectionToggle = ({
    id,
    title,
    children,
    color = "slate",
  }: {
    id: string;
    title: string;
    children: React.ReactNode;
    color?: string;
  }) => {
    const isOpen = revealed[id] ?? true;
    const colorMap: Record<string, string> = {
      slate: "border-slate-200 bg-slate-50 text-slate-700",
      blue: "border-blue-200 bg-blue-50 text-blue-700",
      green: "border-green-200 bg-green-50 text-green-700",
      red: "border-red-200 bg-red-50 text-red-700",
      violet: "border-violet-200 bg-violet-50 text-violet-700",
      amber: "border-amber-200 bg-amber-50 text-amber-700",
    };
    return (
      <div className={`rounded-lg border ${colorMap[color] ?? colorMap.slate}`}>
        <button
          onClick={() => toggleItem(id)}
          className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm font-medium"
          aria-expanded={isOpen}
        >
          {title}
          <span className="text-xs opacity-60">{isOpen ? "收起" : "展开"}</span>
        </button>
        {isOpen && <div className="px-4 pb-3 text-xs leading-relaxed text-slate-600">{children}</div>}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-900">{point.title}</h3>
        {teacherMode && (
          <button
            onClick={revealAll}
            className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50"
          >
            全部展开
          </button>
        )}
      </div>

      <SectionToggle id="objectives" title="学习目标" color="blue">
        <ul className="list-disc space-y-1 pl-4">
          {point.objectives.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>
      </SectionToggle>

      <SectionToggle id="motivation" title="为什么需要这个概念？">
        <p>{point.motivation}</p>
      </SectionToggle>

      <SectionToggle id="intuition" title="直觉理解" color="blue">
        <p>{point.intuition}</p>
      </SectionToggle>

      <SectionToggle id="definition" title="严谨定义" color="violet">
        <p>{point.definition}</p>
      </SectionToggle>

      <SectionToggle id="formula" title="公式说明" color="amber">
        <div className="overflow-x-auto">
          <LatexView latex={point.formulaLatex} displayMode />
        </div>
        <p className="mt-2">{point.formulaExplanation}</p>
      </SectionToggle>

      <SectionToggle id="example" title="分步例题" color="green">
        <p className="mb-2 font-medium text-slate-700">题目：{point.example.problem}</p>
        <div className="space-y-2">
          {point.example.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3 rounded border border-slate-100 p-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-700">
                {i + 1}
              </span>
              <div>
                <span className="text-slate-600">{step.description}</span>
                <div className="mt-1">
                  <LatexView latex={step.latex} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 font-medium text-green-700">
          答案：<LatexView latex={point.example.answerLatex} />
        </div>
      </SectionToggle>

      <SectionToggle id="mistakes" title="常见错误" color="red">
        <ul className="space-y-2">
          {point.commonMistakes.map((m, i) => (
            <li key={i} className="rounded border border-red-100 bg-red-50/50 p-2">
              <div className="font-medium text-red-700">错误：{m.mistake}</div>
              <div className="mt-0.5 text-slate-600">纠正：{m.correction}</div>
            </li>
          ))}
        </ul>
      </SectionToggle>

      <SectionToggle id="summary" title="本节总结" color="blue">
        <ul className="list-disc space-y-1 pl-4">
          {point.summary.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </SectionToggle>

      <SectionToggle id="selfCheck" title="自学检查">
        <ul className="list-disc space-y-1 pl-4">
          {point.selfCheck.map((q, i) => (
            <li key={i} className="italic">{q}</li>
          ))}
        </ul>
      </SectionToggle>
    </div>
  );
}
