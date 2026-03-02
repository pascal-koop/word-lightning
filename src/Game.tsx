import { useGame } from "./hooks/useGame.ts";
import SetupScreen from "./components/screens/SetupScreen.tsx";
import PlayScreen from "./components/screens/PlaySreen.tsx";
import ResultScreen from "./components/screens/ResultScreen.tsx";
import AddQuestionScreen from "./components/screens/AddQuestionScreen.tsx";
export default function Game() {
  const {
    state,
    startGame,
    endGame,
    nextPair,
    addQuestion,
    goToAddQuestion,
    goToSetup,
  } = useGame();

  if (state.phase === "setup") {
    return (
      <SetupScreen
        onStart={startGame}
        onGoToAddQuestion={goToAddQuestion}
        questionsCount={state.questions.length}
      />
    );
  }

  if (state.phase === "add-question") {
    return (
      <AddQuestionScreen
        onAddQuestion={addQuestion}
        onBack={goToSetup}
        questionsCount={state.questions.length}
      />
    );
  }

  if (state.phase === "playing" && state.pairs) {
    return (
      <PlayScreen
        pair={state.pairs}
        questionsCount={state.questions.length}
        onEnd={endGame}
        onNext={nextPair}
      />
    );
  }

  return <ResultScreen onRestart={startGame} />;
}
