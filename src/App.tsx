// hier werden die Komponenten importiert z.B. navigation, hero etc.
import { createPairs } from "./game/logic";
import { useState } from "react";
import Button from "./components/Button";
function App() {
  const [currentPair, setCurrentPair] = useState<{
    letter: string;
    question: string;
  } | null>(null);

  const handleButtonClick = () => {
    const pair = createPairs();
    setCurrentPair(pair);
  };

  return (
    /** <>
     * <NavigationBar />
     * </>
     */

    <div className="App">
      <h1>Hello World!</h1>
      {
        // <button onClick={handleButtonClick}>Klick mich</button>
      }
      <Button onClick={handleButtonClick} />
      {
        // hier kann ich die game stats wie start und ende componenten einfügen, damit es Keine verschiedenen routen gibt und es ein app feeling gibt
      }
      {currentPair && (
        <div>
          <h2>Buchstabe: {currentPair.letter}</h2>
          <p>Frage: {currentPair.question}</p>
        </div>
      )}
    </div>
  );
}

export default App;
