import type { Player } from "./initialState";

export const PLAYER_NAME_MIN_LENGTH = 1;
export const PLAYER_NAME_MAX_LENGTH = 24;

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

  const normalizedCandidate = name.toLocaleLowerCase();
  const isDuplicate = existingPlayers.some(
    (player) => player.name.toLocaleLowerCase() === normalizedCandidate,
  );
  if (isDuplicate) {
    return { ok: false, reason: "duplicate" };
  }

  return { ok: true, name };
}

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

export function resetScores(players: Player[]): Player[] {
  return players.map((player) => ({ ...player, score: 0 }));
}

export function rankPlayers(players: Player[]): Player[] {
  return [...players].sort((a, b) => b.score - a.score);
}
