import { describe, expect, it } from "vitest";
import { compileAnswers, enumerateAnswers, gradeEnglish, gradeTiles, editDistance } from "./index";

describe("compileAnswers", () => {
  it("énumère alternatives et parties optionnelles", () => {
    const g = compileAnswers("[I am|I'm] [a|] student");
    expect(enumerateAnswers(g).sort()).toEqual(["i am a student", "i am student", "i'm a student", "i'm student"].sort());
  });

  it("gère plusieurs réponses complètes et les groupes imbriqués", () => {
    const g = compileAnswers("the [big [red|] house|car] || it");
    expect(enumerateAnswers(g).sort()).toEqual(["it", "the big house", "the big red house", "the car"].sort());
  });

  it("garde un ordre topologique des sommets", () => {
    const g = compileAnswers("a [b [c|d]|e] f || g");
    g.vertices.forEach((edges, v) => edges.forEach((e) => expect(e.to).toBeGreaterThan(v)));
  });

  it("refuse une syntaxe invalide", () => {
    expect(() => compileAnswers("I [am")).toThrow();
    expect(() => compileAnswers("I am]")).toThrow();
  });
});

describe("gradeEnglish", () => {
  const dsl = "[I am|I'm] [a|] student";

  it("accepte toutes les variantes, sans tenir compte de la casse ni de la ponctuation", () => {
    expect(gradeEnglish(dsl, "I am a student.").verdict).toBe("correct");
    expect(gradeEnglish(dsl, "i’m a STUDENT!").verdict).toBe("correct");
    expect(gradeEnglish(dsl, "I am student").verdict).toBe("correct");
  });

  it("signale une faute de frappe sans la compter fausse", () => {
    const r = gradeEnglish(dsl, "I am a studnet");
    expect(r.verdict).toBe("typo");
    expect(r.ops.find((o) => o.kind === "typo")).toMatchObject({ expected: "student", got: "studnet" });
    expect(r.closest).toBe("i am a student");
  });

  it("refuse les mots courts mal écrits (pas de tolérance sous 4 lettres)", () => {
    expect(gradeEnglish("I am happy", "I an happy").verdict).toBe("wrong");
  });

  it("détecte un mauvais mot, un mot manquant, un mot en trop", () => {
    expect(gradeEnglish(dsl, "I am a teacher").ops.some((o) => o.kind === "wrong_word")).toBe(true);
    expect(gradeEnglish("she is my sister", "she is sister").ops.some((o) => o.kind === "missing_word")).toBe(true);
    expect(gradeEnglish("she is my sister", "she is my big sister").ops.some((o) => o.kind === "extra_word")).toBe(true);
    expect(gradeEnglish("she is my sister", "she is sister").verdict).toBe("wrong");
  });

  it("tolère un espace manquant ou en trop", () => {
    expect(gradeEnglish("thank you", "thankyou").verdict).toBe("typo");
    expect(gradeEnglish("everyone is here", "every one is here").verdict).toBe("typo");
  });

  it("une réponse vide est fausse", () => {
    expect(gradeEnglish(dsl, "   ").verdict).toBe("wrong");
  });

  it("la prononciation tolère un petit mot raté", () => {
    expect(gradeEnglish("where is the train station", "where is a train station", "speech").verdict).toBe("correct");
    expect(gradeEnglish("where is the train station", "hello my friend", "speech").verdict).toBe("wrong");
  });
});

describe("gradeTiles", () => {
  it("compare les tuiles en ignorant le tachkil et la ponctuation", () => {
    expect(gradeTiles(["أنا طالب"], "أَنا طالب.").verdict).toBe("correct");
    expect(gradeTiles(["je suis étudiant"], "Je suis étudiant").verdict).toBe("correct");
    expect(gradeTiles(["je suis étudiant"], "suis je étudiant").verdict).toBe("wrong");
  });
});

describe("editDistance", () => {
  it("compte une transposition comme une seule erreur", () => {
    expect(editDistance("studnet", "student")).toBe(1);
    expect(editDistance("kitten", "sitting")).toBe(3);
  });
});
