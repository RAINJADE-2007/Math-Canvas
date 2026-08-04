export type MiddleChapterId =
  | "numbers"
  | "equations"
  | "inequalities"
  | "functions"
  | "plane-geometry"
  | "triangle-circle"
  | "statistics"
  | "applications";

export interface MiddleKnowledgePoint {
  id: string;
  chapterId: MiddleChapterId;
  title: string;
  objectives: string[];
  motivation: string;
  intuition: string;
  definition: string;
  formulaLatex: string;
  formulaExplanation: string;
  conditions: string;
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

export interface MiddleChapter {
  id: MiddleChapterId;
  number: number;
  title: string;
  description: string;
  prerequisites: string[];
  teachingPoints: string[];
  commonMisconceptions: string[];
  discussionQuestions: string[];
  knowledgePoints: MiddleKnowledgePoint[];
}

export interface MiddleExercise {
  id: string;
  chapterId: MiddleChapterId;
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

export interface MiddleLearningProgress {
  completedPoints: string[];
  completedExercises: string[];
  chapterProgress: Record<MiddleChapterId, number>;
  lastChapter: MiddleChapterId;
  lastPointIndex: number;
}
