import { useGame } from "./hooks/useGame.ts";
import SetupScreen from "./components/screens/SetupScreen.tsx";
import PlayScreen from "./components/screens/PlayScreen.tsx";
import ResultScreen from "./components/screens/ResultScreen.tsx";
import AddQuestionScreen from "./components/screens/AddQuestionScreen.tsx";
import CustomQuestionScreen from "./components/screens/CustomQuestionScreen.tsx";
import LoadingScreen from "./components/LoadingScreen.tsx";

export default function Game() {
  const {
    state,
    isLoading,
    customQuestions,
    questionSource,
    activeQuestionTexts,
    startGame,
    endGame,
    nextPair,
    addQuestion,
    goToAddQuestion,
    goToCustomQuestion,
    goToSetup,
    deleteQuestion,
    editQuestion,
    setQuestionSource,
  } = useGame();

  if (isLoading) {
    return <LoadingScreen />;
  }

  const customQuestionTexts = customQuestions.map((q) => q.text);

  if (state.phase === "setup") {
    return (
      <SetupScreen
        onStart={startGame}
        onGoToAddQuestion={goToAddQuestion}
        questionsCount={activeQuestionTexts.length}
        onGoToCustomQuestions={goToCustomQuestion}
      />
    );
  }

  if (state.phase === "add-question") {
    return (
      <AddQuestionScreen
        onAddQuestion={addQuestion}
        onBack={goToSetup}
        onGoToCustomQuestion={goToCustomQuestion}
        questionsCount={activeQuestionTexts.length}
        customQuestions={customQuestionTexts}
        existingQuestions={customQuestionTexts}
        questionSource={questionSource}
        onChangeQuestionSource={setQuestionSource}
      />
    );
  }

  if (state.phase === "custom-question") {
    return (
      <CustomQuestionScreen
        onGoToAddQuestion={goToAddQuestion}
        questions={customQuestionTexts}
        onDeleteQuestion={deleteQuestion}
        onEditQuestion={editQuestion}
        onAddQuestion={addQuestion}
        questionSource={questionSource}
        onChangeQuestionSource={setQuestionSource}
      />
    );
  }

  if (state.phase === "playing" && state.pairs) {
    return (
      <PlayScreen
        pair={state.pairs}
        questionsCount={activeQuestionTexts.length}
        onEnd={endGame}
        onNext={nextPair}
      />
    );
  }

  return <ResultScreen onRestart={goToSetup} />;
}
