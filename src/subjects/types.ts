import type {
  MathAnalysisResult,
  MathExpression,
  MathObject,
  MathObjectType,
  MathProblem,
  ProblemType,
  SolutionResult,
  SubjectId,
  VisualizationDescriptor,
} from "@/types";

export interface SubjectModule {
  id: SubjectId;
  name: string;
  description: string;
  enabled: boolean;
  supportedObjectTypes: MathObjectType[];
  supportedProblemTypes: ProblemType[];

  canHandle(input: string): boolean;

  analyze?(expression: MathExpression): Promise<MathAnalysisResult>;
  solve?(problem: MathProblem): Promise<SolutionResult>;
  visualize?(object: MathObject): VisualizationDescriptor[];
}
