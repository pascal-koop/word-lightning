import { useState, type FormEvent } from "react";
import {
  isDuplicateQuestion,
  validateQuestionInput,
} from "../game/questionValidation";
import type { AddQuestionResult } from "./useGame";

type UseAddQuestionFormArgs = {
  existingQuestions: string[];
  onAddQuestion: (rawQuestion: string) => Promise<AddQuestionResult>;
  onSuccess?: () => void;
};

const SUBMIT_ERROR_MESSAGES: Record<
  Exclude<AddQuestionResult, { ok: true }>["reason"],
  string
> = {
  limit:
    "You have reached the limit of 100 custom questions. Delete some to add new ones.",
  duplicate: "This question already exists.",
  invalid: "This question is invalid.",
};

export function useAddQuestionForm({
  existingQuestions,
  onAddQuestion,
  onSuccess,
}: UseAddQuestionFormArgs) {
  const [value, setValue] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validation = validateQuestionInput(value);
  const isDuplicate = validation.success
    ? isDuplicateQuestion(validation.data, existingQuestions)
    : false;

  const validationError = !validation.success
    ? validation.error.issues[0]?.message
    : isDuplicate
    ? "Question already exists."
    : null;

  const shouldShowValidationError = hasInteracted && Boolean(validationError);
  const isDisabled = !validation.success || isDuplicate || isSubmitting;

  const handleChange = (next: string) => {
    if (!hasInteracted) setHasInteracted(true);
    if (submitError) setSubmitError(null);
    setValue(next);
  };

  const reset = () => {
    setValue("");
    setHasInteracted(false);
    setSubmitError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isDisabled) return;
    setIsSubmitting(true);
    try {
      const result = await onAddQuestion(value);
      if (result.ok) {
        reset();
        onSuccess?.();
      } else {
        setSubmitError(SUBMIT_ERROR_MESSAGES[result.reason]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    value,
    handleChange,
    handleSubmit,
    reset,
    isSubmitting,
    isDisabled,
    shouldShowValidationError,
    validationError,
    submitError,
  };
}
