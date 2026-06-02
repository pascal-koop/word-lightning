import { useState, type FormEvent } from "react";
import QuestionListItem from "../QuestionListItem.tsx";
import AddQuestionDialog from "../dialogs/AddQuestionDialog.tsx";
import QuestionSourceToggle from "../QuestionSourceToggle.tsx";
import {
  isDuplicateQuestion,
  validateQuestionInput,
} from "../../game/questionValidation";
import { type QuestionSource } from "../../db/db.ts";
import BackButton from "../BackButton.tsx";

export default function CustomQuestionScreen({
  onBack,
  questions,
  onDeleteQuestion,
  onEditQuestion,
  onAddQuestion,
  questionSource,
  onChangeQuestionSource,
}: {
  onBack: () => void;
  questions: string[];
  onDeleteQuestion: (question: string) => Promise<void>;
  onEditQuestion: (oldQuestion: string, newQuestion: string) => Promise<void>;
  onAddQuestion: (question: string) => Promise<void>;
  questionSource: QuestionSource;
  onChangeQuestionSource: (value: QuestionSource) => void;
}) {
  const [newQuestion, setNewQuestion] = useState("");
  const [isInputTouched, setIsInputTouched] = useState(false);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const validation = validateQuestionInput(newQuestion);
  const isDuplicate = validation.success
    ? isDuplicateQuestion(validation.data, questions)
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
        {questions.map((question) => (
          <QuestionListItem
            key={question}
            question={question}
            questions={questions}
            onDeleteQuestion={onDeleteQuestion}
            onEditQuestion={onEditQuestion}
          />
        ))}
      </ul>
      {questions.length === 0 && (
        <p className="rounded-2xl bg-[#6365f117] px-4 py-6 text-center text-slate-600">
          No questions yet. Add your first one.
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
