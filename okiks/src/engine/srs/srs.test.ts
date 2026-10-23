import { describe, expect, it } from "vitest";
import { recall, updateMemory, weakestWords } from "./srs";

const DAY = 86_400_000;

describe("SRS", () => {
  it("le souvenir décroît avec le temps et dure plus quand le mot est solide", () => {
    const weak = updateMemory(undefined, true, 0);
    let strong = weak;
    for (let i = 0; i < 4; i++) strong = updateMemory(strong, true, 0);
    expect(recall(weak, 0)).toBe(1);
    expect(recall(weak, 3 * DAY)).toBeLessThan(recall(strong, 3 * DAY));
  });

  it("une erreur fait baisser la force", () => {
    let m = updateMemory(undefined, true, 0);
    m = updateMemory(m, true, 0);
    m = updateMemory(m, true, 0);
    expect(updateMemory(m, false, 0).strength).toBe(m.strength - 2);
  });

  it("choisit les mots les plus faibles, uniquement parmi les mots vus", () => {
    const memory = {
      a: updateMemory(undefined, true, 0),
      b: updateMemory(updateMemory(updateMemory(undefined, true, 0), true, 0), true, 0),
      c: updateMemory(undefined, false, 0),
    };
    expect(weakestWords(memory, ["a", "b", "c", "never"], 2, 2 * DAY)).toEqual(["c", "a"]);
  });
});
