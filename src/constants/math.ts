export const ALLOWED_FUNCTIONS = [
  "sin",
  "cos",
  "tan",
  "asin",
  "acos",
  "atan",
  "sqrt",
  "abs",
  "log",
  "log10",
  "exp",
  "floor",
  "ceil",
  "round",
] as const;

export type AllowedFunction = (typeof ALLOWED_FUNCTIONS)[number];

export const ALLOWED_FUNCTION_SET: ReadonlySet<string> = new Set(ALLOWED_FUNCTIONS);

export const ALLOWED_CONSTANTS = ["pi", "e"] as const;

export const ALLOWED_CONSTANT_SET: ReadonlySet<string> = new Set(ALLOWED_CONSTANTS);

export const RESERVED_SYMBOLS: ReadonlySet<string> = new Set(["x", "y", ...ALLOWED_CONSTANTS]);

export const ALLOWED_SYMBOL_RE = /^[a-zA-Z][a-zA-Z0-9]*$/;

export const PARAMETER_DEFAULT = { min: -10, max: 10, value: 1, step: 0.1 };

export const PARAMETER_NAMES_PRIORITY = ["a", "b", "c", "k", "A", "w", "p"];
