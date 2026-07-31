import Link from "next/link";
import { SUBJECT_META, SUBJECT_ORDER } from "@/constants/subjects";

export default function SubjectsPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-6 py-10">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">学科模块</h1>
        <p className="mt-2 text-sm text-slate-500">
          初版开放中学数学与导数入门，其余学科已预留架构，将在后续版本中开发。
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SUBJECT_ORDER.map((id) => {
          const meta = SUBJECT_META[id];
          return (
            <Link
              key={id}
              href={`/subjects/${id}`}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-card transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">{meta.name}</h2>
                <span
                  className={
                    meta.enabled
                      ? "rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700"
                      : "rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500"
                  }
                >
                  {meta.statusLabel}
                </span>
              </div>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{meta.description}</p>
              <div className="mt-4 text-xs text-slate-400">
                {meta.enabled ? "点击进入模块页面" : "架构已预留 · 开发中"}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
