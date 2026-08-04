export interface SeniorKnowledgePoint {
  id: string;
  chapterId: string;
  title: string;
  objectives: string[];
  prerequisites: string[];
  motivation: string;
  intuition: string;
  definition: string;
  formulaLatex: string;
  formulaExplanation: string;
  applicableConditions: string;
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

export interface SeniorChapter {
  id: string;
  number: number;
  title: string;
  description: string;
  prerequisites: string[];
  teachingPoints: string[];
  commonMisconceptions: string[];
  discussionQuestions: string[];
  knowledgePoints: SeniorKnowledgePoint[];
}

export interface SeniorExercise {
  id: string;
  chapterId: string;
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

export interface SeniorProgress {
  completedPoints: string[];
  completedExercises: string[];
  chapterProgress: Record<string, number>;
  lastChapter: string;
  lastPointIndex: number;
}
