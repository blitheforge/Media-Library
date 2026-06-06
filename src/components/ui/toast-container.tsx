import { useEffect, useState } from "react";
import { CheckCircle2, TriangleAlert, X, XCircle } from "lucide-react";
import type { MediaLibraryThemeMode } from "../../theme";
import { dismissToast, subscribeToasts, type ToastItem } from "../../utils/toast-store";
import { cn } from "../../utils/cn";

function ToastCard({ toast }: { toast: ToastItem }) {
  const isSuccess = toast.type === "success";
  const isWarning = toast.type === "warning";

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-[var(--bfml-shadow-lg)] transition",
        isSuccess
          ? "border-[var(--bfml-success)]/30 bg-[var(--bfml-success-soft)] text-[var(--bfml-success-foreground)]"
          : isWarning
            ? "border-[var(--bfml-warning)]/30 bg-[var(--bfml-warning-soft)] text-[var(--bfml-warning-foreground)]"
            : "border-[var(--bfml-destructive)]/30 bg-[var(--bfml-destructive-soft)] text-[var(--bfml-foreground)]"
      )}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--bfml-success)]" aria-hidden="true" />
      ) : isWarning ? (
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--bfml-warning)]" aria-hidden="true" />
      ) : (
        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--bfml-destructive)]" aria-hidden="true" />
      )}
      <p className="min-w-0 flex-1 text-sm font-medium leading-5">{toast.message}</p>
      <button
        type="button"
        className="rounded-md p-0.5 opacity-70 transition hover:opacity-100"
        aria-label="Dismiss notification"
        onClick={() => dismissToast(toast.id)}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer({ theme = "sync" }: { theme?: MediaLibraryThemeMode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  void theme;

  useEffect(() => {
    return subscribeToasts(setItems);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="pointer-events-none absolute right-3 top-3 z-[45] flex w-[min(100%,20rem)] flex-col items-end gap-2 sm:right-4 sm:top-4">
      {items.map((toast) => (
        <ToastCard key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
