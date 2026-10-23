import { createRng, pick, type Rng } from "../rng";
import type { Tr } from "../types";

/** 10 ligues, des villes marocaines. */
export const LEAGUES: { id: string; name: Tr; color: string }[] = [
  { id: "ifrane", name: { ar: "إفران", darija: "إفران", fr: "Ifrane" }, color: "#8FB8DE" },
  { id: "essaouira", name: { ar: "الصويرة", darija: "الصويرة", fr: "Essaouira" }, color: "#5BA4C4" },
  { id: "agadir", name: { ar: "أكادير", darija: "أكادير", fr: "Agadir" }, color: "#F2A541" },
  { id: "fes", name: { ar: "فاس", darija: "فاس", fr: "Fès" }, color: "#2E9E6A" },
  { id: "meknes", name: { ar: "مكناس", darija: "مكناس", fr: "Meknès" }, color: "#7A9E3A" },
  { id: "tanger", name: { ar: "طنجة", darija: "طنجة", fr: "Tanger" }, color: "#3A7CA5" },
  { id: "chefchaouen", name: { ar: "شفشاون", darija: "الشاون", fr: "Chefchaouen" }, color: "#4A6FE3" },
  { id: "rabat", name: { ar: "الرباط", darija: "الرباط", fr: "Rabat" }, color: "#C8553D" },
  { id: "marrakech", name: { ar: "مراكش", darija: "مراكش", fr: "Marrakech" }, color: "#B5442F" },
  { id: "majorelle", name: { ar: "ماجوريل", darija: "ماجوريل", fr: "Majorelle" }, color: "#2A4BD7" },
];

export const GROUP_SIZE = 30;
export const PROMOTE = 7;
export const DEMOTE = 5;

const FIRST = ["Yassine", "Salma", "Mehdi", "Amina", "Karim", "Noura", "Hamza", "Imane", "Omar", "Khadija", "Youssef", "Sara",
  "Ayoub", "Hiba", "Anas", "Meryem", "Ilyas", "Zineb", "Adam", "Nour", "Reda", "Ghita", "Othmane", "Kawtar", "Hajar", "Badr",
  "Soufiane", "Lina", "Ismail", "Chaimae", "Bilal", "Douae", "Taha", "Rania"];
const LAST = ["B.", "E.", "A.", "M.", "K.", "L.", "T.", "Z.", "O.", "H."];
const AVATARS = ["🦊", "🐪", "🦅", "🐢", "🦁", "🐐", "🦉", "🐬", "🐫", "🦩"];

export interface Bot {
  id: string;
  name: string;
  avatar: string;
  /** XP visée en fin de semaine. */
  weeklyTarget: number;
  /** Forme de la courbe : < 1 commence fort, > 1 finit fort. */
  curve: number;
}

/** 29 adversaires simulés, déterministes pour une semaine et une ligue données. */
export function botsFor(weekId: string, tier: number): Bot[] {
  const rng = createRng(`league:${weekId}:${tier}`);
  const scale = 1 + tier * 0.35;
  return Array.from({ length: GROUP_SIZE - 1 }, (_, i) => ({
    id: `bot-${i}`,
    name: `${pick(rng, FIRST)} ${pick(rng, LAST)}`,
    avatar: pick(rng, AVATARS),
    weeklyTarget: Math.round(botTarget(rng) * scale),
    curve: 0.6 + rng() * 0.9,
  }));
}

function botTarget(rng: Rng): number {
  const r = rng();
  if (r < 0.15) return 0; // inactifs
  if (r < 0.45) return 20 + Math.floor(rng() * 80);
  if (r < 0.85) return 100 + Math.floor(rng() * 250);
  return 350 + Math.floor(rng() * 700); // très actifs
}

export function botXp(bot: Bot, weekProgress: number): number {
  return Math.round(bot.weeklyTarget * Math.min(1, weekProgress) ** bot.curve);
}

export interface Standing {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  isMe: boolean;
}

export function standings(weekId: string, tier: number, myXp: number, myName: string, progress: number): Standing[] {
  const rows: Standing[] = botsFor(weekId, tier).map((b) => ({ id: b.id, name: b.name, avatar: b.avatar, xp: botXp(b, progress), isMe: false }));
  rows.push({ id: "me", name: myName, avatar: "🦊", xp: myXp, isMe: true });
  // À égalité, l'élève passe devant (comme on l'attendrait d'un vrai classement par ordre d'arrivée).
  return rows.sort((a, b) => b.xp - a.xp || Number(b.isMe) - Number(a.isMe));
}

/** Nouvelle ligue après la semaine terminée. Un élève inactif reste où il est. */
export function nextTier(tier: number, rank: number, xp: number): number {
  if (xp === 0) return tier;
  if (rank <= PROMOTE) return Math.min(LEAGUES.length - 1, tier + 1);
  if (rank > GROUP_SIZE - DEMOTE) return Math.max(0, tier - 1);
  return tier;
}
