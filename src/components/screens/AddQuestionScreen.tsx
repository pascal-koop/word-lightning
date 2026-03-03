import { useState } from "react";

type AddQuestionScreenProps = {
  onAddQuestion: (question: string) => void;
  onBack: () => void;
  questionsCount: number;
};

export default function AddQuestionScreen({
  onAddQuestion,
  onBack,
  questionsCount,
}: AddQuestionScreenProps) {
  const [newQuestion, setNewQuestion] = useState("");

  const handleAdd = () => {
    onAddQuestion(newQuestion);
    setNewQuestion("");
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
            Add a Question
          </p>
          <h2 className="mt-2 text-3xl font-black text-slate-900">
            Create a fresh prompt
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Keep it short and playful.
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

        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Your question
          <input
            type="text"
            value={newQuestion}
            onChange={(event) => setNewQuestion(event.target.value)}
            placeholder="z.B. Ist ein Werkzeug"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
          />
        </label>
        <p className="mb-4 text-xs font-semibold text-indigo-600">
          ✨ Tip: keep it short
        </p>

        <div className="flex flex-col gap-3">
          <button
            className="bg-indigo-600 text-white hover:bg-indigo-700"
            onClick={handleAdd}
          >
            Add question
          </button>
          <button
            className="bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
            onClick={onBack}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
