import type { Profile, UiLang } from "../types";
import type { WordMemory } from "../srs/srs";

export interface Quest {
  id: string;
  kind: QuestKind;
  target: number;
  progress: number;
  reward: number;
  done: boolean;
}

export type QuestKind = "xp" | "lessons" | "perfect" | "listen" | "combo" | "correct";

export interface LeagueState {
  weekId: string;
  tier: number;
  xp: number;
  /** Résultat de la semaine précédente, à afficher une fois. */
  lastResult: { weekId: string; rank: number; from: number; to: number } | null;
}

export interface Settings {
  slowTts: boolean;
  reduceMotion: boolean;
  sound: boolean;
  speakEnabled: boolean;
  listenEnabled: boolean;
  leagueEnabled: boolean;
  theme: "auto" | "light" | "dark";
  /** Rappel quotidien par notification. */
  reminders: boolean;
  /** Heure locale du rappel (0–23). */
  reminderHour: number;
  /** L'élève a déjà vu la proposition d'activer les rappels. */
  remindersAsked: boolean;
}

export interface ProgressState {
  version: 1;
  profile: Profile | null;
  uiLang: UiLang | null;
  dailyGoal: number;
  settings: Settings;
  /** Profil enfant : minutes autorisées par jour (null = illimité). */
  parentalDailyMinutes: number | null;

  totalXp: number;
  xpByDay: Record<string, number>;
  msByDay: Record<string, number>;
  streak: { current: number; longest: number; lastActiveDay: string | null; freezes: number; frozenDays: string[] };
  hearts: { count: number; updatedAt: number };
  gems: number;

  /** Niveaux terminés par unité (0 → 5). */
  unitLevels: Record<string, number>;
  memory: Record<string, WordMemory>;
  /** Derniers mots ratés (pour la révision des erreurs). */
  mistakes: string[];

  lessonsCompleted: number;
  perfectLessons: number;
  quests: { day: string; items: Quest[] };
  league: LeagueState;
  achievements: string[];
  outfits: { owned: string[]; equipped: string | null };
}

export const MAX_HEARTS = 5;
export const MAX_FREEZES = 2;

export function defaultSettings(profile: Profile | null): Settings {
  return {
    slowTts: profile === "kids",
    reduceMotion: profile === "pro",
    sound: true,
    speakEnabled: true,
    listenEnabled: true,
    leagueEnabled: profile !== "kids",
    theme: "auto",
    reminders: false,
    reminderHour: profile === "kids" ? 17 : 19,
    remindersAsked: false,
  };
}

export function initialState(now: number): ProgressState {
  return {
    version: 1,
    profile: null,
    uiLang: null,
    dailyGoal: 20,
    settings: defaultSettings(null),
    parentalDailyMinutes: null,
    totalXp: 0,
    xpByDay: {},
    msByDay: {},
    streak: { current: 0, longest: 0, lastActiveDay: null, freezes: 0, frozenDays: [] },
    hearts: { count: MAX_HEARTS, updatedAt: now },
    gems: 500,
    unitLevels: {},
    memory: {},
    mistakes: [],
    lessonsCompleted: 0,
    perfectLessons: 0,
    quests: { day: "", items: [] },
    league: { weekId: "", tier: 0, xp: 0, lastResult: null },
    achievements: [],
    outfits: { owned: [], equipped: null },
  };
}

export function heartsEnabled(s: ProgressState): boolean {
  return s.profile !== "kids";
}
