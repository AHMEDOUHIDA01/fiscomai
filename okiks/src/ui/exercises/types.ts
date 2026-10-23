import type { Settings } from "../../engine/progress/state";
import type { UiLang } from "../../engine/types";

export interface ExerciseResult {
  correct: boolean;
  verdict: "correct" | "typo" | "wrong";
  /** Bonne réponse à afficher en cas d'erreur (ou corrigée en cas de faute de frappe). */
  solution?: string;
  /** Mots fautifs à souligner dans la solution. */
  highlights?: string[];
  /** Traduction / sens à rappeler. */
  meaning?: string;
}

export interface ExerciseProps<E> {
  ex: E;
  lang: UiLang;
  settings: Settings;
  /** Verrouillé après « Vérifier ». */
  locked: boolean;
  /** Déclare la fonction de correction quand une réponse est prête (null sinon). */
  setChecker(check: (() => ExerciseResult) | null): void;
  /** Pour les exercices qui se valident seuls (paires) ou qu'on passe. */
  finish(result: ExerciseResult): void;
}
