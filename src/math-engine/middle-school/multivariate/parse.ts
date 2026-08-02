import { parse } from "mathjs";
import type { MathNode } from "mathjs";
import { asNode, fnName as fnNameOf } from "@/math-engine/core/validator/astAccess";
import { ALLOWED_CONSTANT_SET, ALLOWED_FUNCTION_SET } from "@/constants/math";
import { extractRhs } from "@/math-engine/core/parser/parseExpression";

const SAFE_CHARACTER_RE = /^[0-9a-zA-Z+\-*/^().,\s]+$/;

export interface BivariateParseResult {
  ok: boolean;
  normalizedExpression: string;
  latex: string;
  error?: string;
}

function validateBivariateNode(node: MathNode, errors: string[]): void {
  const n = asNode(node);
  if (n.type === "ConstantNode") return;
  if (n.type === "SymbolNode") {
    const name = n.name ?? "";
    if (name === "x" || name === "y" || ALLOWED_CONSTANT_SET.has(name)) return;
    errors.push(
      `不支持的符号：${name}（多元函数中仅允许 x、y 与常量 ${Array.from(ALLOWED_CONSTANT_SET).join("、")}）`,
    );
    return;
  }
  if (n.type === "FunctionNode") {
    const name = fnNameOf(n);
    if (!ALLOWED_FUNCTION_SET.has(name)) {
      errors.push(`不支持的函数：${name}`);
    }
    for (const arg of n.args ?? []) validateBivariateNode(arg, errors);
    return;
  }
  if (n.type === "OperatorNode") {
    for (const arg of n.args ?? []) validateBivariateNode(arg, errors);
    return;
  }
  if (n.type === "ParenthesisNode") {
    if (n.content) validateBivariateNode(n.content, errors);
    return;
  }
  errors.push(`不支持的语法内容：${n.type}`);
}

export function parseMultivariateInput(rawInput: string): BivariateParseResult {
  const empty: BivariateParseResult = {
    ok: false,
    normalizedExpression: "",
    latex: "",
    error: "请输入多元函数表达式",
  };
  if (!rawInput || rawInput.trim().length === 0) return empty;
  const rhs = extractRhs(rawInput);
  if (!rhs) return { ...empty, error: "未找到等号右侧的表达式" };
  if (!SAFE_CHARACTER_RE.test(rhs)) return { ...empty, error: "表达式包含非法字符" };

  let node: MathNode;
  try {
    node = parse(rhs);
  } catch (err) {
    return { ...empty, error: `表达式解析失败：${err instanceof Error ? err.message : String(err)}` };
  }

  const errors: string[] = [];
  validateBivariateNode(node, errors);
  if (errors.length > 0) return { ...empty, error: errors[0] };

  let latex: string;
  try {
    latex = node.toTex();
  } catch {
    latex = rhs;
  }

  return { ok: true, normalizedExpression: rhs, latex };
}
