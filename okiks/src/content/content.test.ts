import { describe, expect, it } from "vitest";
import { COURSES, courseIndex } from "./index";
import { compileAnswers, gradeEnglish, gradeTiles } from "../engine/grader";
import { generateLesson, generateReview } from "../engine/session/generate";
import type { Exercise, Profile } from "../engine/types";
import { LEVELS_PER_UNIT } from "../engine/types";

const PROFILES: Profile[] = ["kids", "adult", "pro"];

/** Réponse parfaite à un exercice, puis vérification qu'elle est bien acceptée. */
function solveAndGrade(ex: Exercise): boolean {
  switch (ex.type) {
    case "selectImage":
      return ex.options.some((o) => o.wordId === ex.answerId);
    case "listenTrueFalse":
      return typeof ex.isMatch === "boolean";
    case "matchPairs":
      return ex.pairs.length >= 3;
    case "fillBlank":
      return ex.options.includes(ex.answer) && new Set(ex.options).size === ex.options.length;
    case "translateToNative":
      return (["ar", "darija", "fr"] as const).every((l) => {
        // Les bonnes tuiles doivent toutes être présentes dans la banque.
        const pool = [...ex.tiles[l]];
        for (const t of ex.answer[l].split(" ")) {
          const i = pool.indexOf(t);
          if (i < 0) return false;
          pool.splice(i, 1);
        }
        return gradeTiles([ex.answer[l]], ex.answer[l]).verdict === "correct";
      });
    case "translateToEnglish":
      if (ex.tiles && !ex.reference.replace(/[.!?,]/g, "").split(/\s+/).every((t) => ex.tiles!.includes(t))) return false;
      return gradeEnglish(ex.accept, ex.reference).verdict === "correct";
    case "listenOrder":
      return gradeEnglish(ex.accept, ex.tiles.filter((t) => ex.english.includes(t)).length ? ex.english : "").verdict === "correct";
    case "listenType":
    case "speak":
      return gradeEnglish(ex.accept, ex.english).verdict === "correct";
  }
}

describe.each(PROFILES)("contenu %s", (profile) => {
  const course = COURSES[profile];
  const idx = courseIndex(profile);

  it("a 2 sections de 4 unités, chacune avec assez de mots et de phrases", () => {
    expect(course.sections).toHaveLength(2);
    for (const sec of course.sections) expect(sec.units).toHaveLength(4);
    for (const u of idx.units) {
      expect(u.words.length).toBeGreaterThanOrEqual(8);
      expect(u.sentences.length).toBeGreaterThanOrEqual(6);
    }
  });

  it("n'a pas d'identifiant en double et toutes les traductions sont remplies", () => {
    const ids = idx.units.flatMap((u) => [u.id, ...u.words.map((w) => w.id), ...u.sentences.map((s) => s.id)]);
    expect(new Set(ids).size).toBe(ids.length);
    for (const u of idx.units) {
      for (const t of [u.title, u.scene, ...u.words.map((w) => w.tr), ...u.sentences.map((s) => s.tr)]) {
        expect(t.ar.trim()).not.toBe("");
        expect(t.darija.trim()).not.toBe("");
        expect(t.fr.trim()).not.toBe("");
      }
    }
  });

  it("chaque grille de réponses compile et accepte sa propre phrase de référence", () => {
    for (const u of idx.units) {
      for (const w of u.words) {
        expect(() => compileAnswers(w.accept ?? w.en)).not.toThrow();
        expect(gradeEnglish(w.accept ?? w.en, w.en).verdict, `${w.id}`).toBe("correct");
      }
      for (const s of u.sentences) {
        expect(gradeEnglish(s.accept, s.en).verdict, `${s.id}: « ${s.en} »`).toBe("correct");
        expect(s.words.length, `${s.id} n'utilise aucun mot de l'unité`).toBeGreaterThan(0);
      }
    }
  });

  it("génère des leçons complètes et réussissables pour chaque unité et chaque niveau", () => {
    for (const u of idx.units) {
      for (let level = 1; level <= LEVELS_PER_UNIT; level++) {
        const plan = generateLesson(idx, u.id, level, {
          profile, memory: {}, now: 0, seed: `${u.id}-${level}`, speakEnabled: true, listenEnabled: true,
        });
        expect(plan.exercises.length, `${u.id} niveau ${level}`).toBeGreaterThanOrEqual(10);
        for (const ex of plan.exercises) expect(solveAndGrade(ex), `${u.id} ${level} ${ex.type}`).toBe(true);
      }
    }
  });

  it("présente d'abord les nouveaux mots en images", () => {
    const u = idx.units[0];
    const plan = generateLesson(idx, u.id, 1, { profile, memory: {}, now: 0, seed: 1, speakEnabled: false, listenEnabled: false });
    const first = plan.exercises.slice(0, Math.ceil(u.words.length / 2));
    expect(first.every((e) => e.type === "selectImage" && e.isNew)).toBe(true);
    expect(plan.exercises.some((e) => e.type === "speak" || e.type === "listenType" || e.type === "listenOrder" || e.type === "listenTrueFalse")).toBe(false);
  });

  it("génère une révision des erreurs", () => {
    const ids = idx.units[1].words.slice(0, 3).map((w) => w.id);
    const plan = generateReview(idx, "mistakes", ids, { profile, memory: {}, now: 0, seed: 2, speakEnabled: true, listenEnabled: true });
    expect(plan.exercises.length).toBeGreaterThanOrEqual(3);
    for (const ex of plan.exercises) expect(solveAndGrade(ex)).toBe(true);
  });
});
