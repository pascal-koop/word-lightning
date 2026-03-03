import SwipeCards from "../SwipeCards.tsx";
type Pair = { letter: string; question: string };
export default function PlayScreen({
  pair,
  questionsCount,
  onEnd,
  onNext,
}: {
  pair: Pair;
  questionsCount: number;
  onEnd: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-9">
      <SwipeCards onSwipe={onNext} questionsCount={questionsCount} {...pair} />

      <button className="bg-red-500 text-white" onClick={onEnd}>
        End Game
      </button>
    </div>
  );
}
