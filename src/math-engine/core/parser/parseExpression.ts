import type { MathNode } from "mathjs";
import { parseExpressionAst, validateExpressionAst } from "@/math-engine/core/validator/validateNode";
import { asNode } from "@/math-engine/core/validator/astAccess";
import { MAX_EXPRESSION_LENGTH } from "@/constants/app";
import { ALLOWED_CONSTANT_SET, PARAMETER_NAMES_PRIORITY } from "@/constants/math";

const SAFE_CHARACTER_RE = /^[0-9a-zA-Z+\-*/^().,\s]+$/;

export interface ParseResult {
  ok: boolean;
  normalizedExpression: string;
  latex: string;
  parameters: string[];
  error?: string;
  node?: MathNode;
}

export function extractRhs(input: string): string {
  const text = input.trim();
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "(" || c === "[") depth += 1;
    else if (c === ")" || c === "]") depth = Math.max(0, depth - 1);
    else if (c === "=" && depth === 0) {
      return text.slice(i + 1).trim();
    }
  }
  return text;
}

function collectSymbols(node: MathNode, out: string[]): void {
  const n = asNode(node);
  if (n.type === "SymbolNode") {
    if (n.name !== "x" && !ALLOWED_CONSTANT_SET.has(n.name ?? "")) {
      out.push(n.name ?? "");
    }
    return;
  }
  if (n.args) {
    for (const arg of n.args) collectSymbols(arg, out);
  }
  if (n.type === "ParenthesisNode") {
    collectSymbols(n.content!, out);
  }
}

export function extractParameters(node: MathNode): string[] {
  const found: string[] = [];
  collectSymbols(node, found);
  const unique = Array.from(new Set(found));
  unique.sort((a, b) => {
    const ia = PARAMETER_NAMES_PRIORITY.indexOf(a);
    const ib = PARAMETER_NAMES_PRIORITY.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  return unique;
}

export function parseExpressionInput(rawInput: string): ParseResult {
  const empty: ParseResult = { ok: false, normalizedExpression: "", latex: "", parameters: [], error: "请输入函数表达式" };
  if (!rawInput || rawInput.trim().length === 0) return empty;

  const rhs = extractRhs(rawInput);
  if (rhs.length === 0) return { ...empty, error: "未找到等号右侧的表达式" };
  if (rhs.length > MAX_EXPRESSION_LENGTH) {
    return { ...empty, error: `表达式过长（最多 ${MAX_EXPRESSION_LENGTH} 个字符）` };
  }
  if (!SAFE_CHARACTER_RE.test(rhs)) {
    return { ...empty, error: "表达式包含非法字符" };
  }

  let node: MathNode;
  try {
    node = parseExpressionAst(rhs);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ...empty, error: `表达式解析失败：${message}` };
  }

  const validation = validateExpressionAst(node);
  if (!validation.ok) {
    return { ...empty, error: validation.errors[0] };
  }

  let latex: string;
  try {
    latex = node.toTex();
  } catch {
    latex = rhs;
  }

  const parameters = extractParameters(node);

  return { ok: true, normalizedExpression: rhs, latex, parameters, node };
}
