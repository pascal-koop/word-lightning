import { afterEach, describe, expect, it, vi } from "vitest";
import { createPairs } from "./logic";

describe("createPairs", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const questions = ["Is blue", "Is in the kitchen", "Is round"];

  it("returns a letter that is a single uppercase A-Z character", () => {
    const pair = createPairs(questions);

    expect(pair.letter).toMatch(/^[A-Z]$/);
  });

  it("returns a question that came from the supplied list", () => {
    const pair = createPairs(questions);

    expect(questions).toContain(pair.question);
  });

  it("returns an object with exactly the keys `letter` and `question`", () => {
    const pair = createPairs(questions);

    expect(Object.keys(pair).sort()).toEqual(["letter", "question"]);
  });

  it("works with a single-question list (edge case)", () => {
    const pair = createPairs(["Only question"]);

    expect(pair.question).toBe("Only question");
    expect(pair.letter).toMatch(/^[A-Z]$/);
  });

  it("uses Math.random as its source of randomness", () => {
    const randomSpy = vi.spyOn(Math, "random");

    createPairs([...questions]);

    expect(randomSpy).toHaveBeenCalledTimes(questions.length + 26);
  });

  it("returns valid letter/question pairs across many calls (smoke test)", () => {
    for (let i = 0; i < 100; i++) {
      const pair = createPairs([...questions]);

      expect(pair.letter).toMatch(/^[A-Z]$/);
      expect(questions).toContain(pair.question);
    }
  });
});
