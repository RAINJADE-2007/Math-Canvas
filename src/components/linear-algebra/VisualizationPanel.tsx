"use client";

import { useState } from "react";
import type { LaToolId } from "./LaToolBar";
import { LaToolBar } from "./LaToolBar";
import { VectorCanvas } from "./VectorCanvas";
import { MatrixCanvas } from "./MatrixCanvas";
import { GaussCanvas } from "./GaussCanvas";
import { DeterminantVis } from "./DeterminantVis";
import { EigenVis } from "./EigenVis";
import { VectorSpaceVis } from "./VectorSpaceVis";
import { LeastSquaresVis } from "./LeastSquaresVis";

interface VisualizationPanelProps {
  chapterId: string;
  knowledgePointId?: string;
}

export function VisualizationPanel({ chapterId, knowledgePointId }: VisualizationPanelProps) {
  const [activeTool, setActiveTool] = useState<LaToolId>("pan");

  const handleReset = () => setActiveTool("pan");

  const renderVis = () => {
    const key = `${chapterId}-${knowledgePointId ?? ""}`;
    switch (chapterId) {
      case "vectors":
        return <VectorCanvas key={key} height={380} showSum showDot />;
      case "matrices":
      case "linear-transforms":
        return <MatrixCanvas key={key} height={380} />;
      case "linear-systems":
        return <GaussCanvas key={key} />;
      case "determinants":
        return <DeterminantVis key={key} height={380} />;
      case "eigenvalues":
        return <EigenVis key={key} height={380} />;
      case "vector-spaces":
        return <VectorSpaceVis key={key} height={420} />;
      case "applications":
        return <LeastSquaresVis key={key} height={420} />;
      default:
        return (
          <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-400">
            无可视化
          </div>
        );
    }
  };

  return (
    <div className="flex gap-2">
      <LaToolBar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onReset={handleReset}
      />
      <div className="min-w-0 flex-1">
        {renderVis()}
      </div>
    </div>
  );
}
