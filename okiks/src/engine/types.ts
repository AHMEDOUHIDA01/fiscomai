export type UiLang = "ar" | "darija" | "fr";
export type Profile = "kids" | "adult" | "pro";

/** Texte dans les trois langues d'interface. */
export type Tr = Record<UiLang, string>;

export interface Word {
  id: string;
  /** Forme anglaise affichée. */
  en: string;
  /** Réponses anglaises acceptées (DSL) — par défaut `en`. */
  accept?: string;
  tr: Tr;
  emoji: string;
}

export interface Sentence {
  id: string;
  /** Phrase anglaise de référence (affichée, lue par la synthèse vocale). */
  en: string;
  /** Réponses anglaises acceptées (DSL du grader). */
  accept: string;
  tr: Tr;
  /** Ids des mots de l'unité utilisés dans la phrase. */
  words: string[];
}

export interface Unit {
  id: string;
  title: Tr;
  /** Emoji / pictogramme de l'unité. */
  icon: string;
  /** Petite mise en scène marocaine (personnage + lieu). */
  scene: Tr;
  words: Word[];
  sentences: Sentence[];
}

export interface Section {
  id: string;
  title: Tr;
  units: Unit[];
}

export interface Course {
  profile: Profile;
  sections: Section[];
}

export const LEVELS_PER_UNIT = 5;

// ---------------------------------------------------------------------------
// Exercices

export type ExerciseType =
  | "selectImage"
  | "translateToEnglish"
  | "translateToNative"
  | "listenType"
  | "fillBlank"
  | "matchPairs"
  | "listenOrder"
  | "speak"
  | "listenTrueFalse";

interface Base {
  id: string;
  type: ExerciseType;
  /** Mots travaillés (pour le SRS). */
  wordIds: string[];
}

export interface SelectImage extends Base {
  type: "selectImage";
  /** Mot anglais demandé ; on choisit la bonne image. */
  prompt: string;
  options: { wordId: string; emoji: string; label: Tr }[];
  answerId: string;
  isNew: boolean;
}

export interface TranslateToEnglish extends Base {
  type: "translateToEnglish";
  source: Tr;
  accept: string;
  reference: string;
  /** Tuiles anglaises si l'exercice se fait avec la banque de mots. */
  tiles?: string[];
}

export interface TranslateToNative extends Base {
  type: "translateToNative";
  english: string;
  /** Tuiles par langue d'interface (bonnes + leurres), mélangées. */
  tiles: Record<keyof Tr, string[]>;
  answer: Tr;
}

export interface ListenType extends Base {
  type: "listenType";
  english: string;
  accept: string;
}

export interface FillBlank extends Base {
  type: "fillBlank";
  before: string;
  after: string;
  options: string[];
  answer: string;
  hint: Tr;
}

export interface MatchPairs extends Base {
  type: "matchPairs";
  pairs: { wordId: string; en: string; tr: Tr }[];
}

export interface ListenOrder extends Base {
  type: "listenOrder";
  english: string;
  accept: string;
  tiles: string[];
}

export interface Speak extends Base {
  type: "speak";
  english: string;
  accept: string;
  tr: Tr;
}

export interface ListenTrueFalse extends Base {
  type: "listenTrueFalse";
  /** Mot prononcé. */
  spoken: string;
  /** Image montrée. */
  emoji: string;
  shownLabel: Tr;
  isMatch: boolean;
}

export type Exercise =
  | SelectImage
  | TranslateToEnglish
  | TranslateToNative
  | ListenType
  | FillBlank
  | MatchPairs
  | ListenOrder
  | Speak
  | ListenTrueFalse;

export type SessionKind = "lesson" | "mistakes" | "practice";

export interface SessionPlan {
  id: string;
  kind: SessionKind;
  unitId?: string;
  level?: number;
  exercises: Exercise[];
}
