import { describe, expect, it } from "vitest";
import reducer from "./reducer";
import { initialState, type GameState, type Player } from "./initialState";

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

// A tiny helper so tests don't repeat the player/score boilerplate.
// We pass plain ids so assertions are easier to write – the reducer
// doesn't care whether ids come from crypto.randomUUID or a string.
function makePlayer(id: string, name: string, score = 0): Player {
  return { id, name, score };
}

const aliceAndBob: Player[] = [
  makePlayer("p-alice", "Alice"),
  makePlayer("p-bob", "Bob"),
];

const setupStateWithPlayers: GameState = {
  ...initialState,
  players: aliceAndBob,
};

describe("reducer", () => {
  describe("START_GAME", () => {
    it("transitions from setup to playing when questions and players are available", () => {
      const nextState = reducer(setupStateWithPlayers, {
        type: "START_GAME",
        payload: sampleQuestions,
      });

      expect(nextState.phase).toBe("playing");
      expect(nextState.pairs).not.toBeNull();
    });

    it("produces a pair where the question comes from the payload and the letter is an uppercase A-Z character", () => {
      const nextState = reducer(setupStateWithPlayers, {
        type: "START_GAME",
        payload: sampleQuestions,
      });

      const pair = nextState.pairs;
      if (!pair) throw new Error("Expected pairs to be populated");

      expect(sampleQuestions).toContain(pair.question);
      expect(pair.letter).toMatch(/^[A-Z]$/);
    });

    it("resets every player's score to 0 so the same line-up can play another round", () => {
      const stateWithOldScores: GameState = {
        ...setupStateWithPlayers,
        phase: "result",
        players: [
          makePlayer("p-alice", "Alice", 5),
          makePlayer("p-bob", "Bob", 3),
        ],
      };

      const nextState = reducer(stateWithOldScores, {
        type: "START_GAME",
        payload: sampleQuestions,
      });

      expect(nextState.players.map((p) => p.score)).toEqual([0, 0]);
    });

    it("returns the same state reference when the payload is empty", () => {
      const nextState = reducer(setupStateWithPlayers, {
        type: "START_GAME",
        payload: [],
      });

      expect(nextState).toBe(setupStateWithPlayers);
    });

    it("returns the same state reference when no players have been added yet", () => {
      // initialState has no players, so the round cannot start.
      const nextState = reducer(initialState, {
        type: "START_GAME",
        payload: sampleQuestions,
      });

      expect(nextState).toBe(initialState);
    });
  });

  describe("END_GAME", () => {
    const playingState: GameState = {
      phase: "playing",
      pairs: { letter: "A", question: "Is blue" },
      history: [],
      players: aliceAndBob,
      pendingScore: true,
    };

    it("moves to the result phase", () => {
      const nextState = reducer(playingState, { type: "END_GAME" });

      expect(nextState.phase).toBe("result");
    });

    it("keeps the existing pairs unchanged", () => {
      const nextState = reducer(playingState, { type: "END_GAME" });

      expect(nextState.pairs).toEqual(playingState.pairs);
    });

    it("clears pendingScore so a leftover score prompt doesn't leak into the result screen", () => {
      const nextState = reducer(playingState, { type: "END_GAME" });

      expect(nextState.pendingScore).toBe(false);
    });
  });

  describe("NEXT_PAIR", () => {
    const playingState: GameState = {
      phase: "playing",
      pairs: { letter: "A", question: "Is blue" },
      history: [],
      players: aliceAndBob,
      pendingScore: false,
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
      const nextState = reducer(initialState, { type: "GO_TO_ADD_QUESTION" });

      expect(nextState.history).toEqual(["setup"]);
    });
  });

  describe("GO_BACK", () => {
    it("restores the previous phase from history and pops it off", () => {
      const stateOnAddQuestion: GameState = {
        ...initialState,
        phase: "add-question",
        history: ["setup"],
      };

      const nextState = reducer(stateOnAddQuestion, { type: "GO_BACK" });

      expect(nextState.phase).toBe("setup");
      expect(nextState.history).toEqual([]);
    });

    it("returns the same state reference when history is empty (nothing to go back to)", () => {
      const nextState = reducer(initialState, { type: "GO_BACK" });

      expect(nextState).toBe(initialState);
    });
  });

  describe("ADD_PLAYER", () => {
    it("appends a player with a trimmed name, a generated id and a score of 0", () => {
      const nextState = reducer(initialState, {
        type: "ADD_PLAYER",
        payload: "  Alice  ",
      });

      expect(nextState.players).toHaveLength(1);
      const [player] = nextState.players;
      expect(player.name).toBe("Alice");
      expect(player.score).toBe(0);
      expect(player.id).toMatch(/.+/);
    });

    it("rejects a name that is empty after trimming", () => {
      const nextState = reducer(initialState, {
        type: "ADD_PLAYER",
        payload: "   ",
      });

      expect(nextState).toBe(initialState);
    });

    it("rejects a name that already exists (case-insensitive)", () => {
      const stateWithAlice: GameState = {
        ...initialState,
        players: [makePlayer("p-alice", "Alice")],
      };

      const nextState = reducer(stateWithAlice, {
        type: "ADD_PLAYER",
        payload: "alice",
      });

      expect(nextState).toBe(stateWithAlice);
    });
  });

  describe("REMOVE_PLAYER", () => {
    it("removes the player with the matching id", () => {
      const stateWithTwo: GameState = {
        ...initialState,
        players: aliceAndBob,
      };

      const nextState = reducer(stateWithTwo, {
        type: "REMOVE_PLAYER",
        payload: "p-alice",
      });

      expect(nextState.players.map((p) => p.id)).toEqual(["p-bob"]);
    });

    it("returns the same state reference when the id does not match any player", () => {
      const stateWithTwo: GameState = {
        ...initialState,
        players: aliceAndBob,
      };

      const nextState = reducer(stateWithTwo, {
        type: "REMOVE_PLAYER",
        payload: "p-does-not-exist",
      });

      expect(nextState).toBe(stateWithTwo);
    });
  });

  describe("scoring (SWIPE_AWAITING_SCORE + AWARD_POINT)", () => {
    const playingState: GameState = {
      phase: "playing",
      pairs: { letter: "A", question: "Is blue" },
      history: [],
      players: aliceAndBob,
      pendingScore: false,
    };

    it("SWIPE_AWAITING_SCORE flips pendingScore to true", () => {
      const nextState = reducer(playingState, { type: "SWIPE_AWAITING_SCORE" });

      expect(nextState.pendingScore).toBe(true);
    });

    it("SWIPE_AWAITING_SCORE returns the same reference when already pending", () => {
      const alreadyPending: GameState = { ...playingState, pendingScore: true };

      const nextState = reducer(alreadyPending, { type: "SWIPE_AWAITING_SCORE" });

      expect(nextState).toBe(alreadyPending);
    });

    it("AWARD_POINT only credits the targeted player and clears pendingScore", () => {
      const pending: GameState = { ...playingState, pendingScore: true };

      const nextState = reducer(pending, {
        type: "AWARD_POINT",
        payload: "p-alice",
      });

      expect(nextState.pendingScore).toBe(false);
      expect(nextState.players).toEqual([
        makePlayer("p-alice", "Alice", 1),
        makePlayer("p-bob", "Bob", 0),
      ]);
    });

    it("AWARD_POINT returns the same reference when no score is pending (guard rail)", () => {
      // playingState has pendingScore === false – a stray AWARD_POINT
      // must not silently increase the score outside the score prompt.
      const nextState = reducer(playingState, {
        type: "AWARD_POINT",
        payload: "p-alice",
      });

      expect(nextState).toBe(playingState);
    });

    it("AWARD_POINT returns the same reference when the player id is unknown", () => {
      const pending: GameState = { ...playingState, pendingScore: true };

      const nextState = reducer(pending, {
        type: "AWARD_POINT",
        payload: "p-not-in-the-game",
      });

      expect(nextState).toBe(pending);
    });
  });

  describe("unknown actions", () => {
    it("returns the same state reference for an unrecognised action type", () => {
      const nextState = reducer(initialState, {
        type: "UNKNOWN_ACTION",
      } as unknown as Parameters<typeof reducer>[1]);

      expect(nextState).toBe(initialState);
    });
  });

  describe("immutability", () => {
    it("does not mutate the incoming state object", () => {
      const startingState: GameState = {
        ...initialState,
        players: [makePlayer("p-alice", "Alice")],
      };
      const snapshot: GameState = {
        ...startingState,
        players: [...startingState.players],
      };

      reducer(startingState, {
        type: "START_GAME",
        payload: sampleQuestions,
      });

      expect(startingState).toEqual(snapshot);
    });
  });
});
