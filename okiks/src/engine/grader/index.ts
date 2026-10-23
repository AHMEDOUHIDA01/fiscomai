import { compileAnswers, type AnswerGraph } from "./graph";
import { grade, gradeSpeech, type GradeResult } from "./grade";
import { normalizeNative } from "./normalize";

export * from "./graph";
export * from "./grade";
export * from "./normalize";

const cache = new Map<string, AnswerGraph>();

/** Compile (avec cache) puis corrige une réponse anglaise. */
export function gradeEnglish(dsl: string, answer: string, mode: "text" | "speech" = "text"): GradeResult {
  let g = cache.get(dsl);
  if (!g) {
    g = compileAnswers(dsl);
    cache.set(dsl, g);
  }
  return mode === "speech" ? gradeSpeech(g, answer) : grade(g, answer);
}

/** Réponse construite avec la banque de mots en langue maternelle : comparaison exacte normalisée. */
export function gradeTiles(accepted: string[], answer: string): GradeResult {
  const got = normalizeNative(answer);
  const ok = accepted.some((a) => normalizeNative(a) === got);
  return { verdict: ok ? "correct" : "wrong", closest: accepted[0], ops: [], cost: ok ? 0 : 3 };
}
