import type { Course, Sentence, Unit, Word } from "../types";

export interface CourseIndex {
  course: Course;
  units: Unit[];
  unitById: Map<string, Unit>;
  wordById: Map<string, { word: Word; unit: Unit }>;
  /** Position globale de chaque unité dans le parcours. */
  unitOrder: Map<string, number>;
  allSentences: Sentence[];
}

export function indexCourse(course: Course): CourseIndex {
  const units = course.sections.flatMap((s) => s.units);
  const unitById = new Map(units.map((u) => [u.id, u]));
  const wordById = new Map<string, { word: Word; unit: Unit }>();
  for (const unit of units) for (const word of unit.words) wordById.set(word.id, { word, unit });
  return {
    course,
    units,
    unitById,
    wordById,
    unitOrder: new Map(units.map((u, i) => [u.id, i])),
    allSentences: units.flatMap((u) => u.sentences),
  };
}
