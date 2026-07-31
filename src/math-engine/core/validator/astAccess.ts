import type { MathNode } from "mathjs";

export interface AstNode extends MathNode {
  name?: string;
  args?: AstNode[];
  content?: AstNode;
  fn?: { name?: string } | string;
  value?: unknown;
}

export function asNode(node: MathNode): AstNode {
  return node as AstNode;
}

export function fnName(node: AstNode): string {
  if (typeof node.fn === "string") return node.fn;
  return node.fn?.name ?? "";
}

export function opName(node: AstNode): string {
  return typeof node.fn === "string" ? node.fn : "";
}
