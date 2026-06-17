import { useEffect, useRef, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type AddQuestionDialogProps = {
  isOpen: boolean;
  newQuestion: string;
  shouldShowValidationError: boolean;
  validationError: string | null;
  submitError?: string | null;
  isAddDisabled: boolean;
  isSubmitting: boolean;
  onQuestionChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export default function AddQuestionDialog({
  isOpen,
  newQuestion,
  shouldShowValidationError,
  validationError,
  submitError,
  isAddDisabled,
  isSubmitting,
  onQuestionChange,
  onSubmit,
  onClose,
}: AddQuestionDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    }

    if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="add-question-dialog-heading"
      className="fixed top-1/2 left-1/2 m-0 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-0 shadow-xl"
      onClose={onClose}
    >
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="text-center">
          <h2
            id="add-question-dialog-heading"
            className="text-xl font-black text-foreground"
          >
            Add question
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a new question to your collection.
          </p>
        </div>

        <form className="flex flex-col gap-3" onSubmit={onSubmit}>
          <Input
            type="text"
            value={newQuestion}
            onChange={(event) => onQuestionChange(event.target.value)}
            placeholder="e.g. Is a tool"
            aria-label="New question text"
            aria-invalid={shouldShowValidationError}
          />
          <p className="text-left text-xs font-semibold text-primary">
            ✨ Tip: keep it short
          </p>
          {shouldShowValidationError && (
            <p className="text-xs font-semibold text-destructive">
              {validationError}
            </p>
          )}
          {submitError && (
            <p role="alert" className="text-xs font-semibold text-destructive">
              {submitError}
            </p>
          )}
          <Button type="submit" disabled={isAddDisabled} aria-busy={isSubmitting}>
            {isSubmitting ? "Adding…" : "Add question"}
          </Button>
        </form>

        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Close
        </Button>
      </div>
    </dialog>
  );
}
