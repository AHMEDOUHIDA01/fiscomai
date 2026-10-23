import type { ProgressState } from "./engine/progress/state";
import { translate } from "./i18n/strings";

/** Texte du rappel, dans la langue de l'élève (partagé avec le service worker). */
export function reminderText(state: ProgressState, test = false): { title: string; body: string } {
  const lang = state.uiLang ?? "fr";
  const title = translate(lang, "notifTitle");
  if (!test && state.streak.current > 0) return { title, body: translate(lang, "notifStreak", { n: state.streak.current }) };
  return { title, body: translate(lang, "notifBody") };
}
