import { HOUR } from "./time";
import { MAX_HEARTS, type ProgressState } from "./state";

export const HEART_REFILL_MS = 4 * HOUR;
export const HEARTS_REFILL_PRICE = 350;

/** Cœurs disponibles à l'instant `now`, recharge passive comprise. */
export function currentHearts(h: ProgressState["hearts"], now: number): { count: number; updatedAt: number } {
  if (h.count >= MAX_HEARTS) return { count: MAX_HEARTS, updatedAt: now };
  const gained = Math.floor(Math.max(0, now - h.updatedAt) / HEART_REFILL_MS);
  if (gained === 0) return h;
  const count = Math.min(MAX_HEARTS, h.count + gained);
  return { count, updatedAt: count >= MAX_HEARTS ? now : h.updatedAt + gained * HEART_REFILL_MS };
}

/** Millisecondes avant le prochain cœur (null si plein). */
export function msToNextHeart(h: ProgressState["hearts"], now: number): number | null {
  const cur = currentHearts(h, now);
  if (cur.count >= MAX_HEARTS) return null;
  return HEART_REFILL_MS - ((now - cur.updatedAt) % HEART_REFILL_MS);
}

export function loseHeart(h: ProgressState["hearts"], now: number): ProgressState["hearts"] {
  const cur = currentHearts(h, now);
  // Si on était plein, le chrono de recharge démarre maintenant.
  return { count: Math.max(0, cur.count - 1), updatedAt: cur.count >= MAX_HEARTS ? now : cur.updatedAt };
}

export function gainHeart(h: ProgressState["hearts"], now: number, n = 1): ProgressState["hearts"] {
  const cur = currentHearts(h, now);
  const count = Math.min(MAX_HEARTS, cur.count + n);
  return { count, updatedAt: count >= MAX_HEARTS ? now : cur.updatedAt };
}
