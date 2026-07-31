"use client";

import { useMemo } from "react";
import { renderLatex } from "@/utils/katex";

interface LatexViewProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export function LatexView({ latex, displayMode = false, className }: LatexViewProps) {
  const html = useMemo(() => renderLatex(latex, displayMode), [latex, displayMode]);
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
      aria-label="公式预览"
    />
  );
}
