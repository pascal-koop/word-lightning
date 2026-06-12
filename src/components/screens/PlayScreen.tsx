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
  onSwipe: () => void;
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

      {pendingScore && (
        <ScorePrompt players={players} onAwardPoint={handleAwardPoint} />
      )}
    </div>
  );
}
