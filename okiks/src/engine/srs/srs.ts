/** Mémoire d'un mot pour la révision espacée. */
export interface WordMemory {
  /** 0 (fragile) → 6 (solide). */
  strength: number;
  lastSeen: number;
  seen: number;
  errors: number;
}

const DAY = 86_400_000;
export const MAX_STRENGTH = 6;

/** Demi-vie du souvenir en jours : 12 h à 0, puis doublée à chaque niveau. */
export function halfLifeDays(strength: number): number {
  return 0.5 * 2 ** strength;
}

/** Probabilité estimée que l'élève se souvienne du mot à l'instant `now`. */
export function recall(mem: WordMemory | undefined, now: number): number {
  if (!mem) return 0;
  const days = Math.max(0, now - mem.lastSeen) / DAY;
  return 2 ** (-days / halfLifeDays(mem.strength));
}

export function updateMemory(mem: WordMemory | undefined, correct: boolean, now: number): WordMemory {
  const base: WordMemory = mem ?? { strength: 0, lastSeen: now, seen: 0, errors: 0 };
  return {
    strength: correct ? Math.min(MAX_STRENGTH, base.strength + 1) : Math.max(0, base.strength - 2),
    lastSeen: now,
    seen: base.seen + 1,
    errors: base.errors + (correct ? 0 : 1),
  };
}

/** Les `n` mots les plus faibles parmi `candidates` (seulement les mots déjà vus). */
export function weakestWords(
  memory: Record<string, WordMemory>,
  candidates: Iterable<string>,
  n: number,
  now: number,
): string[] {
  return [...candidates]
    .filter((id) => memory[id])
    .map((id) => ({ id, r: recall(memory[id], now) }))
    .sort((a, b) => a.r - b.r || a.id.localeCompare(b.id))
    .slice(0, n)
    .map((x) => x.id);
}

/** Force moyenne d'un ensemble de mots, entre 0 et 1 (affichée comme « fissures » sur les unités). */
export function averageRecall(memory: Record<string, WordMemory>, ids: string[], now: number): number {
  if (ids.length === 0) return 1;
  return ids.reduce((s, id) => s + recall(memory[id], now), 0) / ids.length;
}
