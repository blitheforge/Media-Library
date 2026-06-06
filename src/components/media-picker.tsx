import { useState } from "react";
import { ImagePlus, Upload } from "lucide-react";
import { cn } from "../utils/cn";
import { bfmlRootProps, resolveThemeMode } from "../utils/bfml-theme";
import { fileNameFromPath } from "../client";
import { MediaLibraryModal, MediaPreview } from "./media-library-modal";
import type { MediaPickerProps } from "../types";

export function MediaPicker({
  name,
  label = "Choose image",
  title = "Media Library",
  description = "Create folders, upload files, and choose media.",
  previewTitle = "Live preview",
  previewDescription = "The selected media library file will be used in the table and detail page.",
  value,
  defaultValue = "",
  onChange,
  config,
  theme,
  accept = ["image"],
  className
}: MediaPickerProps) {
  const themeMode = resolveThemeMode(theme ?? config?.theme);
  const rootProps = bfmlRootProps(themeMode);
  const [open, setOpen] = useState(false);
  const [selectedPath, setSelectedPath] = useState(value ?? defaultValue);

  function handleSelect(file: { url: string }) {
    setSelectedPath(file.url);
    onChange?.(file.url);
    setOpen(false);
  }

  const currentValue = value ?? selectedPath;

  return (
    <div {...rootProps} className={cn(rootProps.className, "space-y-4", className)}>
      {label ? <label className="text-sm font-medium text-[var(--bfml-foreground)]">{label}</label> : null}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-xl border border-[var(--bfml-border)] bg-[var(--bfml-surface-soft)] px-3 py-3 text-left transition hover:border-[var(--bfml-primary-border)] hover:bg-[var(--bfml-surface)] sm:gap-4 sm:px-4 sm:py-4"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--bfml-surface)] text-[var(--bfml-primary)] sm:h-12 sm:w-12">
          <ImagePlus className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-[var(--bfml-foreground)]">{label}</span>
          <span className="mt-0.5 block text-xs text-[var(--bfml-muted-foreground)]">Select from folders or upload new</span>
        </span>
        <Upload className="hidden h-5 w-5 shrink-0 text-[var(--bfml-muted-foreground)] sm:block" aria-hidden="true" />
      </button>

      <input type="hidden" name={name} value={currentValue} />

      <div className="rounded-xl border border-[var(--bfml-border)] bg-[var(--bfml-surface)] p-3 sm:p-4">
        <p className="text-sm font-semibold text-[var(--bfml-foreground)]">{previewTitle}</p>
        <p className="mt-1 text-xs text-[var(--bfml-muted-foreground)]">{previewDescription}</p>
        <div className="mt-4">
          <MediaPreview path={currentValue} alt={fileNameFromPath(currentValue)} />
        </div>
        {currentValue ? <p className="mt-2 truncate text-xs text-[var(--bfml-muted-foreground)]">{fileNameFromPath(currentValue)}</p> : null}
      </div>

      <MediaLibraryModal
        open={open}
        onClose={() => setOpen(false)}
        onSelect={handleSelect}
        config={config}
        theme={themeMode}
        title={title}
        description={description}
        accept={accept}
      />
    </div>
  );
}
