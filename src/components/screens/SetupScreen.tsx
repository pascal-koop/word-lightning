type SetupScreenProps = {
  onStart: () => void;
  onGoToAddQuestion: () => void;
  questionsCount: number;
};

export default function SetupScreen({
  onStart,
  onGoToAddQuestion,
  questionsCount,
}: SetupScreenProps) {
  return (
    <div>
      <h2>SetupScreen</h2>
      <p>Questions: {questionsCount}</p>
      <button onClick={onGoToAddQuestion}>Add question</button>
      <button onClick={onStart}>Start</button>
    </div>
  );
}
