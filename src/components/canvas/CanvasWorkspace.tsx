"use client";

import { useState } from "react";
import { useMathCanvasStore } from "@/store/useMathCanvasStore";
import { ToolBar } from "@/components/canvas/ToolBar";
import { MathCanvasBoard } from "@/components/canvas/MathCanvasBoard";
import { RightPanel } from "@/components/canvas/RightPanel";
import { DocumentBar } from "@/components/canvas/DocumentBar";
import { ExpressionPanel } from "@/components/expressions/ExpressionPanel";
import { ParameterPanel } from "@/components/parameters/ParameterPanel";
import { CalculatorPanel } from "@/components/calculator/CalculatorPanel";
import { SolverPanel } from "@/components/solver/SolverPanel";
import { GeometryPanel } from "@/components/geometry/GeometryPanel";
import { StatisticsPanel } from "@/components/statistics/StatisticsPanel";
import { DerivativePanel } from "@/components/derivative/DerivativePanel";
import { MultivariatePanel } from "@/components/multivariate/MultivariatePanel";
import { SurfaceView, DEFAULT_MULTIVARIATE_DOMAIN, DEFAULT_MULTIVARIATE_GRID, type MultivariateDomain } from "@/components/multivariate/SurfaceView";
import { ContourMap } from "@/components/multivariate/ContourMap";
import { MobileNotice } from "@/components/common/MobileNotice";

type BottomTab =
  | "expressions"
  | "parameters"
  | "multivariate"
  | "calculator"
  | "solver"
  | "geometry"
  | "statistics"
  | "derivative";

const TABS: { id: BottomTab; label: string }[] = [
  { id: "expressions", label: "表达式" },
  { id: "parameters", label: "参数" },
  { id: "multivariate", label: "多元函数" },
  { id: "calculator", label: "计算器" },
  { id: "solver", label: "方程求解" },
  { id: "geometry", label: "几何" },
  { id: "statistics", label: "统计" },
  { id: "derivative", label: "导数分析" },
];

export function CanvasWorkspace() {
  const [activeTab, setActiveTab] = useState<BottomTab>("expressions");
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const [view3d, setView3d] = useState<"surface" | "contour">("surface");
  const [mvDomain, setMvDomain] = useState<MultivariateDomain>(DEFAULT_MULTIVARIATE_DOMAIN);
  const [mvGrid, setMvGrid] = useState<number>(DEFAULT_MULTIVARIATE_GRID);
  const multivariateFunctions = useMathCanvasStore((s) => s.multivariateFunctions);

  return (
    <div className="mx-auto flex h-[calc(100vh-108px)] max-w-[1600px] flex-col px-2 py-2">
      <div className="mb-2 lg:hidden">
        <MobileNotice />
      </div>

      <DocumentBar />

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] gap-2 lg:grid-cols-[48px_1fr_300px]">
        <ToolBar />
        <div className="relative min-w-0 min-h-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card">
          {viewMode === "3d" ? (
            view3d === "contour" ? (
              <ContourMap functions={multivariateFunctions} domain={mvDomain} grid={mvGrid} className="h-full w-full" />
            ) : (
              <SurfaceView functions={multivariateFunctions} domain={mvDomain} grid={mvGrid} className="h-full w-full" />
            )
          ) : (
            <MathCanvasBoard />
          )}
          <div className="absolute left-2 top-2 z-20 flex flex-col items-start gap-1.5">
            <div className="flex items-center gap-0.5 rounded-full border border-slate-200 bg-white/95 p-0.5 shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode("2d")}
                title="二维函数图像"
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  viewMode === "2d" ? "bg-primary-600 text-white" : "text-slate-500 hover:text-primary-600"
                }`}
              >
                2D
              </button>
              <button
                type="button"
                onClick={() => setViewMode("3d")}
                title="三维曲面 / 等高线（多元函数）"
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  viewMode === "3d" ? "bg-primary-600 text-white" : "text-slate-500 hover:text-primary-600"
                }`}
              >
                3D
              </button>
            </div>
            {viewMode === "3d" ? (
              <div className="flex items-center gap-0.5 rounded-full border border-slate-200 bg-white/95 p-0.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => setView3d("surface")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    view3d === "surface" ? "bg-primary-600 text-white" : "text-slate-500 hover:text-primary-600"
                  }`}
                >
                  3D曲面
                </button>
                <button
                  type="button"
                  onClick={() => setView3d("contour")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    view3d === "contour" ? "bg-primary-600 text-white" : "text-slate-500 hover:text-primary-600"
                  }`}
                >
                  等高线
                </button>
              </div>
            ) : null}
          </div>
        </div>
        <RightPanel />
      </div>

      <div className="mt-2 flex h-[320px] flex-col rounded-lg border border-slate-200 bg-white shadow-card">
        <nav className="flex flex-wrap gap-1 border-b border-slate-200 px-2 pt-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-t-md px-4 py-2 text-sm transition-colors ${
                activeTab === tab.id
                  ? "border border-b-0 border-slate-200 bg-white font-medium text-primary-700"
                  : "text-slate-500 hover:text-primary-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="panel-scroll flex-1 overflow-y-auto p-4">
          <div key={activeTab} className="tab-enter">
            {activeTab === "expressions" && <ExpressionPanel />}
            {activeTab === "parameters" && <ParameterPanel />}
            {activeTab === "multivariate" && (
              <MultivariatePanel
                domain={mvDomain}
                grid={mvGrid}
                onApplyDomain={setMvDomain}
                onApplyGrid={setMvGrid}
              />
            )}
            {activeTab === "calculator" && <CalculatorPanel />}
            {activeTab === "solver" && <SolverPanel />}
            {activeTab === "geometry" && <GeometryPanel />}
            {activeTab === "statistics" && <StatisticsPanel />}
            {activeTab === "derivative" && <DerivativePanel />}
          </div>
        </div>
      </div>
    </div>
  );
}
