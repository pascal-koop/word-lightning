import type { Player } from "../game/initialState";

type ScorePromptProps = {
  players: Player[];
  // We don't actually need the *current* score for the click handler,
  // but rendering it next to each name gives players continuous feed-
  // back about who's leading. That's important because the prompt
  // appears after every swipe.
  onAwardPoint: (playerId: string) => void;
};

export default function ScorePrompt({
  players,
  onAwardPoint,
}: ScorePromptProps) {
  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="score-prompt-heading"
      // The overlay sits on top of the play area; fixed positioning
      // makes sure it covers the full viewport on mobile, where the
      // swipe stack can be scrolled out of view otherwise.
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-3xl border border-white/60 bg-white p-6 shadow-2xl">
        <h2
          id="score-prompt-heading"
          className="text-center text-xl font-black text-slate-900"
        >
          Who got the point?
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Tap a player to award them one point and continue.
        </p>

        <ul aria-label="Players" className="mt-4 flex flex-col gap-2">
          {players.map((player) => (
            <li key={player.id}>
              <button
                type="button"
                onClick={() => onAwardPoint(player.id)}
                aria-label={`Award one point to ${player.name}`}
                className="flex w-full items-center justify-between bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <span className="font-semibold">{player.name}</span>
                <span
                  aria-hidden="true"
                  className="rounded-full bg-white/20 px-3 py-1 text-sm"
                >
                  {player.score}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
