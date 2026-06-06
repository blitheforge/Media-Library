import { createPortal } from "react-dom";
import type { MediaLibraryThemeMode } from "../../theme";
import { bfmlRootProps } from "../../utils/bfml-theme";
import { cn } from "../../utils/cn";
import { Button } from "./button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  theme?: MediaLibraryThemeMode;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
  theme = "sync",
  onCancel,
  onConfirm
}: ConfirmDialogProps) {
  if (!open || typeof document === "undefined") return null;

  const rootProps = bfmlRootProps(theme);

  return createPortal(
    <div
      {...rootProps}
      className={cn(rootProps.className, "fixed inset-0 z-[10001] flex items-end justify-center p-0 backdrop-blur-sm sm:items-center sm:p-4")}
      style={{ backgroundColor: "var(--bfml-overlay)" }}
      role="presentation"
      onClick={onCancel}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="bfml-confirm-title"
        aria-describedby="bfml-confirm-description"
        className="w-full max-w-md rounded-t-2xl border border-[var(--bfml-border)] bg-[var(--bfml-surface)] p-4 shadow-[var(--bfml-shadow-lg)] sm:rounded-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="bfml-confirm-title" className="text-lg font-semibold text-[var(--bfml-foreground)]">
          {title}
        </h3>
        <p id="bfml-confirm-description" className="mt-2 text-sm text-[var(--bfml-muted-foreground)]">
          {description}
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:mt-6 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" disabled={loading} className="w-full sm:w-auto" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" variant="danger" disabled={loading} className="w-full sm:w-auto" onClick={onConfirm}>
            {loading ? "Deleting..." : confirmLabel}
          </Button>
        </div>
      </section>
    </div>,
    document.body
  );
}
