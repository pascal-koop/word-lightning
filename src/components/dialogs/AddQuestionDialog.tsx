import { useEffect, useRef, type FormEvent } from "react";

type AddQuestionDialogProps = {
  isOpen: boolean;
  newQuestion: string;
  shouldShowValidationError: boolean;
  validationError: string | null;
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
      className="fixed top-1/2 left-1/2 m-0 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-transparent p-0"
      onClose={onClose}
    >
      <div className="w-full rounded-3xl border border-white/60 bg-white/80 p-5 shadow-xl backdrop-blur sm:p-6">
        <div className="flex flex-col gap-3 text-center">
          <h2 className="text-2xl font-black text-slate-900">Add question</h2>
          <p>Add a new question to your collection.</p>
          <form className="flex flex-col gap-3" onSubmit={onSubmit}>
            <input
              type="text"
              value={newQuestion}
              onChange={(event) => onQuestionChange(event.target.value)}
              placeholder="z.B. Ist ein Werkzeug"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              aria-invalid={shouldShowValidationError}
            />
            <p className="mb-2 text-left text-xs font-semibold text-indigo-600">
              ✨ Tip: keep it short
            </p>
            {shouldShowValidationError && (
              <p className="mb-2 text-xs font-semibold text-red-600">
                {validationError}
              </p>
            )}
            <button
              type="submit"
              disabled={isAddDisabled}
              aria-busy={isSubmitting}
              className="disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Adding…" : "Add question"}
            </button>
          </form>
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}
