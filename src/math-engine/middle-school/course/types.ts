export type MiddleStage = "junior" | "senior";

export interface MiddleKnowledgePoint {
  id: string;
  stage?: MiddleStage;
  chapterId: string;
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
  prerequisiteJunior?: string[];
}

export interface MiddleChapter {
  id: string;
  stage?: MiddleStage;
  number: number;
  title: string;
  description: string;
  prerequisites: string[];
  teachingPoints: string[];
  commonMisconceptions: string[];
  discussionQuestions: string[];
  knowledgePoints: MiddleKnowledgePoint[];
}

export interface MiddleStageDef {
  id: MiddleStage;
  name: string;
  description: string;
  suggestedGrades: string;
  learningGoals: string[];
  chapters: MiddleChapter[];
}

export interface MiddleExercise {
  id: string;
  stage?: MiddleStage;
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

export interface MiddleLearningProgress {
  junior: StageProgress;
  senior: StageProgress;
  activeStage: MiddleStage;
}

export interface StageProgress {
  completedPoints: string[];
  completedExercises: string[];
  chapterProgress: Record<string, number>;
  lastChapter: string;
  lastPointIndex: number;
}
