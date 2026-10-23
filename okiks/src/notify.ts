import type { ProgressState } from "./engine/progress/state";
import { dayKey } from "./engine/progress/time";
import { reminderText } from "./reminder";

/**
 * Rappels quotidiens.
 * 1. Synchronisation périodique en arrière-plan (Chrome / Edge Android, application installée) :
 *    le service worker vérifie chaque jour si la leçon est faite et notifie sinon.
 * 2. Tant que l'application est ouverte : minuteur jusqu'à l'heure du rappel.
 * Une notification « push » envoyée par un serveur (fiable sur iPhone app fermée)
 * demanderait un back-end : prévu avec les comptes (v2).
 */
export const REMINDER_TAG = "okiks-daily";

export type NotifySupport = "ok" | "unsupported" | "denied";

export function notifySupport(): NotifySupport {
  if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) return "unsupported";
  return Notification.permission === "denied" ? "denied" : "ok";
}

/** Demande l'autorisation et programme le rappel. Renvoie true si les notifications sont autorisées. */
export async function enableReminders(): Promise<boolean> {
  if (notifySupport() !== "ok") return false;
  const perm = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  if (perm !== "granted") return false;
  await registerPeriodicSync();
  return true;
}

export async function disableReminders() {
  try {
    const reg = await navigator.serviceWorker.ready;
    const ps = (reg as unknown as { periodicSync?: { unregister(tag: string): Promise<void> } }).periodicSync;
    await ps?.unregister(REMINDER_TAG);
  } catch {
    /* rien à désinscrire */
  }
}

async function registerPeriodicSync() {
  try {
    const reg = await navigator.serviceWorker.ready;
    const ps = (reg as unknown as { periodicSync?: { register(tag: string, o: { minInterval: number }): Promise<void> } }).periodicSync;
    if (!ps) return;
    const status = await navigator.permissions?.query({ name: "periodic-background-sync" as PermissionName }).catch(() => null);
    if (status && status.state !== "granted") return;
    await ps.register(REMINDER_TAG, { minInterval: 6 * 60 * 60 * 1000 });
  } catch {
    /* non disponible : le minuteur en page prend le relais */
  }
}

export async function showReminder(state: ProgressState, test = false) {
  if (notifySupport() !== "ok" || Notification.permission !== "granted") return;
  const reg = await navigator.serviceWorker.ready;
  const { title, body } = reminderText(state, test);
  await reg.showNotification(title, {
    body,
    icon: "/icon-192.png",
    badge: "/badge-96.png",
    tag: REMINDER_TAG,
    data: { url: "/" },
  });
}

/** Faut-il rappeler maintenant ? (rappels actifs, heure passée, aucune XP aujourd'hui) */
export function reminderDue(state: ProgressState, now: number, tz: number): boolean {
  if (!state.settings.reminders || !state.profile) return false;
  const today = dayKey(now, tz);
  if ((state.xpByDay[today] ?? 0) > 0) return false;
  const hour = new Date(now - tz * 60_000).getUTCHours();
  return hour >= state.settings.reminderHour;
}

/** Millisecondes jusqu'à la prochaine heure de rappel aujourd'hui (null si passée). */
export function msUntilReminder(state: ProgressState, now: number): number | null {
  const d = new Date(now);
  d.setHours(state.settings.reminderHour, 0, 0, 0);
  const ms = d.getTime() - now;
  return ms > 0 ? ms : null;
}
