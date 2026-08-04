export interface Vector2D {
  x: number;
  y: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Matrix2D {
  rows: number;
  cols: number;
  data: number[][];
}

export interface LinearSystem {
  coefficients: Matrix2D;
  constants: number[];
  variables: string[];
}

export interface GaussStep {
  description: string;
  matrix: number[][];
  rowOps: string;
  highlightRow?: number;
  highlightCol?: number;
}

export interface GaussResult {
  solution: number[] | null;
  solutionType: "unique" | "infinite" | "none";
  solutionLatex: string;
  steps: GaussStep[];
  rank: number;
  nullity: number;
}

export interface DeterminantStep {
  description: string;
  matrix: number[][];
  value?: number;
}

export interface EigenResult {
  eigenvalues: Array<{
    value: number;
    multiplicity: number;
    latex: string;
  }>;
  eigenvectors: Array<{
    eigenvalue: number;
    vector: number[];
    latex: string;
  }>;
  diagonalizable: boolean;
  diagonalMatrix?: number[][];
  diagonalTransform?: number[][];
}

export type ChapterId =
  | "vectors"
  | "matrices"
  | "linear-systems"
  | "linear-transforms"
  | "determinants"
  | "vector-spaces"
  | "eigenvalues"
  | "applications";

export interface KnowledgePoint {
  id: string;
  chapterId: ChapterId;
  title: string;
  slug: string;
  objectives: string[];
  motivation: string;
  intuition: string;
  definition: string;
  formulaLatex: string;
  formulaExplanation: string;
  example: {
    problem: string;
    steps: Array<{ description: string; latex: string }>;
    answer: string;
    answerLatex: string;
  };
  commonMistakes: Array<{ mistake: string; correction: string }>;
  summary: string[];
  selfCheck: string[];
}

export interface Chapter {
  id: ChapterId;
  number: number;
  title: string;
  description: string;
  prerequisites: string[];
  teachingPoints: string[];
  commonMisconceptions: string[];
  discussionQuestions: string[];
  knowledgePoints: KnowledgePoint[];
}

export interface Exercise {
  id: string;
  chapterId: ChapterId;
  difficulty: "basic" | "comprehension" | "application";
  targetConcepts: string[];
  question: string;
  questionLatex: string;
  options?: Array<{ id: string; text: string; latex: string }>;
  answer: string;
  answerLatex: string;
  solution: Array<{ description: string; latex: string }>;
  hints: string[];
  errorAnalysis: Record<string, string>;
}

export interface LearningProgress {
  completedPoints: string[];
  completedExercises: string[];
  chapterProgress: Record<ChapterId, number>;
  selfCheckResults: Record<string, boolean>;
}
