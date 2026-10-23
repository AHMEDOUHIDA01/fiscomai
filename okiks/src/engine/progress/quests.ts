import { createRng, sample } from "../rng";
import type { Quest, QuestKind } from "./state";

interface Template {
  kind: QuestKind;
  targets: number[];
  reward: number;
}

const TEMPLATES: Template[] = [
  { kind: "xp", targets: [20, 30, 40], reward: 15 },
  { kind: "lessons", targets: [2, 3], reward: 15 },
  { kind: "perfect", targets: [1, 2], reward: 20 },
  { kind: "listen", targets: [8, 12], reward: 10 },
  { kind: "combo", targets: [5, 10], reward: 10 },
  { kind: "correct", targets: [15, 25], reward: 10 },
];

/** 3 quêtes du jour, identiques pour un même jour et un même profil. */
export function questsForDay(day: string, listenEnabled: boolean): Quest[] {
  const rng = createRng(`quests:${day}`);
  const pool = TEMPLATES.filter((t) => listenEnabled || t.kind !== "listen");
  return sample(rng, pool, 3).map((t, i) => ({
    id: `${day}-${i}`,
    kind: t.kind,
    target: t.targets[Math.floor(rng() * t.targets.length)],
    progress: 0,
    reward: t.reward,
    done: false,
  }));
}

export interface QuestDelta {
  xp?: number;
  lessons?: number;
  perfect?: number;
  listen?: number;
  correct?: number;
  /** Meilleure série de bonnes réponses dans une leçon (valeur absolue, pas un incrément). */
  combo?: number;
}

/** Fait avancer les quêtes et renvoie les gemmes gagnées par les quêtes terminées. */
export function advanceQuests(items: Quest[], d: QuestDelta): { items: Quest[]; gems: number } {
  let gems = 0;
  const next = items.map((q) => {
    if (q.done) return q;
    const progress = q.kind === "combo" ? Math.max(q.progress, d.combo ?? 0) : q.progress + (d[q.kind] ?? 0);
    const done = progress >= q.target;
    if (done) gems += q.reward;
    return { ...q, progress: Math.min(progress, q.target), done };
  });
  return { items: next, gems };
}
