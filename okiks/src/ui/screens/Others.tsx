import { useState } from "react";
import type { Profile, UiLang } from "../../engine/types";
import { DEMOTE, GROUP_SIZE, LEAGUES, PROMOTE, standings } from "../../engine/progress/league";
import { SHOP } from "../../engine/progress/shop";
import { ACHIEVEMENTS } from "../../engine/progress/achievements";
import { currentHearts } from "../../engine/progress/hearts";
import { MAX_FREEZES, MAX_HEARTS } from "../../engine/progress/state";
import { addDays, dayKey, DAY, weekProgress } from "../../engine/progress/time";
import { formatDuration, LANG_LABEL, pickTr, type StringKey } from "../../i18n/strings";
import { useApp, useLang, useT } from "../../store";
import { href, navigate } from "../router";
import { Button, Modal, ProgressBar, Toggle } from "../components/common";
import { Mascot } from "../components/Mascot";
import { Page } from "../components/Shell";

const tz = () => new Date().getTimezoneOffset();

// ---------------------------------------------------------------------------
// Ligue

export function LeagueScreen() {
  const t = useT();
  const lang = useLang();
  const s = useApp((x) => x.state);
  const dispatch = useApp((x) => x.dispatch);
  const league = LEAGUES[s.league.tier];

  if (!s.settings.leagueEnabled) {
    return (
      <Page>
        <section className="empty">
          <Mascot mood="think" size={110} />
          <p>{t("leagueDisabled")}</p>
          <Button onClick={() => dispatch({ type: "settings", patch: { leagueEnabled: true } })}>{t("enableLeague")}</Button>
        </section>
      </Page>
    );
  }

  const progress = weekProgress(Date.now(), tz());
  const rows = standings(s.league.weekId, s.league.tier, s.league.xp, t("you"), progress);
  const endsIn = (1 - progress) * 7 * DAY;
  const last = s.league.lastResult;

  return (
    <Page>
      <section className="league-head" style={{ background: league.color }}>
        <div className="league-badges" aria-hidden="true">
          {LEAGUES.map((l, i) => (
            <span key={l.id} className={`league-badge ${i === s.league.tier ? "is-current" : ""} ${i > s.league.tier ? "is-locked" : ""}`} style={{ background: l.color }} />
          ))}
        </div>
        <h1>{t("leagueTitle", { name: pickTr(lang, league.name) })}</h1>
        <p>{t("leagueEnds", { t: formatDuration(lang, endsIn) })}</p>
      </section>
      <ol className="leaderboard">
        {rows.map((r, i) => {
          const rank = i + 1;
          const zone = rank <= PROMOTE && s.league.tier < LEAGUES.length - 1 ? "up" : rank > GROUP_SIZE - DEMOTE && s.league.tier > 0 ? "down" : "";
          return (
            <li key={r.id} className={`lb-row ${r.isMe ? "lb-row--me" : ""} ${zone ? `lb-row--${zone}` : ""}`}>
              <span className="lb-row__rank">{rank}</span>
              <span className="lb-row__avatar" aria-hidden="true">{r.avatar}</span>
              <bdi className="lb-row__name">{r.name}</bdi>
              <span className="lb-row__xp" dir="ltr">{r.xp} XP</span>
              {rank === PROMOTE && zone === "up" && <span className="lb-zone lb-zone--up">▲ {t("promotionZone")}</span>}
              {rank === GROUP_SIZE - DEMOTE + 1 && s.league.tier > 0 && <span className="lb-zone lb-zone--down">▼ {t("demotionZone")}</span>}
            </li>
          );
        })}
      </ol>
      {last && (
        <Modal onClose={() => dispatch({ type: "dismissLeagueResult" })} labelledBy="league-result">
          <Mascot mood={last.to > last.from ? "cheer" : last.to < last.from ? "sad" : "happy"} size={100} />
          <h2 id="league-result">
            {last.to > last.from
              ? t("leaguePromoted", { name: pickTr(lang, LEAGUES[last.to].name) })
              : last.to < last.from
                ? t("leagueDemoted", { name: pickTr(lang, LEAGUES[last.to].name) })
                : t("leagueStayed", { name: pickTr(lang, LEAGUES[last.to].name), n: last.rank })}
          </h2>
          <Button block onClick={() => dispatch({ type: "dismissLeagueResult" })}>{t("continue")}</Button>
        </Modal>
      )}
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Quêtes

const QUEST_TEXT: Record<string, StringKey> = {
  xp: "questXp",
  lessons: "questLessons",
  perfect: "questPerfect",
  listen: "questListen",
  combo: "questCombo",
  correct: "questCorrect",
};
const QUEST_ICON: Record<string, string> = { xp: "⚡", lessons: "📘", perfect: "⭐", listen: "🎧", combo: "🔥", correct: "✅" };

export function QuestsScreen() {
  const t = useT();
  const lang = useLang();
  const s = useApp((x) => x.state);
  const now = Date.now();
  const midnight = Date.parse(`${addDays(dayKey(now, tz()), 1)}T00:00:00Z`) + tz() * 60_000;
  return (
    <Page>
      <section className="page-head page-head--green">
        <h1>{t("questsTitle")}</h1>
        <p>{t("questsReset", { t: formatDuration(lang, midnight - now) })}</p>
      </section>
      <ul className="card-list">
        {s.quests.items.map((q) => (
          <li key={q.id} className={`quest ${q.done ? "quest--done" : ""}`}>
            <span className="quest__icon" aria-hidden="true">{QUEST_ICON[q.kind]}</span>
            <div className="quest__body">
              <strong>{t(QUEST_TEXT[q.kind], { n: q.target })}</strong>
              <ProgressBar value={q.progress / q.target} color={q.done ? "var(--mint)" : "var(--saffron)"} />
              <span className="muted"><bdi dir="ltr">{q.progress} / {q.target}</bdi></span>
            </div>
            <span className="quest__reward">{q.done ? "✔" : `💎 ${q.reward}`}</span>
          </li>
        ))}
      </ul>
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Boutique

export function ShopScreen() {
  const t = useT();
  const lang = useLang();
  const s = useApp((x) => x.state);
  const dispatch = useApp((x) => x.dispatch);
  const kids = s.profile === "kids";
  const hearts = currentHearts(s.hearts, Date.now()).count;
  return (
    <Page>
      <section className="page-head page-head--gold">
        <h1>{t("shopTitle")}</h1>
        <p className="shop-gems">💎 {s.gems}</p>
      </section>
      {kids && <p className="notice">{t("shopKidsLocked")}</p>}
      <ul className="card-list">
        {SHOP.filter((i) => i.kind !== "outfit" && !kids).map((item) => {
          const full = item.kind === "hearts" ? hearts >= MAX_HEARTS : s.streak.freezes >= MAX_FREEZES;
          return (
            <li key={item.id} className="shop-item">
              <span className="shop-item__icon" aria-hidden="true">{item.icon}</span>
              <div className="shop-item__body">
                <strong>{pickTr(lang, item.title)}</strong>
                <span className="muted">{pickTr(lang, item.description)}</span>
                {item.kind === "freeze" && <span className="muted">{t("freezesOwned", { n: s.streak.freezes })}</span>}
                {item.kind === "hearts" && <span className="muted">❤️ {hearts} / {MAX_HEARTS}</span>}
              </div>
              <Button variant="gold" disabled={full || s.gems < item.price} onClick={() => dispatch({ type: "buy", item: item.id })}>
                💎 {item.price}
              </Button>
            </li>
          );
        })}
      </ul>
      <h2 className="list-title">{t("outfits")}</h2>
      <ul className="outfit-grid">
        {SHOP.filter((i) => i.kind === "outfit").map((item) => {
          const owned = s.outfits.owned.includes(item.id);
          const equipped = s.outfits.equipped === item.id;
          return (
            <li key={item.id} className={`outfit ${equipped ? "is-selected" : ""}`}>
              <Mascot size={84} outfit={item.id} />
              <strong>{pickTr(lang, item.title)}</strong>
              {owned ? (
                <Button variant={equipped ? "secondary" : "primary"} onClick={() => dispatch({ type: "equip", outfit: equipped ? null : item.id })}>
                  {t(equipped ? "equipped" : "equip")}
                </Button>
              ) : (
                <Button variant="gold" disabled={s.gems < item.price} onClick={() => dispatch({ type: "buy", item: item.id })}>
                  💎 {item.price}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Profil

export function ProfileScreen() {
  const t = useT();
  const lang = useLang();
  const s = useApp((x) => x.state);
  const today = dayKey(Date.now(), tz());
  const learned = Object.values(s.memory).filter((m) => m.strength >= 1).length;
  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const maxXp = Math.max(s.dailyGoal, ...week.map((d) => s.xpByDay[d] ?? 0));
  const frozen = new Set(s.streak.frozenDays);
  return (
    <Page>
      <section className="profile-head">
        <Mascot size={110} outfit={s.outfits.equipped} mood="cheer" />
        <div>
          <h1>{t("profileTitle")}</h1>
          <p className="muted">{t(s.profile === "kids" ? "profileKids" : s.profile === "pro" ? "profilePro" : "profileAdult")} · {LANG_LABEL[s.uiLang as UiLang]}</p>
          <a className="link-btn" href={href({ name: "settings" })}>⚙️ {t("settings")}</a>
        </div>
      </section>
      <div className="stats-grid">
        <div className="stat-tile"><span>🔥</span><strong>{s.streak.current}</strong><small>{t("streak")}</small></div>
        <div className="stat-tile"><span>🏅</span><strong>{s.streak.longest}</strong><small>{t("longestStreak")}</small></div>
        <div className="stat-tile"><span>⚡</span><strong>{s.totalXp}</strong><small>{t("totalXpLabel")}</small></div>
        <div className="stat-tile"><span>📚</span><strong>{learned}</strong><small>{t("wordsLearned")}</small></div>
        <div className="stat-tile"><span>🎓</span><strong>{s.lessonsCompleted}</strong><small>{t("lessons")}</small></div>
        <div className="stat-tile"><span>🏆</span><strong>{pickTr(lang, LEAGUES[s.league.tier].name)}</strong><small>{t("navLeague")}</small></div>
      </div>
      <h2 className="list-title">{t("thisWeek")}</h2>
      <div className="week-chart" role="img" aria-label={t("thisWeek")}>
        {week.map((d) => {
          const xp = s.xpByDay[d] ?? 0;
          return (
            <div key={d} className={`week-chart__day ${d === today ? "is-today" : ""}`}>
              <span className="week-chart__xp">{xp || ""}</span>
              <span className="week-chart__bar" style={{ height: `${(xp / maxXp) * 100}%` }} />
              <span className="week-chart__label">{frozen.has(d) ? "🧊" : xp > 0 ? "🔥" : "·"}</span>
            </div>
          );
        })}
      </div>
      <h2 className="list-title">{t("achievements")}</h2>
      <ul className="badge-grid">
        {ACHIEVEMENTS.map((a) => {
          const got = s.achievements.includes(a.id);
          return (
            <li key={a.id} className={`ach ${got ? "" : "ach--locked"}`}>
              <span className="ach__icon" aria-hidden="true">{a.icon}</span>
              <span>{pickTr(lang, a.title)}</span>
            </li>
          );
        })}
      </ul>
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Réglages

export function SettingsScreen() {
  const t = useT();
  const s = useApp((x) => x.state);
  const dispatch = useApp((x) => x.dispatch);
  const reset = useApp((x) => x.reset);
  const [confirmReset, setConfirmReset] = useState(false);
  const set = (patch: Partial<typeof s.settings>) => dispatch({ type: "settings", patch });
  return (
    <Page>
      <section className="page-head">
        <button type="button" className="link-btn" onClick={() => navigate({ name: "profile" })}>← {t("back")}</button>
        <h1>{t("settings")}</h1>
      </section>
      <div className="settings">
        <fieldset>
          <legend>{t("uiLanguage")}</legend>
          <div className="seg">
            {(["ar", "darija", "fr"] as UiLang[]).map((l) => (
              <button key={l} type="button" className={s.uiLang === l ? "is-selected" : ""} onClick={() => dispatch({ type: "setUiLang", uiLang: l })}>
                {LANG_LABEL[l]}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>{t("learnerProfile")}</legend>
          <div className="seg">
            {(["kids", "adult", "pro"] as Profile[]).map((p) => (
              <button key={p} type="button" className={s.profile === p ? "is-selected" : ""} onClick={() => dispatch({ type: "setProfile", profile: p })}>
                {t(p === "kids" ? "profileKids" : p === "pro" ? "profilePro" : "profileAdult")}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>{t("dailyGoal")}</legend>
          <div className="seg">
            {[10, 20, 30, 50].map((g) => (
              <button key={g} type="button" className={s.dailyGoal === g ? "is-selected" : ""} onClick={() => dispatch({ type: "setDailyGoal", dailyGoal: g })}>
                {g} XP
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <Toggle label={t("soundEffects")} checked={s.settings.sound} onChange={(v) => set({ sound: v })} />
          <Toggle label={t("slowAudio")} checked={s.settings.slowTts} onChange={(v) => set({ slowTts: v })} />
          <Toggle label={t("listeningExercises")} checked={s.settings.listenEnabled} onChange={(v) => set({ listenEnabled: v })} />
          <Toggle label={t("speakingExercises")} checked={s.settings.speakEnabled} onChange={(v) => set({ speakEnabled: v })} />
          <Toggle label={t("reduceMotion")} checked={s.settings.reduceMotion} onChange={(v) => set({ reduceMotion: v })} />
          <Toggle label={t("leagueSetting")} checked={s.settings.leagueEnabled} onChange={(v) => set({ leagueEnabled: v })} />
        </fieldset>
        <fieldset>
          <legend>{t("theme")}</legend>
          <div className="seg">
            {(["auto", "light", "dark"] as const).map((th) => (
              <button key={th} type="button" className={s.settings.theme === th ? "is-selected" : ""} onClick={() => set({ theme: th })}>
                {t(th === "auto" ? "themeAuto" : th === "light" ? "themeLight" : "themeDark")}
              </button>
            ))}
          </div>
        </fieldset>
        {s.profile === "kids" && (
          <fieldset>
            <legend>{t("parental")} — {t("dailyLimit")}</legend>
            <div className="seg">
              {[null, 10, 20, 30].map((m) => (
                <button key={String(m)} type="button" className={s.parentalDailyMinutes === m ? "is-selected" : ""} onClick={() => dispatch({ type: "setParental", dailyMinutes: m })}>
                  {m === null ? t("unlimited") : t("minutes", { n: m })}
                </button>
              ))}
            </div>
          </fieldset>
        )}
        <Button variant="danger" onClick={() => setConfirmReset(true)}>{t("resetProgress")}</Button>
        <p className="made-in">{t("madeIn")} · OKIKS v0.1</p>
      </div>
      {confirmReset && (
        <Modal onClose={() => setConfirmReset(false)} labelledBy="reset-title">
          <h2 id="reset-title">{t("resetConfirm")}</h2>
          <Button block variant="danger" onClick={() => void reset().then(() => navigate({ name: "home" }))}>{t("resetProgress")}</Button>
          <Button block variant="ghost" onClick={() => setConfirmReset(false)}>{t("close")}</Button>
        </Modal>
      )}
    </Page>
  );
}
