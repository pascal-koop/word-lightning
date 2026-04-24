import { useState } from "react";
import {
  isDuplicateQuestion,
  validateQuestionInput,
} from "../game/questionValidation";
import DeleteQuestionDialog from "./dialogs/DeleteQuestionDialog.tsx";

export default function QuestionListItem({
  question,
  questions,
  onEditQuestion,
  onDeleteQuestion,
}: {
  question: string;
  questions: string[];
  onEditQuestion: (oldQuestion: string, newQuestion: string) => Promise<void>;
  onDeleteQuestion: (question: string) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editValue, setEditValue] = useState(question);
  const [isInputTouched, setIsInputTouched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const validation = validateQuestionInput(editValue);
  const otherQuestions = questions.filter((item) => item !== question);
  const isDuplicate = validation.success
    ? isDuplicateQuestion(validation.data, otherQuestions)
    : false;
  const validationError = !validation.success
    ? validation.error.issues[0]?.message
    : isDuplicate
      ? "Question already exists."
      : null;
  const shouldShowValidationError = isInputTouched && Boolean(validationError);
  const isSaveDisabled = !validation.success || isDuplicate || isSaving;

  async function handleSave() {
    if (isSaveDisabled) return;
    setIsSaving(true);
    try {
      await onEditQuestion(question, editValue);
      setIsInputTouched(false);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteConfirm() {
    setIsDeleting(true);
    try {
      await onDeleteQuestion(question);
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  }

  if (isEditing) {
    return (
      <li className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-start">
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onFocus={() => setIsInputTouched(true)}
              aria-invalid={shouldShowValidationError}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
            />
            {shouldShowValidationError && (
              <p className="mt-2 text-xs text-red-600">{validationError}</p>
            )}
          </div>
          <div className="flex w-full gap-2 md:ml-auto md:w-auto md:shrink-0">
            <button
              className="text-sm disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleSave}
              disabled={isSaveDisabled}
              aria-busy={isSaving}
            >
              {isSaving ? "Saving…" : "Save"}
            </button>
            <button
              className="text-sm"
              onClick={() => {
                setIsEditing(false);
                setIsInputTouched(false);
                setEditValue(question);
              }}
              disabled={isSaving}
            >
              Cancel
            </button>
          </div>
        </div>
      </li>
    );
  }
  return (
    <>
      <li className="flex flex-col gap-3 rounded-2xl bg-[#6365f117] px-4 py-3 md:flex-row md:items-center">
        <p className="w-full text-slate-900 wrap-break-word md:min-w-0 md:flex-1">
          {question}
        </p>
        <div className="flex w-full gap-2 md:ml-auto md:w-auto md:shrink-0">
          <button
            className="text-sm disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => {
              setEditValue(question);
              setIsInputTouched(false);
              setIsEditing(true);
            }}
            disabled={isDeleting}
          >
            Edit
          </button>
          <button
            className="text-sm disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isDeleting}
            aria-busy={isDeleting}
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </li>
      <DeleteQuestionDialog
        isOpen={isDeleteDialogOpen}
        question={question}
        isDeleting={isDeleting}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
