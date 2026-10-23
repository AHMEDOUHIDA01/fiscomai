/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { clientsClaim } from "workbox-core";
import type { ProgressState } from "./engine/progress/state";
import { reminderText } from "./reminder";

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<{ url: string; revision: string | null }> };

// Mise à jour immédiate de l'application hors ligne.
self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
registerRoute(new NavigationRoute(createHandlerBoundToURL("index.html")));
registerRoute(
  ({ url }) => url.host === "fonts.googleapis.com" || url.host === "fonts.gstatic.com",
  new CacheFirst({ cacheName: "fonts", plugins: [new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 31_536_000 })] }),
);

// Icônes 3D : en cache à la première utilisation (disponibles hors ligne ensuite).
registerRoute(
  ({ url }) => url.origin === self.location.origin && url.pathname.startsWith("/emoji/"),
  new CacheFirst({ cacheName: "emoji-3d", plugins: [new ExpirationPlugin({ maxEntries: 400 })] }),
);

/** Lit la progression enregistrée par l'application (IndexedDB « okiks »). */
function readState(): Promise<ProgressState | null> {
  return new Promise((resolve) => {
    const open = indexedDB.open("okiks");
    open.onerror = () => resolve(null);
    open.onsuccess = () => {
      const db = open.result;
      if (!db.objectStoreNames.contains("state")) return resolve(null);
      const get = db.transaction("state").objectStore("state").get("progress");
      get.onsuccess = () => resolve((get.result as ProgressState) ?? null);
      get.onerror = () => resolve(null);
    };
  });
}

async function remindIfNeeded() {
  const state = await readState();
  if (!state?.settings?.reminders || !state.profile) return;
  const now = new Date();
  const today = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
  if ((state.xpByDay[today] ?? 0) > 0) return;
  if (now.getHours() < (state.settings.reminderHour ?? 19)) return;
  const { title, body } = reminderText(state);
  await self.registration.showNotification(title, {
    body,
    icon: "/icon-192.png",
    badge: "/badge-96.png",
    tag: "okiks-daily",
    data: { url: "/" },
  });
}

self.addEventListener("periodicsync", (event) => {
  const e = event as ExtendableEvent & { tag?: string };
  if (e.tag === "okiks-daily") e.waitUntil(remindIfNeeded());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data as { url?: string } | undefined)?.url ?? "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      const win = wins.find((w) => "focus" in w);
      return win ? win.focus() : self.clients.openWindow(url);
    }),
  );
});
