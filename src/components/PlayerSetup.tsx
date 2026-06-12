import { useState, type FormEvent } from "react";
import type { Player } from "../game/initialState";
import { PLAYER_NAME_MAX_LENGTH, validatePlayerName } from "../game/players";

type PlayerSetupProps = {
  players: Player[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (id: string) => void;
};

function describeValidationError(
  reason: "empty" | "too-long" | "duplicate",
): string {
  switch (reason) {
    case "empty":
      return "Please type a player name first.";
    case "too-long":
      return `Names can be at most ${PLAYER_NAME_MAX_LENGTH} characters.`;
    case "duplicate":
      return "That player is already in the line-up.";
  }
}

export default function PlayerSetup({
  players,
  onAddPlayer,
  onRemovePlayer,
}: PlayerSetupProps) {
  const [name, setName] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);

  const validation = validatePlayerName(name, players);
  const shouldShowError = hasInteracted && !validation.ok && name.length > 0;
  const errorMessage =
    !validation.ok && shouldShowError
      ? describeValidationError(validation.reason)
      : null;
  const isAddDisabled = !validation.ok;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validation.ok) {
      setHasInteracted(true);
      return;
    }
    onAddPlayer(validation.name);
    setName("");
    setHasInteracted(false);
  };

  return (
    <section aria-labelledby="player-setup-heading" className="px-4 py-3">
      <h3
        id="player-setup-heading"
        className="text-base font-semibold text-slate-700"
      >
        Players
      </h3>
      <p className="mt-1 text-sm text-indigo-600">
        Add at least one player – points are credited after every swipe.
      </p>

      <form className="mt-3 flex flex-col gap-2" onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onFocus={() => setHasInteracted(true)}
            maxLength={PLAYER_NAME_MAX_LENGTH + 8}
            placeholder="Player name"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
            aria-invalid={shouldShowError}
            aria-label="New player name"
          />
          <button
            type="submit"
            disabled={isAddDisabled}
            aria-label="Add player"
            className="bg-indigo-600 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add
          </button>
        </div>
        {errorMessage && (
          <p className="text-xs font-semibold text-red-600">{errorMessage}</p>
        )}
      </form>

      {players.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-2" aria-label="Player list">
          {players.map((player) => (
            <li
              key={player.id}
              className="flex items-center justify-between rounded-xl bg-indigo-50 px-3 py-2"
            >
              <span className="font-medium text-slate-800">{player.name}</span>
              <button
                type="button"
                onClick={() => onRemovePlayer(player.id)}
                aria-label={`Remove ${player.name}`}
                className="bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-center text-xs text-slate-500">
          No players yet.
        </p>
      )}
    </section>
  );
}
