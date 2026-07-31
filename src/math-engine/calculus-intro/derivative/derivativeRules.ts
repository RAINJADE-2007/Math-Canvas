import { parse, simplify } from "mathjs";
import type { MathNode } from "mathjs";
import { asNode, fnName, opName } from "@/math-engine/core/validator/astAccess";
import { UnsupportedDerivativeError } from "@/math-engine/calculus-intro/derivative/types";

export interface SymbolicDerivativeResult {
  ok: boolean;
  derivative: string;
  latex: string;
  steps: { rule: string; beforeLatex: string; afterLatex: string; explanation: string }[];
  error?: string;
}

function isConstantWithRespectToX(node: MathNode): boolean {
  const n = asNode(node);
  if (n.type === "ConstantNode") return true;
  if (n.type === "SymbolNode") return n.name !== "x";
  return false;
}

function diffString(node: MathNode, depth: number): string {
  const n = asNode(node);
  if (depth > 12) {
    throw new UnsupportedDerivativeError("表达式嵌套过深，无法进行稳定的符号求导");
  }
  const d = depth + 1;

  if (n.type === "ConstantNode") return "0";

  if (n.type === "SymbolNode") {
    return n.name === "x" ? "1" : "0";
  }

  if (n.type === "ParenthesisNode") {
    return diffString(n.content!, d);
  }

  if (n.type === "OperatorNode") {
    const op = opName(n);
    if (op === "unaryMinus") return `-(${diffString(n.args![0], d)})`;
    if (op === "unaryPlus") return `(${diffString(n.args![0], d)})`;
    if (op === "mod") {
      throw new UnsupportedDerivativeError("取模运算暂不支持求导");
    }
    if (op === "add") {
      return `(${diffString(n.args![0], d)} + ${diffString(n.args![1], d)})`;
    }
    if (op === "subtract") {
      return `(${diffString(n.args![0], d)} - ${diffString(n.args![1], d)})`;
    }
    if (op === "multiply") {
      const a = n.args![0];
      const b = n.args![1];
      return `((${diffString(a, d)} * (${b.toString()}) + (${a.toString()}) * ${diffString(b, d)}))`;
    }
    if (op === "divide") {
      const a = n.args![0];
      const b = n.args![1];
      return `(((${diffString(a, d)} * (${b.toString()}) - (${a.toString()}) * ${diffString(b, d)}) / (${b.toString()})^2))`;
    }
    if (op === "pow") {
      const base = n.args![0];
      const exp = n.args![1];
      if (exp.type === "ConstantNode") {
        const value = Number((asNode(exp).value as number) ?? 0);
        if (!Number.isInteger(value)) {
          throw new UnsupportedDerivativeError("初版仅支持整数次幂的符号求导");
        }
        return `(${value} * (${base.toString()})^${value - 1} * ${diffString(base, d)})`;
      }
      if (isConstantWithRespectToX(base)) {
        return `((${base.toString()})^${exp.toString()} * ln(${base.toString()}) * ${diffString(exp, d)})`;
      }
      throw new UnsupportedDerivativeError("当前版本暂不支持一般的幂指函数求导");
    }
    throw new UnsupportedDerivativeError(`不支持的运算：${op}`);
  }

  if (n.type === "FunctionNode") {
    const name = fnName(n);
    const arg = n.args![0];
    const inner = diffString(arg, d);
    const argStr = arg.toString();
    switch (name) {
      case "sin":
        return `cos(${argStr}) * (${inner})`;
      case "cos":
        return `-sin(${argStr}) * (${inner})`;
      case "tan":
        return `(1 / (cos(${argStr})^2)) * (${inner})`;
      case "exp":
        return `exp(${argStr}) * (${inner})`;
      case "log":
        return `(1 / (${argStr})) * (${inner})`;
      case "log10":
        return `(1 / (${argStr} * ln(10))) * (${inner})`;
      case "sqrt":
        return `(1 / (2 * sqrt(${argStr}))) * (${inner})`;
      default:
        throw new UnsupportedDerivativeError(`函数 ${name} 的导数暂未开放符号求导`);
    }
  }

  throw new UnsupportedDerivativeError(`不支持的表达式类型：${n.type}`);
}

function toLatexSafe(expression: string): string {
  try {
    return parse(expression).toTex();
  } catch {
    return expression;
  }
}

function describeRule(node: MathNode): { rule: string; explanation: string } {
  const n = asNode(node);
  if (n.type === "ConstantNode") {
    return { rule: "constant-rule", explanation: "常数的导数为 0：(C)' = 0" };
  }
  if (n.type === "SymbolNode") {
    if (n.name === "x") return { rule: "identity-rule", explanation: "自变量求导：(x)' = 1" };
    return { rule: "constant-rule", explanation: "参数视为常数，其导数为 0" };
  }
  if (n.type === "ParenthesisNode") {
    return describeRule(n.content!);
  }
  if (n.type === "OperatorNode") {
    const op = opName(n);
    if (op === "unaryMinus") {
      return { rule: "constant-multiple-rule", explanation: "常数倍法则：(-f(x))' = -f'(x)" };
    }
    if (op === "multiply" && (isConstantWithRespectToX(n.args![0]) || isConstantWithRespectToX(n.args![1]))) {
      return { rule: "constant-multiple-rule", explanation: "常数倍法则：(c·f(x))' = c·f'(x)" };
    }
    if (op === "multiply") {
      return { rule: "product-rule", explanation: "乘积法则：(f·g)' = f'·g + f·g'" };
    }
    if (op === "divide") {
      return { rule: "quotient-rule", explanation: "商法则：(f/g)' = (f'·g − f·g')/g²" };
    }
    if (op === "pow") {
      if (n.args![1].type === "ConstantNode") {
        return { rule: "power-rule", explanation: "幂函数法则：(x^n)' = n·x^(n−1)" };
      }
      return { rule: "exponential-rule", explanation: "指数函数法则：(a^x)' = a^x·ln(a)" };
    }
    return { rule: "sum-rule", explanation: "和的求导法则：(f+g)' = f'+g'" };
  }
  if (n.type === "FunctionNode") {
    const map: Record<string, { rule: string; explanation: string }> = {
      sin: { rule: "sine-rule", explanation: "(sin x)' = cos x" },
      cos: { rule: "cosine-rule", explanation: "(cos x)' = −sin x" },
      tan: { rule: "tangent-rule", explanation: "(tan x)' = 1/cos²x" },
      exp: { rule: "exp-rule", explanation: "(eˣ)' = eˣ" },
      log: { rule: "log-rule", explanation: "(ln x)' = 1/x" },
      log10: { rule: "log10-rule", explanation: "(log₁₀ x)' = 1/(x·ln10)" },
      sqrt: { rule: "sqrt-rule", explanation: "(√x)' = 1/(2√x)" },
    };
    return map[fnName(n)] ?? { rule: "chain-rule", explanation: "链式法则" };
  }
  return { rule: "unknown", explanation: "对该部分应用求导法则" };
}

export function differentiateSymbolically(expression: string): SymbolicDerivativeResult {
  const steps: { rule: string; beforeLatex: string; afterLatex: string; explanation: string }[] = [];

  let node: MathNode;
  try {
    node = parse(expression);
  } catch (err) {
    return {
      ok: false,
      derivative: "",
      latex: "",
      steps: [],
      error: err instanceof Error ? err.message : "表达式解析失败",
    };
  }

  try {
    const beforeLatex = node.toTex();
    steps.push({
      rule: "original",
      beforeLatex: "",
      afterLatex: beforeLatex,
      explanation: "对函数求关于 x 的导数",
    });

    const nodeAs = asNode(node);
    const terms: MathNode[] =
      nodeAs.type === "OperatorNode" && (opName(nodeAs) === "add" || opName(nodeAs) === "subtract")
        ? nodeAs.args!
        : [node];

    for (const term of terms) {
      const termLatex = term.toTex();
      const termDerivative = diffString(term, 0);
      const simplified = simplify(termDerivative).toString();
      const desc = describeRule(term);
      steps.push({
        rule: desc.rule,
        beforeLatex: termLatex,
        afterLatex: toLatexSafe(simplified),
        explanation: desc.explanation,
      });
    }

    let totalDerivative: string;
    try {
      totalDerivative = simplify(diffString(node, 0)).toString();
    } catch {
      totalDerivative = terms.map((t) => diffString(t, 0)).join(" + ");
    }

    steps.push({
      rule: "simplify",
      beforeLatex: beforeLatex,
      afterLatex: toLatexSafe(totalDerivative),
      explanation: "化简得到最终导函数",
    });

    return {
      ok: true,
      derivative: totalDerivative,
      latex: toLatexSafe(totalDerivative),
      steps,
    };
  } catch (err) {
    if (err instanceof UnsupportedDerivativeError) {
      return { ok: false, derivative: "", latex: "", steps, error: err.message };
    }
    return {
      ok: false,
      derivative: "",
      latex: "",
      steps,
      error: err instanceof Error ? err.message : "符号求导失败",
    };
  }
}
