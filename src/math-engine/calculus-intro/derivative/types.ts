import type { SolutionStep } from "@/types";

export interface DerivativeStep {
  rule: string;
  beforeLatex: string;
  afterLatex: string;
  explanation: string;
}

export class UnsupportedDerivativeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsupportedDerivativeError";
  }
}

export function toSolutionSteps(
  subjectId: "calculus-intro",
  problemType: SolutionStep["problemType"],
  steps: DerivativeStep[],
): SolutionStep[] {
  return steps.map((step, index) => ({
    id: `dstep-${subjectId}-${problemType}-${index}`,
    subjectId,
    problemType,
    rule: step.rule,
    beforeLatex: step.beforeLatex,
    afterLatex: step.afterLatex,
    explanation: step.explanation,
    verified: false,
  }));
}
