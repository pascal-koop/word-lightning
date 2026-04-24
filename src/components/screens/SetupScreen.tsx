type SetupScreenProps = {
  onStart: () => void;
  onGoToAddQuestion: () => void;
  questionsCount: number;
};

export default function SetupScreen({
  onStart,
  onGoToAddQuestion,
  questionsCount,
}: SetupScreenProps) {
  const isStartDisabled = questionsCount === 0;
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
            Game Setup
          </p>
          <h2 className="mt-2 text-3xl font-black text-slate-900">
            Ready to play?
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Add your own prompts, then hit start or play with default prompts.
          </p>
        </div>

        <div className="mb-6 flex items-center justify-between rounded-2xl bg-indigo-50 px-4 py-3">
          <span className="text-sm font-semibold text-slate-700">
            Questions loaded
          </span>
          <span className="text-2xl font-black text-indigo-700">
            {questionsCount}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <button
            className="bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
            onClick={onGoToAddQuestion}
          >
            Add question
          </button>
          <button
            className="bg-indigo-600 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onStart}
            disabled={isStartDisabled}
          >
            Start game
          </button>
        </div>
      </div>
    </div>
  );
}
