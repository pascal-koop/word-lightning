export default function SetupScreen({ onStart }: { onStart: () => void }) {
  return (
    <div>
      <h2>SetupScreen</h2>
      <button onClick={onStart}>Start</button>
    </div>
  );
}
