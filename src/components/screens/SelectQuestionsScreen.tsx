import { useState } from "react";
import ThemePicker from "../ThemePicker.tsx";
import AddQuestionDialog from "../dialogs/AddQuestionDialog.tsx";
import { useAddQuestionForm } from "../../hooks/useAddQuestionForm.ts";
import { MAX_CUSTOM_QUESTIONS } from "../../db/db.ts";
import type { Theme } from "../../game/themes.ts";
import type { PlaySelection } from "../../game/playSelection.ts";
import type { AddQuestionResult } from "../../hooks/useGame.ts";

type SelectQuestionsScreenProps = {
  onBack: () => void;
  onGoToCustomQuestions: () => void;
  defaultQuestions: string[];
  customQuestions: string[];
  customCount: number;
  themes: Theme[];
  selection: PlaySelection;
  onSelectTheme: (themeId: string) => void;
  onClearTheme: () => void;
  activeCount: number;
  onAddQuestion: (rawQuestion: string) => Promise<AddQuestionResult>;
};

export default function SelectQuestionsScreen({
  onBack,
  onGoToCustomQuestions,
  defaultQuestions,
  customQuestions,
  customCount,
  themes,
  selection,
  onSelectTheme,
  onClearTheme,
  activeCount,
  onAddQuestion,
}: SelectQuestionsScreenProps) {
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);

  const isAtLimit = customCount >= MAX_CUSTOM_QUESTIONS;

  const addForm = useAddQuestionForm({
    existingQuestions: [...defaultQuestions, ...customQuestions],
    onAddQuestion,
    onSuccess: () => setIsAddQuestionOpen(false),
  });

  const handleCloseAddQuestion = () => {
    setIsAddQuestionOpen(false);
    addForm.reset();
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
              Questions
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-900">
              What will be played?
            </h2>
          </div>
          <span
            aria-live="polite"
            className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
          >
            {activeCount} active
          </span>
        </div>

        <ThemePicker
          themes={themes}
          selection={selection}
          onSelectTheme={onSelectTheme}
          onClearTheme={onClearTheme}
        />

        <section aria-labelledby="mix-heading" className="mt-6">
          <h4 id="mix-heading" className="text-sm font-semibold text-slate-700">
            Custom mix
          </h4>
          <p className="mt-1 text-xs text-slate-500">
            Write your own questions and check individual questions in the list
            to build your own mix.
          </p>
          <button
            type="button"
            aria-label="Select and manage questions"
            onClick={onGoToCustomQuestions}
            className="mt-3 w-full bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Manage questions
          </button>
        </section>

        {isAtLimit && (
          <p role="status" className="mt-2 text-center text-xs text-red-600">
            Limit reached. Delete custom questions to add new ones.
          </p>
        )}

        <div className="mt-5">
          <button
            type="button"
            onClick={onBack}
            className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Done
          </button>
        </div>

        <AddQuestionDialog
          isOpen={isAddQuestionOpen}
          newQuestion={addForm.value}
          shouldShowValidationError={addForm.shouldShowValidationError}
          validationError={addForm.validationError}
          submitError={addForm.submitError}
          isAddDisabled={addForm.isDisabled}
          isSubmitting={addForm.isSubmitting}
          onQuestionChange={addForm.handleChange}
          onSubmit={addForm.handleSubmit}
          onClose={handleCloseAddQuestion}
        />
      </div>
    </div>
  );
}
