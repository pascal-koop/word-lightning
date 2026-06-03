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
      history: [],
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
      history: [],
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

    it("pushes the previous phase onto the history when navigating", () => {
      // Coming from "setup" and going to "add-question" must record
      // "setup" in the history so a subsequent GO_BACK can return there.
      const nextState = reducer(initialState, { type: "GO_TO_ADD_QUESTION" });

      expect(nextState.history).toEqual(["setup"]);
    });
  });

  describe("GO_BACK", () => {
    it("restores the previous phase from history and pops it off", () => {
      // The state acts as if the user navigated setup -> add-question.
      const stateOnAddQuestion: GameState = {
        phase: "add-question",
        pairs: null,
        history: ["setup"],
      };

      const nextState = reducer(stateOnAddQuestion, { type: "GO_BACK" });

      expect(nextState.phase).toBe("setup");
      expect(nextState.history).toEqual([]);
    });

    it("returns the same state reference when history is empty (nothing to go back to)", () => {
      // Guard rail: the reducer must not crash when called with an empty
      // history. Returning the same reference also lets React's
      // bail-out skip a re-render.
      const nextState = reducer(initialState, { type: "GO_BACK" });

      expect(nextState).toBe(initialState);
    });
  });

  describe("unknown actions", () => {
    it("returns the same state reference for an unrecognised action type", () => {
      // We cast through `unknown` because TypeScript would otherwise
      // refuse to pass an action that isn't part of the union — which
      // is exactly the protection we want at compile time. At runtime
      // the reducer must still be defensive and fall through to the
      // `default` branch, which is what this test pins down.
      const nextState = reducer(initialState, {
        type: "UNKNOWN_ACTION",
      } as unknown as Parameters<typeof reducer>[1]);

      expect(nextState).toBe(initialState);
    });
  });

  describe("immutability", () => {
    it("does not mutate the incoming state object", () => {
      const startingState: GameState = {
        phase: "setup",
        pairs: null,
        history: [],
      };
      const snapshot: GameState = { ...startingState };

      reducer(startingState, {
        type: "START_GAME",
        payload: sampleQuestions,
      });

      expect(startingState).toEqual(snapshot);
    });
  });
});
