"use client";

import { useState } from "react";
import { useMathCanvasStore } from "@/store/useMathCanvasStore";
import { uid } from "@/store/useMathCanvasStore";
import { computeStatistics, parseDataInput } from "@/math-engine/middle-school/statistics/statistics";
import type { MathDataset } from "@/types";
import { StatChart } from "@/components/statistics/StatChart";

export function StatisticsPanel() {
  const datasets = useMathCanvasStore((s) => s.datasets);
  const addDataset = useMathCanvasStore((s) => s.addDataset);
  const removeDataset = useMathCanvasStore((s) => s.removeDataset);

  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [chartType, setChartType] = useState<"bar" | "line">("bar");

  const activeDataset = datasets.find((d) => d.id === activeId) ?? datasets[0] ?? null;

  function addData() {
    const parsed = parseDataInput(input);
    if (parsed.error) {
      setError(parsed.error);
      return;
    }
    const dataset: MathDataset = {
      id: uid("data"),
      name: name.trim() || `数据集 ${datasets.length + 1}`,
      rawInput: input.trim(),
      values: parsed.values,
      color: "#2563eb",
      createdAt: Date.now(),
    };
    addDataset(dataset);
    setInput("");
    setName("");
    setError(null);
    setActiveId(dataset.id);
  }

  const stats = activeDataset ? computeStatistics(activeDataset.values) : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") addData();
            }}
            placeholder="输入数据，用逗号分隔，例如 12,15,15,18,20"
            className="min-w-[220px] flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500"
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="数据集名称（可选）"
            className="w-36 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500"
          />
          <button
            type="button"
            onClick={addData}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            添加数据集
          </button>
        </div>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <p className="mt-2 text-xs text-slate-400">
          计算数据个数、总和、平均数、中位数、众数、最大值、最小值与极差。
        </p>

        {datasets.length === 0 ? (
          <div className="mt-4 rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
            暂无数据集
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {datasets.map((dataset) => (
              <li
                key={dataset.id}
                className={`flex cursor-pointer items-center gap-2 rounded-md border p-2.5 text-sm ${
                  activeDataset?.id === dataset.id
                    ? "border-primary-400 bg-primary-50/60"
                    : "border-slate-200 hover:border-slate-300"
                }`}
                onClick={() => setActiveId(dataset.id)}
              >
                <span className="font-medium text-slate-700">{dataset.name}</span>
                <span className="truncate font-mono text-xs text-slate-500">{dataset.rawInput}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeDataset(dataset.id);
                  }}
                  className="ml-auto rounded p-1 text-xs text-red-500 hover:bg-red-50"
                >
                  删除
                </button>
              </li>
            ))}
          </ul>
        )}

        {stats ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatItem label="数据个数" value={String(stats.count)} />
              <StatItem label="总和" value={fmt(stats.sum)} />
              <StatItem label="平均数" value={fmt(stats.mean)} />
              <StatItem label="中位数" value={fmt(stats.median)} />
              <StatItem label="众数" value={stats.mode.length > 0 ? stats.mode.map(fmt).join("、") : "无"} />
              <StatItem label="最大值" value={fmt(stats.max)} />
              <StatItem label="最小值" value={fmt(stats.min)} />
              <StatItem label="极差" value={fmt(stats.range)} />
            </div>
          </div>
        ) : null}
      </div>

      <div>
        {activeDataset && stats ? (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">统计图：{activeDataset.name}</p>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setChartType("bar")}
                  className={`rounded px-2.5 py-1 text-xs ${chartType === "bar" ? "bg-primary-600 text-white" : "border border-slate-200 text-slate-600"}`}
                >
                  柱状图
                </button>
                <button
                  type="button"
                  onClick={() => setChartType("line")}
                  className={`rounded px-2.5 py-1 text-xs ${chartType === "line" ? "bg-primary-600 text-white" : "border border-slate-200 text-slate-600"}`}
                >
                  折线图
                </button>
              </div>
            </div>
            {chartType === "bar" ? (
              <StatChart
                type="bar"
                data={stats.frequency.map((f) => ({ label: fmt(f.value), value: f.count }))}
              />
            ) : (
              <StatChart
                type="line"
                data={stats.sorted.map((v, index) => ({ label: `#${index + 1}`, value: v }))}
              />
            )}
            <p className="mt-2 text-xs text-slate-400">
              柱状图展示各数值的频数分布；折线图按从小到大顺序展示数据。
            </p>
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
            添加数据集后可查看统计图
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-2.5">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-0.5 font-mono text-base font-medium text-slate-800">{value}</p>
    </div>
  );
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}
