import type { SubjectModule } from "@/subjects/types";

function createPlaceholderModule(): SubjectModule {
  return {
    id: "probability",
    name: "概率论",
    description: "计划支持概率计算、随机变量、常见概率分布等概率论内容（开发中）",
    enabled: false,
    supportedObjectTypes: [],
    supportedProblemTypes: [],
    canHandle: () => false,
  };
}

export const probabilityModule = createPlaceholderModule();
