import { create } from "zustand";
import { applyEvent, type ProgressEvent, type SessionReward } from "./engine/progress/reducer";
import { defaultSettings, initialState, type ProgressState } from "./engine/progress/state";
import type { Repository } from "./storage/repository";
import { translate, type StringKey } from "./i18n/strings";

interface AppStore {
  ready: boolean;
  state: ProgressState;
  lastReward: SessionReward | null;
  init(repo: Repository): Promise<void>;
  dispatch(event: ProgressEvent): SessionReward | undefined;
  reset(): Promise<void>;
}

let repo: Repository | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

const ctx = () => ({ now: Date.now(), tzOffsetMin: new Date().getTimezoneOffset() });

export const useApp = create<AppStore>((set, get) => ({
  ready: false,
  state: initialState(Date.now()),
  lastReward: null,

  async init(r) {
    repo = r;
    const saved = await r.load().catch(() => null);
    const base = saved && saved.version === 1 ? saved : initialState(Date.now());
    // Les réglages ajoutés après la première installation reçoivent leur valeur par défaut.
    base.settings = { ...defaultSettings(base.profile), ...base.settings };
    set({ ready: true, state: applyEvent(base, { type: "tick" }, ctx()).state });
  },

  dispatch(event) {
    const { state, reward } = applyEvent(get().state, event, ctx());
    set(reward ? { state, lastReward: reward } : { state });
    if (repo) {
      void repo.enqueue(event, Date.now());
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => void repo?.save(get().state), 150);
    }
    return reward;
  },

  async reset() {
    await repo?.clear();
    set({ state: initialState(Date.now()), lastReward: null });
  },
}));

/** Sauvegarde immédiate quand l'onglet est masqué ou fermé. */
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && repo) void repo.save(useApp.getState().state);
  });
}

export function useT() {
  const lang = useApp((s) => s.state.uiLang ?? "fr");
  return (key: StringKey, vars?: Record<string, string | number>) => translate(lang, key, vars);
}

export function useLang() {
  return useApp((s) => s.state.uiLang ?? "fr");
}
