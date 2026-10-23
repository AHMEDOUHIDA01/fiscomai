import type { Sentence, Tr, Unit, Word } from "../engine/types";
import { tokenize } from "../engine/grader/normalize";

/**
 * Petit langage pour écrire le contenu de façon compacte.
 *   w(id, en, emoji, ar, darija, fr, accept?)
 *   s(en, ar, darija, fr, accept?)
 * Les mots utilisés par chaque phrase sont détectés automatiquement.
 */
export type WordSpec = [id: string, en: string, emoji: string, ar: string, darija: string, fr: string, accept?: string];
export type SentenceSpec = [en: string, ar: string, darija: string, fr: string, accept?: string];

export const w = (...a: WordSpec) => a;
export const s = (...a: SentenceSpec) => a;
export const tr = (ar: string, darija: string, fr: string): Tr => ({ ar, darija, fr });

export function unit(
  prefix: string,
  spec: { id: string; icon: string; title: Tr; scene: Tr; words: WordSpec[]; sentences: SentenceSpec[] },
): Unit {
  const unitId = `${prefix}.${spec.id}`;
  const words: Word[] = spec.words.map(([id, en, emoji, ar, darija, fr, accept]) => ({
    id: `${unitId}.${id}`,
    en,
    emoji,
    tr: { ar, darija, fr },
    ...(accept ? { accept } : {}),
  }));
  const sentences: Sentence[] = spec.sentences.map(([en, ar, darija, fr, accept], i) => {
    const toks = ` ${tokenize(en).join(" ")} `;
    return {
      id: `${unitId}.s${i}`,
      en,
      accept: accept ?? en,
      tr: { ar, darija, fr },
      words: words.filter((wd) => toks.includes(` ${tokenize(wd.en).join(" ")} `)).map((wd) => wd.id),
    };
  });
  return { id: unitId, icon: spec.icon, title: spec.title, scene: spec.scene, words, sentences };
}
