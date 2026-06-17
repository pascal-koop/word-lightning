import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

type DeleteQuestionDialogProps = {
  isOpen: boolean;
  question: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteQuestionDialog({
  isOpen,
  question,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteQuestionDialogProps) {
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
      aria-labelledby="delete-question-dialog-heading"
      className="fixed top-1/2 left-1/2 m-0 w-[92vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-0 shadow-xl"
      onClose={onClose}
    >
      <div className="p-4 sm:p-5">
        <h3
          id="delete-question-dialog-heading"
          className="text-lg font-bold text-foreground"
        >
          Delete question?
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Are you sure you want to delete this question?
        </p>
        <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-sm text-foreground">
          {question}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            aria-label="Cancel deletion"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            aria-busy={isDeleting}
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
