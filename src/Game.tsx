import { useGame } from "./hooks/useGame.ts";
import SetupScreen from "./components/screens/SetupScreen.tsx";
import PlayScreen from "./components/screens/PlaySreen.tsx";
import ResultScreen from "./components/screens/ResultScreen.tsx";

export default function Game() {
  const { state, startGame, endGame, nextPair } = useGame();

  if (state.phase === "setup") {
    return <SetupScreen onStart={startGame} />;
  }

  if (state.phase === "playing" && state.pairs) {
    return <PlayScreen pair={state.pairs} onEnd={endGame} onNext={nextPair} />;
  }

  return <ResultScreen onRestart={startGame} />;
}
