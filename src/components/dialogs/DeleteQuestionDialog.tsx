import { useEffect, useRef } from "react";

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
      className="fixed top-1/2 left-1/2 m-0 w-[92vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/60 bg-white/90 p-0 shadow-xl backdrop-blur"
      onClose={onClose}
    >
      <div className="p-4 sm:p-5">
        <h3 className="text-lg font-bold text-slate-900">Delete question?</h3>
        <p className="mt-2 text-sm text-slate-700">
          Are you sure you want to delete this question?
        </p>
        <p className="mt-2 rounded-lg bg-slate-200/50 px-3 py-2 text-sm text-slate-800">
          {question}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={isDeleting}>
            Cancel
          </button>
          <button
            type="button"
            className="bg-red-600 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onConfirm}
            disabled={isDeleting}
            aria-busy={isDeleting}
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
