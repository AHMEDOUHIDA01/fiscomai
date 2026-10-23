import type { ExerciseType, Profile, SessionKind, UiLang } from "../types";
import { LEVELS_PER_UNIT } from "../types";
import { updateMemory } from "../srs/srs";
import { unlockAchievements } from "./achievements";
import { currentHearts, gainHeart, loseHeart } from "./hearts";
import { advanceQuests, questsForDay } from "./quests";
import { GROUP_SIZE, nextTier, standings } from "./league";
import { shopItem, type ShopItemId } from "./shop";
import { defaultSettings, heartsEnabled, MAX_FREEZES, MAX_HEARTS, type ProgressState, type Settings } from "./state";
import { extendStreak, settleStreak } from "./streak";
import { dayKey, localHour, weekKey } from "./time";

/**
 * Toute modification de la progression passe par un événement.
 * En v1 ils sont appliqués localement ; en v2 ils seront aussi envoyés au serveur.
 */
export type ProgressEvent =
  | { type: "onboard"; profile: Profile; uiLang: UiLang; dailyGoal: number }
  | { type: "setProfile"; profile: Profile }
  | { type: "setUiLang"; uiLang: UiLang }
  | { type: "setDailyGoal"; dailyGoal: number }
  | { type: "settings"; patch: Partial<Settings> }
  | { type: "setParental"; dailyMinutes: number | null }
  | { type: "answer"; wordIds: string[]; correct: boolean; exerciseType: ExerciseType; sessionKind: SessionKind }
  | {
      type: "sessionComplete";
      kind: SessionKind;
      unitId?: string;
      level?: number;
      mistakes: number;
      correct: number;
      listenCorrect: number;
      maxCombo: number;
      durationMs: number;
    }
  | { type: "buy"; item: ShopItemId }
  | { type: "equip"; outfit: string | null }
  | { type: "dismissLeagueResult" }
  | { type: "tick" };

export interface EventContext {
  now: number;
  tzOffsetMin: number;
  /** Nom affiché dans la ligue. */
  playerName?: string;
}

export interface SessionReward {
  xp: number;
  gems: number;
  perfect: boolean;
  morningBonus: boolean;
  comboBonus: boolean;
  streakExtended: boolean;
  unitCompleted: boolean;
  achievements: string[];
}

export const XP = { lesson: 10, perfect: 15, review: 5, combo: 5, comboThreshold: 5, morningHour: 9, unitChest: 25 } as const;

export function xpForSession(kind: SessionKind, mistakes: number, maxCombo: number, hour: number) {
  const perfect = mistakes === 0;
  let xp = kind === "lesson" ? (perfect ? XP.perfect : XP.lesson) : XP.review;
  const comboBonus = maxCombo >= XP.comboThreshold;
  if (comboBonus) xp += XP.combo;
  const morningBonus = hour < XP.morningHour && hour >= 5;
  if (morningBonus) xp *= 2;
  return { xp, perfect, comboBonus, morningBonus };
}

/** Applique un événement. Pur : même état + même événement + même contexte → même résultat. */
export function applyEvent(state: ProgressState, ev: ProgressEvent, ctx: EventContext): { state: ProgressState; reward?: SessionReward } {
  const s = rollover(state, ctx);
  const today = dayKey(ctx.now, ctx.tzOffsetMin);

  switch (ev.type) {
    case "tick":
      return { state: s };

    case "onboard":
      return {
        state: {
          ...s,
          profile: ev.profile,
          uiLang: ev.uiLang,
          dailyGoal: ev.dailyGoal,
          settings: { ...defaultSettings(ev.profile), reminders: s.settings.reminders, remindersAsked: s.settings.remindersAsked },
          quests: { day: today, items: questsForDay(today, true) },
        },
      };

    case "setProfile":
      return { state: { ...s, profile: ev.profile, settings: { ...s.settings, ...profileDefaults(ev.profile) } } };

    case "setUiLang":
      return { state: { ...s, uiLang: ev.uiLang } };

    case "setDailyGoal":
      return { state: { ...s, dailyGoal: ev.dailyGoal } };

    case "settings":
      return { state: { ...s, settings: { ...s.settings, ...ev.patch } } };

    case "setParental":
      return { state: { ...s, parentalDailyMinutes: ev.dailyMinutes } };

    case "answer": {
      const memory = { ...s.memory };
      for (const id of ev.wordIds) memory[id] = updateMemory(memory[id], ev.correct, ctx.now);
      let mistakes = s.mistakes;
      if (ev.correct) {
        if (ev.sessionKind === "mistakes") mistakes = mistakes.filter((id) => !ev.wordIds.includes(id));
      } else {
        mistakes = [...ev.wordIds, ...mistakes.filter((id) => !ev.wordIds.includes(id))].slice(0, 30);
      }
      // On ne perd un cœur que dans les nouvelles leçons (les révisions restent toujours possibles).
      const hearts = !ev.correct && heartsEnabled(s) && ev.sessionKind === "lesson" ? loseHeart(s.hearts, ctx.now) : s.hearts;
      return { state: { ...s, memory, mistakes, hearts } };
    }

    case "sessionComplete": {
      const { xp, perfect, comboBonus, morningBonus } = xpForSession(ev.kind, ev.mistakes, ev.maxCombo, localHour(ctx.now, ctx.tzOffsetMin));
      let next: ProgressState = {
        ...s,
        totalXp: s.totalXp + xp,
        xpByDay: { ...s.xpByDay, [today]: (s.xpByDay[today] ?? 0) + xp },
        msByDay: { ...s.msByDay, [today]: (s.msByDay[today] ?? 0) + ev.durationMs },
        streak: extendStreak(s.streak, today),
        league: { ...s.league, xp: s.league.xp + xp },
        lessonsCompleted: s.lessonsCompleted + (ev.kind === "lesson" ? 1 : 0),
        perfectLessons: s.perfectLessons + (ev.kind === "lesson" && perfect ? 1 : 0),
      };
      let gems = 0;

      // Progression dans l'unité + coffre quand l'unité est terminée.
      let unitCompleted = false;
      if (ev.kind === "lesson" && ev.unitId && ev.level) {
        const done = s.unitLevels[ev.unitId] ?? 0;
        if (ev.level === done + 1) {
          next.unitLevels = { ...s.unitLevels, [ev.unitId]: ev.level };
          if (ev.level === LEVELS_PER_UNIT) {
            unitCompleted = true;
            gems += XP.unitChest;
          }
        }
      }
      // Une révision rend un cœur.
      if (ev.kind !== "lesson" && heartsEnabled(s)) next.hearts = gainHeart(next.hearts, ctx.now);

      const q = advanceQuests(next.quests.items, {
        xp,
        lessons: ev.kind === "lesson" ? 1 : 0,
        perfect: ev.kind === "lesson" && perfect ? 1 : 0,
        listen: ev.listenCorrect,
        correct: ev.correct,
        combo: ev.maxCombo,
      });
      gems += q.gems;
      next = { ...next, quests: { ...next.quests, items: q.items }, gems: next.gems + gems };

      const ach = unlockAchievements(next);
      gems += ach.state.gems - next.gems;
      next = ach.state;

      return {
        state: next,
        reward: {
          xp,
          gems,
          perfect,
          morningBonus,
          comboBonus,
          streakExtended: s.streak.lastActiveDay !== today,
          unitCompleted,
          achievements: ach.unlocked,
        },
      };
    }

    case "buy": {
      const item = shopItem(ev.item);
      if (s.gems < item.price) return { state: s };
      if (s.profile === "kids" && item.kind !== "outfit") return { state: s };
      if (item.kind === "hearts") {
        if (currentHearts(s.hearts, ctx.now).count >= MAX_HEARTS) return { state: s };
        return { state: { ...s, gems: s.gems - item.price, hearts: { count: MAX_HEARTS, updatedAt: ctx.now } } };
      }
      if (item.kind === "freeze") {
        if (s.streak.freezes >= MAX_FREEZES) return { state: s };
        return { state: { ...s, gems: s.gems - item.price, streak: { ...s.streak, freezes: s.streak.freezes + 1 } } };
      }
      if (s.outfits.owned.includes(item.id)) return { state: s };
      return { state: { ...s, gems: s.gems - item.price, outfits: { owned: [...s.outfits.owned, item.id], equipped: item.id } } };
    }

    case "equip":
      if (ev.outfit !== null && !s.outfits.owned.includes(ev.outfit)) return { state: s };
      return { state: { ...s, outfits: { ...s.outfits, equipped: ev.outfit } } };

    case "dismissLeagueResult":
      return { state: { ...s, league: { ...s.league, lastResult: null } } };
  }
}

/** Passage de jour / de semaine : série, quêtes, ligue, cœurs. */
function rollover(s: ProgressState, ctx: EventContext): ProgressState {
  const today = dayKey(ctx.now, ctx.tzOffsetMin);
  const week = weekKey(ctx.now, ctx.tzOffsetMin);
  let next = s;

  const streak = settleStreak(s.streak, today);
  if (streak !== s.streak) next = { ...next, streak };

  if (next.profile && next.quests.day !== today) {
    next = { ...next, quests: { day: today, items: questsForDay(today, next.settings.listenEnabled) } };
  }

  if (next.league.weekId !== week) {
    let { tier } = next.league;
    let lastResult = null;
    if (next.league.weekId) {
      const final = standings(next.league.weekId, tier, next.league.xp, "", 1);
      const rank = final.findIndex((r) => r.isMe) + 1;
      const to = nextTier(tier, Math.min(rank, GROUP_SIZE), next.league.xp);
      if (next.league.xp > 0) lastResult = { weekId: next.league.weekId, rank, from: tier, to };
      tier = to;
    }
    next = { ...next, league: { weekId: week, tier, xp: 0, lastResult } };
  }

  const hearts = currentHearts(next.hearts, ctx.now);
  if (hearts.count !== next.hearts.count || hearts.updatedAt !== next.hearts.updatedAt) next = { ...next, hearts };
  return next;
}

function profileDefaults(p: Profile): Partial<Settings> {
  const d = defaultSettings(p);
  return { slowTts: d.slowTts, reduceMotion: d.reduceMotion, leagueEnabled: d.leagueEnabled, reminderHour: d.reminderHour };
}
