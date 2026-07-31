import type { SubjectModule } from "@/subjects/types";

function createPlaceholderModule(): SubjectModule {
  return {
    id: "complex-analysis",
    name: "复变函数",
    description: "计划支持复数运算、复变函数与基本映射等复变函数入门内容（开发中）",
    enabled: false,
    supportedObjectTypes: [],
    supportedProblemTypes: [],
    canHandle: () => false,
  };
}

export const complexAnalysisModule = createPlaceholderModule();
