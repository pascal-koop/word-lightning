import { useState } from "react";
import {
  isDuplicateQuestion,
  validateQuestionInput,
} from "../game/questionValidation";
import DeleteQuestionDialog from "./dialogs/DeleteQuestionDialog.tsx";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function QuestionListItem({
  question,
  questions,

  isCustom = true,

  isSelectedForPlay,
  onTogglePlay,
  onEditQuestion,
  onDeleteQuestion,
}: {
  question: string;
  questions: string[];
  isCustom?: boolean;
  isSelectedForPlay: boolean;
  onTogglePlay: (question: string) => void;
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
      <li className="rounded-lg border bg-card px-4 py-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-start">
          <div className="min-w-0 flex-1">
            <Input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onFocus={() => setIsInputTouched(true)}
              aria-label="Edit question text"
              aria-invalid={shouldShowValidationError}
            />
            {shouldShowValidationError && (
              <p className="mt-2 text-xs text-destructive">{validationError}</p>
            )}
          </div>
          <div className="flex w-full gap-2 md:ml-auto md:w-auto md:shrink-0">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaveDisabled}
              aria-busy={isSaving}
            >
              {isSaving ? "Saving…" : "Save"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditing(false);
                setIsInputTouched(false);
                setEditValue(question);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </div>
      </li>
    );
  }
  return (
    <>
      <li className="flex flex-col gap-3 rounded-lg border bg-secondary/50 px-4 py-3 md:flex-row md:items-center">
        <label className="flex w-full items-center gap-3 text-foreground wrap-break-word md:min-w-0 md:flex-1">
          <input
            type="checkbox"
            className="size-5 shrink-0 cursor-pointer accent-primary"
            checked={isSelectedForPlay}
            onChange={() => onTogglePlay(question)}
            aria-label={`"${question}" zum Mitspielen auswählen`}
          />
          <span className="min-w-0 wrap-break-word">{question}</span>
          {!isCustom && (
            <Badge variant="secondary">Default</Badge>
          )}
        </label>
        {isCustom && (
          <div className="flex w-full gap-2 md:ml-auto md:w-auto md:shrink-0">
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Edit "${question}"`}
              onClick={() => {
                setEditValue(question);
                setIsInputTouched(false);
                setIsEditing(true);
              }}
              disabled={isDeleting}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              aria-label={`Delete "${question}"`}
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isDeleting}
              aria-busy={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        )}
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
