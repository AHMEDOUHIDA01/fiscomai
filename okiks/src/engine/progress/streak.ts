import { addDays, daysBetween } from "./time";
import type { ProgressState } from "./state";

type Streak = ProgressState["streak"];

/**
 * Appelé au changement de jour : si des jours ont été manqués, on consomme
 * des protections (une par jour manqué) ; sinon la série retombe à 0.
 */
export function settleStreak(s: Streak, today: string): Streak {
  if (!s.lastActiveDay || s.current === 0) return s;
  const missed = daysBetween(s.lastActiveDay, today) - 1; // jours entiers sans activité avant aujourd'hui
  if (missed <= 0) return s;
  if (s.freezes >= missed) {
    const frozen = Array.from({ length: missed }, (_, i) => addDays(s.lastActiveDay!, i + 1));
    return {
      ...s,
      freezes: s.freezes - missed,
      frozenDays: [...s.frozenDays, ...frozen].slice(-60),
      lastActiveDay: addDays(today, -1),
    };
  }
  return { ...s, current: 0 };
}

/** Appelé quand l'élève gagne de l'XP aujourd'hui. */
export function extendStreak(s: Streak, today: string): Streak {
  const settled = settleStreak(s, today);
  if (settled.lastActiveDay === today) return settled;
  const continues = settled.current > 0 && settled.lastActiveDay === addDays(today, -1);
  const current = continues ? settled.current + 1 : 1;
  return { ...settled, current, longest: Math.max(settled.longest, current), lastActiveDay: today };
}

export function streakExtendedToday(s: Streak, today: string): boolean {
  return s.lastActiveDay === today;
}
