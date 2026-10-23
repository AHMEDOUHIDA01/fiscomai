import { useEffect, useState } from "react";
import { useApp, useLang, useT } from "./store";
import { setSoundEnabled } from "./audio";
import { dirOf } from "./i18n/strings";
import { navigate, useRoute } from "./ui/router";
import { Onboarding } from "./ui/screens/Onboarding";
import { Home } from "./ui/screens/Home";
import { LessonScreen } from "./ui/screens/Lesson";
import { LeagueScreen, ProfileScreen, QuestsScreen, SettingsScreen, ShopScreen } from "./ui/screens/Others";
import { courseIndex } from "./content";
import type { Profile } from "./engine/types";

export function App() {
  const ready = useApp((s) => s.ready);
  const state = useApp((s) => s.state);
  const dispatch = useApp((s) => s.dispatch);
  const lang = useLang();
  const route = useRoute();
  const online = useOnline();
  const t = useT();

  // Horloge : recharge des cœurs, changement de jour et de semaine.
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: "tick" }), 60_000);
    return () => clearInterval(id);
  }, [dispatch]);

  useEffect(() => setSoundEnabled(state.settings.sound), [state.settings.sound]);

  // Langue, direction et thème sur <html>.
  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang === "fr" ? "fr" : lang === "darija" ? "ar-MA" : "ar";
    html.dir = dirOf(lang);
    html.dataset.theme = state.settings.theme;
    html.dataset.motion = state.settings.reduceMotion ? "reduce" : "full";
    html.dataset.profile = state.profile ?? "";
  }, [lang, state.settings.theme, state.settings.reduceMotion, state.profile]);

  if (!ready) return <div className="splash" aria-busy="true">OKIKS</div>;
  if (!state.profile || !state.uiLang) return <Onboarding />;

  // Une leçon d'une unité inconnue (profil changé, lien ancien) renvoie à l'accueil.
  if (route.name === "lesson" && !courseIndex(state.profile as Profile).unitById.has(route.unitId)) {
    queueMicrotask(() => navigate({ name: "home" }, true));
    return null;
  }

  return (
    <>
      {!online && <div className="offline-banner" role="status">{t("offline")}</div>}
      {route.name === "lesson" ? (
        <LessonScreen key={`${route.unitId}-${route.level}`} kind="lesson" unitId={route.unitId} level={route.level} />
      ) : route.name === "review" ? (
        <LessonScreen key={route.kind} kind={route.kind} />
      ) : route.name === "league" ? (
        <LeagueScreen />
      ) : route.name === "quests" ? (
        <QuestsScreen />
      ) : route.name === "shop" ? (
        <ShopScreen />
      ) : route.name === "profile" ? (
        <ProfileScreen />
      ) : route.name === "settings" ? (
        <SettingsScreen />
      ) : (
        <Home />
      )}
    </>
  );
}

function useOnline() {
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}
