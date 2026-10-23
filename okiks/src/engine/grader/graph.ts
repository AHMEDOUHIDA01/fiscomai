import { tokenize } from "./normalize";

/**
 * Graphe de réponses acceptées (DAG). Les sommets sont numérotés dans l'ordre
 * topologique : toute arête va d'un sommet vers un sommet de numéro supérieur.
 * Une arête porte un mot ("" = arête vide, pour les parties optionnelles).
 */
export interface Edge {
  to: number;
  word: string;
}

export interface AnswerGraph {
  vertices: Edge[][];
  start: number;
  end: number;
}

type Segment = { kind: "word"; word: string } | { kind: "group"; options: Segment[][] };

/**
 * Compile le DSL :
 *   `I [am|'m] [a|] student`   → alternatives entre crochets, branche vide = optionnel
 *   `answer one || answer two` → plusieurs réponses complètes
 * Les groupes peuvent être imbriqués : `[the [big|] house|it]`.
 */
export function compileAnswers(dsl: string): AnswerGraph {
  const alternatives = dsl.split("||").map((s) => s.trim()).filter(Boolean);
  if (alternatives.length === 0) throw new Error("Réponse vide");
  const root: Segment = { kind: "group", options: alternatives.map(parseSequence) };

  const vertices: Edge[][] = [];
  const newVertex = () => {
    vertices.push([]);
    return vertices.length - 1;
  };
  const start = newVertex();

  // Construit le segment à partir de `from` et renvoie le sommet d'arrivée.
  // Le sommet d'arrivée d'un groupe est créé après toutes ses branches, ce qui
  // garantit l'ordre topologique des numéros.
  const build = (seg: Segment, from: number): number => {
    if (seg.kind === "word") {
      const to = newVertex();
      vertices[from].push({ to, word: seg.word });
      return to;
    }
    const ends = seg.options.map((seq) => {
      let cur = from;
      for (const s of seq) cur = build(s, cur);
      return cur;
    });
    const join = newVertex();
    for (const e of ends) vertices[e].push({ to: join, word: "" });
    return join;
  };

  const end = build(root, start);
  return { vertices, start, end };
}

function parseSequence(src: string): Segment[] {
  let i = 0;
  const parseSeq = (stopChars: string): Segment[] => {
    const out: Segment[] = [];
    let buf = "";
    const flush = () => {
      for (const w of tokenize(buf)) out.push({ kind: "word", word: w });
      buf = "";
    };
    while (i < src.length) {
      const c = src[i];
      if (stopChars.includes(c)) break;
      if (c === "[") {
        flush();
        i++;
        const options: Segment[][] = [];
        for (;;) {
          options.push(parseSeq("|]"));
          if (i >= src.length) throw new Error(`Crochet non fermé dans « ${src} »`);
          if (src[i] === "]") {
            i++;
            break;
          }
          i++; // '|'
        }
        out.push({ kind: "group", options });
        continue;
      }
      if (c === "]" || c === "|") throw new Error(`Caractère inattendu « ${c} » dans « ${src} »`);
      buf += c;
      i++;
    }
    flush();
    return out;
  };
  const seq = parseSeq("");
  if (i < src.length) throw new Error(`Syntaxe invalide dans « ${src} »`);
  return seq;
}

/** Énumère (au plus `limit`) les phrases acceptées — utile pour les tests et la banque de mots. */
export function enumerateAnswers(graph: AnswerGraph, limit = 50): string[] {
  const out: string[] = [];
  const walk = (v: number, words: string[]) => {
    if (out.length >= limit) return;
    if (v === graph.end) {
      out.push(words.join(" "));
      return;
    }
    for (const e of graph.vertices[v]) walk(e.to, e.word ? [...words, e.word] : words);
  };
  walk(graph.start, []);
  return out;
}
