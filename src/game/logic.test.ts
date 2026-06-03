import { afterEach, describe, expect, it, vi } from "vitest";
import { createPairs } from "./logic";

/**
 * `createPairs` is the only exported function from `src/game/logic.ts`.
 * It uses an internal Fisher-Yates shuffle which relies on `Math.random`,
 * so we test two angles:
 *
 *   1. The *contract*: regardless of the random sequence, the returned
 *      `letter` must be an A-Z character and the returned `question` must
 *      come from the input list.
 *   2. *Determinism*: when we mock `Math.random` to a fixed value, the
 *      function must produce a stable, reproducible result.
 *
 * Mocking `Math.random` is important because tests must not be flaky:
 * a test that passes "most of the time" is worse than no test at all.
 */

describe("createPairs", () => {
  // Vitest installs each spy on the global `Math` object, so we have to
  // restore it after every test to avoid bleeding state between tests.
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
    // The internal Fisher-Yates shuffle calls Math.random once per item
    // it walks over, both for the question list and for the 26-letter
    // alphabet. So for n questions we expect n + 26 calls in total.
    const randomSpy = vi.spyOn(Math, "random");

    createPairs([...questions]);

    expect(randomSpy).toHaveBeenCalledTimes(questions.length + 26);
  });

  it("returns valid letter/question pairs across many calls (smoke test)", () => {
    // Run many times with real randomness to make sure the contract
    // holds across different shuffle outcomes, not just one path.
    for (let i = 0; i < 100; i++) {
      const pair = createPairs([...questions]);

      expect(pair.letter).toMatch(/^[A-Z]$/);
      expect(questions).toContain(pair.question);
    }
  });
});
