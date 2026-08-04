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
      "函数图像、方程求解、平面几何、基础统计等中学核心内容的系统化教学模块。",
    status: "extension",
    statusLabel: "拓展功能",
    enabled: true,
    isCore: true,
    features: [
      "函数图像与性质分析",
      "参数滑块动态探索",
      "一元一次/二次方程分步求解",
      "不等式求解",
      "平面几何（点、直线、圆）",
      "基础描述统计",
      "分层练习与即时反馈",
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
    description:
      "从向量基础到特征值，八大章节系统学习线性代数。每章含交互式可视化、分层练习与教师演示模式。",
    status: "extension",
    statusLabel: "拓展功能",
    enabled: true,
    isCore: false,
    features: [
      "向量运算与几何可视化",
      "矩阵运算与变换演示",
      "高斯消元分步执行",
      "行列式与面积关系",
      "特征值与特征向量",
      "线性变换交互实验",
      "最小二乘拟合",
      "分层练习与解析",
    ],
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
  "math-canvas": {
    id: "math-canvas",
    name: "数学画布",
    shortName: "数学画布",
    description: "交互式数学坐标画布：函数绘制、参数调节、几何图形、方程求解、导数可视化等全套工具。",
    status: "available",
    statusLabel: "正式开放",
    enabled: true,
    isCore: true,
    features: [
      "函数表达式输入与多函数同屏显示",
      "参数滑块动态探索函数性质",
      "科学计算器",
      "一元一次/二次方程分步求解",
      "平面几何（点、线、圆）",
      "基础统计分析与图表",
      "导数与切线动态展示",
      "三维曲面与多元函数",
    ],
  },
};

export const SUBJECT_ORDER: SubjectId[] = [
  "middle-school",
  "calculus-intro",
  "linear-algebra",
  "math-canvas",
  "calculus",
  "probability",
  "complex-analysis",
];
