import { useEffect, useRef } from "react";

type ThemeSwitchDialogProps = {
  isOpen: boolean;
  themeName: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ThemeSwitchDialog({
  isOpen,
  themeName,
  onClose,
  onConfirm,
}: ThemeSwitchDialogProps) {
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
      aria-labelledby="theme-switch-dialog-heading"
      className="fixed top-1/2 left-1/2 m-0 w-[92vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/60 bg-white/90 p-0 shadow-xl backdrop-blur"
      onClose={onClose}
    >
      <div className="p-4 sm:p-5">
        <h3
          id="theme-switch-dialog-heading"
          className="text-lg font-bold text-slate-900"
        >
          Switch to custom mix?
        </h3>
        <p className="mt-2 text-sm text-slate-700">
          The theme{" "}
          <span className="font-semibold text-indigo-600">{themeName}</span> can
          no longer be played. Instead, you play your own mix.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="bg-indigo-600 text-white hover:bg-indigo-700"
            onClick={onConfirm}
          >
            Continue
          </button>
        </div>
      </div>
    </dialog>
  );
}
