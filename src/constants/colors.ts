export const EXPRESSION_COLORS = [
  "#2563eb",
  "#dc2626",
  "#059669",
  "#d97706",
  "#7c3aed",
  "#db2777",
  "#0891b2",
  "#4d7c0f",
  "#c2410c",
  "#334155",
] as const;

export const DEFAULT_COLOR = EXPRESSION_COLORS[0];

export function colorForIndex(index: number): string {
  return EXPRESSION_COLORS[index % EXPRESSION_COLORS.length];
}
