import { useState } from "react";
import { ImagePlus, Upload, X } from "lucide-react";
import { cn } from "../utils/cn";
import { bfmlRootProps, resolveThemeMode } from "../utils/bfml-theme";
import { fileNameFromPath } from "../client";
import { MediaLibraryModal, MediaPreview } from "./media-library-modal";
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

  const currentValues = values ?? selectedPaths;

  function handleSelect(file: { url: string }) {
    setSelectedPaths((current) => {
      if (current.includes(file.url) || current.length >= max) return current;
      const next = [...current, file.url];
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
    <div {...rootProps} className={cn(rootProps.className, "space-y-4", className)}>
      {label ? <label className="text-sm font-medium text-[var(--bfml-foreground)]">{label}</label> : null}

      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={currentValues.length >= max}
        className="flex w-full items-center gap-3 rounded-xl border border-[var(--bfml-border)] bg-[var(--bfml-surface-soft)] px-3 py-3 text-left transition hover:border-[var(--bfml-primary-border)] hover:bg-[var(--bfml-surface)] disabled:cursor-not-allowed disabled:opacity-60 sm:gap-4 sm:px-4 sm:py-4"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--bfml-surface)] text-[var(--bfml-primary)] sm:h-12 sm:w-12">
          <ImagePlus className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-[var(--bfml-foreground)]">{label}</span>
          <span className="mt-0.5 block text-xs text-[var(--bfml-muted-foreground)]">
            Select from folders or upload new ({currentValues.length}/{max})
          </span>
        </span>
        <Upload className="hidden h-5 w-5 shrink-0 text-[var(--bfml-muted-foreground)] sm:block" aria-hidden="true" />
      </button>

      {currentValues.map((path, index) => (
        <input key={`${path}-${index}`} type="hidden" name={`${name}[${index}]`} value={path} />
      ))}

      {currentValues.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3">
          {currentValues.map((path, index) => (
            <div key={`${path}-${index}`} className="relative rounded-xl border border-[var(--bfml-border)] bg-[var(--bfml-surface)] p-3">
              <button
                type="button"
                className="absolute right-2 top-2 rounded-md bg-[var(--bfml-surface)] p-1 shadow-sm"
                onClick={() => removeAt(index)}
                title="Remove attachment"
              >
                <X className="h-4 w-4 text-[var(--bfml-destructive)]" />
              </button>
              <MediaPreview path={path} alt={fileNameFromPath(path)} />
              <p className="mt-2 truncate text-xs text-[var(--bfml-muted-foreground)]">{fileNameFromPath(path)}</p>
            </div>
          ))}
        </div>
      ) : null}

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
