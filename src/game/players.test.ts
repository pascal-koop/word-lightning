import { describe, expect, it } from "vitest";
import {
  createPlayerId,
  normalizePlayerName,
  PLAYER_NAME_MAX_LENGTH,
  rankPlayers,
  resetScores,
  validatePlayerName,
} from "./players";
import type { Player } from "./initialState";

/**
 * `src/game/players.ts` is a small, pure utility module. We test it
 * directly (in addition to going through the reducer) because that
 * keeps the failure messages tight – when something breaks, you find
 * out *which* helper is misbehaving without having to mentally peel
 * back the reducer's switch statement.
 */

function makePlayer(id: string, name: string, score = 0): Player {
  return { id, name, score };
}

describe("normalizePlayerName", () => {
  it("trims leading and trailing whitespace", () => {
    expect(normalizePlayerName("   Alice   ")).toBe("Alice");
  });

  it("collapses internal whitespace runs into a single space", () => {
    expect(normalizePlayerName("Alice    von    Wonderland")).toBe(
      "Alice von Wonderland",
    );
  });

  it("returns an empty string when given only whitespace", () => {
    expect(normalizePlayerName("   \t\n   ")).toBe("");
  });
});

describe("validatePlayerName", () => {
  it("accepts a normal name and reports the trimmed form", () => {
    const result = validatePlayerName("  Alice  ", []);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.name).toBe("Alice");
    }
  });

  it("rejects an empty name with reason 'empty'", () => {
    const result = validatePlayerName("   ", []);

    expect(result).toEqual({ ok: false, reason: "empty" });
  });

  it("rejects a name that exceeds the maximum length", () => {
    const tooLong = "a".repeat(PLAYER_NAME_MAX_LENGTH + 1);

    const result = validatePlayerName(tooLong, []);

    expect(result).toEqual({ ok: false, reason: "too-long" });
  });

  it("rejects a duplicate name regardless of letter case", () => {
    const existing = [makePlayer("p-alice", "Alice")];

    const result = validatePlayerName("alice", existing);

    expect(result).toEqual({ ok: false, reason: "duplicate" });
  });

  it("treats accented variants as different names", () => {
    // The product decision is: "Anna" and "Änna" are *different*
    // people; only letter case is ignored. This test pins that down
    // so a future refactor of the comparison logic can't silently
    // change the meaning.
    const existing = [makePlayer("p-anna", "Anna")];

    const result = validatePlayerName("Änna", existing);

    expect(result.ok).toBe(true);
  });
});

describe("createPlayerId", () => {
  it("returns a non-empty string", () => {
    const id = createPlayerId();

    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("returns unique values across calls", () => {
    // Even with the fallback path (counter-based), consecutive calls
    // must never produce the same id, or the player list would lose
    // its primary key invariant.
    const ids = new Set([createPlayerId(), createPlayerId(), createPlayerId()]);

    expect(ids.size).toBe(3);
  });
});

describe("resetScores", () => {
  it("sets every player's score to 0 while preserving identity", () => {
    const players: Player[] = [
      makePlayer("p-alice", "Alice", 5),
      makePlayer("p-bob", "Bob", 2),
    ];

    const reset = resetScores(players);

    expect(reset).toEqual([
      makePlayer("p-alice", "Alice", 0),
      makePlayer("p-bob", "Bob", 0),
    ]);
  });

  it("does not mutate the original array", () => {
    const players: Player[] = [makePlayer("p-alice", "Alice", 5)];
    const snapshot = JSON.parse(JSON.stringify(players));

    resetScores(players);

    expect(players).toEqual(snapshot);
  });
});

describe("rankPlayers", () => {
  it("sorts by descending score", () => {
    const players: Player[] = [
      makePlayer("p-alice", "Alice", 1),
      makePlayer("p-bob", "Bob", 4),
      makePlayer("p-carol", "Carol", 2),
    ];

    const ranked = rankPlayers(players);

    expect(ranked.map((p) => p.name)).toEqual(["Bob", "Carol", "Alice"]);
  });

  it("keeps the original insertion order for tied scores (stable sort)", () => {
    const players: Player[] = [
      makePlayer("p-alice", "Alice", 3),
      makePlayer("p-bob", "Bob", 3),
      makePlayer("p-carol", "Carol", 3),
    ];

    const ranked = rankPlayers(players);

    expect(ranked.map((p) => p.name)).toEqual(["Alice", "Bob", "Carol"]);
  });

  it("does not mutate the input array", () => {
    const players: Player[] = [
      makePlayer("p-alice", "Alice", 1),
      makePlayer("p-bob", "Bob", 4),
    ];
    const snapshot = JSON.parse(JSON.stringify(players));

    rankPlayers(players);

    expect(players).toEqual(snapshot);
  });
});
