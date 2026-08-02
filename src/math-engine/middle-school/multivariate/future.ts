// Multi-variable function module
// Support z=f(x,y)
// 未来高等数学扩展预留接口（结构占位）。
// 当前版本只实现简单多元函数，以下接口仅定义结构，不实现具体算法。
// 后续可接入：偏导数、梯度、二重积分、向量场等模块。

export interface PartialDerivativeSignature {
  (expression: string, variable: "x" | "y"): {
    ok: boolean;
    expression?: string;
    latex?: string;
    error?: string;
  };
}

export interface GradientSignature {
  (expression: string): {
    ok: boolean;
    fx?: string;
    fy?: string;
    latex?: string;
    error?: string;
  };
}

export interface DoubleIntegralSignature {
  (
    expression: string,
    region: { x: [number, number]; y: [number, number] },
  ): { ok: boolean; value?: number; error?: string };
}

export interface VectorFieldSignature {
  (fx: string, fy: string): unknown;
}

/** 预留接口清单（未来按需实现） */
export const FUTURE_APIS = ["partialDerivative", "gradient", "doubleIntegral", "vectorField"] as const;
