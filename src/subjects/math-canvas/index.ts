import type { SubjectModule } from "@/subjects/types";

export const mathCanvasModule: SubjectModule = {
  id: "math-canvas",
  name: "数学画布",
  description: "交互式数学坐标画布：函数绘制、参数调节、几何图形、方程求解、导数可视化等全套工具。",
  enabled: true,
  supportedObjectTypes: ["function", "derivative", "tangent", "point", "line", "circle", "parameter", "dataset"],
  supportedProblemTypes: [
    "numeric",
    "linear-equation",
    "quadratic-equation",
    "linear-inequality",
    "derivative",
    "tangent",
    "monotonicity",
  ],
  canHandle: () => true,
};
