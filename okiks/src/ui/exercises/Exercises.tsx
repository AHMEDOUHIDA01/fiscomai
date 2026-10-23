import { useEffect, useMemo, useState } from "react";
import type {
  FillBlank,
  ListenOrder,
  ListenTrueFalse,
  ListenType,
  MatchPairs,
  SelectImage,
  Speak,
  TranslateToEnglish,
  TranslateToNative,
} from "../../engine/types";
import { gradeEnglish, gradeTiles, type GradeResult } from "../../engine/grader";
import { canRecognizeSpeech, listenOnce, sayEnglish, sfx } from "../../audio";
import { dirOf, pickTr, translate } from "../../i18n/strings";
import { createRng, shuffle } from "../../engine/rng";
import type { ExerciseProps, ExerciseResult } from "./types";
import { EnglishLine, SpeakButtons, TileBank, useTileBank } from "./shared";

/** Convertit le verdict du correcteur en résultat affichable. */
function fromGrade(g: GradeResult, reference: string, meaning?: string): ExerciseResult {
  if (g.verdict === "correct") return { correct: true, verdict: "correct", meaning };
  if (g.verdict === "typo")
    return {
      correct: true,
      verdict: "typo",
      solution: g.closest,
      highlights: g.ops.filter((o) => o.kind !== "exact").map((o) => o.expected.split(" ")).flat(),
      meaning,
    };
  const bad = g.ops.filter((o) => o.kind === "wrong_word" || o.kind === "missing_word").map((o) => o.expected);
  // On montre la phrase de référence si l'élève est très loin, sinon la variante la plus proche.
  const solution = bad.length > 2 ? reference : g.closest || reference;
  return { correct: false, verdict: "wrong", solution, highlights: bad, meaning };
}

// ---------------------------------------------------------------------------

export function SelectImageEx({ ex, lang, settings, locked, setChecker }: ExerciseProps<SelectImage>) {
  const [sel, setSel] = useState<string | null>(null);
  useEffect(() => {
    setChecker(
      sel === null
        ? null
        : () => {
            const answer = ex.options.find((o) => o.wordId === ex.answerId)!;
            return sel === ex.answerId
              ? { correct: true, verdict: "correct", meaning: pickTr(lang, answer.label) }
              : { correct: false, verdict: "wrong", solution: ex.prompt, meaning: pickTr(lang, answer.label) };
          },
    );
  }, [sel, ex, lang, setChecker]);
  return (
    <div className="ex">
      {ex.isNew && <span className="badge badge--new">{translate(lang, "exNewWord")}</span>}
      <div className="ex__prompt-row">
        <SpeakButtons text={ex.prompt} slowDefault={settings.slowTts} autoPlay={settings.listenEnabled} slowLabel={translate(lang, "slow")} />
        <p className="ex__english" lang="en" dir="ltr">{ex.prompt}</p>
      </div>
      <div className="choice-grid">
        {ex.options.map((o, i) => (
          <button
            key={o.wordId}
            type="button"
            className={`choice-card ${sel === o.wordId ? "is-selected" : ""}`}
            disabled={locked}
            onClick={() => {
              setSel(o.wordId);
              sfx.tap();
            }}
            aria-pressed={sel === o.wordId}
          >
            <span className="choice-card__emoji" aria-hidden="true">{o.emoji}</span>
            <span className="choice-card__label">{pickTr(lang, o.label)}</span>
            <kbd className="choice-card__key">{i + 1}</kbd>
          </button>
        ))}
      </div>
    </div>
  );
}

export function TranslateToEnglishEx({ ex, lang, settings, locked, setChecker }: ExerciseProps<TranslateToEnglish>) {
  const [useKeyboard, setUseKeyboard] = useState(!ex.tiles);
  const [typed, setTyped] = useState("");
  const tiles = ex.tiles ?? [];
  const bank = useTileBank(tiles);
  const answer = useKeyboard ? typed : bank.text;
  useEffect(() => {
    setChecker(answer.trim() === "" ? null : () => fromGrade(gradeEnglish(ex.accept, answer), ex.reference));
  }, [answer, ex, setChecker]);
  return (
    <div className="ex">
      <div className="bubble-row">
        <span className="bubble-row__avatar" aria-hidden="true">🧕</span>
        <p className="bubble" dir={dirOf(lang)}>{pickTr(lang, ex.source)}</p>
      </div>
      {useKeyboard ? (
        <textarea
          className="answer-input"
          dir="ltr"
          lang="en"
          autoFocus
          rows={3}
          value={typed}
          disabled={locked}
          placeholder={translate(lang, "typeInEnglish")}
          onChange={(e) => setTyped(e.target.value)}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
      ) : (
        <TileBank tiles={tiles} bank={bank} locked={locked} dir="ltr" lang="en" onTap={(w) => settings.listenEnabled && sayEnglish(w, settings.slowTts)} />
      )}
      {ex.tiles && !locked && (
        <button type="button" className="link-btn" onClick={() => setUseKeyboard((k) => !k)}>
          {translate(lang, useKeyboard ? "useTiles" : "useKeyboard")}
        </button>
      )}
    </div>
  );
}

export function TranslateToNativeEx({ ex, lang, settings, locked, setChecker }: ExerciseProps<TranslateToNative>) {
  const tiles = ex.tiles[lang];
  const bank = useTileBank(tiles);
  useEffect(() => {
    setChecker(
      bank.text === ""
        ? null
        : () => {
            const g = gradeTiles([ex.answer[lang]], bank.text);
            return g.verdict === "correct"
              ? { correct: true, verdict: "correct" }
              : { correct: false, verdict: "wrong", solution: ex.answer[lang] };
          },
    );
  }, [bank.text, ex, lang, setChecker]);
  return (
    <div className="ex">
      <div className="bubble-row">
        <span className="bubble-row__avatar" aria-hidden="true">🧔🏽</span>
        <div className="bubble bubble--en">
          {settings.listenEnabled && <SpeakButtons text={ex.english} slowDefault={settings.slowTts} slowLabel={translate(lang, "slow")} />}
          <EnglishLine text={ex.english} slow={settings.slowTts} />
        </div>
      </div>
      <TileBank tiles={tiles} bank={bank} locked={locked} dir={dirOf(lang)} />
    </div>
  );
}

export function ListenTypeEx({ ex, lang, settings, locked, setChecker, finish }: ExerciseProps<ListenType>) {
  const [typed, setTyped] = useState("");
  useEffect(() => {
    setChecker(typed.trim() === "" ? null : () => fromGrade(gradeEnglish(ex.accept, typed), ex.english));
  }, [typed, ex, setChecker]);
  return (
    <div className="ex">
      <SpeakButtons text={ex.english} slowDefault={settings.slowTts} big slowLabel={translate(lang, "slow")} />
      <textarea
        className="answer-input"
        dir="ltr"
        lang="en"
        rows={3}
        value={typed}
        disabled={locked}
        placeholder={translate(lang, "typeInEnglish")}
        onChange={(e) => setTyped(e.target.value)}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />
      {!locked && (
        <button type="button" className="link-btn" onClick={() => finish({ correct: true, verdict: "correct", solution: ex.english })}>
          {translate(lang, "cantListen")}
        </button>
      )}
    </div>
  );
}

export function FillBlankEx({ ex, lang, locked, setChecker }: ExerciseProps<FillBlank>) {
  const [sel, setSel] = useState<string | null>(null);
  useEffect(() => {
    setChecker(
      sel === null
        ? null
        : () =>
            sel === ex.answer
              ? { correct: true, verdict: "correct", meaning: pickTr(lang, ex.hint) }
              : { correct: false, verdict: "wrong", solution: `${ex.before} ${ex.answer}${ex.after}`.trim(), highlights: [ex.answer.toLowerCase()], meaning: pickTr(lang, ex.hint) },
    );
  }, [sel, ex, lang, setChecker]);
  return (
    <div className="ex">
      <p className="ex__hint" dir={dirOf(lang)}>{pickTr(lang, ex.hint)}</p>
      <p className="blank-sentence" lang="en" dir="ltr">
        {ex.before && <span>{ex.before} </span>}
        <span className={`blank ${sel ? "blank--filled" : ""}`}>{sel ?? "____"}</span>
        <span>{ex.after}</span>
      </p>
      <div className="option-row" dir="ltr">
        {ex.options.map((o) => (
          <button key={o} type="button" className={`tile tile--big ${sel === o ? "is-selected" : ""}`} disabled={locked} onClick={() => setSel(o)} lang="en">
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

export function MatchPairsEx({ ex, lang, settings, locked, finish, setChecker }: ExerciseProps<MatchPairs>) {
  const order = useMemo(() => {
    const rng = createRng(ex.id);
    return { left: shuffle(rng, ex.pairs), right: shuffle(rng, ex.pairs) };
  }, [ex]);
  const [left, setLeft] = useState<string | null>(null);
  const [right, setRight] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null);
  const [mistakes, setMistakes] = useState(0);

  useEffect(() => setChecker(null), [setChecker]);

  useEffect(() => {
    if (!left || !right) return;
    if (left === right) {
      sfx.correct();
      const next = [...done, left];
      setDone(next);
      if (next.length === ex.pairs.length) {
        // Une association n'est « juste » que si elle a été trouvée sans erreur.
        setTimeout(() => finish({ correct: mistakes === 0, verdict: mistakes === 0 ? "correct" : "wrong" }), 350);
      }
    } else {
      sfx.wrong();
      setMistakes((m) => m + 1);
      setWrongPair([left, right]);
      setTimeout(() => setWrongPair(null), 500);
    }
    setLeft(null);
    setRight(null);
  }, [left, right]); // eslint-disable-line react-hooks/exhaustive-deps

  const cls = (id: string, side: "l" | "r") =>
    `pair ${done.includes(id) ? "pair--done" : ""} ${(side === "l" ? left : right) === id ? "is-selected" : ""} ${
      wrongPair && wrongPair[side === "l" ? 0 : 1] === id ? "pair--wrong" : ""
    }`;

  return (
    <div className="ex pairs">
      <div className="pairs__col" dir="ltr" lang="en">
        {order.left.map((p) => (
          <button
            key={p.wordId}
            type="button"
            className={cls(p.wordId, "l")}
            disabled={locked || done.includes(p.wordId)}
            onClick={() => {
              setLeft(p.wordId);
              if (settings.listenEnabled) sayEnglish(p.en, settings.slowTts);
            }}
          >
            {p.en}
          </button>
        ))}
      </div>
      <div className="pairs__col" dir={dirOf(lang)}>
        {order.right.map((p) => (
          <button key={p.wordId} type="button" className={cls(p.wordId, "r")} disabled={locked || done.includes(p.wordId)} onClick={() => setRight(p.wordId)}>
            {pickTr(lang, p.tr)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ListenOrderEx({ ex, lang, settings, locked, setChecker, finish }: ExerciseProps<ListenOrder>) {
  const bank = useTileBank(ex.tiles);
  useEffect(() => {
    setChecker(bank.text === "" ? null : () => fromGrade(gradeEnglish(ex.accept, bank.text), ex.english));
  }, [bank.text, ex, setChecker]);
  return (
    <div className="ex">
      <SpeakButtons text={ex.english} slowDefault={settings.slowTts} big slowLabel={translate(lang, "slow")} />
      <TileBank tiles={ex.tiles} bank={bank} locked={locked} dir="ltr" lang="en" />
      {!locked && (
        <button type="button" className="link-btn" onClick={() => finish({ correct: true, verdict: "correct", solution: ex.english })}>
          {translate(lang, "cantListen")}
        </button>
      )}
    </div>
  );
}

export function SpeakEx({ ex, lang, settings, locked, setChecker, finish }: ExerciseProps<Speak>) {
  const [state, setState] = useState<"idle" | "listening" | "heard" | "error">("idle");
  const [heard, setHeard] = useState<string[]>([]);
  const supported = canRecognizeSpeech();

  useEffect(() => {
    setChecker(
      heard.length === 0
        ? null
        : () => {
            // On garde la meilleure des transcriptions proposées par le navigateur.
            const best = heard
              .map((h) => gradeEnglish(ex.accept, h, "speech"))
              .sort((a, b) => a.cost - b.cost)[0];
            const r = fromGrade(best, ex.english, pickTr(lang, ex.tr));
            return r.verdict === "typo" ? { ...r, verdict: "correct", solution: undefined } : r;
          },
    );
  }, [heard, ex, lang, setChecker]);

  const start = () => {
    setState("listening");
    const { result } = listenOnce();
    result
      .then((alts) => {
        setHeard(alts);
        setState(alts.length ? "heard" : "idle");
      })
      .catch(() => setState("error"));
  };

  return (
    <div className="ex">
      <div className="bubble-row">
        <span className="bubble-row__avatar" aria-hidden="true">👩🏽‍💼</span>
        <div className="bubble bubble--en">
          <SpeakButtons text={ex.english} slowDefault={settings.slowTts} autoPlay={settings.listenEnabled} slowLabel={translate(lang, "slow")} />
          <EnglishLine text={ex.english} slow={settings.slowTts} />
        </div>
      </div>
      {supported ? (
        <button type="button" className={`mic ${state === "listening" ? "mic--on" : ""}`} disabled={locked || state === "listening"} onClick={start}>
          <span aria-hidden="true">🎙️</span> {translate(lang, state === "listening" ? "listening" : "tapToSpeak")}
        </button>
      ) : (
        <p className="ex__note">{translate(lang, "speechUnsupported")}</p>
      )}
      {heard[0] && (
        <p className="ex__note">
          {translate(lang, "youSaid")} <q lang="en" dir="ltr">{heard[0]}</q>
        </p>
      )}
      {!locked && (
        <button type="button" className="link-btn" onClick={() => finish({ correct: true, verdict: "correct", solution: ex.english })}>
          {translate(lang, "cantSpeak")}
        </button>
      )}
    </div>
  );
}

export function ListenTrueFalseEx({ ex, lang, settings, locked, setChecker }: ExerciseProps<ListenTrueFalse>) {
  const [sel, setSel] = useState<boolean | null>(null);
  useEffect(() => {
    setChecker(
      sel === null
        ? null
        : () =>
            sel === ex.isMatch
              ? { correct: true, verdict: "correct", meaning: `${ex.spoken}` }
              : { correct: false, verdict: "wrong", solution: ex.spoken, meaning: pickTr(lang, ex.shownLabel) },
    );
  }, [sel, ex, lang, setChecker]);
  return (
    <div className="ex ex--center">
      <SpeakButtons text={ex.spoken} slowDefault={settings.slowTts} big slowLabel={translate(lang, "slow")} />
      <div className="tf-card" aria-hidden="true">{ex.emoji}</div>
      <div className="option-row">
        <button type="button" className={`tile tile--big ${sel === true ? "is-selected" : ""}`} disabled={locked} onClick={() => setSel(true)}>
          ✅ {translate(lang, "yes")}
        </button>
        <button type="button" className={`tile tile--big ${sel === false ? "is-selected" : ""}`} disabled={locked} onClick={() => setSel(false)}>
          ❌ {translate(lang, "no")}
        </button>
      </div>
    </div>
  );
}
