export type GeometryVisualType =
  | "triangle-properties"
  | "congruence-lab"
  | "pythagorean-lab"
  | "similarity-lab"
  | "right-triangle-trig"
  | "circle-theorem"
  | "quadrilateral-lab"
  | "transformation-lab"
  | "solid-geometry"
  | "line-plane-relation"
  | "space-angle-distance"
  | "space-vector"
  | "number-line"
  | "algebra-tiles"
  | "inequality-line"
  | "function-graph"
  | "statistics-chart"
  | "geometry-board";

export interface GeometryVisualizationConfig {
  type: GeometryVisualType;
  preset?: string;
  title: string;
  learningGoal: string;
  instructions: string[];
  guidedQuestions: string[];
  conclusion: string;
}

export const JUNIOR_VIS: Record<string, GeometryVisualizationConfig> = {
  "jr-num-numberline": {
    type: "number-line", preset: "default", title: "数轴交互实验",
    learningGoal: "理解有理数在数轴上的表示，比较两个数的大小。",
    instructions: ["拖动A和B的滑块改变点的位置", "观察右边数是否总是大于左边数", "观察两点之间的距离 |A-B|"],
    guidedQuestions: ["A和B哪个更靠右？它们的大小关系是什么？", "|A-B|表示什么？为什么|A-B|总是非负的？", "如何用数轴判断两个负数的大小？"],
    conclusion: "数轴上的点越往右，对应的数越大。两点距离 = 大数减小数。" },
  "jr-num-absolute": {
    type: "number-line", preset: "absolute", title: "绝对值与相反数实验",
    learningGoal: "理解绝对值的几何意义（点到原点的距离），理解相反数的概念。",
    instructions: ["拖动点A", "观察|A|和|-A|的值", "观察A和-A关于原点对称"],
    guidedQuestions: ["|A|和|-A|为什么总是相等？", "什么情况下|A|=A？什么情况下|A|=-A？", "A和-A在数轴上有什么关系？"],
    conclusion: "绝对值 = 点到原点的距离。相反数关于原点对称。" },
  "jr-num-polynomial": {
    type: "algebra-tiles", preset: "square-formula", title: "完全平方公式面积模型",
    learningGoal: "用面积模型理解(a+b)²=a²+2ab+b²。",
    instructions: ["调整a和b的值", "观察正方形如何被分割为a²、ab、ab、b²四块", "比较总面积(a+b)²和分割面积之和"],
    guidedQuestions: ["四块面积加起来为什么等于(a+b)²？", "中间的两块ab为什么出现两次？", "如果换成(a-b)²，面积模型会怎样变化？"],
    conclusion: "(a+b)² = a² + 2ab + b²。面积模型直观展示了公式的几何意义。" },
  "jr-eq-linear1": {
    type: "function-graph", preset: "linear", title: "一元一次方程图像解法",
    learningGoal: "用图像理解一元一次方程的解就是直线与x轴的交点。",
    instructions: ["在数学画布中输入一次函数表达式", "观察图像与x轴的交点", "读出交点坐标，即为方程的解"],
    guidedQuestions: ["直线与x轴的交点的x坐标是什么？", "如果直线平行于x轴（y=常数≠0），方程有解吗？", "为什么移项过程中等号两边同加同一个数不改变解？"],
    conclusion: "一次方程的解 = 对应一次函数图像与x轴交点的横坐标。" },
  "jr-geo-congruence": {
    type: "congruence-lab", preset: "sas", title: "全等三角形判定实验",
    learningGoal: "掌握SSS、SAS、ASA、AAS和HL五种全等判定方法。",
    instructions: ["观察两个三角形", "选择不同的判定条件", "尝试让两个三角形重合", "观察AAA和SSA为什么不能判定全等"],
    guidedQuestions: ["哪些条件组合可以唯一确定一个三角形？", "为什么AAA不能判定全等？", "SSA在什么情况下可能有两个三角形？"],
    conclusion: "全等三角形的5种判定方法。AAA只判定相似，SSA一般不能判定。" },
  "jr-geo-pythagorean": {
    type: "pythagorean-lab", preset: "classic", title: "勾股定理实验",
    learningGoal: "用面积验证勾股定理：直角三角形两直角边的平方和等于斜边的平方。",
    instructions: ["保持三角形是直角（∠C=90°）", "观察三个正方形面积的变化", "验证a²+b²=c²"],
    guidedQuestions: ["两个小正方形面积之和与大正方形面积有什么关系？", "这个关系只在什么三角形中成立？", "如果a²+b²=c²，能否反过来判定三角形是直角三角形？"],
    conclusion: "在直角三角形中，两直角边平方和等于斜边平方。逆定理也成立。" },
  "jr-tc-similar": {
    type: "similarity-lab", preset: "scale", title: "相似三角形实验",
    learningGoal: "理解相似三角形的对应角相等、对应边成比例的性质。",
    instructions: ["调节相似比k", "观察两个三角形中对应的角和边", "注意周长比和面积比"],
    guidedQuestions: ["相似比为k时，对应边的比值是多少？周长比是多少？", "面积比为什么是k²而不是k？", "角度与相似比有关吗？"],
    conclusion: "相似比=k时，边长比、周长比=k，面积比=k²。对应角始终相等。" },
  "jr-tc-trig": {
    type: "right-triangle-trig", preset: "basic", title: "锐角三角函数实验",
    learningGoal: "理解sin、cos、tan的定义，掌握特殊角的三角函数值。",
    instructions: ["保持三角形为直角三角形", "选择参考角A", "观察对边、邻边和斜边的比值", "固定角度，改变三角形大小"],
    guidedQuestions: ["保持∠A=30°不变时，对边/斜边是常数吗？", "sinA=cos(90°-A)为什么成立？", "tanA与sinA/cosA有什么关系？"],
    conclusion: "在直角三角形中，三角函数值只与角的大小有关，与三角形大小无关。" },
  "jr-tc-circle": {
    type: "circle-theorem", preset: "inscribed", title: "圆的性质实验",
    learningGoal: "理解圆周角定理、垂径定理和直线与圆的位置关系。",
    instructions: ["拖动圆周上的点", "观察圆心角和圆周角的关系", "移动直线观察与圆的相交情况"],
    guidedQuestions: ["同一弧上的所有圆周角相等吗？", "圆周角与圆心角有什么倍数关系？", "直线在什么情况下与圆相切？"],
    conclusion: "同一弧上的圆周角相等且等于圆心角的一半。d>r相离，d=r相切，d<r相交。" },
  "sn-3d-volume": {
    type: "solid-geometry", preset: "shapes", title: "立体几何实验",
    learningGoal: "认识常见空间几何体，掌握表面积和体积公式。",
    instructions: ["选择几何体类型", "调整尺寸参数", "旋转观察几何体", "查看表面积和体积计算"],
    guidedQuestions: ["柱体和锥体体积之间有什么关系？", "球的表面积和体积公式有什么特点？", "旋转不同角度后，哪个面是底面？"],
    conclusion: "V柱=Sh，V锥=Sh/3，V球=4πr³/3。表面积和体积随尺寸变化。" },
};

export const SENIOR_VIS: Record<string, GeometryVisualizationConfig> = {
  "sn-sn-set-ops": {
    type: "function-graph", preset: "venn", title: "集合运算Venn图",
    learningGoal: "用Venn图直观理解集合的交集、并集和补集运算。",
    instructions: ["观察Venn图中不同区域的阴影", "理解A∩B和A∪B的区域", "理解补集∁UA"],
    guidedQuestions: ["A∩B对应图中的哪个区域？", "A∪B和A∩B的面积有什么关系？", "全集在Venn图中如何表示？"],
    conclusion: "A∩B = A和B的共同部分。A∪B = A和B的全部。∁UA = 全集中不在A的部分。" },
  "sn-sn-func-monotone": {
    type: "function-graph", preset: "monotone", title: "函数单调性实验",
    learningGoal: "通过函数图像直观理解单调递增和单调递减的含义。",
    instructions: ["在数学画布上绘制函数图像", "观察图像从左到右是上升还是下降", "用定义验证单调性"],
    guidedQuestions: ["图像上升时，x₁<x₂是否总有f(x₁)<f(x₂)？", "哪些函数既有递增区间又有递减区间？", "常数函数是单调的吗？"],
    conclusion: "单调递增：自变量增大，函数值也增大。单调递减：自变量增大，函数值减小。" },
  "sn-sn-trig-def": {
    type: "function-graph", preset: "unit-circle", title: "单位圆与三角函数",
    learningGoal: "用单位圆理解任意角三角函数的定义，掌握弧度制。",
    instructions: ["在数学画布中打开单位圆", "拖动终边观察角的变化", "同时观察sin和cos的值变化"],
    guidedQuestions: ["sin在哪些象限为正？cos呢？tan呢？", "终边旋转360°后三角函数值如何变化？", "弧度制和角度制如何换算？"],
    conclusion: "单位圆上点的坐标(x,y) = (cosθ, sinθ)。三角函数的周期性和符号由象限决定。" },
  "sn-sn-trig-graph": {
    type: "function-graph", preset: "trig-transform", title: "三角函数图像变换",
    learningGoal: "掌握y=Asin(ωx+φ)的图像与参数A、ω、φ的关系。",
    instructions: ["调整A、ω、φ的值", "观察振幅、周期和相位的变化"],
    guidedQuestions: ["A由1变为2时图像如何变化？", "ω由1变为2时周期如何变化？", "φ取不同值时图像怎么平移？"],
    conclusion: "A控制振幅，ω控制周期(T=2π/|ω|)，φ控制初相（水平平移）。" },
  "sn-sn-deriv-concept": {
    type: "function-graph", preset: "derivative-tangent", title: "导数概念实验",
    learningGoal: "通过割线逼近切线，理解导数的几何意义。",
    instructions: ["在数学画布中绘制函数", "拖动割线端点使之趋近切点", "观察割线斜率趋近切线斜率"],
    guidedQuestions: ["当h→0时，割线斜率趋近什么？", "导数f'(x₀)的几何意义是什么？", "哪些点处导数不存在？为什么？"],
    conclusion: "导数是函数在一点的切线斜率，反映瞬时变化率。" },
};

export function getVisConfig(kpId: string): GeometryVisualizationConfig | undefined {
  return JUNIOR_VIS[kpId] ?? SENIOR_VIS[kpId] ?? undefined;
}
