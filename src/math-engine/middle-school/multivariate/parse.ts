import { parse } from "mathjs";
import type { MathNode } from "mathjs";
import { asNode, fnName as fnNameOf } from "@/math-engine/core/validator/astAccess";
import { ALLOWED_CONSTANT_SET, ALLOWED_FUNCTION_SET } from "@/constants/math";
import { extractRhs } from "@/math-engine/core/parser/parseExpression";

const SAFE_CHARACTER_RE = /^[0-9a-zA-Z+\-*/^().,\s]+$/;

// 统一的用户提示文案（需求指定）
const PARSE_HINT = "无法解析该函数，请检查表达式";

// 常见输入写法到 mathjs 表达式的归一化映射，
// 让 z=x²+y²、π、√、· 等自然写法也能被解析。
const SUPERSCRIPT_MAP: Record<string, string> = {
  "⁰": "^0",
  "¹": "^1",
  "²": "^2",
  "³": "^3",
  "⁴": "^4",
  "⁵": "^5",
  "⁶": "^6",
  "⁷": "^7",
  "⁸": "^8",
  "⁹": "^9",
};

function normalizeExpressionInput(input: string): string {
  let out = input
    .replace(/π/g, "pi")
    .replace(/√/g, "sqrt")
    .replace(/[−–—]/g, "-")
    .replace(/[·⋅×]/g, "*");
  for (const [from, to] of Object.entries(SUPERSCRIPT_MAP)) {
    out = out.split(from).join(to);
  }
  return out;
}

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
    error: `${PARSE_HINT}（输入为空）`,
  };
  if (!rawInput || rawInput.trim().length === 0) return empty;
  const rhs = extractRhs(rawInput);
  if (!rhs) return { ...empty, error: `${PARSE_HINT}（未找到等号右侧的表达式）` };

  const normalized = normalizeExpressionInput(rhs);
  if (!SAFE_CHARACTER_RE.test(normalized)) return { ...empty, error: `${PARSE_HINT}（包含非法字符）` };

  let node: MathNode;
  try {
    node = parse(normalized);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return { ...empty, error: `${PARSE_HINT}（${detail}）` };
  }

  const errors: string[] = [];
  validateBivariateNode(node, errors);
  if (errors.length > 0) return { ...empty, error: `${PARSE_HINT}（${errors[0]}）` };

  let latex: string;
  try {
    latex = node.toTex();
  } catch {
    latex = normalized;
  }

  return { ok: true, normalizedExpression: normalized, latex };
}
