import type { SubjectId } from "@/types";

export interface SubjectMeta {
  id: SubjectId;
  name: string;
  shortName: string;
  description: string;
  status: "available" | "extension" | "coming-soon";
  statusLabel: string;
  enabled: boolean;
  isCore: boolean;
  features: string[];
  placeholderText?: string;
}

export const SUBJECT_META: Record<SubjectId, SubjectMeta> = {
  "middle-school": {
    id: "middle-school",
    name: "中学数学",
    shortName: "中学数学",
    description:
      "函数图像、参数探索、方程与不等式求解、平面几何、基础统计等中学数学核心内容。",
    status: "available",
    statusLabel: "正式开放",
    enabled: true,
    isCore: true,
    features: [
      "函数画布与多函数同时显示",
      "表达式输入与 KaTeX 公式预览",
      "函数参数滑块动态探索",
      "一次函数、二次函数、反比例函数性质分析",
      "科学计算器",
      "一元一次、一元二次方程分步求解",
      "一元一次不等式求解",
      "基础平面几何（点、直线、圆）",
      "基础描述统计",
    ],
  },
  "calculus-intro": {
    id: "calculus-intro",
    name: "导数入门",
    shortName: "导数入门",
    description:
      "基础符号求导、数值导数、切线动态展示、割线逼近切线、单调性与极值分析等导数入门内容。",
    status: "extension",
    statusLabel: "拓展功能",
    enabled: true,
    isCore: false,
    features: [
      "基础符号求导",
      "数值导数（中心差分近似）",
      "原函数与导函数联合绘制",
      "曲线上可拖动切点",
      "切线方程实时更新",
      "割线逼近切线",
      "单调性与极值分析",
    ],
  },
  calculus: {
    id: "calculus",
    name: "高等数学",
    shortName: "高等数学",
    description: "计划支持极限、微分、积分、微分方程等完整高等数学内容。",
    status: "coming-soon",
    statusLabel: "开发中",
    enabled: false,
    isCore: false,
    features: ["极限入门", "一元函数微积分", "多元函数与偏导数", "微分方程"],
    placeholderText: "该模块已完成架构预留，具体功能将在后续版本中开发。",
  },
  "linear-algebra": {
    id: "linear-algebra",
    name: "线性代数",
    shortName: "线性代数",
    description: "计划支持矩阵、向量、线性方程组、线性变换等线性代数内容。",
    status: "coming-soon",
    statusLabel: "开发中",
    enabled: false,
    isCore: false,
    features: ["矩阵运算", "线性方程组", "行列式", "线性变换"],
    placeholderText: "该模块已完成架构预留，具体功能将在后续版本中开发。",
  },
  probability: {
    id: "probability",
    name: "概率论",
    shortName: "概率论",
    description: "计划支持概率计算、随机变量、概率分布等概率论基础内容。",
    status: "coming-soon",
    statusLabel: "开发中",
    enabled: false,
    isCore: false,
    features: ["概率计算", "随机变量", "常见概率分布"],
    placeholderText: "该模块已完成架构预留，具体功能将在后续版本中开发。",
  },
  "complex-analysis": {
    id: "complex-analysis",
    name: "复变函数",
    shortName: "复变函数",
    description: "计划支持复数运算、复变函数与基本映射等复变函数入门内容。",
    status: "coming-soon",
    statusLabel: "开发中",
    enabled: false,
    isCore: false,
    features: ["复数运算", "复变函数", "基本映射"],
    placeholderText: "该模块已完成架构预留，具体功能将在后续版本中开发。",
  },
};

export const SUBJECT_ORDER: SubjectId[] = [
  "middle-school",
  "calculus-intro",
  "calculus",
  "linear-algebra",
  "probability",
  "complex-analysis",
];
