import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Exercise, Profile, SessionKind, SessionPlan } from "../../engine/types";
import { generateLesson, generateReview } from "../../engine/session/generate";
import { weakestWords } from "../../engine/srs/srs";
import { currentHearts, HEARTS_REFILL_PRICE, msToNextHeart } from "../../engine/progress/hearts";
import { heartsEnabled } from "../../engine/progress/state";
import type { SessionReward } from "../../engine/progress/reducer";
import { ACHIEVEMENTS } from "../../engine/progress/achievements";
import { courseIndex } from "../../content";
import { useApp, useLang, useT } from "../../store";
import { dirOf, formatDuration, pickTr, type StringKey } from "../../i18n/strings";
import { canRecognizeSpeech, sfx } from "../../audio";
import { navigate } from "../router";
import { Button, Modal, ProgressBar } from "../components/common";
import { Mascot } from "../components/Mascot";
import { Zellige } from "../components/Zellige";
import type { ExerciseResult } from "../exercises/types";
import * as X from "../exercises/Exercises";
import { Confetti, CountUp, haptic } from "../components/Fx";
import type { Mood } from "../components/Mascot";
import { E } from "../components/Emoji3D";

const INSTRUCTION: Record<Exercise["type"], StringKey> = {
  selectImage: "exSelectImage",
  translateToEnglish: "exTranslateToEnglish",
  translateToNative: "exTranslateToNative",
  listenType: "exListenType",
  fillBlank: "exFillBlank",
  matchPairs: "exMatchPairs",
  listenOrder: "exListenOrder",
  speak: "exSpeak",
  listenTrueFalse: "exListenTrueFalse",
};

const LISTENING = new Set<Exercise["type"]>(["listenType", "listenOrder", "listenTrueFalse"]);
const WRITING = new Set<Exercise["type"]>(["translateToEnglish", "listenType"]);

function buddyMood(ex: Exercise): Mood {
  if (WRITING.has(ex.type)) return "write";
  if (ex.type === "speak" || LISTENING.has(ex.type)) return "think";
  return "happy";
}

type Props = { kind: SessionKind; unitId?: string; level?: number };

export function LessonScreen({ kind, unitId, level }: Props) {
  const t = useT();
  const lang = useLang();
  const state = useApp((s) => s.state);
  const dispatch = useApp((s) => s.dispatch);
  const profile = state.profile as Profile;

  // La leçon est générée une seule fois à l'ouverture.
  const plan = useMemo<SessionPlan>(() => {
    const idx = courseIndex(profile);
    const opts = {
      profile,
      memory: state.memory,
      now: Date.now(),
      speakEnabled: state.settings.speakEnabled && canRecognizeSpeech(),
      listenEnabled: state.settings.listenEnabled,
    };
    if (kind === "lesson" && unitId && level) return generateLesson(idx, unitId, level, opts);
    const courseWords = [...idx.wordById.keys()];
    const ids =
      kind === "mistakes"
        ? state.mistakes.filter((id) => idx.wordById.has(id))
        : weakestWords(state.memory, courseWords, 10, Date.now());
    return generateReview(idx, kind === "mistakes" ? "mistakes" : "practice", ids.length ? ids : courseWords.slice(0, 8), opts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [queue, setQueue] = useState<Exercise[]>(plan.exercises);
  const [pos, setPos] = useState(0);
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [checker, setCheckerState] = useState<(() => ExerciseResult) | null>(null);
  const [stats, setStats] = useState({ mistakes: 0, correct: 0, listenCorrect: 0, combo: 0, maxCombo: 0 });
  const [retried, setRetried] = useState<Set<string>>(new Set());
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [reward, setReward] = useState<SessionReward | null>(null);
  const started = useRef(Date.now());

  const setChecker = useCallback((c: (() => ExerciseResult) | null) => setCheckerState(() => c), []);
  const ex = queue[pos];
  const usesHearts = kind === "lesson" && heartsEnabled(state);
  const hearts = currentHearts(state.hearts, Date.now()).count;
  const outOfHearts = usesHearts && hearts === 0 && !reward;

  const record = (r: ExerciseResult) => {
    setResult(r);
    (r.correct ? sfx.correct : sfx.wrong)();
    haptic(r.correct ? 18 : [40, 60, 40]);
    dispatch({ type: "answer", wordIds: ex.wordIds, correct: r.correct, exerciseType: ex.type, sessionKind: kind });
    setStats((s) => {
      const combo = r.correct ? s.combo + 1 : 0;
      return {
        mistakes: s.mistakes + (r.correct ? 0 : 1),
        correct: s.correct + (r.correct ? 1 : 0),
        listenCorrect: s.listenCorrect + (r.correct && LISTENING.has(ex.type) ? 1 : 0),
        combo,
        maxCombo: Math.max(s.maxCombo, combo),
      };
    });
    // Un exercice raté revient une seule fois en fin de leçon (la copie porte le suffixe « -r »).
    const baseId = ex.id.replace(/-r$/, "");
    if (!r.correct && !retried.has(baseId)) {
      setRetried((set) => new Set(set).add(baseId));
      setQueue((q) => [...q, { ...ex, id: `${baseId}-r` }]);
    }
  };

  const check = () => {
    if (!checker || result) return;
    record(checker());
  };

  const next = () => {
    setResult(null);
    setCheckerState(null);
    if (pos + 1 < queue.length) {
      setPos(pos + 1);
      return;
    }
    const r = dispatch({
      type: "sessionComplete",
      kind,
      unitId,
      level,
      mistakes: stats.mistakes,
      correct: stats.correct,
      listenCorrect: stats.listenCorrect,
      maxCombo: stats.maxCombo,
      durationMs: Date.now() - started.current,
    });
    sfx.complete();
    setReward(r ?? null);
  };

  // Clavier : Entrée pour vérifier / continuer, Échap pour quitter.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        if ((e.target as HTMLElement)?.tagName === "TEXTAREA") e.preventDefault();
        if (result) next();
        else check();
      } else if (e.key === "Escape") setConfirmQuit(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (reward) return <LessonEnd reward={reward} stats={stats} durationMs={Date.now() - started.current} total={queue.length} />;

  const props = {
    lang,
    settings: state.settings,
    locked: result !== null,
    setChecker,
    finish: (r: ExerciseResult) => {
      if (!result) record(r);
    },
  };

  return (
    <div className="lesson" dir={dirOf(lang)}>
      <header className="lesson__top">
        <button type="button" className="icon-btn" aria-label={t("quit")} onClick={() => setConfirmQuit(true)}>
          ✕
        </button>
        <ProgressBar value={pos / queue.length + (result ? 1 / queue.length : 0)} />
        {usesHearts ? (
          <span className="stat stat--hearts" aria-label={`${hearts} ${t("hearts")}`}><E e="❤️" size={26} className="heartbeat" /> {hearts}</span>
        ) : (
          stats.combo >= 3 && <span className="stat stat--combo"><E e="🔥" size={26} className="flame" /> {stats.combo}</span>
        )}
      </header>

      <main className="lesson__body" key={ex.id}>
        <h1 className="lesson__instruction">{t(INSTRUCTION[ex.type])}</h1>
        <ExerciseView ex={ex} {...props} />
        {!result && (
          <div className="lesson__buddy">
            <Mascot size={78} mood={buddyMood(ex)} outfit={state.outfits.equipped} interactive />
            {WRITING.has(ex.type) && <span className="lesson__buddy-say">{t("lessonWrite")}</span>}
          </div>
        )}
      </main>

      <footer className={`lesson__footer ${result ? (result.correct ? "is-correct" : "is-wrong") : ""}`}>
        {result ? (
          <Feedback result={result} onNext={next} />
        ) : (
          <div className="lesson__footer-inner">
            <Button variant="ghost" onClick={() => record({ correct: false, verdict: "wrong", solution: solutionOf(ex) })}>
              {t("skip")}
            </Button>
            <Button variant="success" disabled={!checker} onClick={check}>
              {t("check")}
            </Button>
          </div>
        )}
      </footer>

      {confirmQuit && (
        <Modal onClose={() => setConfirmQuit(false)} labelledBy="quit-title">
          <Mascot mood="sad" size={90} />
          <h2 id="quit-title">{t("quitTitle")}</h2>
          <p>{t("quitBody")}</p>
          <Button block onClick={() => setConfirmQuit(false)}>{t("keepLearning")}</Button>
          <Button block variant="ghost" onClick={() => navigate({ name: "home" })}>{t("quit")}</Button>
        </Modal>
      )}
      {outOfHearts && <NoHeartsModal />}
    </div>
  );
}

function ExerciseView({ ex, ...p }: { ex: Exercise } & Omit<Parameters<typeof X.SelectImageEx>[0], "ex">) {
  switch (ex.type) {
    case "selectImage":
      return <X.SelectImageEx ex={ex} {...p} />;
    case "translateToEnglish":
      return <X.TranslateToEnglishEx ex={ex} {...p} />;
    case "translateToNative":
      return <X.TranslateToNativeEx ex={ex} {...p} />;
    case "listenType":
      return <X.ListenTypeEx ex={ex} {...p} />;
    case "fillBlank":
      return <X.FillBlankEx ex={ex} {...p} />;
    case "matchPairs":
      return <X.MatchPairsEx ex={ex} {...p} />;
    case "listenOrder":
      return <X.ListenOrderEx ex={ex} {...p} />;
    case "speak":
      return <X.SpeakEx ex={ex} {...p} />;
    case "listenTrueFalse":
      return <X.ListenTrueFalseEx ex={ex} {...p} />;
  }
}

function solutionOf(ex: Exercise): string | undefined {
  switch (ex.type) {
    case "selectImage":
      return ex.prompt;
    case "translateToEnglish":
      return ex.reference;
    case "fillBlank":
      return `${ex.before} ${ex.answer}${ex.after}`.trim();
    case "matchPairs":
      return undefined;
    case "listenTrueFalse":
      return ex.spoken;
    case "translateToNative":
      return undefined;
    default:
      return ex.english;
  }
}

function Feedback({ result, onNext }: { result: ExerciseResult; onNext: () => void }) {
  const t = useT();
  const title = result.verdict === "correct" ? t(Math.random() < 0.5 ? "correct" : "correctAlt") : result.verdict === "typo" ? t("typoTitle") : t("wrongTitle");
  const isEnglish = !!result.solution && /^[\x20-\x7E’]+$/.test(result.solution);
  return (
    <div className="feedback" role="status" aria-live="assertive">
      <Mascot size={70} mood={result.correct ? "cheer" : "sad"} className="feedback__okiko" />
      <div className="feedback__text">
        <strong className="feedback__title">
          <span aria-hidden="true">{result.correct ? "✔" : "✖"}</span> {title}
        </strong>
        {result.solution && (
          <p className="feedback__solution" dir={isEnglish ? "ltr" : undefined} lang={isEnglish ? "en" : undefined}>
            {highlight(result.solution, result.highlights)}
          </p>
        )}
        {result.correct && result.verdict === "correct" && <p className="feedback__meaning">{t(Math.random() < 0.5 ? "lessonCheer" : "lessonCheer2")}</p>}
        {!result.correct && <p className="feedback__meaning">{t("lessonOops")}</p>}
        {result.meaning && !result.correct && (
          <p className="feedback__meaning">
            {t("meaning")} {result.meaning}
          </p>
        )}
      </div>
      <Button variant={result.correct ? "success" : "danger"} onClick={onNext} autoFocus>
        {t("continue")}
      </Button>
    </div>
  );
}

function highlight(text: string, words: string[] = []) {
  if (!words.length) return text;
  const set = new Set(words.map((w) => w.toLowerCase()));
  return text.split(" ").map((w, i) => (
    <span key={i}>
      {i > 0 && " "}
      {set.has(w.toLowerCase().replace(/[.,!?]/g, "")) ? <mark>{w}</mark> : w}
    </span>
  ));
}

function NoHeartsModal() {
  const t = useT();
  const state = useApp((s) => s.state);
  const dispatch = useApp((s) => s.dispatch);
  const ms = msToNextHeart(state.hearts, Date.now());
  const lang = useLang();
  return (
    <Modal labelledBy="nohearts-title">
      <Mascot mood="sad" size={100} />
      <h2 id="nohearts-title">{t("noHearts")}</h2>
      <p>{t("noHeartsBody")}</p>
      {ms !== null && <p className="muted">{t("nextHeartIn", { t: formatDuration(lang, ms) })}</p>}
      <Button block variant="gold" disabled={state.gems < HEARTS_REFILL_PRICE} onClick={() => dispatch({ type: "buy", item: "hearts" })}>
        {t("refillHearts", { n: HEARTS_REFILL_PRICE })}
      </Button>
      <Button block onClick={() => navigate({ name: "review", kind: "practice" }, true)}>{t("practiceToEarn")}</Button>
      <Button block variant="ghost" onClick={() => navigate({ name: "home" })}>{t("close")}</Button>
    </Modal>
  );
}

function LessonEnd({ reward, stats, durationMs, total }: { reward: SessionReward; stats: { mistakes: number; correct: number }; durationMs: number; total: number }) {
  const t = useT();
  const lang = useLang();
  const state = useApp((s) => s.state);
  const accuracy = Math.round((100 * stats.correct) / Math.max(1, stats.correct + stats.mistakes));
  const unlocked = ACHIEVEMENTS.filter((a) => reward.achievements.includes(a.id));
  void total;
  return (
    <div className="lesson-end" dir={dirOf(lang)}>
      <div className="lesson-end__bg"><Zellige id="end-z" opacity={0.18} /></div>
      <Confetti />
      <Mascot mood="cheer" size={170} outfit={state.outfits.equipped} interactive />
      <h1>{t(reward.perfect ? "perfectLesson" : "lessonComplete")}</h1>
      <div className="stat-cards">
        <div className="stat-card stat-card--gold">
          <span>{t("totalXp")}</span>
          <strong><E e="⚡" size={26} /> <CountUp to={reward.xp} /></strong>
        </div>
        <div className="stat-card stat-card--green">
          <span>{t("accuracy")}</span>
          <strong><E e="🎯" size={26} /> <CountUp to={accuracy} />%</strong>
        </div>
        <div className="stat-card stat-card--blue">
          <span>{t("time")}</span>
          <strong><E e="⏱️" size={26} /> {formatDuration(lang, durationMs)}</strong>
        </div>
      </div>
      <ul className="bonus-list">
        {reward.morningBonus && <li><E e="🌅" /> {t("morningBonus")}</li>}
        {reward.comboBonus && <li><E e="🔥" /> {t("comboBonus")}</li>}
        {reward.streakExtended && <li><E e="🔥" className="flame" /> {t("streakUp", { n: state.streak.current })}</li>}
        {reward.unitCompleted && <li><E e="🎁" className="chest" size={36} /> {t("unitChest", { n: 25 })}</li>}
        {reward.gems > 0 && <li><E e="💎" /> +{reward.gems} {t("gems")}</li>}
        {unlocked.map((a) => (
          <li key={a.id}>
            <E e={a.icon} /> {t("newAchievement")} — {pickTr(lang, a.title)}
          </li>
        ))}
      </ul>
      <Button block variant="primary" onClick={() => navigate({ name: "home" })} autoFocus>
        {t("continue")}
      </Button>
    </div>
  );
}
