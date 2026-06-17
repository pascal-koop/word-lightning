import { AnimatePresence, motion } from "motion/react";
import type { NavigationDirection } from "./game/initialState";
import { useGame } from "./hooks/useGame.ts";
import SetupScreen from "./components/screens/SetupScreen.tsx";
import SelectQuestionsScreen from "./components/screens/SelectQuestionsScreen.tsx";
import PlayScreen from "./components/screens/PlayScreen.tsx";
import ResultScreen from "./components/screens/ResultScreen.tsx";
import CustomQuestionScreen from "./components/screens/CustomQuestionScreen.tsx";
import LoadingScreen from "./components/LoadingScreen.tsx";

const slideVariants = {
  enter: (direction: NavigationDirection) => ({
    x: direction === "forward" ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: NavigationDirection) => ({
    x: direction === "forward" ? "-100%" : "100%",
    opacity: 0,
  }),
};

export default function Game() {
  const {
    state,
    isLoading,
    defaultQuestions,
    customQuestions,
    customCount,
    themes,
    playSelection,
    selectionSummary,
    activeQuestionTexts,
    selectTheme,
    clearTheme,
    setQuestionsSelected,
    startGame,
    endGame,
    nextPair,
    addQuestion,
    goToSelectQuestions,
    goToCustomQuestion,
    goToSetup,
    deleteQuestion,
    editQuestion,
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

  let currentScreen: React.ReactNode;

  if (state.phase === "setup") {
    currentScreen = (
      <SetupScreen
        onStart={startGame}
        onGoToSelectQuestions={goToSelectQuestions}
        selectionSummary={selectionSummary}
        players={state.players}
        onAddPlayer={addPlayer}
        onRemovePlayer={removePlayer}
      />
    );
  } else if (state.phase === "select-questions") {
    currentScreen = (
      <SelectQuestionsScreen
        onBack={goBack}
        onGoToCustomQuestions={goToCustomQuestion}
        defaultQuestions={defaultQuestionTexts}
        customQuestions={customQuestionTexts}
        customCount={customCount}
        themes={themes}
        selection={playSelection}
        onSelectTheme={selectTheme}
        onClearTheme={clearTheme}
        activeCount={activeQuestionTexts.length}
        onAddQuestion={addQuestion}
      />
    );
  } else if (state.phase === "custom-question") {
    currentScreen = (
      <CustomQuestionScreen
        onBack={goBack}
        defaultQuestions={defaultQuestionTexts}
        customQuestions={customQuestionTexts}
        onDeleteQuestion={deleteQuestion}
        onEditQuestion={editQuestion}
        onAddQuestion={addQuestion}
        questionSource={manageQuestionSource}
        onChangeQuestionSource={setManageQuestionSource}
        selection={playSelection}
        onSetQuestionsSelected={setQuestionsSelected}
      />
    );
  } else if (state.phase === "playing" && state.pairs) {
    currentScreen = (
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
  } else {
    currentScreen = <ResultScreen players={state.players} onRestart={goToSetup} />;
  }

  return (
    <AnimatePresence mode="wait" custom={state.direction}>
      <motion.div
        key={state.phase}
        custom={state.direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ type: "tween", duration: 0.25, ease: "easeInOut" }}
      >
        {currentScreen}
      </motion.div>
    </AnimatePresence>
  );
}
