import { useState, type FormEvent } from "react";
import {
  isDuplicateQuestion,
  validateQuestionInput,
} from "../../game/questionValidation";
import QuestionSourceToggle from "../QuestionSourceToggle.tsx";
import { type QuestionSource } from "../../db/db.ts";
import BackButton from "../BackButton.tsx";

type AddQuestionScreenProps = {
  onAddQuestion: (question: string) => Promise<void>;
  onBack: () => void;
  onGoToCustomQuestion: () => void;
  questionsCount: number;
  customQuestions: string[];
  existingQuestions: string[];
  questionSource: QuestionSource;
  onChangeQuestionSource: (value: QuestionSource) => void;
};

export default function AddQuestionScreen({
  onAddQuestion,
  onBack,
  onGoToCustomQuestion,
  questionsCount,
  customQuestions,
  existingQuestions,
  questionSource,
  onChangeQuestionSource,
}: AddQuestionScreenProps) {
  const [newQuestion, setNewQuestion] = useState("");
  const [isInputTouched, setIsInputTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const validation = validateQuestionInput(newQuestion);
  const isDuplicate = validation.success
    ? isDuplicateQuestion(validation.data, existingQuestions)
    : false;
  const validationError = !validation.success
    ? validation.error.issues[0]?.message
    : isDuplicate
      ? "Question already exists."
      : null;
  const shouldShowValidationError = isInputTouched && Boolean(validationError);
  const isAddDisabled = !validation.success || isDuplicate || isSubmitting;

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isAddDisabled) return;
    setIsSubmitting(true);
    try {
      await onAddQuestion(newQuestion);
      setNewQuestion("");
      setIsInputTouched(false);
    } finally {
      setIsSubmitting(false);
    }
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

        <div className="mb-4">
          <QuestionSourceToggle
            questionSource={questionSource}
            onChange={onChangeQuestionSource}
          />
        </div>

        <div className="mb-6 flex items-center justify-between rounded-2xl bg-indigo-50 px-4 py-3">
          <span className="text-sm font-semibold text-slate-700">
            Questions loaded
          </span>
          <span className="text-2xl font-black text-indigo-700">
            {questionsCount}
          </span>
        </div>

        <form className="flex flex-col gap-3" onSubmit={handleAdd}>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Your question
            <input
              type="text"
              value={newQuestion}
              onChange={(event) => setNewQuestion(event.target.value)}
              onFocus={() => setIsInputTouched(true)}
              placeholder="z.B. Ist ein Werkzeug"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              aria-invalid={shouldShowValidationError}
            />
          </label>
          <p className="mb-4 text-xs font-semibold text-indigo-600">
            ✨ Tip: keep it short
          </p>
          {shouldShowValidationError && (
            <p className="mb-2 text-xs font-semibold text-red-600">
              {validationError}
            </p>
          )}
          <button
            className="bg-indigo-600 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
            disabled={isAddDisabled}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? "Adding…" : "Add question"}
          </button>
        </form>
        <div className="mt-3 flex flex-col gap-3">
          <BackButton onBack={onBack} />
        </div>
        {customQuestions.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-slate-700">
              Your questions
            </h3>
            <ul className="mt-2 space-y-2 mb-5">
              {customQuestions.slice(-3).map((question, index) => (
                <li
                  key={`${question}-${index}`}
                  className="text-sm text-slate-600"
                >
                  {index + 1}. {question}
                </li>
              ))}
              {customQuestions.length > 3 && (
                <p className="text-sm text-slate-600 text-center">
                  and {customQuestions.length - 3} more
                </p>
              )}
            </ul>
            <button onClick={onGoToCustomQuestion} type="button">
              show all {customQuestions.length}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
