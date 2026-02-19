import SwipeCards from "../SwipeCards.tsx";
type Pair = { letter: string; question: string };
export default function PlayScreen({
  pair,
  onEnd,
  onNext,
}: {
  pair: Pair;
  onEnd: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <SwipeCards onSwipe={onNext} />
      <h2>Buchstabe: {pair.letter}</h2>
      <p>Frage: {pair.question}</p>
      <button onClick={onEnd}>Ende</button>
      {/* <button onClick={onNext}>Nächste Frage</button> */}
    </div>
  );
}
