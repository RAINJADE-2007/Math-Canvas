import Link from "next/link";
import { notFound } from "next/navigation";
import { SUBJECT_META, SUBJECT_ORDER } from "@/constants/subjects";
import type { SubjectId } from "@/types";

interface SubjectDetailPageProps {
  params: Promise<{ subjectId: string }>;
}

export async function generateStaticParams() {
  return SUBJECT_ORDER.map((id) => ({ subjectId: id }));
}

export default async function SubjectDetailPage({ params }: SubjectDetailPageProps) {
  const { subjectId } = await params;
  if (!SUBJECT_META[subjectId as SubjectId]) notFound();

  const meta = SUBJECT_META[subjectId as SubjectId];

  return (
    <div className="mx-auto max-w-[900px] px-6 py-10">
      <div className="flex items-center justify-between">
        <Link href="/subjects" className="text-sm text-primary-600 hover:underline">
          ← 返回学科模块
        </Link>
        <span
          className={
            meta.enabled
              ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
              : "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500"
          }
        >
          {meta.statusLabel}
        </span>
      </div>

      <header className="mt-6">
        <h1 className="text-3xl font-bold text-slate-900">{meta.name}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{meta.description}</p>
      </header>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="text-lg font-semibold text-slate-900">计划功能</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {meta.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
              {feature}
            </li>
          ))}
        </ul>
      </section>

      {meta.enabled ? (
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/subjects/math-canvas"
            className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            进入{meta.name}画布
          </Link>
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-base text-slate-600">{meta.placeholderText}</p>
          <p className="mt-2 text-sm text-slate-400">
            该模块不会提前提供虚假的计算逻辑，请关注后续版本更新。
          </p>
        </div>
      )}
    </div>
  );
}
