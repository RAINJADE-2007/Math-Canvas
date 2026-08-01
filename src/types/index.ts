export type SubjectId =
  | "middle-school"
  | "calculus-intro"
  | "calculus"
  | "linear-algebra"
  | "probability"
  | "complex-analysis";

export type MathObjectType =
  | "function"
  | "derivative"
  | "tangent"
  | "secant"
  | "point"
  | "line"
  | "circle"
  | "parameter"
  | "dataset";

export type ProblemType =
  | "numeric"
  | "linear-equation"
  | "quadratic-equation"
  | "linear-inequality"
  | "derivative"
  | "tangent"
  | "monotonicity";

export type ToolId =
  | "select"
  | "pan"
  | "translate"
  | "add-point"
  | "add-line"
  | "add-circle"
  | "reset-view";

export interface MathExpression {
  id: string;
  subjectId: SubjectId;
  type: MathObjectType;
  rawInput: string;
  latex: string;
  normalizedExpression: string;
  color: string;
  visible: boolean;
  parameters: string[];
  translation?: {
    dx: number;
    dy: number;
  };
  domain?: {
    min: number;
    max: number;
  };
  error?: string;
  createdAt: number;
  updatedAt: number;
}

export interface MathParameter {
  id: string;
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
}

export interface CanvasSettings {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  showGrid: boolean;
  showAxes: boolean;
  showLabels: boolean;
  showMonotonicityHint: boolean;
  viewVersion: number;
}

export type GeometryObjectType = "point" | "line" | "segment" | "circle";

export interface GeometryObject {
  id: string;
  type: GeometryObjectType;
  label: string;
  color: string;
  visible: boolean;
  x?: number;
  y?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  centerX?: number;
  centerY?: number;
  radius?: number;
  createdAt: number;
  updatedAt: number;
}

export interface MathDataset {
  id: string;
  name: string;
  rawInput: string;
  values: number[];
  color: string;
  createdAt: number;
}

export interface PinnedPoint {
  id: string;
  expressionId: string;
  x: number;
  createdAt: number;
}

export interface CalculatorRecord {
  id: string;
  input: string;
  latex: string;
  result: string;
  approximation: string;
  error?: string;
  createdAt: number;
}

export interface SolutionStep {
  id: string;
  subjectId: SubjectId;
  problemType: ProblemType;
  rule: string;
  beforeLatex: string;
  afterLatex: string;
  explanation: string;
  verified: boolean;
}

export interface SolutionRecord {
  id: string;
  problemType: ProblemType;
  problem: string;
  problemLatex: string;
  steps: SolutionStep[];
  resultLatex: string;
  resultText: string;
  verified: boolean;
  createdAt: number;
}

export interface TangentResult {
  x: number;
  y: number;
  slope: number;
  equation: string;
}

export interface SecantResult {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  h: number;
  slope: number;
}

export interface MonotonicInterval {
  start: number | null;
  end: number | null;
  type: "increasing" | "decreasing" | "constant" | "unknown";
}

export interface DerivativeResult {
  originalExpression: string;
  derivativeExpression?: string;
  derivativeLatex?: string;
  method: "symbolic" | "numeric";
  steps: SolutionStep[];
  tangent?: TangentResult;
  secant?: SecantResult;
  criticalPoints: number[];
  monotonicIntervals: MonotonicInterval[];
  warning?: string;
}

export interface DerivativeVisibility {
  derivative: boolean;
  tangent: boolean;
  secant: boolean;
  criticalPoints: boolean;
}

export interface FunctionPropertyItem {
  key: string;
  label: string;
  latex?: string;
  value?: string;
}

export interface MathAnalysisResult {
  objectType: MathObjectType;
  functionType:
    | "linear"
    | "quadratic"
    | "inverse-proportional"
    | "trigonometric"
    | "other"
    | null;
  summary: string;
  properties: FunctionPropertyItem[];
  warning?: string;
}

export interface MathProblem {
  id: string;
  subjectId: SubjectId;
  problemType: ProblemType;
  text: string;
  input: string;
}

export interface SolutionResult {
  problemType: ProblemType;
  steps: SolutionStep[];
  resultLatex: string;
  resultText: string;
  verified: boolean;
  warning?: string;
}

export interface MathObject {
  id: string;
  subjectId: SubjectId;
  type: MathObjectType;
  rawInput: string;
  latex: string;
  visible: boolean;
  color: string;
  extra?: Record<string, unknown>;
}

export interface VisualizationDescriptor {
  type: "curve" | "point" | "line" | "segment" | "circle";
  name: string;
  color: string;
  visible: boolean;
  data: Record<string, unknown>;
}

export type MathCanvasData = Omit<MathCanvasState, "past" | "future">;

export interface MathCanvasState {
  currentSubject: SubjectId;
  documentName: string;
  expressions: MathExpression[];
  geometryObjects: GeometryObject[];
  datasets: MathDataset[];
  pinnedPoints: PinnedPoint[];
  parameters: Record<string, MathParameter>;
  derivativeResults: Record<string, DerivativeResult>;
  derivativeVisibility: Record<string, DerivativeVisibility>;
  selectedObjectId: string | null;
  activeTool: ToolId;
  canvasSettings: CanvasSettings;
  calculatorHistory: CalculatorRecord[];
  solutionHistory: SolutionRecord[];
  past: MathCanvasData[];
  future: MathCanvasData[];
}

export interface SavedMathCanvasDocument {
  schemaVersion: 1;
  projectVersion: string;
  savedAt: number;
  subjectId: SubjectId;
  data: MathCanvasData;
}
