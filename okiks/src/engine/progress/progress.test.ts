import { describe, expect, it } from "vitest";
import { applyEvent, type ProgressEvent } from "./reducer";
import { initialState, type ProgressState } from "./state";
import { currentHearts, HEART_REFILL_MS } from "./hearts";
import { botsFor, botXp, nextTier, standings } from "./league";
import { advanceQuests, questsForDay } from "./quests";
import { dayKey, weekKey, DAY, HOUR } from "./time";

// Mardi 20 octobre 2026, 14:00 heure du Maroc (UTC+1 → offset -60).
const TZ = -60;
const T0 = Date.UTC(2026, 9, 20, 13, 0);

function run(events: [ProgressEvent, number][], start?: ProgressState) {
  let s = start ?? initialState(T0);
  const rewards = [];
  for (const [ev, now] of events) {
    const r = applyEvent(s, ev, { now, tzOffsetMin: TZ });
    s = r.state;
    if (r.reward) rewards.push(r.reward);
  }
  return { s, rewards };
}

const onboard = (profile: "kids" | "adult" | "pro" = "adult"): ProgressEvent => ({ type: "onboard", profile, uiLang: "fr", dailyGoal: 20 });
const lesson = (mistakes = 1, extra: Partial<Extract<ProgressEvent, { type: "sessionComplete" }>> = {}): ProgressEvent => ({
  type: "sessionComplete", kind: "lesson", unitId: "u1", level: 1, mistakes, correct: 10, listenCorrect: 2, maxCombo: 3, durationMs: 120_000, ...extra,
});
const wrong: ProgressEvent = { type: "answer", wordIds: ["w1"], correct: false, exerciseType: "translateToEnglish", sessionKind: "lesson" };

describe("temps local", () => {
  it("calcule le jour et la semaine dans le fuseau de l'élève", () => {
    expect(dayKey(Date.UTC(2026, 9, 20, 23, 30), TZ)).toBe("2026-10-21");
    expect(weekKey(T0, TZ)).toBe("2026-W43");
  });
});

describe("XP et leçons", () => {
  it("donne 10 XP, 15 si parfaite, et fait avancer l'unité", () => {
    const { s, rewards } = run([[onboard(), T0], [lesson(2), T0], [lesson(0, { level: 2 }), T0]]);
    expect(rewards.map((r) => r.xp)).toEqual([10, 15]);
    expect(s.totalXp).toBe(25);
    expect(s.unitLevels.u1).toBe(2);
    expect(s.perfectLessons).toBe(1);
  });

  it("double l'XP le matin et ajoute le bonus de combo", () => {
    const morning = Date.UTC(2026, 9, 20, 6, 30); // 7 h 30 au Maroc
    const { rewards } = run([[onboard(), morning], [lesson(1, { maxCombo: 6 }), morning]]);
    expect(rewards[0]).toMatchObject({ xp: (10 + 5) * 2, morningBonus: true, comboBonus: true });
  });

  it("ne fait pas sauter de niveau et donne un coffre à la fin de l'unité", () => {
    let { s } = run([[onboard(), T0], [lesson(1, { level: 3 }), T0]]);
    expect(s.unitLevels.u1).toBeUndefined();
    const gemsBefore = s.gems;
    for (let l = 1; l <= 5; l++) s = applyEvent(s, lesson(1, { level: l }), { now: T0, tzOffsetMin: TZ }).state;
    expect(s.unitLevels.u1).toBe(5);
    expect(s.gems).toBeGreaterThanOrEqual(gemsBefore + 25);
  });
});

describe("série", () => {
  it("augmente d'un jour au lendemain et retombe après un jour manqué", () => {
    const { s } = run([[onboard(), T0], [lesson(), T0], [lesson(), T0 + DAY], [lesson(), T0 + DAY]]);
    expect(s.streak.current).toBe(2);
    const after = run([[{ type: "tick" }, T0 + 3 * DAY]], s).s;
    expect(after.streak.current).toBe(0);
    expect(after.streak.longest).toBe(2);
  });

  it("une protection sauve un jour manqué", () => {
    let { s } = run([[onboard(), T0], [lesson(), T0]]);
    s = { ...s, gems: 1000 };
    s = run([[{ type: "buy", item: "freeze" }, T0], [lesson(), T0 + 2 * DAY]], s).s;
    expect(s.streak.current).toBe(2);
    expect(s.streak.freezes).toBe(0);
    expect(s.streak.frozenDays).toEqual([dayKey(T0 + DAY, TZ)]);
  });

  it("une leçon juste avant minuit et une juste après comptent pour deux jours", () => {
    const beforeMidnight = Date.UTC(2026, 9, 20, 22, 50); // 23 h 50 locales
    const { s } = run([[onboard(), beforeMidnight], [lesson(), beforeMidnight], [lesson(), beforeMidnight + 20 * 60_000]]);
    expect(s.streak.current).toBe(2);
  });
});

describe("cœurs", () => {
  it("une erreur en leçon coûte un cœur, pas en révision ni pour les enfants", () => {
    expect(run([[onboard(), T0], [wrong, T0]]).s.hearts.count).toBe(4);
    expect(run([[onboard(), T0], [{ ...wrong, sessionKind: "practice" } as ProgressEvent, T0]]).s.hearts.count).toBe(5);
    expect(run([[onboard("kids"), T0], [wrong, T0]]).s.hearts.count).toBe(5);
  });

  it("se rechargent d'un cœur toutes les 4 heures", () => {
    const { s } = run([[onboard(), T0], [wrong, T0], [wrong, T0], [wrong, T0]]);
    expect(currentHearts(s.hearts, T0 + HEART_REFILL_MS - 1).count).toBe(2);
    expect(currentHearts(s.hearts, T0 + HEART_REFILL_MS).count).toBe(3);
    expect(currentHearts(s.hearts, T0 + 10 * HEART_REFILL_MS).count).toBe(5);
  });

  it("la boutique recharge les cœurs contre 350 gemmes", () => {
    const { s } = run([[onboard(), T0], [wrong, T0], [{ type: "buy", item: "hearts" }, T0]]);
    expect(s.hearts.count).toBe(5);
    expect(s.gems).toBe(500 - 350);
  });
});

describe("quêtes", () => {
  it("sont identiques pour un même jour", () => {
    expect(questsForDay("2026-10-20", true)).toEqual(questsForDay("2026-10-20", true));
    expect(questsForDay("2026-10-20", true)).toHaveLength(3);
  });

  it("donnent des gemmes une seule fois quand elles sont terminées", () => {
    const items = [{ id: "q", kind: "xp" as const, target: 20, progress: 0, reward: 15, done: false }];
    const a = advanceQuests(items, { xp: 15 });
    expect(a.gems).toBe(0);
    const b = advanceQuests(a.items, { xp: 15 });
    expect(b.gems).toBe(15);
    expect(advanceQuests(b.items, { xp: 15 }).gems).toBe(0);
  });
});

describe("ligue", () => {
  it("les adversaires simulés sont déterministes et progressent pendant la semaine", () => {
    expect(botsFor("2026-W43", 2)).toEqual(botsFor("2026-W43", 2));
    const bot = botsFor("2026-W43", 2).find((b) => b.weeklyTarget > 0)!;
    expect(botXp(bot, 0.2)).toBeLessThanOrEqual(botXp(bot, 0.8));
    expect(standings("2026-W43", 0, 50, "Moi", 0.5)).toHaveLength(30);
  });

  it("montée pour le top 7, descente pour les 5 derniers, inactif = reste", () => {
    expect(nextTier(2, 3, 100)).toBe(3);
    expect(nextTier(2, 28, 10)).toBe(1);
    expect(nextTier(2, 15, 50)).toBe(2);
    expect(nextTier(2, 30, 0)).toBe(2);
  });

  it("change de semaine et enregistre le résultat", () => {
    let { s } = run([[onboard(), T0], [lesson(0, { maxCombo: 9 }), T0]]);
    s = { ...s, league: { ...s.league, xp: 5000 } };
    s = run([[{ type: "tick" }, T0 + 7 * DAY]], s).s;
    expect(s.league.tier).toBe(1);
    expect(s.league.xp).toBe(0);
    expect(s.league.lastResult).toMatchObject({ rank: 1, from: 0, to: 1 });
  });
});

describe("succès", () => {
  it("débloque « première leçon » avec ses gemmes", () => {
    const { s, rewards } = run([[onboard(), T0], [lesson(), T0]]);
    expect(s.achievements).toContain("first");
    expect(rewards[0].achievements).toContain("first");
  });
});

describe("profil enfant", () => {
  it("ne peut pas acheter de cœurs ni de protection", () => {
    const { s } = run([[onboard("kids"), T0], [{ type: "buy", item: "freeze" }, T0]]);
    expect(s.gems).toBe(500);
    expect(s.settings.leagueEnabled).toBe(false);
    expect(s.settings.slowTts).toBe(true);
  });
});

it("la recharge passive ne dépasse jamais 5 cœurs", () => {
  expect(currentHearts({ count: 4, updatedAt: T0 }, T0 + 100 * HOUR).count).toBe(5);
});
