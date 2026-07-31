import { parse } from "mathjs";
import type { MathNode } from "mathjs";
import { ALLOWED_CONSTANT_SET, ALLOWED_FUNCTION_SET, ALLOWED_SYMBOL_RE } from "@/constants/math";
import { asNode, fnName as fnNameOf, opName as opNameOf } from "@/math-engine/core/validator/astAccess";

const SUPPORTED_OPERATORS = new Set([
  "add",
  "subtract",
  "multiply",
  "divide",
  "pow",
  "mod",
  "unaryMinus",
  "unaryPlus",
]);

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

function isReservedSymbol(name: string): boolean {
  return name === "x" || ALLOWED_CONSTANT_SET.has(name);
}

function walk(node: MathNode, errors: string[]): void {
  const n = asNode(node);
  if (n.type === "ConstantNode") return;

  if (n.type === "SymbolNode") {
    if (isReservedSymbol(n.name ?? "")) return;
    if (!ALLOWED_SYMBOL_RE.test(n.name ?? "")) {
      errors.push(`不支持的符号：${n.name}`);
    }
    return;
  }

  if (n.type === "FunctionNode") {
    const fnName = fnNameOf(n);
    if (!ALLOWED_FUNCTION_SET.has(fnName)) {
      errors.push(`不支持的函数：${fnName}（请使用 ${"sin cos tan asin acos atan sqrt abs log log10 exp floor ceil round".split(" ").join("、")} 中的一个）`);
    }
    for (const arg of n.args ?? []) walk(arg, errors);
    return;
  }

  if (n.type === "OperatorNode") {
    const op = opNameOf(n);
    if (!SUPPORTED_OPERATORS.has(op)) {
      errors.push(`不支持的运算：${op}`);
    }
    for (const arg of n.args ?? []) walk(arg, errors);
    return;
  }

  if (n.type === "ParenthesisNode") {
    walk(n.content!, errors);
    return;
  }

  errors.push(`不支持的语法内容：${n.type}（当前版本暂不支持该数学内容）`);
}

export function validateExpressionAst(node: MathNode): ValidationResult {
  const errors: string[] = [];
  walk(node, errors);
  return { ok: errors.length === 0, errors };
}

export function parseExpressionAst(expression: string): MathNode {
  return parse(expression);
}
