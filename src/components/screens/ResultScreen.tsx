export default function ResultScreen({ onRestart }: { onRestart: () => void }) {
  return (
    <div>
      <h2>ResultScreen</h2>
      <button onClick={onRestart}>Restart</button>
    </div>
  );
}