export { vec2, vec3, vec2Add, vec2Sub, vec2Scale, vec2Dot, vec2Norm, vec2Normalize, vec2Angle, vec2AngleDeg, vec2Distance, vec2Project, vec2LinearCombination, vec2IsOrthogonal, vec2IsParallel, formatVector2D, formatVector2DLatex, formatVector2DLatexRow } from "./vector";
export { matrix, matrixFrom, identityMatrix, matrixAdd, matrixSub, matrixScale, matrixMultiply, matrixTranspose, matrixDeterminant, matrixInverse, matrixRank, matrixToLatex, matrixToLatexBracket, matrixClone, matrixApplyToVector } from "./matrix";
export { solveLinearSystem } from "./gauss";
export { computeDeterminantSteps, det2x2Latex, det3x3Latex } from "./determinant";
export { computeEigen22, computeEigen33, matrix2x2Transform } from "./eigenvalues";
export { COURSE_CHAPTERS } from "./course-data";
export { generateVectorExercise, generateMatrixExercise, generateLinearSystemExercise, generateDeterminantExercise, generateEigenExercise } from "./exercises";
export type { Vector2D, Vector3D, Matrix2D, ChapterId, Chapter, KnowledgePoint, Exercise, LearningProgress, GaussResult, GaussStep, EigenResult, LinearSystem } from "./types";
