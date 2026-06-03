import type { Player } from "../../game/initialState";
import { rankPlayers } from "../../game/players";

type ResultScreenProps = {
  players: Player[];
  onRestart: () => void;
};

export default function ResultScreen({
  players,
  onRestart,
}: ResultScreenProps) {
  // Sort by descending score (rankPlayers handles the copy + sort).
  // We compute the top score once so we can highlight every player
  // tied for first place – not just the first one in the array.
  const ranked = rankPlayers(players);
  const topScore = ranked[0]?.score ?? 0;
  const hasAnyScore = topScore > 0;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
            Round over
          </p>
          <h2 className="mt-2 text-3xl font-black text-slate-900">
            Final scores
          </h2>
          {!hasAnyScore && (
            <p className="mt-2 text-sm text-slate-600">
              No points were awarded this round.
            </p>
          )}
        </div>

        {ranked.length > 0 ? (
          <ol
            aria-label="Scoreboard"
            className="mb-6 flex flex-col gap-2"
          >
            {ranked.map((player, index) => {
              const isWinner = hasAnyScore && player.score === topScore;
              return (
                <li
                  key={player.id}
                  className={
                    isWinner
                      ? "flex items-center justify-between rounded-2xl bg-indigo-600 px-4 py-3 text-white shadow-md"
                      : "flex items-center justify-between rounded-2xl bg-indigo-50 px-4 py-3 text-slate-900"
                  }
                >
                  <span className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={
                        isWinner
                          ? "text-lg font-black"
                          : "text-sm font-semibold text-slate-500"
                      }
                    >
                      #{index + 1}
                    </span>
                    <span className="font-semibold">{player.name}</span>
                  </span>
                  <span
                    className={
                      isWinner
                        ? "text-2xl font-black"
                        : "text-xl font-bold text-indigo-700"
                    }
                  >
                    {player.score}
                  </span>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="mb-6 rounded-2xl bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
            No players were registered for this round.
          </p>
        )}

        <button
          className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
          onClick={onRestart}
        >
          Play again
        </button>
      </div>
    </div>
  );
}
