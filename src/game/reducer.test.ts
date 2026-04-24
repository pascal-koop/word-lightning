import { describe, expect, it } from "vitest";
import reducer from "./reducer";
import { initialState, type GameState } from "./initialState";

/**
 * A pure reducer is the easiest piece of a React app to test:
 *   - No React, no DOM, no async, no side effects.
 *   - Given the same input (state + action), it must return the same output.
 *
 * Every test below follows the same Arrange / Act / Assert structure:
 *   1. Build an input state and an action.
 *   2. Call the reducer once.
 *   3. Assert something about the returned state.
 */

const sampleQuestions = ["Is blue", "Is in the kitchen", "Is round"];

describe("reducer", () => {
  describe("START_GAME", () => {
    it("transitions from setup to playing when questions are available", () => {
      const nextState = reducer(initialState, {
        type: "START_GAME",
        payload: sampleQuestions,
      });

      expect(nextState.phase).toBe("playing");
      expect(nextState.pairs).not.toBeNull();
    });

    it("produces a pair where the question comes from the payload and the letter is an uppercase A-Z character", () => {
      const nextState = reducer(initialState, {
        type: "START_GAME",
        payload: sampleQuestions,
      });

      const pair = nextState.pairs;
      if (!pair) throw new Error("Expected pairs to be populated");

      expect(sampleQuestions).toContain(pair.question);
      expect(pair.letter).toMatch(/^[A-Z]$/);
    });

    it("returns the exact same state reference when the payload is empty", () => {
      const nextState = reducer(initialState, {
        type: "START_GAME",
        payload: [],
      });

      expect(nextState).toBe(initialState);
    });
  });

  describe("END_GAME", () => {
    const playingState: GameState = {
      phase: "playing",
      pairs: { letter: "A", question: "Is blue" },
    };

    it("moves to the result phase", () => {
      const nextState = reducer(playingState, { type: "END_GAME" });

      expect(nextState.phase).toBe("result");
    });

    it("keeps the existing pairs unchanged", () => {
      const nextState = reducer(playingState, { type: "END_GAME" });

      expect(nextState.pairs).toEqual(playingState.pairs);
    });
  });

  describe("NEXT_PAIR", () => {
    const playingState: GameState = {
      phase: "playing",
      pairs: { letter: "A", question: "Is blue" },
    };

    it("generates a new pair and keeps the phase on playing", () => {
      const nextState = reducer(playingState, {
        type: "NEXT_PAIR",
        payload: sampleQuestions,
      });

      expect(nextState.phase).toBe("playing");

      const pair = nextState.pairs;
      if (!pair) throw new Error("Expected pairs to be populated");

      expect(sampleQuestions).toContain(pair.question);
      expect(pair.letter).toMatch(/^[A-Z]$/);
    });

    it("returns the exact same state reference when the payload is empty", () => {
      const nextState = reducer(playingState, {
        type: "NEXT_PAIR",
        payload: [],
      });

      expect(nextState).toBe(playingState);
    });
  });

  describe("navigation actions", () => {
    it.each([
      ["GO_TO_ADD_QUESTION", "add-question"],
      ["GO_TO_CUSTOM_QUESTION", "custom-question"],
      ["GO_TO_SETUP", "setup"],
    ] as const)("%s sets the phase to %s", (actionType, expectedPhase) => {
      const nextState = reducer(initialState, { type: actionType });

      expect(nextState.phase).toBe(expectedPhase);
    });
  });

  describe("immutability", () => {
    it("does not mutate the incoming state object", () => {
      const startingState: GameState = { phase: "setup", pairs: null };
      const snapshot: GameState = { ...startingState };

      reducer(startingState, {
        type: "START_GAME",
        payload: sampleQuestions,
      });

      expect(startingState).toEqual(snapshot);
    });
  });
});
