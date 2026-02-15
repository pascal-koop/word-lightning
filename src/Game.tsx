/* import { createPairs } from "./game/logic";
import { useState } from "react";
import Button from "./components/Button";
export default function Game() {
  const [currentPair, setCurrentPair] = useState<{
    letter: string;
    question: string;
  } | null>(null);

  const handleButtonClick = () => {
    const pair = createPairs();
    setCurrentPair(pair);
  };
  return (
    <div className="App">
      <h1>Wort Blitz mit React</h1>
      {
        // <button onClick={handleButtonClick}>Klick mich</button>
      }
      <Button onClick={handleButtonClick} />

      {currentPair && (
        <div>
          <h2>Buchstabe: {currentPair.letter}</h2>
          <p>Frage: {currentPair.question}</p>
        </div>
      )}
    </div>
  );
} */
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
