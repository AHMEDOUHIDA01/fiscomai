import { useState } from "react";
import type { Profile, UiLang } from "../../engine/types";
import { dirOf, LANG_LABEL, translate } from "../../i18n/strings";
import { useApp } from "../../store";
import { Button } from "../components/common";
import { Mascot } from "../components/Mascot";
import { Zellige } from "../components/Zellige";
import { Logo } from "../components/Logo";
import { E } from "../components/Emoji3D";

const GOALS = [
  { xp: 10, key: "goalCasual" },
  { xp: 20, key: "goalRegular" },
  { xp: 30, key: "goalSerious" },
  { xp: 50, key: "goalIntense" },
] as const;

const PROFILES: { id: Profile; icon: string; title: "profileKids" | "profileAdult" | "profilePro"; desc: "profileKidsDesc" | "profileAdultDesc" | "profileProDesc" }[] = [
  { id: "kids", icon: "🧒", title: "profileKids", desc: "profileKidsDesc" },
  { id: "adult", icon: "🧑", title: "profileAdult", desc: "profileAdultDesc" },
  { id: "pro", icon: "💼", title: "profilePro", desc: "profileProDesc" },
];

export function Onboarding() {
  const dispatch = useApp((s) => s.dispatch);
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState<UiLang>("ar");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goal, setGoal] = useState(20);
  const t = (k: Parameters<typeof translate>[1], v?: Record<string, string | number>) => translate(lang, k, v);

  return (
    <div className="onboarding" dir={dirOf(lang)}>
      <div className="onboarding__bg"><Zellige id="ob-z" opacity={0.14} /></div>
      <div className="onboarding__card">
        <Mascot mood={step === 0 ? "happy" : "cheer"} size={step === 0 ? 140 : 96} className={step === 0 ? "bounce" : ""} />
        {step === 0 && (
          <>
            <h1 className="logo">
              <Logo size={56} tifinagh id="ob" />
            </h1>
            <p className="tagline">{t("appTagline")}</p>
            <h2>{t("chooseLang")}</h2>
            <div className="stack">
              {(["ar", "darija", "fr"] as UiLang[]).map((l) => (
                <button key={l} type="button" className={`option-card ${lang === l ? "is-selected" : ""}`} onClick={() => setLang(l)} dir={dirOf(l)}>
                  <span className="option-card__title">{LANG_LABEL[l]}</span>
                </button>
              ))}
            </div>
            <Button block onClick={() => setStep(1)}>{t("continue")}</Button>
          </>
        )}
        {step === 1 && (
          <>
            <h2>{t("whoAreYou")}</h2>
            <div className="stack">
              {PROFILES.map((p) => (
                <button key={p.id} type="button" className={`option-card option-card--row ${profile === p.id ? "is-selected" : ""}`} onClick={() => setProfile(p.id)}>
                  <span className="option-card__icon"><E e={p.icon} size={48} /></span>
                  <span>
                    <span className="option-card__title">{t(p.title)}</span>
                    <span className="option-card__desc">{t(p.desc)}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="row">
              <Button variant="ghost" onClick={() => setStep(0)}>{t("back")}</Button>
              <Button disabled={!profile} onClick={() => setStep(2)}>{t("continue")}</Button>
            </div>
          </>
        )}
        {step === 2 && profile && (
          <>
            <h2>{t("dailyGoalTitle")}</h2>
            <div className="stack">
              {GOALS.map((g) => (
                <button key={g.xp} type="button" className={`option-card option-card--split ${goal === g.xp ? "is-selected" : ""}`} onClick={() => setGoal(g.xp)}>
                  <span className="option-card__title">{t(g.key)}</span>
                  <span className="option-card__desc">{t("xpPerDay", { n: g.xp })}</span>
                </button>
              ))}
            </div>
            <div className="row">
              <Button variant="ghost" onClick={() => setStep(1)}>{t("back")}</Button>
              <Button variant="success" onClick={() => dispatch({ type: "onboard", profile, uiLang: lang, dailyGoal: goal })}>
                {t("start")}
              </Button>
            </div>
          </>
        )}
        <p className="made-in">{t("madeIn")}</p>
      </div>
    </div>
  );
}
