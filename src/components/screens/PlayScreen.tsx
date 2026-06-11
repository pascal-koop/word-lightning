import SwipeCards from "../SwipeCards.tsx";
import ScorePrompt from "../ScorePrompt.tsx";
import type { Player } from "../../game/initialState.ts";

type Pair = { letter: string; question: string };

type PlayScreenProps = {
  pair: Pair;
  questionsCount: number;
  players: Player[];
  pendingScore: boolean;
  onEnd: () => void;
  // Called when the front card is swiped far enough. The reducer
  // turns this into "pendingScore = true" so the user has to award
  // a point before they can swipe the next card.
  onSwipe: () => void;
  // Called when the user picks a player on the score prompt. It
  // credits the point and pulls in the next pair.
  onAwardPoint: (playerId: string) => void;
  onNextPair: () => void;
};

export default function PlayScreen({
  pair,
  questionsCount,
  players,
  pendingScore,
  /* onEnd, */
  onSwipe,
  onAwardPoint,
  onNextPair,
}: PlayScreenProps) {
  // Combine "award point" + "next pair" so the user only needs one tap
  // to continue. Keeping these two reducer actions separate (rather
  // than merging them into one) makes the data flow easier to test.
  const handleAwardPoint = (playerId: string) => {
    onAwardPoint(playerId);
    onNextPair();
  };

  return (
    <div
      role="region"
      aria-label="Game play area"
      className="flex flex-col items-center justify-center"
    >
      <SwipeCards
        onSwipe={onSwipe}
        questionsCount={questionsCount}
        isLocked={pendingScore}
        {...pair}
      />

      {/* <div
        // A small live scoreboard above the End-Game button so players
        // see the running totals at a glance. `aria-live="polite"`
        // tells screen readers to announce score updates.
        aria-live="polite"
        className="mt-6 flex w-full max-w-xs flex-wrap items-center justify-center gap-2"
      >
        {players.map((player) => (
          <span
            key={player.id}
            className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
          >
            {player.name}: <span className="text-indigo-700">{player.score}</span>
          </span>
        ))}
      </div>

      <button className="bg-red-500 text-white mt-10" onClick={onEnd}>
        End Game
      </button> */}

      {pendingScore && (
        <ScorePrompt players={players} onAwardPoint={handleAwardPoint} />
      )}
    </div>
  );
}
