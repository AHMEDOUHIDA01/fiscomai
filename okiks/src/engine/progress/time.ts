/**
 * Dates locales sans dépendre du fuseau de la machine : chaque calcul reçoit
 * `tzOffsetMin` (valeur de `Date#getTimezoneOffset`, ex. -60 pour UTC+1).
 */
const MIN = 60_000;
export const HOUR = 60 * MIN;
export const DAY = 24 * HOUR;

function shifted(now: number, tzOffsetMin: number): Date {
  return new Date(now - tzOffsetMin * MIN);
}

/** Jour local au format AAAA-MM-JJ. */
export function dayKey(now: number, tzOffsetMin: number): string {
  return shifted(now, tzOffsetMin).toISOString().slice(0, 10);
}

export function localHour(now: number, tzOffsetMin: number): number {
  return shifted(now, tzOffsetMin).getUTCHours();
}

export function addDays(day: string, n: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY);
}

/** Semaine ISO locale, ex. « 2026-W43 ». Les ligues changent le lundi. */
export function weekKey(now: number, tzOffsetMin: number): string {
  const d = shifted(now, tzOffsetMin);
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dow);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / DAY + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** Part écoulée de la semaine locale (lundi 00:00 → 0, dimanche 24:00 → 1). */
export function weekProgress(now: number, tzOffsetMin: number): number {
  const d = shifted(now, tzOffsetMin);
  const dow = (d.getUTCDay() + 6) % 7; // lundi = 0
  const msInDay = d.getUTCHours() * HOUR + d.getUTCMinutes() * MIN;
  return (dow * DAY + msInDay) / (7 * DAY);
}
