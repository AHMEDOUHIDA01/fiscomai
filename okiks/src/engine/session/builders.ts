import type {
  FillBlank,
  ListenOrder,
  ListenTrueFalse,
  MatchPairs,
  Sentence,
  SelectImage,
  Speak,
  TranslateToEnglish,
  TranslateToNative,
  ListenType,
  Tr,
  UiLang,
  Word,
} from "../types";
import { normalizeText } from "../grader/normalize";
import { pick, sample, shuffle, type Rng } from "../rng";

/** Fabrique d'exercices à partir d'un mot ou d'une phrase du contenu. */

let counter = 0;
const nextId = (prefix: string) => `${prefix}-${(counter++).toString(36)}`;

/** Découpe une phrase anglaise en tuiles (sans la ponctuation finale). */
export function englishTiles(s: string): string[] {
  return s.replace(/[.!?,]/g, "").split(/\s+/).filter(Boolean);
}

export function nativeTiles(s: string): string[] {
  return s.replace(/[.!?,؟،]/g, "").split(/\s+/).filter(Boolean);
}

export function selectImage(rng: Rng, word: Word, pool: Word[], isNew: boolean): SelectImage {
  const distractors = sample(
    rng,
    pool.filter((w) => w.id !== word.id && w.emoji !== word.emoji),
    2,
  );
  const options = shuffle(rng, [word, ...distractors]).map((w) => ({ wordId: w.id, emoji: w.emoji, label: w.tr }));
  return { id: nextId("img"), type: "selectImage", wordIds: [word.id], prompt: word.en, options, answerId: word.id, isNew };
}

export function listenTrueFalse(rng: Rng, word: Word, pool: Word[]): ListenTrueFalse {
  const others = pool.filter((w) => w.id !== word.id && w.emoji !== word.emoji);
  const isMatch = others.length === 0 || rng() < 0.5;
  const shown = isMatch ? word : pick(rng, others);
  return {
    id: nextId("tf"),
    type: "listenTrueFalse",
    wordIds: [word.id],
    spoken: word.en,
    emoji: shown.emoji,
    shownLabel: shown.tr,
    isMatch,
  };
}

export function matchPairs(rng: Rng, words: Word[]): MatchPairs | null {
  const chosen = sample(rng, uniqueBy(words, (w) => w.en.toLowerCase()), 5);
  if (chosen.length < 3) return null;
  return {
    id: nextId("pairs"),
    type: "matchPairs",
    wordIds: chosen.map((w) => w.id),
    pairs: chosen.map((w) => ({ wordId: w.id, en: w.en, tr: w.tr })),
  };
}

export function translateWord(word: Word): TranslateToEnglish {
  return {
    id: nextId("tw"),
    type: "translateToEnglish",
    wordIds: [word.id],
    source: word.tr,
    accept: word.accept ?? word.en,
    reference: word.en,
  };
}

export function translateToEnglish(rng: Rng, s: Sentence, others: Sentence[], withTiles: boolean): TranslateToEnglish {
  return {
    id: nextId("te"),
    type: "translateToEnglish",
    wordIds: s.words,
    source: s.tr,
    accept: s.accept,
    reference: s.en,
    tiles: withTiles ? withDistractors(rng, englishTiles(s.en), others.flatMap((o) => englishTiles(o.en)), 3) : undefined,
  };
}

export function translateToNative(rng: Rng, s: Sentence, others: Sentence[]): TranslateToNative {
  const tiles = {} as Record<UiLang, string[]>;
  for (const lang of ["ar", "darija", "fr"] as const) {
    tiles[lang] = withDistractors(rng, nativeTiles(s.tr[lang]), others.flatMap((o) => nativeTiles(o.tr[lang])), 3);
  }
  return { id: nextId("tn"), type: "translateToNative", wordIds: s.words, english: s.en, tiles, answer: stripPunct(s.tr) };
}

export function listenType(s: Sentence): ListenType {
  return { id: nextId("lt"), type: "listenType", wordIds: s.words, english: s.en, accept: s.accept };
}

export function listenOrder(rng: Rng, s: Sentence, others: Sentence[]): ListenOrder {
  return {
    id: nextId("lo"),
    type: "listenOrder",
    wordIds: s.words,
    english: s.en,
    accept: s.accept,
    tiles: withDistractors(rng, englishTiles(s.en), others.flatMap((o) => englishTiles(o.en)), 2),
  };
}

export function speak(s: Sentence): Speak {
  return { id: nextId("sp"), type: "speak", wordIds: s.words, english: s.en, accept: s.accept, tr: s.tr };
}

/** Phrase à trou : on retire un mot de l'unité présent dans la phrase. */
export function fillBlank(rng: Rng, s: Sentence, unitWords: Word[]): FillBlank | null {
  const tokens = englishTiles(s.en);
  const singleWords = unitWords.filter((w) => !w.en.includes(" "));
  const candidates = tokens
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => singleWords.some((w) => w.en.toLowerCase() === t.toLowerCase()));
  if (candidates.length === 0) return null;
  const { t: answer, i } = pick(rng, candidates);
  const distractors = sample(
    rng,
    uniqueBy(
      singleWords.filter((w) => !tokens.some((tok) => tok.toLowerCase() === w.en.toLowerCase())),
      (w) => w.en.toLowerCase(),
    ),
    2,
  ).map((w) => matchCase(w.en, answer));
  if (distractors.length < 2) return null;
  const words = s.en.split(/\s+/);
  const rest = words.slice(i + 1).join(" ");
  return {
    id: nextId("fb"),
    type: "fillBlank",
    wordIds: s.words,
    before: words.slice(0, i).join(" "),
    // `after` commence par la ponctuation collée au mot retiré (ex. « . » ou « , la suite »).
    after: punctAfter(words[i]) + (rest ? ` ${rest}` : ""),
    options: shuffle(rng, [answer, ...distractors]),
    answer,
    hint: s.tr,
  };
}

// ---------------------------------------------------------------------------

function withDistractors(rng: Rng, correct: string[], pool: string[], n: number): string[] {
  const lower = new Set(correct.map((t) => normalizeText(t)));
  const extra = sample(
    rng,
    uniqueBy(pool.filter((t) => !lower.has(normalizeText(t))), (t) => normalizeText(t)),
    n,
  );
  return shuffle(rng, [...correct, ...extra]);
}

function uniqueBy<T>(items: T[], key: (t: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((x) => {
    const k = key(x);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function stripPunct(tr: Tr): Tr {
  return { ar: nativeTiles(tr.ar).join(" "), darija: nativeTiles(tr.darija).join(" "), fr: nativeTiles(tr.fr).join(" ") };
}

function matchCase(word: string, model: string): string {
  return model[0] === model[0].toUpperCase() ? word[0].toUpperCase() + word.slice(1) : word.toLowerCase();
}

function punctAfter(token: string): string {
  const m = token.match(/[.!?,]+$/);
  return m ? m[0] : "";
}
