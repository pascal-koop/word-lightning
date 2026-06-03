import type { Player } from "./initialState";

// We cap player names at 24 characters so the scoreboard layout stays
// readable on small screens. The minimum of 1 character just guards
// against accidental empty submissions.
export const PLAYER_NAME_MIN_LENGTH = 1;
export const PLAYER_NAME_MAX_LENGTH = 24;

// Trim leading/trailing whitespace and collapse internal whitespace runs
// into a single space. This is purely a UX helper so "  Alice   " and
// "Alice" are treated as the same name in the duplicate check.
export function normalizePlayerName(rawName: string): string {
  return rawName.trim().replace(/\s+/g, " ");
}

export type PlayerNameValidation =
  | { ok: true; name: string }
  | { ok: false; reason: "empty" | "too-long" | "duplicate" };

export function validatePlayerName(
  rawName: string,
  existingPlayers: Player[],
): PlayerNameValidation {
  const name = normalizePlayerName(rawName);

  if (name.length < PLAYER_NAME_MIN_LENGTH) {
    return { ok: false, reason: "empty" };
  }
  if (name.length > PLAYER_NAME_MAX_LENGTH) {
    return { ok: false, reason: "too-long" };
  }

  // Case-insensitive duplicate check (the same approach
  // `questionValidation.ts` uses), so "alice" and "Alice" don't both
  // end up in the line-up. Accents are still treated as different –
  // "Anna" and "Änna" can co-exist.
  const normalizedCandidate = name.toLocaleLowerCase();
  const isDuplicate = existingPlayers.some(
    (player) => player.name.toLocaleLowerCase() === normalizedCandidate,
  );
  if (isDuplicate) {
    return { ok: false, reason: "duplicate" };
  }

  return { ok: true, name };
}

// We generate a short random id at insertion time. crypto.randomUUID is
// available in every modern browser (and in the iOS/Android WebViews we
// ship through Capacitor), so we don't need a third-party uuid package.
// In the rare case it is missing (older devices, jsdom in tests), we
// fall back to a deterministic-but-unique counter-based id.
let fallbackCounter = 0;
export function createPlayerId(): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }
  fallbackCounter += 1;
  return `player-${Date.now()}-${fallbackCounter}`;
}

// Reset every player's score to 0 without losing their identity, so
// the same line-up can play multiple rounds in a row.
export function resetScores(players: Player[]): Player[] {
  return players.map((player) => ({ ...player, score: 0 }));
}

// Returns the players sorted by score (descending). Array.prototype.sort
// is stable in modern JavaScript engines, so players with the same
// score keep their original (insertion) order. We use a copy of the
// input so the reducer's state is never mutated.
export function rankPlayers(players: Player[]): Player[] {
  return [...players].sort((a, b) => b.score - a.score);
}
