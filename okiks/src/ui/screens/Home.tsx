import { useState, type CSSProperties } from "react";
import type { Profile, Unit } from "../../engine/types";
import { LEVELS_PER_UNIT } from "../../engine/types";
import { courseIndex } from "../../content";
import { averageRecall } from "../../engine/srs/srs";
import { currentHearts } from "../../engine/progress/hearts";
import { heartsEnabled } from "../../engine/progress/state";
import { dayKey } from "../../engine/progress/time";
import { XP } from "../../engine/progress/reducer";
import { pickTr } from "../../i18n/strings";
import { useApp, useLang, useT } from "../../store";
import { navigate } from "../router";
import { Button, Star8 } from "../components/common";
import { Mascot, OkikoSays } from "../components/Mascot";
import { Ring } from "../components/Fx";
import { enableReminders, notifySupport } from "../../notify";
import type { StringKey } from "../../i18n/strings";
import { Page } from "../components/Shell";
import { Zellige } from "../components/Zellige";
import { E } from "../components/Emoji3D";

const UNIT_COLORS = ["#2A4BD7", "#2E9E6A", "#C8553D", "#B07D2B", "#5B4BC4", "#1F8A8A", "#C2456F", "#3A7CA5"];

/** Décalage horizontal des étoiles pour dessiner un chemin sinueux. */
const OFFSETS = [0, 44, 64, 44, 0, -44, -64, -44];

export function Home() {
  const t = useT();
  const lang = useLang();
  const s = useApp((x) => x.state);
  const idx = courseIndex(s.profile as Profile);
  const today = dayKey(Date.now(), new Date().getTimezoneOffset());
  const xpToday = s.xpByDay[today] ?? 0;
  const [open, setOpen] = useState<string | null>(null);

  // Position courante : première unité non terminée.
  const currentUnitIdx = idx.units.findIndex((u) => (s.unitLevels[u.id] ?? 0) < LEVELS_PER_UNIT);
  const timeUp = s.profile === "kids" && s.parentalDailyMinutes !== null && (s.msByDay[today] ?? 0) >= s.parentalDailyMinutes * 60_000;
  const noHearts = heartsEnabled(s) && currentHearts(s.hearts, Date.now()).count === 0;

  const goalDone = xpToday >= s.dailyGoal;
  const [tapIdx, setTapIdx] = useState(0);
  const bubble = okikoLine(t, s.streak.current, s.streak.lastActiveDay === today, goalDone, tapIdx);
  const showReminderAsk = !s.settings.reminders && !s.settings.remindersAsked && s.lessonsCompleted > 0 && notifySupport() === "ok";

  let unitNumber = 0;
  return (
    <Page className="home">
      <section className="hero">
        <div className="hero__bg"><Zellige id="hero-z" opacity={0.1} /></div>
        <OkikoSays
          size={112}
          mood={goalDone ? "cheer" : "happy"}
          outfit={s.outfits.equipped}
          text={bubble}
          onTap={() => setTapIdx((i) => i + 1)}
        />
        <div className="hero__goal">
          <Ring value={xpToday / s.dailyGoal} size={84} color={goalDone ? "var(--mint)" : "var(--saffron)"}>
            <E e={goalDone ? "🏆" : "⚡"} size={34} />
          </Ring>
          <span className="hero__goal-label">{t("dailyGoal")}</span>
          <span className="goal-card__value"><bdi dir="ltr">{xpToday} / {s.dailyGoal} XP</bdi></span>
        </div>
      </section>

      {showReminderAsk && <ReminderAsk />}

      {timeUp && (
        <section className="notice notice--blue">
          <strong>{t("timeUp")}</strong>
          <p>{t("timeUpBody")}</p>
        </section>
      )}

      <div className="review-row">
        {s.mistakes.some((id) => idx.wordById.has(id)) && (
          <Button variant="secondary" disabled={timeUp} onClick={() => navigate({ name: "review", kind: "mistakes" })}>
            <E e="🔁" size={22} /> {t("mistakesReview")}
          </Button>
        )}
        {Object.keys(s.memory).some((id) => idx.wordById.has(id)) && (
          <Button variant="secondary" disabled={timeUp} onClick={() => navigate({ name: "review", kind: "practice" })}>
            <E e="🏋️" size={22} /> {t("practice")}
          </Button>
        )}
      </div>

      {idx.course.sections.map((section, si) => (
        <section key={section.id} className="path-section">
          <h2 className="path-section__title">
            <span>{t("section", { n: si + 1 })}</span> · {pickTr(lang, section.title)}
          </h2>
          {section.units.map((unit) => {
            const ui = unitNumber++;
            const color = UNIT_COLORS[ui % UNIT_COLORS.length];
            const done = s.unitLevels[unit.id] ?? 0;
            const unlocked = ui <= (currentUnitIdx === -1 ? idx.units.length : currentUnitIdx);
            return (
              <div key={unit.id} className="unit">
                <header className="unit__banner" style={{ background: color }}>
                  <div className="unit__banner-bg"><Zellige id={`z-${unit.id}`} opacity={0.2} color="#fff" /></div>
                  <div>
                    <span className="unit__number">{t("unit", { n: ui + 1 })}</span>
                    <h3 className="unit__title"><E e={unit.icon} size={34} /> {pickTr(lang, unit.title)}</h3>
                    <p className="unit__scene">{pickTr(lang, unit.scene)}</p>
                  </div>
                  <UnitStrength unit={unit} />
                </header>
                <ol className="unit__path">
                  {Array.from({ length: LEVELS_PER_UNIT }, (_, li) => {
                    const level = li + 1;
                    const isDone = level <= done;
                    const isCurrent = unlocked && level === done + 1;
                    const locked = !unlocked || level > done + 1;
                    const key = `${unit.id}:${level}`;
                    const offset = OFFSETS[(ui * 3 + li) % OFFSETS.length];
                    return (
                      <li key={key} className={`node ${open === key ? "is-open" : ""} ${isCurrent ? "is-current" : ""}`} style={{ "--offset": `${offset}px` } as CSSProperties}>
                        <button
                          type="button"
                          className={`node__btn ${isCurrent ? "is-current" : ""}`}
                          onClick={() => setOpen(open === key ? null : key)}
                          aria-expanded={open === key}
                          aria-label={`${pickTr(lang, unit.title)} — ${t("level", { n: level, m: LEVELS_PER_UNIT })}`}
                        >
                          <Star8 size={isCurrent ? 84 : 72} fill={locked ? "var(--locked)" : isDone ? "var(--saffron)" : color}>
                            <E e={isDone ? "⭐" : locked ? "🔒" : level === LEVELS_PER_UNIT ? "🎁" : "✏️"} size={isCurrent ? 40 : 34} />
                          </Star8>
                          {isCurrent && <span className="node__start">{t("start")}</span>}
                        </button>
                        {isCurrent && li % 2 === 1 && (
                          <span className="node__mascot" aria-hidden="true">
                            <Mascot size={56} outfit={s.outfits.equipped} />
                          </span>
                        )}
                        {open === key && (
                          <div className="node__pop" role="dialog" style={{ borderColor: locked ? "var(--line)" : color }}>
                            <strong>{pickTr(lang, unit.title)}</strong>
                            <span>{t("level", { n: level, m: LEVELS_PER_UNIT })}</span>
                            {locked ? (
                              <span className="muted">{t("lockedHint")}</span>
                            ) : (
                              <Button
                                block
                                variant={isDone ? "secondary" : "primary"}
                                disabled={timeUp || (noHearts && !isDone)}
                                onClick={() => navigate({ name: "lesson", unitId: unit.id, level })}
                              >
                                {isDone ? t("review") : t("startLesson", { n: XP.lesson })}
                              </Button>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
                {done >= LEVELS_PER_UNIT && <p className="unit__done">✔ {t("unitDone")}</p>}
              </div>
            );
          })}
        </section>
      ))}
    </Page>
  );
}

/** Jauge de mémoire de l'unité (les mots s'estompent avec le temps). */
function UnitStrength({ unit }: { unit: Unit }) {
  const memory = useApp((s) => s.state.memory);
  const seen = unit.words.filter((w) => memory[w.id]);
  if (seen.length === 0) return null;
  const r = averageRecall(memory, seen.map((w) => w.id), Date.now());
  return (
    <span className="unit__strength" title={`${Math.round(r * 100)}%`} aria-hidden="true">
      <E e={r > 0.8 ? "🟢" : r > 0.5 ? "🟡" : "🔴"} size={20} />
    </span>
  );
}

const TAPS: StringKey[] = ["tap1", "tap2", "tap3", "tap4", "tap5"];

/** Ce que dit Okiko sur l'accueil : selon l'heure, la série, l'objectif — ou une réplique quand on le touche. */
function okikoLine(t: ReturnType<typeof useT>, streak: number, doneToday: boolean, goalDone: boolean, tapIdx: number): string {
  if (tapIdx > 0) return t(TAPS[(tapIdx - 1) % TAPS.length]);
  if (goalDone) return t("goalDone");
  const h = new Date().getHours();
  if (streak > 0 && !doneToday && h >= 17) return t("streakRisk", { n: streak });
  return t(h < 12 ? "hiMorning" : h < 18 ? "hiAfternoon" : "hiEvening");
}

/** Carte qui propose d'activer les rappels (après la première leçon). */
function ReminderAsk() {
  const t = useT();
  const dispatch = useApp((x) => x.dispatch);
  const [denied, setDenied] = useState(false);
  return (
    <section className="reminder-ask">
      <E e="🔔" size={52} className="ring-bell" />
      <div className="reminder-ask__body">
        <strong>{t("remindersAskTitle")}</strong>
        <span className="muted">{denied ? t("remindersDenied") : t("remindersAskBody")}</span>
        <div className="row">
          <Button variant="ghost" onClick={() => dispatch({ type: "settings", patch: { remindersAsked: true } })}>
            {t("remindersLater")}
          </Button>
          <Button
            variant="gold"
            onClick={async () => {
              const ok = await enableReminders();
              if (!ok) return setDenied(true);
              dispatch({ type: "settings", patch: { reminders: true, remindersAsked: true } });
            }}
          >
            {t("remindersEnable")}
          </Button>
        </div>
      </div>
    </section>
  );
}
