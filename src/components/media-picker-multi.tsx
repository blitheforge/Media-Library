import { useEffect, useState } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "../utils/cn";
import { bfmlRootProps, resolveThemeMode } from "../utils/bfml-theme";
import { fileNameFromPath, isImagePath } from "../client";
import { MediaLibraryModal } from "./media-library-modal";
import { PickerThumbnailStack } from "./picker-thumbnail";
import type { MediaFile } from "../types";
import type { MediaPickerMultiProps } from "../types";

export function MediaPickerMulti({
  name,
  label = "Choose attachments",
  title = "Media Library",
  description = "Create folders, upload files, and choose one or more attachments.",
  max = 10,
  values,
  defaultValues = [],
  onChange,
  config,
  theme,
  accept = ["image", "pdf"],
  className
}: MediaPickerMultiProps) {
  const themeMode = resolveThemeMode(theme ?? config?.theme);
  const rootProps = bfmlRootProps(themeMode);
  const [open, setOpen] = useState(false);
  const [selectedPaths, setSelectedPaths] = useState<string[]>(values ?? defaultValues);

  useEffect(() => {
    if (values !== undefined) setSelectedPaths(values);
  }, [values]);

  const currentValues = values ?? selectedPaths;
  const atMax = currentValues.length >= max;

  function handleSelectMany(files: MediaFile[]) {
    setSelectedPaths((current) => {
      const next = [...current];
      for (const file of files) {
        if (next.includes(file.url) || next.length >= max) continue;
        next.push(file.url);
      }
      onChange?.(next);
      return next;
    });
    setOpen(false);
  }

  function removeAt(index: number) {
    setSelectedPaths((current) => {
      const next = current.filter((_, itemIndex) => itemIndex !== index);
      onChange?.(next);
      return next;
    });
  }

  return (
    <div {...rootProps} className={cn(rootProps.className, "space-y-2", className)}>
      {label ? <label className="text-sm font-medium text-[var(--bfml-foreground)]">{label}</label> : null}

      <div className="overflow-hidden rounded-xl border border-[var(--bfml-border)] bg-[var(--bfml-surface-soft)]">
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={atMax}
          className="flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-[var(--bfml-surface)] disabled:cursor-not-allowed disabled:opacity-60 sm:gap-4 sm:px-4 sm:py-4"
        >
          <PickerThumbnailStack paths={currentValues} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-[var(--bfml-foreground)]">{label}</span>
            <span className="mt-0.5 block text-xs text-[var(--bfml-muted-foreground)]">
              {currentValues.length > 0
                ? `${currentValues.length} selected · click to add more (${currentValues.length}/${max})`
                : `Select from folders or upload new (0/${max})`}
            </span>
          </span>
          <Upload className="hidden h-5 w-5 shrink-0 text-[var(--bfml-muted-foreground)] sm:block" aria-hidden="true" />
        </button>

        {currentValues.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 border-t border-[var(--bfml-border)] bg-[var(--bfml-surface)] p-3 sm:grid-cols-4 sm:p-4">
            {currentValues.map((path, index) => {
              const fileName = fileNameFromPath(path);
              const isImage = isImagePath(path);
              return (
                <div
                  key={`${path}-${index}`}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--bfml-border)] bg-[var(--bfml-surface-soft)]"
                >
                  {isImage ? (
                    <img src={path} alt={fileName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-1 text-center text-[var(--bfml-muted-foreground)]">
                      <span className="text-[10px] font-semibold uppercase">PDF</span>
                    </div>
                  )}
                  <button
                    type="button"
                    className="absolute right-1 top-1 rounded-md border border-[var(--bfml-border)] bg-[var(--bfml-surface)] p-1 shadow-sm transition hover:bg-[var(--bfml-destructive-soft)]"
                    onClick={() => removeAt(index)}
                    title="Remove attachment"
                  >
                    <X className="h-3 w-3 text-[var(--bfml-destructive)]" />
                  </button>
                  <div className="absolute inset-x-0 bottom-0 bg-[var(--bfml-overlay)] px-1.5 py-1">
                    <p className="truncate text-[10px] font-medium text-[var(--bfml-primary-foreground)]">{fileName}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {currentValues.map((path, index) => (
        <input key={`${path}-${index}`} type="hidden" name={`${name}[${index}]`} value={path} />
      ))}

      <MediaLibraryModal
        open={open}
        onClose={() => setOpen(false)}
        onSelectMany={handleSelectMany}
        selectionMode="multi"
        maxSelections={Math.max(0, max - currentValues.length)}
        autoSelectUploads
        config={config}
        theme={themeMode}
        title={title}
        description={description}
        accept={accept}
      />
    </div>
  );
}
