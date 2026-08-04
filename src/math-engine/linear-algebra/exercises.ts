import type { Exercise } from "./types";

export const EXERCISES: Exercise[] = [
  {
    id: "vec-01",
    chapterId: "vectors",
    difficulty: "basic",
    targetConcepts: ["向量表示"],
    question: "设 $\\vec{a} = (3, 4)$，则 $\\vec{a}$ 的坐标表示正确的是？",
    questionLatex: "\\vec{a} = (3, 4)",
    options: [
      { id: "a", text: "x=3, y=4", latex: "x=3, y=4" },
      { id: "b", text: "x=4, y=3", latex: "x=4, y=3" },
    ],
    answer: "a",
    answerLatex: "x=3, y=4",
    solution: [{ description: "向量 (3,4) 表示从原点出发，x方向移动3，y方向移动4", latex: "(3,4)" }],
    hints: ["向量 (x,y) 的第一个数字是x坐标", "向量 (3,4) 是 x=3, y=4"],
    errorAnalysis: { b: "你把x和y的坐标搞反了，向量 (x,y) 中第一个数是x坐标。" },
  },
  {
    id: "vec-02",
    chapterId: "vectors",
    difficulty: "basic",
    targetConcepts: ["向量加法"],
    question: "设 $\\vec{a} = (1, 2)$，$\\vec{b} = (3, 1)$，则 $\\vec{a} + \\vec{b} = ?$",
    questionLatex: "\\vec{a}=(1,2),\\ \\vec{b}=(3,1)",
    options: [
      { id: "a", text: "(4, 3)", latex: "(4, 3)" },
      { id: "b", text: "(2, 3)", latex: "(2, 3)" },
    ],
    answer: "a",
    answerLatex: "(4, 3)",
    solution: [
      { description: "向量加法：对应分量相加", latex: "" },
      { description: "x分量：1 + 3 = 4", latex: "1+3=4" },
      { description: "y分量：2 + 1 = 3", latex: "2+1=3" },
    ],
    hints: ["向量加法是分量对应相加", "x分量=1+3=4, y分量=?"],
    errorAnalysis: { b: "y分量计算：2+1=3，所以是 (4,3)。" },
  },
  {
    id: "vec-03",
    chapterId: "vectors",
    difficulty: "basic",
    targetConcepts: ["向量数乘"],
    question: "设 $\\vec{v} = (2, -3)$，则 $3\\vec{v} = ?$",
    questionLatex: "\\vec{v}=(2,-3),\\ 3\\vec{v}=?",
    options: [
      { id: "a", text: "(6, -9)", latex: "(6, -9)" },
      { id: "b", text: "(5, 0)", latex: "(5, 0)" },
    ],
    answer: "a",
    answerLatex: "(6, -9)",
    solution: [
      { description: "数乘：每个分量都乘以标量3", latex: "" },
      { description: "x分量：3 × 2 = 6", latex: "3 \\times 2 = 6" },
      { description: "y分量：3 × (-3) = -9", latex: "3 \\times (-3) = -9" },
    ],
    hints: ["数乘是将向量的每个分量都乘以该数", "注意负号的运算：3×(-3) = -9"],
    errorAnalysis: { b: "数乘不是加法，(2,-3)的每个分量乘以3，不是加上3。" },
  },
  {
    id: "vec-04",
    chapterId: "vectors",
    difficulty: "basic",
    targetConcepts: ["向量长度"],
    question: "向量 $\\vec{v} = (3, 4)$ 的长度（模）是多少？",
    questionLatex: "\\vec{v} = (3, 4)",
    options: [
      { id: "a", text: "5", latex: "5" },
      { id: "b", text: "7", latex: "7" },
    ],
    answer: "a",
    answerLatex: "5",
    solution: [
      { description: "向量长度公式：", latex: "\\|\\vec{v}\\| = \\sqrt{x^2 + y^2}" },
      { description: "代入：", latex: "\\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5" },
    ],
    hints: ["长度的计算公式是 $\\sqrt{x^2 + y^2}$", "$3^2 + 4^2 = 9 + 16 = 25$"],
    errorAnalysis: { b: "不能直接把分量相加！长度要用平方再开根号。" },
  },
  {
    id: "vec-05",
    chapterId: "vectors",
    difficulty: "comprehension",
    targetConcepts: ["点积", "夹角"],
    question: "已知 $\\vec{a} = (1, 0)$，$\\vec{b} = (0, 1)$，它们的夹角是多少度？",
    questionLatex: "\\vec{a}=(1,0),\\ \\vec{b}=(0,1)",
    options: [
      { id: "a", text: "90°", latex: "90^\\circ" },
      { id: "b", text: "0°", latex: "0^\\circ" },
    ],
    answer: "a",
    answerLatex: "90^\\circ",
    solution: [
      { description: "计算点积：", latex: "\\vec{a} \\cdot \\vec{b} = 1 \\times 0 + 0 \\times 1 = 0" },
      { description: "点积为0，说明两向量正交（垂直），夹角为90°", latex: "" },
    ],
    hints: ["计算点积 a·b", "如果点积为0，说明两向量垂直"],
    errorAnalysis: { b: "夹角0°意味着两向量方向完全相同，但 (1,0) 和 (0,1) 方向明显不同。" },
  },
  {
    id: "vec-06",
    chapterId: "vectors",
    difficulty: "comprehension",
    targetConcepts: ["线性组合"],
    question: "$\\vec{a}=(1,0),\\vec{b}=(0,1)$，下列哪个向量是 $2\\vec{a}+3\\vec{b}$？",
    questionLatex: "2\\vec{a}+3\\vec{b},\\ \\vec{a}=(1,0),\\ \\vec{b}=(0,1)",
    options: [
      { id: "a", text: "(2, 3)", latex: "(2, 3)" },
      { id: "b", text: "(3, 2)", latex: "(3, 2)" },
    ],
    answer: "a",
    answerLatex: "(2, 3)",
    solution: [
      { description: "$2\\vec{a} = 2×(1,0) = (2,0)$", latex: "2(1,0)=(2,0)" },
      { description: "$3\\vec{b} = 3×(0,1) = (0,3)$", latex: "3(0,1)=(0,3)" },
      { description: "$2\\vec{a}+3\\vec{b} = (2,0)+(0,3) = (2,3)$", latex: "(2,0)+(0,3)=(2,3)" },
    ],
    hints: ["先分别计算数乘，再相加", "$\\vec{a}$ 和 $\\vec{b}$ 是标准基向量"],
    errorAnalysis: { b: "你把系数写反了。$2\\vec{a}$ 给你x坐标2，$3\\vec{b}$ 给你y坐标3。" },
  },
  {
    id: "mat-01",
    chapterId: "matrices",
    difficulty: "basic",
    targetConcepts: ["矩阵元素"],
    question: "矩阵 $A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$ 中，元素 $a_{21}$ 的值是？",
    questionLatex: "A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix},\\ a_{21}=?",
    options: [
      { id: "a", text: "3", latex: "3" },
      { id: "b", text: "2", latex: "2" },
    ],
    answer: "a",
    answerLatex: "3",
    solution: [{ description: "$a_{21}$ 是第2行第1列，即3", latex: "a_{21}=3" }],
    hints: ["$a_{ij}$ 中 i 是行号，j 是列号", "第2行第1列是什么？"],
    errorAnalysis: { b: "$a_{12}$ 才是2（第1行第2列）。$a_{21}$ 是第2行第1列。" },
  },
  {
    id: "mat-02",
    chapterId: "matrices",
    difficulty: "basic",
    targetConcepts: ["矩阵乘法"],
    question:
      "$A = \\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}, B = \\begin{pmatrix} 3 & 1 \\\\ 2 & 4 \\end{pmatrix}$，求 $AB$。",
    questionLatex: "A = \\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix},\\ B = \\begin{pmatrix} 3 & 1 \\\\ 2 & 4 \\end{pmatrix}",
    options: [
      { id: "a", text: "等于B本身", latex: "B" },
      { id: "b", text: "等于单位矩阵", latex: "I" },
    ],
    answer: "a",
    answerLatex: "AB = B",
    solution: [
      { description: "A是单位矩阵，单位矩阵乘以任何矩阵等于该矩阵本身", latex: "I \\cdot B = B" },
    ],
    hints: ["A是单位矩阵（对角线上全是1）", "想一想：单位矩阵I乘以任意矩阵A，结果是什么？"],
    errorAnalysis: { b: "单位矩阵乘以另一个矩阵，结果不是单位矩阵。单位矩阵在乘法中起'数1'的作用。" },
  },
  {
    id: "mat-03",
    chapterId: "matrices",
    difficulty: "comprehension",
    targetConcepts: ["矩阵乘法不交换"],
    question: "设 $A = \\begin{pmatrix} 1 & 2 \\\\ 0 & 1 \\end{pmatrix}, B = \\begin{pmatrix} 1 & 0 \\\\ 1 & 1 \\end{pmatrix}$，则：",
    questionLatex: "A = \\begin{pmatrix} 1 & 2 \\\\ 0 & 1 \\end{pmatrix}, B = \\begin{pmatrix} 1 & 0 \\\\ 1 & 1 \\end{pmatrix}",
    options: [
      { id: "a", text: "AB ≠ BA", latex: "AB \\neq BA" },
      { id: "b", text: "AB = BA", latex: "AB = BA" },
    ],
    answer: "a",
    answerLatex: "AB \\neq BA",
    solution: [
      {
        description: "AB = [[3,2],[1,1]]，BA = [[1,2],[1,3]]，不相等",
        latex: "AB \\neq BA",
      },
    ],
    hints: ["分别计算AB和BA", "比较两个结果是否相同"],
    errorAnalysis: { b: "请实际计算一下AB和BA的结果，它们并不相同。" },
  },
  {
    id: "sys-01",
    chapterId: "linear-systems",
    difficulty: "basic",
    targetConcepts: ["方程组矩阵表示"],
    question: "方程组 $\\begin{cases} 2x + y = 5 \\\\ x - y = 1 \\end{cases}$ 的矩阵形式 Ax = b 中，A 是什么？",
    questionLatex: "\\begin{cases} 2x + y = 5 \\\\ x - y = 1 \\end{cases}",
    options: [
      { id: "a", text: "[[2,1],[1,-1]]", latex: "\\begin{pmatrix} 2 & 1 \\\\ 1 & -1 \\end{pmatrix}" },
      { id: "b", text: "[[2,1,5],[1,-1,1]]", latex: "\\begin{pmatrix} 2&1&5\\\\1&-1&1 \\end{pmatrix}" },
    ],
    answer: "a",
    answerLatex: "A = \\begin{pmatrix} 2 & 1 \\\\ 1 & -1 \\end{pmatrix}",
    solution: [
      { description: "系数矩阵A由方程组的系数组成", latex: "" },
      { description: "第一行来自 $2x+1y=5$：系数是 2 和 1", latex: "" },
      { description: "第二行来自 $1x+(-1)y=1$：系数是 1 和 -1", latex: "" },
    ],
    hints: ["系数矩阵只包含变量的系数", "常数项是单独的向量b"],
    errorAnalysis: { b: "这是增广矩阵（包含了常数项），系数矩阵A只包含变量的系数。" },
  },
  {
    id: "sys-02",
    chapterId: "linear-systems",
    difficulty: "basic",
    targetConcepts: ["高斯消元"],
    question: "用高斯消元法解 $\\begin{cases} x + y = 3 \\\\ x - y = 1 \\end{cases}$，x = ?",
    questionLatex: "\\begin{cases} x + y = 3 \\\\ x - y = 1 \\end{cases}",
    options: [
      { id: "a", text: "2", latex: "x=2" },
      { id: "b", text: "3", latex: "x=3" },
    ],
    answer: "a",
    answerLatex: "x=2, y=1",
    solution: [
      { description: "方程(1)+(2)：$(x+y)+(x-y)=3+1 \\Rightarrow 2x = 4$", latex: "2x = 4" },
      { description: "得 $x=2$，代入得 $y=1$", latex: "x = 2, y = 1" },
    ],
    hints: ["把两个方程相加可以消去y", "消去y后得到关于x的一元一次方程"],
    errorAnalysis: { b: "如果x=3，代入方程(1)得3+y=3，y=0，代入(2)得3-0≠1。" },
  },
  {
    id: "sys-03",
    chapterId: "linear-systems",
    difficulty: "comprehension",
    targetConcepts: ["解集几何意义"],
    question: "方程组 $\\begin{cases} x + y = 2 \\\\ 2x + 2y = 4 \\end{cases}$ 有多少解？",
    questionLatex: "\\begin{cases} x + y = 2 \\\\ 2x + 2y = 4 \\end{cases}",
    options: [
      { id: "a", text: "无穷多解", latex: "\\text{无穷多解}" },
      { id: "b", text: "唯一解", latex: "\\text{唯一解}" },
    ],
    answer: "a",
    answerLatex: "\\text{无穷多解}",
    solution: [
      { description: "第二个方程就是把第一个方程的每一项都乘以2", latex: "2(x+y)=2(2)" },
      { description: "两个方程描述的是同一条直线，线上每一点都是解", latex: "" },
    ],
    hints: ["比较两个方程的关系", "第二个方程是否可以用第一个方程推导出来？"],
    errorAnalysis: { b: "两个方程实际上是同一个方程的两倍，描述的是同一条直线。" },
  },
  {
    id: "det-01",
    chapterId: "determinants",
    difficulty: "basic",
    targetConcepts: ["二阶行列式"],
    question: "计算 $\\det\\begin{pmatrix} 3 & 1 \\\\ 2 & 4 \\end{pmatrix}$",
    questionLatex: "\\det\\begin{pmatrix} 3 & 1 \\\\ 2 & 4 \\end{pmatrix}",
    options: [
      { id: "a", text: "10", latex: "10" },
      { id: "b", text: "14", latex: "14" },
    ],
    answer: "a",
    answerLatex: "10",
    solution: [
      { description: "二阶行列式公式：$ad - bc$", latex: "\\det = ad - bc" },
      { description: "$3×4 - 1×2 = 12 - 2 = 10$", latex: "= 10" },
    ],
    hints: ["公式：a×d - b×c", "3×4 - 1×2 = ?"],
    errorAnalysis: { b: "你可能把公式记成了 a×d + b×c，正确的是 ad - bc。" },
  },
  {
    id: "det-02",
    chapterId: "determinants",
    difficulty: "comprehension",
    targetConcepts: ["行列式几何意义"],
    question: "矩阵 $\\begin{pmatrix} 2 & 0 \\\\ 0 & 3 \\end{pmatrix}$ 的行列式为6，表示什么？",
    questionLatex: "A = \\begin{pmatrix} 2 & 0 \\\\ 0 & 3 \\end{pmatrix},\\ \\det(A)=6",
    options: [
      { id: "a", text: "单位正方形面积变为6倍", latex: "\\text{面积变为6倍}" },
      { id: "b", text: "正方形边长为6", latex: "\\text{边长为6}" },
    ],
    answer: "a",
    answerLatex: "\\text{单位正方形面积扩大为原来的6倍}",
    solution: [
      { description: "行列式的绝对值等于变换后面积的缩放因子", latex: "" },
      { description: "该矩阵把1×1正方形变成2×3矩形，面积=6=det(A)", latex: "" },
    ],
    hints: ["行列式的几何意义是面积缩放比例", "det=ad-bc，这里是2×3-0×0=6"],
    errorAnalysis: { b: "边长分别是2和3，面积是6。行列式表示面积，不是边长。" },
  },
  {
    id: "ev-01",
    chapterId: "eigenvalues",
    difficulty: "basic",
    targetConcepts: ["特征向量概念"],
    question: "对于 $A = \\begin{pmatrix} 2 & 0 \\\\ 0 & 3 \\end{pmatrix}$，哪个向量在A的作用下方向不变？",
    questionLatex: "A = \\begin{pmatrix} 2 & 0 \\\\ 0 & 3 \\end{pmatrix}",
    options: [
      { id: "a", text: "(1, 0)", latex: "\\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}" },
      { id: "b", text: "(1, 1)", latex: "\\begin{pmatrix} 1 \\\\ 1 \\end{pmatrix}" },
    ],
    answer: "a",
    answerLatex: "A(1,0) = 2(1,0)",
    solution: [
      { description: "验证 (1,0)：$A(1,0) = (2,0) = 2(1,0)$，方向不变", latex: "" },
      { description: "验证 (1,1)：$A(1,1) = (2,3)$，方向变了", latex: "" },
    ],
    hints: ["特征向量满足 $A\\vec{v} = \\lambda\\vec{v}$", "对角矩阵的特征向量就是标准基向量"],
    errorAnalysis: { b: "$A(1,1)=(2,3)$，不等于任何倍数倍的(1,1)，方向改变了。" },
  },
  {
    id: "app-01",
    chapterId: "applications",
    difficulty: "application",
    targetConcepts: ["最小二乘"],
    question: "对于数据点 (1,1), (2,2), (3,2)，用最小二乘法拟合的直线斜率约为？",
    questionLatex: "(1,1), (2,2), (3,2)",
    options: [
      { id: "a", text: "0.5", latex: "0.5" },
      { id: "b", text: "1", latex: "1" },
    ],
    answer: "a",
    answerLatex: "k \\approx 0.5",
    solution: [
      { description: "正规方程解得 $k = 0.5, b \\approx 0.833$", latex: "y = 0.5x + 0.833" },
    ],
    hints: ["使用最小二乘公式", "斜率 = (n∑xy - ∑x∑y) / (n∑x² - (∑x)²)"],
    errorAnalysis: { b: "虽然点大致在y=x附近，但(3,2)偏离了，最小二乘考虑了所有点的误差。" },
  },
];

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randNonZero(min: number, max: number): number {
  let v = 0;
  while (v === 0) v = randInt(min, max);
  return v;
}

export function generateVectorExercise(difficulty: Exercise["difficulty"]): Exercise {
  if (difficulty === "basic") {
    const x = randInt(1, 8);
    const y = randInt(1, 8);
    const sx = randInt(-5, 5);
    const sy = randInt(-5, 5);
    return {
      id: `vec_gen_${Date.now()}`,
      chapterId: "vectors",
      difficulty: "basic",
      targetConcepts: ["向量加法"],
      question: `已知向量 a = (${x}, ${y})，b = (${sx}, ${sy})，求 a + b`,
      questionLatex: `\\vec{a} = (${x}, ${y}),\\ \\vec{b} = (${sx}, ${sy})，求 \\vec{a} + \\vec{b}`,
      options: [
        { id: "a", text: `(${x + sx}, ${y + sy})`, latex: `(${x + sx}, ${y + sy})` },
        { id: "b", text: `(${x - sx}, ${y - sy})`, latex: `(${x - sx}, ${y - sy})` },
        { id: "c", text: `(${x * sx}, ${y * sy})`, latex: `(${x * sx}, ${y * sy})` },
        { id: "d", text: `(${x + y}, ${sx + sy})`, latex: `(${x + y}, ${sx + sy})` },
      ],
      answer: "a",
      answerLatex: `(${x + sx}, ${y + sy})`,
      solution: [
        { description: "向量加法：对应分量相加", latex: `\\vec{a} + \\vec{b} = (x_1 + x_2, y_1 + y_2)` },
        { description: `x 分量：${x} + (${sx})`, latex: `${x} + (${sx}) = ${x + sx}` },
        { description: `y 分量：${y} + (${sy})`, latex: `${y} + (${sy}) = ${y + sy}` },
        { description: "结果", latex: `(${x + sx}, ${y + sy})` },
      ],
      hints: ["向量加法是分量对应相加", `例如 (1,2) + (3,4) = (4,6)`],
      errorAnalysis: {
        b: "你把加法做成了减法。向量加法是分量相加，不是相减。",
        c: "你把加法做成了乘法。向量加法是分量相加，不是相乘。",
        d: "你混淆了分量的对应关系。向量加法是第一个分量加第一个分量。",
      },
    };
  }
  if (difficulty === "comprehension") {
    const ax = randNonZero(-5, 5);
    const ay = randNonZero(-5, 5);
    const bx = randNonZero(-5, 5);
    const by = randNonZero(-5, 5);
    const dot = ax * bx + ay * by;
    const normA = Math.sqrt(ax * ax + ay * ay);
    const normB = Math.sqrt(bx * bx + by * by);
    const cosTheta = dot / (normA * normB);
    const angle = Math.round((Math.acos(cosTheta) * 180) / Math.PI);
    return {
      id: `vec_gen_${Date.now()}`,
      chapterId: "vectors",
      difficulty: "comprehension",
      targetConcepts: ["点积", "夹角"],
      question: `已知 a = (${ax}, ${ay})，b = (${bx}, ${by})，求 a·b 及夹角（角度取整）`,
      questionLatex: `\\vec{a}=(${ax},${ay}),\\ \\vec{b}=(${bx},${by})，求\\vec{a}\\cdot\\vec{b}与\\theta`,
      answer: `${dot}`,
      answerLatex: `\\vec{a}\\cdot\\vec{b}=${dot},\\ \\theta\\approx${angle}^\\circ`,
      solution: [
        { description: "点积公式", latex: `\\vec{a}\\cdot\\vec{b}=a_1 b_1+a_2 b_2` },
        { description: `代入：${ax}×${bx}+${ay}×${by}`, latex: `${ax * bx}+${ay * by}=${dot}` },
        { description: `|a|≈${normA.toFixed(1)}, |b|≈${normB.toFixed(1)}`, latex: `\\cos\\theta=${cosTheta.toFixed(3)}` },
        { description: `θ ≈ ${angle}°`, latex: `\\theta\\approx${angle}^\\circ` },
      ],
      hints: ["点积 = 对应分量相乘再相加", "cosθ = (a·b)/(|a||b|)"],
      errorAnalysis: {},
    };
  }
  const ax = randNonZero(-3, 3);
  const ay = randNonZero(-3, 3);
  return {
    id: `vec_gen_${Date.now()}`,
    chapterId: "vectors",
    difficulty: "application",
    targetConcepts: ["线性组合"],
    question: `向量 a=(${ax},${ay}), b=(${ay},${-ax})。a 和 b 有何关系？`,
    questionLatex: `\\vec{a}=(${ax},${ay}),\\ \\vec{b}=(${ay},${-ax})`,
    answer: "正交",
    answerLatex: `\\vec{a}\\cdot\\vec{b}=0，正交`,
    solution: [
      { description: `计算点积`, latex: `\\vec{a}\\cdot\\vec{b}=${ax}\\times${ay}+${ay}\\times(${-ax})=0` },
      { description: "点积为零，正交", latex: `\\therefore\\vec{a}\\perp\\vec{b}` },
    ],
    hints: ["计算 a·b", "点积为零意味着什么？"],
    errorAnalysis: {},
  };
}

export function generateMatrixExercise(difficulty: Exercise["difficulty"]): Exercise {
  const a = randNonZero(-3, 5);
  const b = randInt(-3, 5);
  const c = randInt(-3, 5);
  const d = randNonZero(-3, 5);
  const e = randInt(-3, 5);
  const f = randInt(-3, 5);
  const g = randInt(-3, 5);
  const h = randInt(-3, 5);

  if (difficulty === "basic") {
    return {
      id: `mat_gen_${Date.now()}`,
      chapterId: "matrices",
      difficulty: "basic",
      targetConcepts: ["矩阵乘法"],
      question: `求 ┌${a} ${b}┐ × ┌${e} ${f}┐\n    └${c} ${d}┘   └${g} ${h}┘`,
      questionLatex: `\\begin{pmatrix}${a}&${b}\\\\${c}&${d}\\end{pmatrix}\\begin{pmatrix}${e}&${f}\\\\${g}&${h}\\end{pmatrix}`,
      answer: `${a * e + b * g},${a * f + b * h},${c * e + d * g},${c * f + d * h}`,
      answerLatex: `\\begin{pmatrix}${a * e + b * g}&${a * f + b * h}\\\\${c * e + d * g}&${c * f + d * h}\\end{pmatrix}`,
      solution: [
        { description: `[1,1]:${a}×${e}+${b}×${g}=${a * e + b * g}`, latex: `${a * e + b * g}` },
        { description: `[1,2]:${a}×${f}+${b}×${h}=${a * f + b * h}`, latex: `${a * f + b * h}` },
        { description: `[2,1]:${c}×${e}+${d}×${g}=${c * e + d * g}`, latex: `${c * e + d * g}` },
        { description: `[2,2]:${c}×${f}+${d}×${h}=${c * f + d * h}`, latex: `${c * f + d * h}` },
      ],
      hints: ["矩阵乘法 = 行×列点积"],
      errorAnalysis: {},
    };
  }
  const det = a * d - b * c;
  const invertible = Math.abs(det) > 0.001;
  return {
    id: `mat_gen_${Date.now()}`,
    chapterId: "matrices",
    difficulty: "comprehension",
    targetConcepts: ["逆矩阵", "行列式"],
    question: `A=┌${a} ${b}┐，判断是否可逆。\n    └${c} ${d}┘`,
    questionLatex: `A=\\begin{pmatrix}${a}&${b}\\\\${c}&${d}\\end{pmatrix}`,
    answer: invertible ? "可逆" : "不可逆",
    answerLatex: invertible ? `\\det=${det}\\neq0，可逆` : `\\det=${det}=0，不可逆`,
    solution: [
      { description: `行列式：${a}×${d}-${b}×${c}=${det}`, latex: `\\det(A)=${det}` },
      ...(invertible
        ? [{ description: "det≠0，可逆", latex: `\\text{可逆}` }]
        : [{ description: "det=0，不可逆", latex: `\\text{不可逆}` }]),
    ],
    hints: ["计算行列式", "det≠0 → 可逆"],
    errorAnalysis: {},
  };
}

export function generateLinearSystemExercise(difficulty: Exercise["difficulty"]): Exercise {
  const x = randInt(1, 6);
  const y = randInt(1, 6);
  const a = randNonZero(1, 3);
  const b_ = randNonZero(1, 3);
  const c1 = a * x + b_ * y;
  const d_ = randNonZero(1, 3);
  const e_ = randNonZero(1, 3);
  const f_ = d_ * x + e_ * y;
  if (difficulty === "basic") {
    return {
      id: `sys_gen_${Date.now()}`,
      chapterId: "linear-systems",
      difficulty: "basic",
      targetConcepts: ["线性方程组"],
      question: `解方程组：${a}x+${b_}y=${c1}, ${d_}x+${e_}y=${f_}`,
      questionLatex: `\\begin{cases}${a}x+${b_}y=${c1}\\\\${d_}x+${e_}y=${f_}\\end{cases}`,
      answer: `x=${x},y=${y}`,
      answerLatex: `x=${x},y=${y}`,
      solution: [
        { description: "增广矩阵", latex: `\\left[\\begin{matrix}${a}&${b_}&\\vert&${c1}\\\\${d_}&${e_}&\\vert&${f_}\\end{matrix}\\right]` },
        { description: `解得`, latex: `x=${x}, y=${y}` },
      ],
      hints: ["用消元法", "先消去一个变量"],
      errorAnalysis: {},
    };
  }
  const k = randNonZero(1, 3);
  const m = randInt(1, 5);
  const cc1 = k * m;
  const cc2 = cc1 + randNonZero(1, 3);
  return {
    id: `sys_gen_${Date.now()}`,
    chapterId: "linear-systems",
    difficulty: "comprehension",
    targetConcepts: ["无解"],
    question: `判断：x+y=${cc1}, x+y=${cc2} 有解吗？`,
    questionLatex: `\\begin{cases}x+y=${cc1}\\\\x+y=${cc2}\\end{cases}`,
    answer: "无解",
    answerLatex: `无解（左边相同右边不同）`,
    solution: [
      { description: "两方程左边相同但右边不同", latex: `x+y不能同时等于${cc1}和${cc2}` },
    ],
    hints: ["比较两个方程左边", "左边一样，右边一样吗？"],
    errorAnalysis: {},
  };
}

export function generateDeterminantExercise(difficulty: Exercise["difficulty"]): Exercise {
  const a = randNonZero(-4, 4);
  const b_ = randInt(-4, 4);
  const c = randInt(-4, 4);
  const d = randNonZero(-4, 4);
  const det = a * d - b_ * c;
  if (difficulty === "basic") {
    return {
      id: `det_gen_${Date.now()}`,
      chapterId: "determinants",
      difficulty: "basic",
      targetConcepts: ["二阶行列式"],
      question: `计算 |${a} ${b_}|\n     |${c} ${d}|`,
      questionLatex: `\\det\\begin{pmatrix}${a}&${b_}\\\\${c}&${d}\\end{pmatrix}`,
      answer: `${det}`,
      answerLatex: `${det}`,
      solution: [
        { description: `ad-bc=${a}×${d}-${b_}×${c}`, latex: `${det}` },
      ],
      hints: ["二阶行列式 = ad - bc"],
      errorAnalysis: {},
    };
  }
  const area = Math.abs(det);
  return {
    id: `det_gen_${Date.now()}`,
    chapterId: "determinants",
    difficulty: "comprehension",
    targetConcepts: ["行列式几何意义"],
    question: `矩阵┌${a} ${b_}┐把单位正方形变成平行四边形，面积是多少？\n    └${c} ${d}┘`,
    questionLatex: `\\begin{pmatrix}${a}&${b_}\\\\${c}&${d}\\end{pmatrix}`,
    answer: `${area}`,
    answerLatex: `面积=|\\det|=${area}`,
    solution: [
      { description: `|det|=|${det}|=${area}`, latex: `\\text{面积}=${area}` },
    ],
    hints: ["面积缩放因子 = |行列式|"],
    errorAnalysis: {},
  };
}

export function generateEigenExercise(difficulty: Exercise["difficulty"]): Exercise {
  if (difficulty === "basic") {
    return {
      id: `ev_gen_${Date.now()}`,
      chapterId: "eigenvalues",
      difficulty: "basic",
      targetConcepts: ["特征值概念"],
      question: `对A=┌2 0┐，v=(1,0)。A作用于v后方向是否改变？\n      └0 3┘`,
      questionLatex: `A=\\begin{pmatrix}2&0\\\\0&3\\end{pmatrix},v=\\begin{pmatrix}1\\\\0\\end{pmatrix}`,
      answer: "不变",
      answerLatex: `Av=2v，方向不变，特征值2`,
      solution: [
        { description: "Av=(2,0)=2v", latex: `Av=2v` },
        { description: "是特征向量，特征值2", latex: `\\lambda=2` },
      ],
      hints: ["计算Av", "看结果是不是v的倍数"],
      errorAnalysis: {},
    };
  }
  const a = randNonZero(1, 4);
  const b_ = randInt(0, 3);
  const c = randInt(0, 3);
  const d = randNonZero(1, 4);
  const trace = a + d;
  const detM = a * d - b_ * c;
  const disc = trace * trace - 4 * detM;
  return {
    id: `ev_gen_${Date.now()}`,
    chapterId: "eigenvalues",
    difficulty: "comprehension",
    targetConcepts: ["求特征值"],
    question: `求A=┌${a} ${b_}┐的特征值\n     └${c} ${d}┘`,
    questionLatex: `A=\\begin{pmatrix}${a}&${b_}\\\\${c}&${d}\\end{pmatrix}`,
    answer: disc >= 0 ? `λ₁≈${((trace + Math.sqrt(disc)) / 2).toFixed(1)}` : "复数特征值",
    answerLatex: disc >= 0
      ? `\\lambda_1=${((trace + Math.sqrt(disc)) / 2).toFixed(2)},\\lambda_2=${((trace - Math.sqrt(disc)) / 2).toFixed(2)}`
      : `\\lambda=${(trace / 2).toFixed(2)}\\pm${(Math.sqrt(-disc) / 2).toFixed(2)}i`,
    solution: [
      { description: "特征方程", latex: `\\det(A-\\lambda I)=0` },
      { description: `λ²-${trace}λ+${detM}=0`, latex: `解:\\lambda=\\frac{${trace}\\pm\\sqrt{${disc.toFixed(1)}}}{2}` },
    ],
    hints: ["解 det(A-λI)=0", "展开得二次方程"],
    errorAnalysis: {},
  };
}