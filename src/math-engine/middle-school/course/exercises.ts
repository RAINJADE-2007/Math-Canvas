import type { MiddleExercise } from "./types";

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randNonZero(min: number, max: number): number {
  let v = 0;
  while (v === 0) v = randInt(min, max);
  return v;
}

export function generateNumberExercise(difficulty: MiddleExercise["difficulty"]): MiddleExercise {
  if (difficulty === "basic") {
    const a = randInt(-20, 20);
    const b = randInt(-20, 20);
    return {
      id: `num_${Date.now()}`,
      chapterId: "numbers",
      difficulty: "basic",
      targetConcepts: ["绝对值"],
      question: `|${a}| + |${b}| = ?`,
      questionLatex: `|${a}| + |${b}|`,
      options: [
        { id: "a", text: `${Math.abs(a) + Math.abs(b)}`, latex: `${Math.abs(a) + Math.abs(b)}` },
        { id: "b", text: `${a + b}`, latex: `${a + b}` },
        { id: "c", text: `${Math.abs(a + b)}`, latex: `${Math.abs(a + b)}` },
        { id: "d", text: `${a * b}`, latex: `${a * b}` },
      ],
      answer: "a",
      answerLatex: `${Math.abs(a) + Math.abs(b)}`,
      solution: [
        { description: `|${a}|=${Math.abs(a)}`, latex: `|${a}| = ${Math.abs(a)}` },
        { description: `|${b}|=${Math.abs(b)}`, latex: `|${b}| = ${Math.abs(b)}` },
        { description: `和=${Math.abs(a) + Math.abs(b)}`, latex: `${Math.abs(a)} + ${Math.abs(b)} = ${Math.abs(a) + Math.abs(b)}` },
      ],
      hints: ["先计算每个数的绝对值", "正数的绝对值是它自己，负数的绝对值是它的相反数"],
      errorAnalysis: {
        b: `不能直接把${a}和${b}加起来，绝对值要先去绝对值符号。`,
        c: "绝对值是和，不是和的绝对值。先各自去绝对值再相加。",
        d: "是绝对值相加，不是相乘。",
      },
    };
  }
  if (difficulty === "comprehension") {
    const x = randInt(1, 15);
    const a = randInt(2, 4);
    const b = randNonZero(-3, 3);
    const correct = a * x + b;
    const wrongs = [correct + randNonZero(1, 3), correct - randNonZero(1, 3), correct + randInt(-2, 2) * 2 + 1];
    return {
      id: `num_comp_${Date.now()}`,
      chapterId: "numbers",
      difficulty: "comprehension",
      targetConcepts: ["整式运算"],
      question: `当x=${x}时，${a}x${b >= 0 ? "+" : ""}${b} = ?`,
      questionLatex: `${a} \\times ${x} ${b >= 0 ? "+" : ""} ${b}`,
      options: [
        { id: "a", text: `${correct}`, latex: `${correct}` },
        { id: "b", text: `${wrongs[0]}`, latex: `${wrongs[0]}` },
        { id: "c", text: `${wrongs[1]}`, latex: `${wrongs[1]}` },
        { id: "d", text: `${wrongs[2]}`, latex: `${wrongs[2]}` },
      ],
      answer: "a",
      answerLatex: `${correct}`,
      solution: [
        { description: "代入x的值", latex: `${a} \\times ${x} ${b >= 0 ? "+" : ""} (${b})` },
        { description: "计算", latex: `= ${a * x} ${b >= 0 ? "+" : ""} ${b} = ${correct}` },
      ],
      hints: ["先算乘法再算加法", "代入x的值进行计算"],
      errorAnalysis: {},
    };
  }
  const n = randNonZero(2, 8);
  const a = randNonZero(1, 4);
  const b = randInt(1, 5);
  const correct1 = n * a;
  const correct2 = n * b;
  return {
    id: `num_app_${Date.now()}`,
    chapterId: "numbers",
    difficulty: "application",
    targetConcepts: ["因式分解"],
    question: `分解因式：${n * a}x + ${n * b}`,
    questionLatex: `${n * a}x + ${n * b}`,
    answer: `${n}(${a}x+${b})`,
    answerLatex: `${n}(${a}x + ${b})`,
    solution: [
      { description: "找出公因式", latex: `\\gcd(${n * a}, ${n * b}) = ${n}` },
      { description: "提取公因式", latex: `${n}(${a}x + ${b})` },
    ],
    hints: ["找出两项的最大公因数", "将公因数提取到括号外面"],
    errorAnalysis: {},
  };
}

export function generateEquationExercise(difficulty: MiddleExercise["difficulty"]): MiddleExercise {
  if (difficulty === "basic") {
    const a = randNonZero(1, 5);
    const b = randInt(2, 15);
    const c = randInt(1, 10);
    const x = (c - b) / a;
    if (!Number.isInteger(x) || Math.abs(x) > 15) {
      return generateEquationExercise("basic");
    }
    const signs: string[] = [];
    if (b >= 0) signs.push("+");
    const eqStr = `${a}x${b >= 0 ? "+" : ""}${b}=${c}`;
    return {
      id: `eq_${Date.now()}`,
      chapterId: "equations",
      difficulty: "basic",
      targetConcepts: ["一元一次方程"],
      question: `解方程：${eqStr}`,
      questionLatex: `${a > 1 ? a : ""}x ${b >= 0 ? "+" : ""} ${b} = ${c}`,
      options: [
        { id: "a", text: `x = ${x}`, latex: `x = ${x}` },
        { id: "b", text: `x = ${-x}`, latex: `x = ${-x}` },
      ],
      answer: "a",
      answerLatex: `x = ${x}`,
      solution: [
        { description: "移项", latex: `${a}x = ${c} - (${b}) = ${c - b}` },
        { description: "系数化为1", latex: `x = \\frac{${c - b}}{${a}} = ${x}` },
      ],
      hints: [`移项：将${b}移到右边`, `两边除以${a}`],
      errorAnalysis: { b: "移项时符号出错了，需要检查正负号。" },
    };
  }
  if (difficulty === "comprehension") {
    const a = randNonZero(1, 3);
    const b = randInt(1, 4);
    const c = a * a + b * b;
    const discriminant = 4 * b * b - 4 * a * c;
    if (discriminant < 0 || !Number.isInteger(Math.sqrt(discriminant))) {
      return generateEquationExercise("comprehension");
    }
    const sqrtD = Math.sqrt(discriminant);
    const x1 = (2 * b + sqrtD) / (2 * a);
    const x2 = (2 * b - sqrtD) / (2 * a);
    if (!Number.isInteger(x1) || !Number.isInteger(x2)) {
      return generateEquationExercise("comprehension");
    }
    return {
      id: `eq_quad_${Date.now()}`,
      chapterId: "equations",
      difficulty: "comprehension",
      targetConcepts: ["一元二次方程"],
      question: `解方程：${a}x² ${-2 * b >= 0 ? "+" : ""} ${-2 * b}x ${c >= 0 ? "+" : ""} ${c} = 0`,
      questionLatex: `${a > 1 ? a : ""}x^2 ${-2 * b >= 0 ? "+" : ""} ${-2 * b}x ${c >= 0 ? "+" : ""} ${c} = 0`,
      answer: `x₁=${Math.min(x1, x2)}, x₂=${Math.max(x1, x2)}`,
      answerLatex: `x_1 = ${Math.min(x1, x2)}, \\ x_2 = ${Math.max(x1, x2)}`,
      solution: [
        { description: "判别式", latex: `\\Delta = ${discriminant} = ${sqrtD}^2` },
        { description: "因式分解", latex: `(${a}x - ${Math.round(x1)})(x - ${Math.round(x2)}) = 0` },
        { description: "两根", latex: `x_1 = ${Math.min(x1, x2)}, \\ x_2 = ${Math.max(x1, x2)}` },
      ],
      hints: ["尝试因式分解", "用求根公式如果因式分解不起"],
      errorAnalysis: {},
    };
  }
  const r = randInt(2, 6);
  const h1 = randInt(2, 8);
  const h2 = randNonZero(1, 5);
  const total = r + h1 + h2;
  return {
    id: `eq_app_${Date.now()}`,
    chapterId: "equations",
    difficulty: "application",
    targetConcepts: ["二元一次方程组"],
    question: `鸡兔同笼：头共${total}个，脚共${r * 2 + (total - r) * 4}只。鸡和兔各几只？`,
    questionLatex: `\\text{头共}${total}\\text{个，脚共}${r * 2 + (total - r) * 4}\\text{只}`,
    answer: `鸡${r}只，兔${total - r}只`,
    answerLatex: `\\text{鸡} ${r} \\text{只}, \\text{兔} ${total - r} \\text{只}`,
    solution: [
      { description: "设鸡x只，兔y只", latex: `x + y = ${total}` },
      { description: "脚数方程", latex: `2x + 4y = ${r * 2 + (total - r) * 4}` },
      { description: "解方程组得", latex: `x = ${r}, y = ${total - r}` },
    ],
    hints: ["每只鸡2只脚，每只兔4只脚", "设鸡x只，兔y只，列两个方程"],
    errorAnalysis: {},
  };
}

export function generateInequalityExercise(difficulty: MiddleExercise["difficulty"]): MiddleExercise {
  const a = randNonZero(-5, 5);
  const b = randInt(-20, 20);
  const c = randInt(-10, 10);
  const xBound = (c - b) / a;
  const xVal = Math.round(xBound * 100) / 100;

  if (difficulty === "basic") {
    const greater = a > 0;
    return {
      id: `ineq_${Date.now()}`,
      chapterId: "inequalities",
      difficulty: "basic",
      targetConcepts: ["一元一次不等式"],
      question: `解不等式：${a}x${b >= 0 ? "+" : ""}${b} ${greater ? ">" : "<"} ${c}`,
      questionLatex: `${a}x ${b >= 0 ? "+" : ""} ${b} ${greater ? ">" : "<"} ${c}`,
      options: [
        { id: "a", text: `x ${greater ? ">" : "<"} ${xVal}`, latex: `x ${greater ? ">" : "<"} ${xVal}` },
        { id: "b", text: `x ${greater ? "<" : ">"} ${xVal}`, latex: `x ${greater ? "<" : ">"} ${xVal}` },
      ],
      answer: "a",
      answerLatex: `x ${greater ? ">" : "<"} ${xVal}`,
      solution: [
        { description: "移项", latex: `${a}x ${greater ? ">" : "<"} ${c - b}` },
        { description: `两边除以${a}${a < 0 ? "（负数，不等号反转）" : ""}`, latex: `x ${greater ? ">" : "<"} ${xVal}` },
      ],
      hints: ["先移项", `除以${a}时注意${a < 0 ? "反转" : "不变"}不等号`],
      errorAnalysis: { b: a < 0 ? "除以负数时不等号需要反转" : "检查不等号的方向" },
    };
  }
  const low = randInt(0, 5);
  const high = low + randInt(2, 8);
  return {
    id: `ineq_sys_${Date.now()}`,
    chapterId: "inequalities",
    difficulty: "comprehension",
    targetConcepts: ["不等式组"],
    question: `解不等式组：{x - ${randInt(1, 3)} ≥ ${low - randInt(1, 3)}, 2x + 1 < ${high * 2 + 1}}`,
    questionLatex: `\\begin{cases} x \\geq ${low} \\\\ x < ${high} \\end{cases}`,
    answer: `${low} ≤ x < ${high}`,
    answerLatex: `${low} \\leq x < ${high}`,
    solution: [
      { description: "分别解", latex: `x \\geq ${low}, \\ x < ${high}` },
      { description: "交集", latex: `${low} \\leq x < ${high}` },
    ],
    hints: ["分别解两个不等式", "找出公共部分"],
    errorAnalysis: {},
  };
}

export function generateFunctionExercise(difficulty: MiddleExercise["difficulty"]): MiddleExercise {
  if (difficulty === "basic") {
    const k = randNonZero(-4, 4);
    const b = randInt(-10, 10);
    const dir = k > 0 ? "递增" : "递减";
    return {
      id: `func_${Date.now()}`,
      chapterId: "functions",
      difficulty: "basic",
      targetConcepts: ["一次函数"],
      question: `y = ${k}x ${b >= 0 ? "+" : ""} ${b} 的斜率k是${k}，该函数是递增还是递减？`,
      questionLatex: `y = ${k}x ${b >= 0 ? "+" : ""} ${b}`,
      options: [
        { id: "a", text: dir, latex: `\\text{${dir}}` },
        { id: "b", text: k > 0 ? "递减" : "递增", latex: `\\text{${k > 0 ? "递减" : "递增"}}` },
      ],
      answer: "a",
      answerLatex: `\\text{${dir}}`,
      solution: [
        { description: `k>0递增，k<0递减；k=${k}`, latex: `\\therefore ${dir}` },
      ],
      hints: ["斜率k的正负决定函数的单调性", "k>0递增，k<0递减"],
      errorAnalysis: {},
    };
  }
  if (difficulty === "comprehension") {
    const a = randNonZero(-3, 3);
    const h = randInt(-5, 5);
    const k = randInt(-5, 5);
    return {
      id: `func_quad_${Date.now()}`,
      chapterId: "functions",
      difficulty: "comprehension",
      targetConcepts: ["二次函数顶点"],
      question: `y = ${a}(x ${h >= 0 ? "-" : "+"} ${Math.abs(h)})² ${k >= 0 ? "+" : ""} ${k} 的顶点是什么？`,
      questionLatex: `y = ${a}(x ${h >= 0 ? "-" : "+"} ${Math.abs(h)})^2 ${k >= 0 ? "+" : ""} ${k}`,
      answer: `(${h}, ${k})`,
      answerLatex: `(${h}, ${k})`,
      solution: [
        { description: "顶点式y=a(x-h)²+k的顶点是(h,k)", latex: `h = ${h}, k = ${k}` },
        { description: `顶点(${h}, ${k})`, latex: `\\text{顶点}(${h}, ${k})` },
      ],
      hints: ["识别顶点式y=a(x-h)²+k", "顶点坐标为(h,k)"],
      errorAnalysis: {},
    };
  }
  const x1 = randInt(-5, 5);
  const x2 = x1 + randInt(1, 5);
  return {
    id: `func_app_${Date.now()}`,
    chapterId: "functions",
    difficulty: "application",
    targetConcepts: ["函数应用"],
    question: `某商品进价50元/件，售价定为x元/件时，日销量为(200-2x)件。写出日利润y关于售价x的函数。`,
    questionLatex: `\\text{进价}50\\text{元，售价}x\\text{元，日销量}(200-2x)\\text{件}`,
    answer: `y = (x-50)(200-2x)`,
    answerLatex: `y = (x-50)(200-2x)`,
    solution: [
      { description: "每件利润 = 售价-进价", latex: `x - 50` },
      { description: "日总利润 = 每件利润×日销量", latex: `y = (x-50)(200-2x)` },
    ],
    hints: ["利润 = 售价 - 进价", "总利润 = 每件利润 × 销量"],
    errorAnalysis: {},
  };
}

export function generateGeometryExercise(difficulty: MiddleExercise["difficulty"]): MiddleExercise {
  if (difficulty === "basic") {
    const a = randInt(3, 15);
    const b = randInt(3, 15);
    const c = Math.sqrt(a * a + b * b);
    if (!Number.isInteger(c)) return generateGeometryExercise("basic");
    return {
      id: `geo_${Date.now()}`,
      chapterId: "plane-geometry",
      difficulty: "basic",
      targetConcepts: ["勾股定理"],
      question: `直角三角形的两直角边为${a}和${b}，斜边长多少？`,
      questionLatex: `a = ${a}, b = ${b}, c = ?`,
      options: [
        { id: "a", text: `${c}`, latex: `${c}` },
        { id: "b", text: `${a + b}`, latex: `${a + b}` },
      ],
      answer: "a",
      answerLatex: `${c}`,
      solution: [
        { description: `c² = ${a}² + ${b}²`, latex: `c^2 = ${a * a} + ${b * b} = ${c * c}` },
        { description: "c = " + c, latex: `c = ${c}` },
      ],
      hints: ["勾股定理：c² = a² + b²", "两边平方和再开方"],
      errorAnalysis: { b: "斜边不是两边之和，是平方和再开方。" },
    };
  }
  if (difficulty === "comprehension") {
    const sim = randInt(2, 4);
    const a = randInt(2, 5);
    const b = a * sim;
    return {
      id: `geo_sim_${Date.now()}`,
      chapterId: "triangle-circle",
      difficulty: "comprehension",
      targetConcepts: ["相似三角形"],
      question: `△ABC~△DEF，AB=${a}，DE=${b}。BC=5，求EF。`,
      questionLatex: `\\triangle ABC \\sim \\triangle DEF, AB=${a}, DE=${b}, BC=5`,
      answer: `${b / a * 5}`,
      answerLatex: `${b / a * 5}`,
      solution: [
        { description: `相似比k = DE/AB = ${b}/${a} = ${sim}`, latex: `k = ${sim}` },
        { description: `EF = k·BC = ${sim}×5 = ${sim * 5}`, latex: `EF = ${sim * 5}` },
      ],
      hints: ["对应边成比例", `相似比 = AB对DE = ${a}/${b}`],
      errorAnalysis: {},
    };
  }
  const r = randInt(3, 10);
  return {
    id: `geo_circle_${Date.now()}`,
    chapterId: "triangle-circle",
    difficulty: "application",
    targetConcepts: ["圆的计算"],
    question: `半径为${r}的圆，面积是多少（保留π）？`,
    questionLatex: `r = ${r}`,
    answer: `${r * r}π`,
    answerLatex: `${r * r}\\pi`,
    solution: [
      { description: "S=πr²", latex: `S = \\pi \\times ${r}^2 = ${r * r}\\pi` },
    ],
    hints: ["圆面积公式 S = πr²", "r² = r×r"],
    errorAnalysis: {},
  };
}

export function generateStatisticsExercise(difficulty: MiddleExercise["difficulty"]): MiddleExercise {
  if (difficulty === "basic") {
    const nums = [randInt(1, 20), randInt(1, 20), randInt(1, 20), randInt(1, 20), randInt(1, 20)];
    const sum = nums.reduce((a, b) => a + b, 0);
    const avg = sum / nums.length;
    return {
      id: `stat_${Date.now()}`,
      chapterId: "statistics",
      difficulty: "basic",
      targetConcepts: ["平均数"],
      question: `求数据 ${nums.join(", ")} 的平均数。`,
      questionLatex: `\\text{数据: } ${nums.join(", ")}`,
      answer: `${avg.toFixed(1)}`,
      answerLatex: `${avg}`,
      solution: [
        { description: `总和=${sum}`, latex: `\\sum = ${sum}` },
        { description: `平均数 = ${sum}/${nums.length} = ${avg.toFixed(1)}`, latex: `\\bar{x} = ${avg.toFixed(1)}` },
      ],
      hints: ["把数据加起来除以个数", `先算总和：${nums.join("+")}=${sum}`],
      errorAnalysis: {},
    };
  }
  if (difficulty === "comprehension") {
    const nums = [randInt(1, 10), randInt(1, 10), randInt(1, 10), randInt(1, 10), randInt(1, 10)];
    const sorted = [...nums].sort((a, b) => a - b);
    const median = sorted[2];
    return {
      id: `stat_med_${Date.now()}`,
      chapterId: "statistics",
      difficulty: "comprehension",
      targetConcepts: ["中位数"],
      question: `求数据 ${nums.join(", ")} 的中位数。`,
      questionLatex: `\\text{数据: } ${nums.join(", ")}`,
      options: [
        { id: "a", text: `${median}`, latex: `${median}` },
        { id: "b", text: `${nums.reduce((a, b) => a + b, 0) / nums.length}`, latex: `${(nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1)}` },
      ],
      answer: "a",
      answerLatex: `${median}`,
      solution: [
        { description: `排序: ${sorted.join(", ")}`, latex: `\\text{排序: } ${sorted.join(", ")}` },
        { description: `5个数，中位数是第3个= ${median}`, latex: `\\text{中位数} = ${median}` },
      ],
      hints: ["先排序从小到大", "中间位置的那个数"],
      errorAnalysis: { b: "那是平均数，中位数是排序后中间的二个数。" },
    };
  }
  const favorable = randInt(1, 5);
  const total = favorable + randInt(2, 8);
  const prob = favorable / total;
  return {
    id: `stat_prob_${Date.now()}`,
    chapterId: "statistics",
    difficulty: "application",
    targetConcepts: ["概率"],
    question: `一个袋子里有${total}个球，其中${favorable}个红球。随机取一个，取到红球的概率是多少？`,
    questionLatex: `${favorable} \\text{红球}, ${total - favorable} \\text{其他}, ${total} \\text{总共}`,
    answer: `${favorable}/${total}`,
    answerLatex: `\\frac{${favorable}}{${total}}`,
    solution: [
      { description: `P = 红球数/总球数`, latex: `P = \\frac{${favorable}}{${total}}` },
    ],
    hints: ["概率 = 关注结果/总结果数", "关注结果=红球数，总结果=球的总数"],
    errorAnalysis: {},
  };
}
