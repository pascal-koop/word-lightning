// hier werden die Komponenten importiert z.B. navigation, hero etc.
import Game from "./Game";
function App() {
  return (
    /** <>
     * <NavigationBar />
     * </>
     */
    <main className="App">
      <h1>Word Blitz</h1>
      <Game />
    </main>
  );
}

export default App;
