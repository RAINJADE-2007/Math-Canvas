import type { SubjectModule } from "@/subjects/types";

export const linearAlgebraModule: SubjectModule = {
  id: "linear-algebra",
  name: "线性代数",
  description:
    "从向量基础到特征值与特征向量，涵盖线性代数核心内容。交互式可视化、分层练习和教师演示功能。",
  enabled: true,
  supportedObjectTypes: [],
  supportedProblemTypes: [],
  canHandle: () => true,
};
