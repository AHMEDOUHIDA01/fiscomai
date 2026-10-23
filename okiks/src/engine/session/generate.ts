import type { Exercise, Profile, Sentence, SessionPlan, Unit, Word } from "../types";
import { LEVELS_PER_UNIT } from "../types";
import { createRng, pick, shuffle, type Rng } from "../rng";
import { weakestWords, type WordMemory } from "../srs/srs";
import type { CourseIndex } from "./courseIndex";
import * as B from "./builders";

export const LESSON_LENGTH = 12;

export interface GenerateOptions {
  profile: Profile;
  memory: Record<string, WordMemory>;
  now: number;
  seed?: number | string;
  /** Exercices de prononciation autorisés (micro disponible et accepté). */
  speakEnabled: boolean;
  /** Exercices d'écoute autorisés. */
  listenEnabled: boolean;
}

/**
 * Mots introduits à un niveau donné : niveau 1 = première moitié, niveau 2 = le reste.
 * Les niveaux suivants n'introduisent rien et travaillent les phrases.
 */
export function newWordsForLevel(unit: Unit, level: number): Word[] {
  const half = Math.ceil(unit.words.length / 2);
  if (level === 1) return unit.words.slice(0, half);
  if (level === 2) return unit.words.slice(half);
  return [];
}

/** Mots connus à la fin du niveau (pour choisir des phrases réalisables). */
export function knownWordsAtLevel(unit: Unit, level: number): Set<string> {
  const half = Math.ceil(unit.words.length / 2);
  return new Set(unit.words.slice(0, level <= 1 ? half : unit.words.length).map((w) => w.id));
}

type Maker = () => Exercise | null;

export function generateLesson(index: CourseIndex, unitId: string, level: number, opts: GenerateOptions): SessionPlan {
  const unit = index.unitById.get(unitId);
  if (!unit) throw new Error(`Unité inconnue : ${unitId}`);
  if (level < 1 || level > LEVELS_PER_UNIT) throw new Error(`Niveau invalide : ${level}`);
  const rng = createRng(opts.seed ?? `${unitId}:${level}:${opts.now}`);

  const known = knownWordsAtLevel(unit, level);
  const knownWords = unit.words.filter((w) => known.has(w.id));
  const fresh = newWordsForLevel(unit, level);
  const sentences = unit.sentences.filter((s) => s.words.every((id) => known.has(id) || !index.wordById.has(id)));
  const otherSentences = index.allSentences.filter((s) => !sentences.includes(s));

  const out: Exercise[] = [];

  // 1. Présentation des nouveaux mots : toujours d'abord en « choisir l'image ».
  for (const w of fresh) out.push(B.selectImage(rng, w, unit.words, true));

  // 2. Révision espacée : ~20 % de mots faibles des unités précédentes.
  const order = index.unitOrder.get(unitId) ?? 0;
  const previousIds = index.units.slice(0, order).flatMap((u) => u.words.map((w) => w.id));
  const reviewIds = weakestWords(opts.memory, previousIds, Math.round(LESSON_LENGTH * 0.2), opts.now);
  const review = reviewIds.map((id) => index.wordById.get(id)!.word);

  // 3. Exercices de l'unité selon le profil et le niveau.
  const makers = unitMakers(rng, opts, level, knownWords, sentences, otherSentences);
  const target = LESSON_LENGTH - review.length;
  let guard = 0;
  while (out.length < target && guard++ < 200 && makers.length > 0) {
    const ex = pick(rng, makers)();
    if (ex && !isDuplicate(out, ex)) out.push(ex);
  }

  const reviewExercises = review.map((w) => reviewExercise(rng, w, opts, [...index.wordById.values()].map((x) => x.word)));
  const body = out.slice(fresh.length);
  const exercises = [...out.slice(0, fresh.length), ...shuffle(rng, [...body, ...reviewExercises])];

  return { id: `lesson-${unitId}-${level}-${opts.now}`, kind: "lesson", unitId, level, exercises };
}

/** Révision ciblée : erreurs récentes ou mots les plus faibles de tout le parcours. */
export function generateReview(
  index: CourseIndex,
  kind: "mistakes" | "practice",
  wordIds: string[],
  opts: GenerateOptions,
): SessionPlan {
  const rng = createRng(opts.seed ?? `${kind}:${opts.now}`);
  const words = wordIds.map((id) => index.wordById.get(id)?.word).filter((w): w is Word => !!w);
  const all = [...index.wordById.values()].map((x) => x.word);
  const exercises: Exercise[] = [];
  const idSet = new Set(wordIds);
  const sentences = index.allSentences.filter((s) => s.words.some((id) => idSet.has(id)));
  for (const w of words.slice(0, 8)) exercises.push(reviewExercise(rng, w, opts, all));
  for (const s of shuffle(rng, sentences).slice(0, Math.max(0, LESSON_LENGTH - exercises.length))) {
    exercises.push(
      opts.profile === "kids" ? B.listenOrder(rng, s, index.allSentences) : B.translateToEnglish(rng, s, index.allSentences, rng() < 0.5),
    );
  }
  return { id: `${kind}-${opts.now}`, kind, exercises: shuffle(rng, exercises) };
}

// ---------------------------------------------------------------------------

function unitMakers(
  rng: Rng,
  opts: GenerateOptions,
  level: number,
  words: Word[],
  sentences: Sentence[],
  others: Sentence[],
): Maker[] {
  const kids = opts.profile === "kids";
  const anyWord = () => pick(rng, words);
  const anySentence = () => (sentences.length ? pick(rng, sentences) : null);
  const m: Maker[] = [];
  const add = (weight: number, f: Maker) => {
    for (let i = 0; i < weight; i++) m.push(f);
  };

  add(kids ? 3 : 1, () => B.selectImage(rng, anyWord(), words, false));
  add(2, () => B.matchPairs(rng, words));
  if (opts.listenEnabled) add(kids ? 3 : 1, () => B.listenTrueFalse(rng, anyWord(), words));
  if (!kids && level <= 2) add(1, () => B.translateWord(anyWord()));

  if (sentences.length > 0) {
    const late = level >= 3;
    add(late ? 3 : 2, () => {
      const s = anySentence();
      // Enfants et premiers niveaux : banque de mots. Ensuite : clavier.
      return s && B.translateToEnglish(rng, s, others, kids || !late);
    });
    add(2, () => {
      const s = anySentence();
      return s && B.translateToNative(rng, s, others);
    });
    add(2, () => {
      const s = anySentence();
      return s && B.fillBlank(rng, s, words);
    });
    if (opts.listenEnabled) {
      add(kids ? 3 : 2, () => {
        const s = anySentence();
        return s && B.listenOrder(rng, s, others);
      });
      if (!kids && late) add(2, () => {
        const s = anySentence();
        return s && B.listenType(s);
      });
    }
    if (opts.speakEnabled) add(1, () => {
      const s = anySentence();
      return s && B.speak(s);
    });
  }
  return m;
}

function reviewExercise(rng: Rng, w: Word, opts: GenerateOptions, pool: Word[]): Exercise {
  if (opts.profile === "kids") return opts.listenEnabled && rng() < 0.5 ? B.listenTrueFalse(rng, w, pool) : B.selectImage(rng, w, pool, false);
  return rng() < 0.5 ? B.translateWord(w) : B.selectImage(rng, w, pool, false);
}

/** Évite deux fois le même exercice sur le même contenu dans une leçon. */
function isDuplicate(list: Exercise[], ex: Exercise): boolean {
  const key = contentKey(ex);
  return list.some((e) => contentKey(e) === key);
}

function contentKey(ex: Exercise): string {
  switch (ex.type) {
    case "selectImage":
      return `${ex.type}:${ex.answerId}`;
    case "listenTrueFalse":
      return `${ex.type}:${ex.spoken}`;
    case "matchPairs":
      return `${ex.type}:${[...ex.wordIds].sort().join(",")}`;
    case "translateToEnglish":
      return `${ex.type}:${ex.reference}`;
    case "translateToNative":
      return `${ex.type}:${ex.english}`;
    case "fillBlank":
      return `${ex.type}:${ex.before}_${ex.after}`;
    default:
      return `${ex.type}:${ex.english}`;
  }
}
