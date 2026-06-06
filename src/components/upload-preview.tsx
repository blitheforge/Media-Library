import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import { cn } from "../utils/cn";

export type UploadQueueItem = {
  id: string;
  file: File;
  previewUrl: string;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
};

export function UploadPreviewCard({ item }: { item: UploadQueueItem }) {
  const isImage = item.file.type.startsWith("image/");

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-[var(--bfml-surface)] p-2 sm:p-3",
        item.status === "done"
          ? "border-[var(--bfml-success)]/40"
          : item.status === "error"
            ? "border-[var(--bfml-destructive)]/40"
            : "border-[var(--bfml-border)]"
      )}
    >
      <div className="relative flex h-20 items-center justify-center overflow-hidden rounded-lg bg-[var(--bfml-surface-soft)] sm:h-28">
        {isImage ? (
          <img src={item.previewUrl} alt={item.file.name} className="h-full w-full object-contain opacity-80" />
        ) : (
          <div className="text-xs font-semibold uppercase text-[var(--bfml-muted-foreground)]">PDF</div>
        )}

        {item.status === "pending" || item.status === "uploading" ? (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-2 text-[var(--bfml-primary-foreground)]"
            style={{ backgroundColor: "var(--bfml-overlay)" }}
          >
            <LoaderCircle className="h-6 w-6 animate-spin" />
            <span className="text-xs font-medium">{item.status === "uploading" ? "Uploading..." : "Waiting..."}</span>
          </div>
        ) : null}

        {item.status === "done" ? (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "color-mix(in srgb, var(--bfml-success) 25%, transparent)" }}
          >
            <CheckCircle2 className="h-8 w-8 text-[var(--bfml-success)]" />
          </div>
        ) : null}

        {item.status === "error" ? (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "color-mix(in srgb, var(--bfml-destructive) 25%, transparent)" }}
          >
            <XCircle className="h-8 w-8 text-[var(--bfml-destructive)]" />
          </div>
        ) : null}
      </div>

      <p className="mt-2 truncate text-sm font-medium text-[var(--bfml-foreground)]">{item.file.name}</p>
      <p className="truncate text-xs text-[var(--bfml-muted-foreground)]">
        {item.status === "error" ? item.error ?? "Upload failed" : item.status === "done" ? "Uploaded" : "In queue"}
      </p>
    </div>
  );
}
