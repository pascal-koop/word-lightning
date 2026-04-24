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
    <div className="flex flex-col items-center justify-center">
      <SwipeCards onSwipe={onNext} questionsCount={questionsCount} {...pair} />

      <button className="bg-red-500 text-white mt-16" onClick={onEnd}>
        End Game
      </button>
    </div>
  );
}
