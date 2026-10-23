import { useEffect, useRef, useState } from "react";
import { sayEnglish } from "../../audio";
import { normalizeText } from "../../engine/grader";
import { E } from "../components/Emoji3D";

/** Bouton haut-parleur (+ version lente). */
export function SpeakButtons({ text, slowDefault, big, autoPlay = true, slowLabel }: { text: string; slowDefault: boolean; big?: boolean; autoPlay?: boolean; slowLabel: string }) {
  const played = useRef(false);
  useEffect(() => {
    if (autoPlay && !played.current) {
      played.current = true;
      const t = setTimeout(() => sayEnglish(text, slowDefault), 250);
      return () => clearTimeout(t);
    }
  }, [text, slowDefault, autoPlay]);
  return (
    <div className="speak-buttons">
      <button type="button" className={`speaker ${big ? "speaker--big" : ""}`} onClick={() => sayEnglish(text, slowDefault)} aria-label="▶ English">
        <E e="🔊" size={big ? 56 : 30} />
      </button>
      <button type="button" className="speaker speaker--slow" onClick={() => sayEnglish(text, true)} aria-label={slowLabel} title={slowLabel}>
        <E e="🐢" size={24} />
      </button>
    </div>
  );
}

/** Phrase anglaise dont chaque mot peut être prononcé en le touchant. */
export function EnglishLine({ text, slow }: { text: string; slow: boolean }) {
  return (
    <p className="english-line" lang="en" dir="ltr">
      {text.split(" ").map((w, i) => (
        <button key={i} type="button" className="english-line__word" onClick={() => sayEnglish(w.replace(/[.,!?]/g, ""), slow)}>
          {w}
        </button>
      ))}
    </p>
  );
}

/**
 * Banque de mots : on touche les tuiles pour construire la réponse.
 * Chaque tuile garde son identité (index) même si deux tuiles ont le même texte.
 */
export function useTileBank(tiles: string[]) {
  const [chosen, setChosen] = useState<number[]>([]);
  const add = (i: number) => setChosen((c) => (c.includes(i) ? c : [...c, i]));
  const remove = (i: number) => setChosen((c) => c.filter((x) => x !== i));
  const text = chosen.map((i) => tiles[i]).join(" ");
  return { chosen, add, remove, text, reset: () => setChosen([]) };
}

export function TileBank({ tiles, bank, locked, dir, lang, onTap }: { tiles: string[]; bank: ReturnType<typeof useTileBank>; locked: boolean; dir: "ltr" | "rtl"; lang?: string; onTap?: (word: string) => void }) {
  return (
    <div className="tilebank">
      <div className="tilebank__answer" dir={dir} lang={lang} aria-live="polite">
        {bank.chosen.map((i) => (
          <button key={i} type="button" className="tile" disabled={locked} onClick={() => bank.remove(i)}>
            {tiles[i]}
          </button>
        ))}
      </div>
      <div className="tilebank__pool" dir={dir} lang={lang}>
        {tiles.map((t, i) => (
          <button
            key={i}
            type="button"
            className={`tile ${bank.chosen.includes(i) ? "tile--used" : ""}`}
            disabled={locked || bank.chosen.includes(i)}
            onClick={() => {
              bank.add(i);
              onTap?.(t);
            }}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Mots d'une solution qui diffèrent de la réponse donnée (pour les souligner). */
export function diffWords(solution: string, answer: string): string[] {
  const given = new Set(normalizeText(answer).split(" "));
  return normalizeText(solution)
    .split(" ")
    .filter((w) => w && !given.has(w));
}
