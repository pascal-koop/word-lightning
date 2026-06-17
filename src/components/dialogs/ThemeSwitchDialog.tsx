import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

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
      className="fixed top-1/2 left-1/2 m-0 w-[92vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-0 shadow-xl"
      onClose={onClose}
    >
      <div className="p-4 sm:p-5">
        <h3
          id="theme-switch-dialog-heading"
          className="text-lg font-bold text-foreground"
        >
          Switch to custom mix?
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          The theme{" "}
          <span className="font-semibold text-primary">{themeName}</span> can no
          longer be played. Instead, you play your own mix.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Continue</Button>
        </div>
      </div>
    </dialog>
  );
}
