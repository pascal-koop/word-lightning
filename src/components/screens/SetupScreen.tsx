import PlayerSetup from "../PlayerSetup";
import type { Player } from "../../game/initialState";

type SetupScreenProps = {
  onStart: () => void;
  onGoToAddQuestion: () => void;
  questionsCount: number;
  onGoToCustomQuestions: () => void;
  players: Player[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (id: string) => void;
};

export default function SetupScreen({
  onStart,
  onGoToAddQuestion,
  questionsCount,
  onGoToCustomQuestions,
  players,
  onAddPlayer,
  onRemovePlayer,
}: SetupScreenProps) {
  // The Start button needs both a question source *and* at least one
  // player – otherwise we'd either show "undefined" cards or have no
  // one to attribute points to.
  const hasQuestions = questionsCount > 0;
  const hasPlayers = players.length > 0;
  const isStartDisabled = !hasQuestions || !hasPlayers;

  // A small inline helper text so users understand *why* the button is
  // disabled. UX rule: never leave a disabled control unexplained.
  const startHint = (() => {
    if (!hasQuestions && !hasPlayers) {
      return "Add at least one question and one player to start.";
    }
    if (!hasQuestions) {
      return "Add at least one question to start.";
    }
    if (!hasPlayers) {
      return "Add at least one player to start.";
    }
    return null;
  })();

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
            Game Setup
          </p>
          <h2 className="mt-2 text-3xl font-black text-slate-900">
            Ready to play?
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Add players, choose your prompts, then hit start.
          </p>
        </div>

        <div className="mb-4 flex items-center justify-between rounded-2xl bg-indigo-50 px-4 py-3">
          <span className="text-sm font-semibold text-slate-700">
            Questions loaded
          </span>
          <span className="text-2xl font-black text-indigo-700">
            {questionsCount}
          </span>
        </div>

        <div className="mb-6">
          <PlayerSetup
            players={players}
            onAddPlayer={onAddPlayer}
            onRemovePlayer={onRemovePlayer}
          />
        </div>

        <div className="flex flex-col gap-3">
          <button
            className="bg-indigo-600 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onStart}
            disabled={isStartDisabled}
          >
            Start game
          </button>
          {startHint && (
            <p
              role="status"
              className="text-center text-xs text-slate-500"
            >
              {startHint}
            </p>
          )}
          <button
            className="bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
            onClick={onGoToAddQuestion}
          >
            Add question
          </button>
          <button
            className="bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
            onClick={onGoToCustomQuestions}
          >
            go to Questions
          </button>
        </div>
      </div>
    </div>
  );
}
