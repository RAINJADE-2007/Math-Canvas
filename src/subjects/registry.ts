import type { SubjectId } from "@/types";
import type { SubjectModule } from "@/subjects/types";
import { middleSchoolModule } from "@/subjects/middle-school";
import { calculusIntroModule } from "@/subjects/calculus-intro";
import { calculusModule } from "@/subjects/calculus";
import { linearAlgebraModule } from "@/subjects/linear-algebra";
import { mathCanvasModule } from "@/subjects/math-canvas";
import { probabilityModule } from "@/subjects/probability";
import { complexAnalysisModule } from "@/subjects/complex-analysis";

export const SUBJECT_MODULES: Record<SubjectId, SubjectModule> = {
  "middle-school": middleSchoolModule,
  "calculus-intro": calculusIntroModule,
  calculus: calculusModule,
  "linear-algebra": linearAlgebraModule,
  "math-canvas": mathCanvasModule,
  probability: probabilityModule,
  "complex-analysis": complexAnalysisModule,
};

export function getSubjectModule(subjectId: SubjectId): SubjectModule {
  return SUBJECT_MODULES[subjectId];
}

export function isSubjectEnabled(subjectId: SubjectId): boolean {
  return SUBJECT_MODULES[subjectId]?.enabled === true;
}
