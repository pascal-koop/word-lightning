import PlayerSetup from "../PlayerSetup";
import type { Player } from "../../game/initialState";
import type { SelectionSummary } from "../../game/playSelection.ts";

type SetupScreenProps = {
  onStart: () => void;
  onGoToSelectQuestions: () => void;
  selectionSummary: SelectionSummary;
  players: Player[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (id: string) => void;
};

export default function SetupScreen({
  onStart,
  onGoToSelectQuestions,
  selectionSummary,
  players,
  onAddPlayer,
  onRemovePlayer,
}: SetupScreenProps) {
  const hasPlayers = players.length > 0;
  const hasActiveQuestions = selectionSummary.count > 0;
  const isStartDisabled = !hasPlayers || !hasActiveQuestions;

  const startHint = (() => {
    if (!hasActiveQuestions && !hasPlayers) {
      return "Add a player and select questions.";
    }
    if (!hasActiveQuestions) {
      return "Select a theme or individual questions.";
    }
    if (!hasPlayers) {
      return "Add at least one player to start.";
    }
    return null;
  })();

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur">
        <div className="mb-5 text-center">
          <h2 className="mt-2 text-3xl font-black text-slate-900">
            Ready to play?
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Add players, pick your prompts, then hit start.
          </p>
        </div>

        <div className="mb-5">
          <PlayerSetup
            players={players}
            onAddPlayer={onAddPlayer}
            onRemovePlayer={onRemovePlayer}
          />
        </div>

        <section
          aria-labelledby="questions-setup-heading"
          className="mb-5 px-4 py-3"
        >
          <div className="flex items-center justify-between">
            <h3
              id="questions-setup-heading"
              className="text-base font-semibold text-slate-700"
            >
              Questions
            </h3>
            <span
              aria-live="polite"
              className="text-xs font-semibold text-indigo-700"
            >
              {selectionSummary.count} active
            </span>
          </div>

          <p className="mt-2 text-sm text-indigo-800">
            {selectionSummary.title}
          </p>

          <button
            type="button"
            onClick={onGoToSelectQuestions}
            className="mt-3 w-full bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            {hasActiveQuestions ? "Change selection" : "Select questions"}
          </button>
        </section>

        <button
          className="w-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onStart}
          disabled={isStartDisabled}
        >
          ▶ Start game
        </button>
        {startHint && (
          <p role="status" className="mt-2 text-center text-xs text-slate-500">
            {startHint}
          </p>
        )}
      </div>
    </div>
  );
}
