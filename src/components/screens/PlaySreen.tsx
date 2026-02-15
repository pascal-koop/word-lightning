type Pair = { letter: string; question: string };
export default function PlayScreen({ pair, onEnd, onNext }: { pair: Pair; onEnd: () => void; onNext: () => void }) {
  return (
    <div>
      <h2>Buchstabe: {pair.letter}</h2>
      <p>Frage: {pair.question}</p>
      <button onClick={onEnd}>Ende</button>
      <button onClick={onNext}>Nächste Frage</button>
    </div>
  );
}