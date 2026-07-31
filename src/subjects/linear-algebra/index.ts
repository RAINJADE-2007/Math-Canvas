import type { SubjectModule } from "@/subjects/types";

function createPlaceholderModule(): SubjectModule {
  return {
    id: "linear-algebra",
    name: "线性代数",
    description: "计划支持矩阵、向量、线性方程组、线性变换等线性代数内容（开发中）",
    enabled: false,
    supportedObjectTypes: [],
    supportedProblemTypes: [],
    canHandle: () => false,
  };
}

export const linearAlgebraModule = createPlaceholderModule();
