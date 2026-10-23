import type { ReactNode } from "react";
import { useApp, useLang, useT } from "../../store";
import { currentHearts } from "../../engine/progress/hearts";
import { heartsEnabled } from "../../engine/progress/state";
import { dayKey } from "../../engine/progress/time";
import { dirOf } from "../../i18n/strings";
import { href, useRoute, type Route } from "../router";
import { Logo } from "./Logo";

export function TopBar() {
  const t = useT();
  const s = useApp((x) => x.state);
  const today = dayKey(Date.now(), new Date().getTimezoneOffset());
  const lit = s.streak.lastActiveDay === today;
  const hearts = currentHearts(s.hearts, Date.now()).count;
  return (
    <header className="topbar">
      <a className="topbar__brand" href={href({ name: "home" })} aria-label="OKIKS">
        <Logo size={34} id="top" />
      </a>
      <div className="topbar__stats">
        <span className={`stat ${lit ? "stat--fire" : "stat--off"}`} title={t("streak")}>🔥 {s.streak.current}</span>
        <a className="stat stat--gems" href={href({ name: "shop" })} title={t("gems")}>💎 {s.gems}</a>
        {heartsEnabled(s) ? (
          <a className="stat stat--hearts" href={href({ name: "shop" })} title={t("hearts")}>❤️ {hearts}</a>
        ) : (
          <span className="stat stat--hearts" title={t("hearts")}>❤️ ∞</span>
        )}
      </div>
    </header>
  );
}

const NAV: { route: Route; icon: string; key: "navLearn" | "navLeague" | "navQuests" | "navShop" | "navProfile" }[] = [
  { route: { name: "home" }, icon: "🏠", key: "navLearn" },
  { route: { name: "league" }, icon: "🏆", key: "navLeague" },
  { route: { name: "quests" }, icon: "🎯", key: "navQuests" },
  { route: { name: "shop" }, icon: "🛍️", key: "navShop" },
  { route: { name: "profile" }, icon: "🦊", key: "navProfile" },
];

export function BottomNav() {
  const t = useT();
  const route = useRoute();
  return (
    <nav className="bottomnav" aria-label="Navigation">
      {NAV.map((n) => {
        const active = route.name === n.route.name || (n.route.name === "profile" && route.name === "settings");
        return (
          <a key={n.key} className={`bottomnav__item ${active ? "is-active" : ""}`} href={href(n.route)} aria-current={active ? "page" : undefined}>
            <span className="bottomnav__icon" aria-hidden="true">{n.icon}</span>
            <span className="bottomnav__label">{t(n.key)}</span>
          </a>
        );
      })}
    </nav>
  );
}

export function Page({ children, className = "" }: { children: ReactNode; className?: string }) {
  const lang = useLang();
  return (
    <div className={`page ${className}`} dir={dirOf(lang)}>
      <TopBar />
      <main className="page__main">{children}</main>
      <BottomNav />
    </div>
  );
}
