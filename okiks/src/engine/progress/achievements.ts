import type { Tr } from "../types";
import type { ProgressState } from "./state";

export interface Achievement {
  id: string;
  icon: string;
  title: Tr;
  reward: number;
  test: (s: ProgressState) => boolean;
}

const learnedWords = (s: ProgressState) => Object.values(s.memory).filter((m) => m.strength >= 1).length;

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first", icon: "🌱", reward: 10, title: { ar: "أول درس", darija: "أول درس", fr: "Première leçon" }, test: (s) => s.lessonsCompleted >= 1 },
  { id: "streak3", icon: "🔥", reward: 15, title: { ar: "3 أيام متتالية", darija: "3 أيام بلا ما تحبس", fr: "3 jours d'affilée" }, test: (s) => s.streak.longest >= 3 },
  { id: "streak7", icon: "🏮", reward: 30, title: { ar: "أسبوع كامل", darija: "سيمانة كاملة", fr: "Une semaine entière" }, test: (s) => s.streak.longest >= 7 },
  { id: "streak30", icon: "🕌", reward: 100, title: { ar: "30 يومًا", darija: "شهر كامل", fr: "30 jours" }, test: (s) => s.streak.longest >= 30 },
  { id: "words50", icon: "📚", reward: 20, title: { ar: "50 كلمة", darija: "50 كلمة", fr: "50 mots" }, test: (s) => learnedWords(s) >= 50 },
  { id: "words100", icon: "🧠", reward: 40, title: { ar: "100 كلمة", darija: "100 كلمة", fr: "100 mots" }, test: (s) => learnedWords(s) >= 100 },
  { id: "lessons10", icon: "🎒", reward: 20, title: { ar: "10 دروس", darija: "10 دروس", fr: "10 leçons" }, test: (s) => s.lessonsCompleted >= 10 },
  { id: "perfect5", icon: "⭐", reward: 25, title: { ar: "5 دروس بلا أخطاء", darija: "5 دروس بلا غلطة", fr: "5 leçons parfaites" }, test: (s) => s.perfectLessons >= 5 },
  { id: "fes", icon: "🏆", reward: 50, title: { ar: "دوري فاس", darija: "وصلت لفاس", fr: "Ligue de Fès" }, test: (s) => s.league.tier >= 3 },
  { id: "xp1000", icon: "💎", reward: 50, title: { ar: "1000 نقطة", darija: "1000 نقطة", fr: "1000 XP" }, test: (s) => s.totalXp >= 1000 },
];

/** Débloque les succès atteints ; renvoie le nouvel état et les ids débloqués. */
export function unlockAchievements(s: ProgressState): { state: ProgressState; unlocked: string[] } {
  const unlocked = ACHIEVEMENTS.filter((a) => !s.achievements.includes(a.id) && a.test(s));
  if (unlocked.length === 0) return { state: s, unlocked: [] };
  return {
    state: {
      ...s,
      achievements: [...s.achievements, ...unlocked.map((a) => a.id)],
      gems: s.gems + unlocked.reduce((n, a) => n + a.reward, 0),
    },
    unlocked: unlocked.map((a) => a.id),
  };
}
