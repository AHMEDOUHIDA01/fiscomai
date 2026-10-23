import { useSyncExternalStore } from "react";

/** Routes de l'application (hachage d'URL, pour fonctionner hors ligne et sur Netlify sans configuration). */
export type Route =
  | { name: "home" }
  | { name: "lesson"; unitId: string; level: number }
  | { name: "review"; kind: "mistakes" | "practice" }
  | { name: "league" }
  | { name: "quests" }
  | { name: "shop" }
  | { name: "profile" }
  | { name: "settings" };

export function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
  switch (parts[0]) {
    case "lesson":
      return parts[1] && Number(parts[2]) ? { name: "lesson", unitId: parts[1], level: Number(parts[2]) } : { name: "home" };
    case "review":
      return { name: "review", kind: parts[1] === "mistakes" ? "mistakes" : "practice" };
    case "league":
    case "quests":
    case "shop":
    case "profile":
    case "settings":
      return { name: parts[0] };
    default:
      return { name: "home" };
  }
}

export function href(r: Route): string {
  switch (r.name) {
    case "home":
      return "#/";
    case "lesson":
      return `#/lesson/${encodeURIComponent(r.unitId)}/${r.level}`;
    case "review":
      return `#/review/${r.kind}`;
    default:
      return `#/${r.name}`;
  }
}

export function navigate(r: Route, replace = false) {
  if (replace) history.replaceState(null, "", href(r));
  else location.hash = href(r);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

const subscribe = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => location.hash);
  return parseRoute(hash);
}
