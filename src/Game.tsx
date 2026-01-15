import { createPairs } from "./game/logic";
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
      <h1>Hello World!</h1>
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
}
