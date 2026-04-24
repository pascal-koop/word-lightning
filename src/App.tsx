import Game from "./Game";
import wordBlitzCenter from "./assets/word_blitz_center.png";
function App() {
  return (
    <main className="App min-h-screen px-4 py-6 sm:px-3">
      <header className="mx-auto  flex max-w-4xl items-center justify-between">
        <div className="flex items-center gap-1">
          <div>
            <img
              src={wordBlitzCenter}
              alt="Word Blitz"
              className="h-36 w-36 z-10 object-contain scale-125"
            />
          </div>
          <div className="-ml-2 z-20">
            <p className="text-sm text-slate-600">
              Fast, fun, and playful word challenge
            </p>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-4xl">
        <Game />
      </div>
    </main>
  );
}

export default App;
