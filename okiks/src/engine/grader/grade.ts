import type { AnswerGraph } from "./graph";
import { editDistance, tokenize, typoAllowance } from "./normalize";

export type OpKind =
  | "exact"
  | "typo"
  | "missing_space"
  | "extra_space"
  | "wrong_word"
  | "missing_word"
  | "extra_word";

export interface Op {
  kind: OpKind;
  /** Mot attendu (vide pour un mot en trop). */
  expected: string;
  /** Ce que l'élève a écrit (vide pour un mot manquant). */
  got: string;
}

export type Verdict = "correct" | "typo" | "wrong";

export interface GradeResult {
  verdict: Verdict;
  /** Réponse correcte la plus proche de celle de l'élève. */
  closest: string;
  ops: Op[];
  cost: number;
}

const COST: Record<OpKind, number> = {
  exact: 0,
  typo: 1,
  missing_space: 0.5,
  extra_space: 0.5,
  wrong_word: 3,
  missing_word: 3,
  extra_word: 3,
};

interface Back {
  v: number;
  i: number;
  ops: Op[];
}

/**
 * Aligne la réponse sur le graphe par programmation dynamique sur (sommet, position)
 * et renvoie le chemin de coût minimal. Les sommets étant en ordre topologique,
 * un seul passage suffit.
 */
export function grade(graph: AnswerGraph, answer: string): GradeResult {
  const input = tokenize(answer);
  const M = input.length;
  const V = graph.vertices.length;
  const dist: number[][] = Array.from({ length: V }, () => new Array(M + 1).fill(Infinity));
  const back: (Back | null)[][] = Array.from({ length: V }, () => new Array(M + 1).fill(null));
  dist[graph.start][0] = 0;

  const relax = (v: number, i: number, to: number, j: number, ops: Op[]) => {
    const c = dist[v][i] + ops.reduce((s, o) => s + COST[o.kind], 0);
    if (c < dist[to][j] - 1e-9) {
      dist[to][j] = c;
      back[to][j] = { v, i, ops };
    }
  };

  for (let v = 0; v < V; v++) {
    for (let i = 0; i <= M; i++) {
      if (dist[v][i] === Infinity) continue;
      const got = input[i];

      // Mot en trop dans la réponse : on reste sur le même sommet.
      if (i < M) relax(v, i, v, i + 1, [{ kind: "extra_word", expected: "", got }]);

      for (const e of graph.vertices[v]) {
        if (e.word === "") {
          relax(v, i, e.to, i, []);
          continue;
        }
        // Mot attendu absent.
        relax(v, i, e.to, i, [{ kind: "missing_word", expected: e.word, got: "" }]);
        if (i < M) {
          if (got === e.word) {
            relax(v, i, e.to, i + 1, [{ kind: "exact", expected: e.word, got }]);
          } else if (editDistance(got, e.word) <= typoAllowance(e.word)) {
            relax(v, i, e.to, i + 1, [{ kind: "typo", expected: e.word, got }]);
          } else {
            relax(v, i, e.to, i + 1, [{ kind: "wrong_word", expected: e.word, got }]);
          }
          // Deux mots collés : « thankyou » pour « thank you ».
          for (const [next, w2] of followWords(graph, e.to)) {
            if (got === e.word + w2) {
              relax(v, i, next, i + 1, [{ kind: "missing_space", expected: `${e.word} ${w2}`, got }]);
            }
          }
          // Un mot coupé en deux : « every one » pour « everyone ».
          if (i + 1 < M && got + input[i + 1] === e.word) {
            relax(v, i, e.to, i + 2, [{ kind: "extra_space", expected: e.word, got: `${got} ${input[i + 1]}` }]);
          }
        }
      }
    }
  }

  // Reconstruction du meilleur chemin.
  const ops: Op[] = [];
  let v = graph.end;
  let i = M;
  while (back[v][i]) {
    const b = back[v][i]!;
    ops.unshift(...b.ops);
    v = b.v;
    i = b.i;
  }
  const cost = dist[graph.end][M];
  const closest = ops
    .filter((o) => o.expected !== "")
    .map((o) => o.expected)
    .join(" ");

  let verdict: Verdict;
  if (M === 0) verdict = "wrong";
  else if (ops.every((o) => o.kind === "exact")) verdict = "correct";
  else if (ops.every((o) => o.kind === "exact" || o.kind === "typo" || o.kind === "missing_space" || o.kind === "extra_space"))
    verdict = "typo";
  else verdict = "wrong";

  return { verdict, closest, ops, cost };
}

/** Mots qui suivent immédiatement un sommet (en traversant les arêtes vides). */
function followWords(graph: AnswerGraph, v: number): [number, string][] {
  const out: [number, string][] = [];
  const seen = new Set<number>();
  const walk = (u: number) => {
    if (seen.has(u)) return;
    seen.add(u);
    for (const e of graph.vertices[u]) {
      if (e.word === "") walk(e.to);
      else out.push([e.to, e.word]);
    }
  };
  walk(v);
  return out;
}

/**
 * Correction indulgente pour la prononciation : la reconnaissance vocale
 * se trompe souvent sur les petits mots, on accepte jusqu'à 25 % d'écarts.
 */
export function gradeSpeech(graph: AnswerGraph, transcript: string): GradeResult {
  const r = grade(graph, transcript);
  if (r.verdict !== "wrong") return r;
  const expectedWords = r.ops.filter((o) => o.expected !== "").length || 1;
  const bad = r.ops.filter((o) => o.kind === "wrong_word" || o.kind === "missing_word" || o.kind === "extra_word").length;
  return bad / expectedWords <= 0.25 ? { ...r, verdict: "correct" } : r;
}
