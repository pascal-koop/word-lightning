import { useGame } from "./hooks/useGame.ts";
import SetupScreen from "./components/screens/SetupScreen.tsx";
import PlayScreen from "./components/screens/PlayScreen.tsx";
import ResultScreen from "./components/screens/ResultScreen.tsx";
import CustomQuestionScreen from "./components/screens/CustomQuestionScreen.tsx";
import LoadingScreen from "./components/LoadingScreen.tsx";

export default function Game() {
  const {
    state,
    isLoading,
    defaultQuestions,
    customQuestions,
    questionSource,
    activeQuestionTexts,
    startGame,
    endGame,
    nextPair,
    addQuestion,
    goToCustomQuestion,
    goToSetup,
    deleteQuestion,
    editQuestion,
    setQuestionSource,
    manageQuestionSource,
    setManageQuestionSource,
    goBack,
    addPlayer,
    removePlayer,
    onSwipe,
    awardPoint,
  } = useGame();

  if (isLoading) {
    return <LoadingScreen />;
  }

  const customQuestionTexts = customQuestions.map((q) => q.text);
  const defaultQuestionTexts = defaultQuestions.map((q) => q.text);

  if (state.phase === "setup") {
    return (
      <SetupScreen
        onStart={startGame}
        onGoToCustomQuestions={goToCustomQuestion}
        defaultQuestions={defaultQuestionTexts}
        customQuestions={customQuestionTexts}
        questionSource={questionSource}
        onChangeQuestionSource={setQuestionSource}
        onAddQuestion={addQuestion}
        players={state.players}
        onAddPlayer={addPlayer}
        onRemovePlayer={removePlayer}
      />
    );
  }

  if (state.phase === "custom-question") {
    return (
      <CustomQuestionScreen
        onBack={goBack}
        defaultQuestions={defaultQuestionTexts}
        customQuestions={customQuestionTexts}
        onDeleteQuestion={deleteQuestion}
        onEditQuestion={editQuestion}
        onAddQuestion={addQuestion}
        questionSource={manageQuestionSource}
        onChangeQuestionSource={setManageQuestionSource}
      />
    );
  }

  if (state.phase === "playing" && state.pairs) {
    return (
      <PlayScreen
        pair={state.pairs}
        questionsCount={activeQuestionTexts.length}
        players={state.players}
        pendingScore={state.pendingScore}
        onEnd={endGame}
        onSwipe={onSwipe}
        onAwardPoint={awardPoint}
        onNextPair={nextPair}
      />
    );
  }

  return <ResultScreen players={state.players} onRestart={goToSetup} />;
}
