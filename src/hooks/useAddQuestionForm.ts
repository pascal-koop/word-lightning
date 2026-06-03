import { useState, type FormEvent } from "react";
import {
  isDuplicateQuestion,
  validateQuestionInput,
} from "../game/questionValidation";

type UseAddQuestionFormArgs = {
  // The list a new candidate is checked against. Callers usually pass
  // the union of default + custom prompts so a custom prompt cannot
  // collide with a default's text.
  existingQuestions: string[];
  // The async mutation that actually writes the new prompt (today
  // backed by Dexie). The hook awaits it and only resets the form
  // when the promise resolves.
  onAddQuestion: (rawQuestion: string) => Promise<void>;
  // Called once the form has been successfully submitted and reset.
  // We expose it as a separate callback (rather than baking it into
  // onAddQuestion) so callers can use it to e.g. close a modal.
  onSuccess?: () => void;
};

// Shared state + validation logic for the "Add a question" form.
// Both the setup screen's quick-add modal and the manage screen's
// modal need the exact same behaviour, so pulling it out of the
// components removes a non-trivial amount of duplication and keeps
// the validation in lock-step.
export function useAddQuestionForm({
  existingQuestions,
  onAddQuestion,
  onSuccess,
}: UseAddQuestionFormArgs) {
  const [value, setValue] = useState("");
  // We only show validation errors after the user has interacted
  // with the field. This way an empty form doesn't immediately
  // scream at the user when it first opens.
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Wrap setValue so we can flip hasInteracted on first keystroke.
  // Callers that wire this to an <input>'s onChange get the desired
  // "show errors after typing" behaviour for free.
  const handleChange = (next: string) => {
    if (!hasInteracted) setHasInteracted(true);
    setValue(next);
  };

  const reset = () => {
    setValue("");
    setHasInteracted(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isDisabled) return;
    setIsSubmitting(true);
    try {
      await onAddQuestion(value);
      reset();
      onSuccess?.();
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
  };
}
