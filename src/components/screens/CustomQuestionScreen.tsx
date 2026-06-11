import { useState } from "react";
import QuestionListItem from "../QuestionListItem.tsx";
import AddQuestionDialog from "../dialogs/AddQuestionDialog.tsx";
import QuestionSourceToggle from "../QuestionSourceToggle.tsx";
import { type QuestionSource } from "../../db/db.ts";
import { buildVisibleQuestions } from "../../game/questionList.ts";
import { useAddQuestionForm } from "../../hooks/useAddQuestionForm.ts";
import BackButton from "../BackButton.tsx";

type CustomQuestionScreenProps = {
  onBack: () => void;
  defaultQuestions: string[];
  customQuestions: string[];
  onDeleteQuestion: (question: string) => Promise<void>;
  onEditQuestion: (oldQuestion: string, newQuestion: string) => Promise<void>;
  onAddQuestion: (question: string) => Promise<void>;
  questionSource: QuestionSource;
  onChangeQuestionSource: (value: QuestionSource) => void;
};

export default function CustomQuestionScreen({
  onBack,
  defaultQuestions,
  customQuestions,
  onDeleteQuestion,
  onEditQuestion,
  onAddQuestion,
  questionSource,
  onChangeQuestionSource,
}: CustomQuestionScreenProps) {
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);

  const visibleQuestions = buildVisibleQuestions(
    questionSource,
    defaultQuestions,
    customQuestions,
  );
  // For the duplicate check on the "Add question" form we always
  // compare against the union of both tables. Otherwise a user could
  // add a custom question whose text already exists in the defaults,
  // which the schema-level "&text" unique index would silently allow
  // but would still confuse players.
  const allQuestionTexts = [...defaultQuestions, ...customQuestions];

  // Shared with the quick-add modal on the setup screen so the form
  // behaviour stays identical no matter where the user adds from.
  const addForm = useAddQuestionForm({
    existingQuestions: allQuestionTexts,
    onAddQuestion,
    onSuccess: () => setIsAddQuestionOpen(false),
  });

  const handleCloseAddQuestion = () => {
    setIsAddQuestionOpen(false);
    addForm.reset();
  };

  // Empty-state copy depends on which source the user has selected,
  // so they get a helpful, source-specific hint rather than a generic
  // "No questions yet" message that would be misleading on the
  // "default" tab (where they cannot add anything anyway).
  const emptyStateMessage = (() => {
    switch (questionSource) {
      case "default":
        return "No default questions have been seeded yet.";
      case "custom":
        return "No custom questions yet. Add your first one.";
      case "both":
        return "No questions yet. Add your first one.";
    }
  })();

  return (
    <div className="mx-auto w-full max-w-2xl rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur md:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-black text-slate-900">My Questions</h2>
        <div className="flex gap-2">
          <button onClick={() => setIsAddQuestionOpen(true)}>Add question</button>
          <BackButton onBack={onBack} />
        </div>
      </div>
      <div className="mb-6">
        <QuestionSourceToggle
          questionSource={questionSource}
          onChange={onChangeQuestionSource}
        />
      </div>
      <ul aria-label="Question list" className="space-y-3">
        {visibleQuestions.map((entry) => (
          <QuestionListItem
            key={`${entry.isCustom ? "custom" : "default"}-${entry.text}`}
            question={entry.text}
            // The duplicate check inside the edit form must see every
            // other question – including defaults the user cannot edit
            // – so they can't rename one of their customs to a
            // default's text.
            questions={allQuestionTexts}
            isCustom={entry.isCustom}
            onDeleteQuestion={onDeleteQuestion}
            onEditQuestion={onEditQuestion}
          />
        ))}
      </ul>
      {visibleQuestions.length === 0 && (
        <p className="rounded-2xl bg-[#6365f117] px-4 py-6 text-center text-slate-600">
          {emptyStateMessage}
        </p>
      )}
      <AddQuestionDialog
        isOpen={isAddQuestionOpen}
        newQuestion={addForm.value}
        shouldShowValidationError={addForm.shouldShowValidationError}
        validationError={addForm.validationError}
        isAddDisabled={addForm.isDisabled}
        isSubmitting={addForm.isSubmitting}
        onQuestionChange={addForm.handleChange}
        onSubmit={addForm.handleSubmit}
        onClose={handleCloseAddQuestion}
      />
    </div>
  );
}
