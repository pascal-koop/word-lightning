import { useState, type FormEvent } from "react";
import QuestionListItem from "../QuestionListItem.tsx";
import AddQuestionDialog from "../dialogs/AddQuestionDialog.tsx";
import QuestionSourceToggle from "../QuestionSourceToggle.tsx";
import {
  isDuplicateQuestion,
  validateQuestionInput,
} from "../../game/questionValidation";
import { type QuestionSource } from "../../db/db.ts";
import { buildVisibleQuestions } from "../../game/questionList.ts";
import BackButton from "../BackButton.tsx";

type CustomQuestionScreenProps = {
  onBack: () => void;
  // We accept the two source tables separately so the screen can
  // decide which rows are read-only (defaults) and which are editable
  // (customs). Doing the merge here – instead of asking the caller to
  // pre-merge – keeps the read/write logic in one place.
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
  const [newQuestion, setNewQuestion] = useState("");
  const [isInputTouched, setIsInputTouched] = useState(false);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const validation = validateQuestionInput(newQuestion);
  const isDuplicate = validation.success
    ? isDuplicateQuestion(validation.data, allQuestionTexts)
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
      setIsAddQuestionOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCloseAddQuestion = () => {
    setIsInputTouched(false);
    setIsAddQuestionOpen(false);
  };
  const handleOpenAddQuestion = () => {
    setIsInputTouched(false);
    setIsAddQuestionOpen(true);
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
          <button onClick={handleOpenAddQuestion}>Add question</button>
          <BackButton onBack={onBack} />
        </div>
      </div>
      <div className="mb-6">
        <QuestionSourceToggle
          questionSource={questionSource}
          onChange={onChangeQuestionSource}
        />
      </div>
      <ul className="space-y-3">
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
        newQuestion={newQuestion}
        shouldShowValidationError={shouldShowValidationError}
        validationError={validationError}
        isAddDisabled={isAddDisabled}
        isSubmitting={isSubmitting}
        onQuestionChange={(value) => {
          if (!isInputTouched) {
            setIsInputTouched(true);
          }
          setNewQuestion(value);
        }}
        onSubmit={handleAdd}
        onClose={handleCloseAddQuestion}
      />
    </div>
  );
}
