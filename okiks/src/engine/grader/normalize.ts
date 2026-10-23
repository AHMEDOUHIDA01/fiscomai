/** Normalise une réponse anglaise : minuscules, apostrophes unifiées, ponctuation retirée. */
export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[‘’ʼ`´]/g, "'")
    .replace(/[^\p{L}\p{N}' ]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(input: string): string[] {
  const n = normalizeText(input);
  return n === "" ? [] : n.split(" ");
}

/** Normalisation pour les réponses en arabe/darija/français (banque de mots). */
export function normalizeNative(input: string): string {
  return input
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[ً-ْـ]/g, "") // tachkil + tatweel
    .replace(/[إأآ]/g, "ا")
    .replace(/[‘’]/g, "'")
    .replace(/[^\p{L}\p{N}' ]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Distance d'édition avec transpositions adjacentes (« studnet » → « student » = 1). */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

/** Tolérance de faute de frappe selon la longueur du mot attendu. */
export function typoAllowance(word: string): number {
  if (word.length >= 8) return 2;
  if (word.length >= 4) return 1;
  return 0;
}
