import type { SubjectModule } from "@/subjects/types";

function createPlaceholderModule(): SubjectModule {
  return {
    id: "calculus",
    name: "高等数学",
    description: "计划支持极限、微分、积分、微分方程等完整高等数学内容（开发中）",
    enabled: false,
    supportedObjectTypes: [],
    supportedProblemTypes: [],
    canHandle: () => false,
  };
}

export const calculusModule = createPlaceholderModule();
