import { createPortal } from "react-dom";
import { cn } from "../utils/cn";
import { bfmlRootProps, resolveThemeMode } from "../utils/bfml-theme";
import { defaultMediaLibraryConfig } from "../types";
import type { MediaLibraryModalProps } from "../types";
import { MediaLibraryPanel } from "./media-library-panel";
import { fileNameFromPath } from "../client";

export function MediaLibraryModal({
  open,
  onClose,
  onSelect,
  onSelectMany,
  closeOnSelect = true,
  selectionMode = "single",
  maxSelections,
  autoSelectUploads = false,
  config,
  theme,
  title = "Media Library",
  description = "Create folders, upload files, and choose media.",
  accept
}: MediaLibraryModalProps) {
  const resolved = { ...defaultMediaLibraryConfig, ...config };
  const themeMode = resolveThemeMode(theme ?? resolved.theme);
  const rootProps = bfmlRootProps(themeMode);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      {...rootProps}
      className={cn(
        rootProps.className,
        "fixed inset-0 z-[9999] flex items-stretch justify-center p-0 backdrop-blur-sm sm:items-center sm:p-2 md:p-4"
      )}
      style={{ backgroundColor: "var(--bfml-overlay)" }}
    >
      <MediaLibraryPanel
        active={open}
        variant="modal"
        selectable
        config={config}
        theme={theme}
        title={title}
        description={description}
        accept={accept}
        onClose={onClose}
        onSelect={onSelect}
        onSelectMany={onSelectMany}
        closeOnSelect={closeOnSelect}
        selectionMode={selectionMode}
        maxSelections={maxSelections}
        autoSelectUploads={autoSelectUploads}
      />
    </div>,
    document.body
  );
}

export function MediaPreview({ path, alt }: { path: string; alt?: string }) {
  const isImage = /\.(png|jpe?g|webp|gif)$/i.test(path);
  if (!path) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-[var(--bfml-border)] bg-[var(--bfml-surface-soft)] px-4 text-center text-sm text-[var(--bfml-muted-foreground)] sm:h-40">
        No media selected
      </div>
    );
  }

  if (isImage) {
    return (
      <div className="overflow-hidden rounded-xl border border-[var(--bfml-border)] bg-[var(--bfml-surface-soft)]">
        <img src={path} alt={alt ?? fileNameFromPath(path)} className="h-32 w-full object-contain sm:h-40" />
      </div>
    );
  }

  return (
    <div className="flex h-32 items-center justify-center rounded-xl border border-[var(--bfml-border)] bg-[var(--bfml-surface-soft)] px-4 text-center text-sm font-medium text-[var(--bfml-foreground)] sm:h-40">
      {fileNameFromPath(path)}
    </div>
  );
}
