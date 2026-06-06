import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "../utils/cn";
import { bfmlRootProps, resolveThemeMode } from "../utils/bfml-theme";
import { fileNameFromPath } from "../client";
import { MediaLibraryModal } from "./media-library-modal";
import { PickerThumbnail } from "./picker-thumbnail";
import type { MediaPickerProps } from "../types";

export function MediaPicker({
  name,
  label = "Choose image",
  title = "Media Library",
  description = "Create folders, upload files, and choose media.",
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

  useEffect(() => {
    if (value !== undefined) setSelectedPath(value);
  }, [value]);

  function handleSelect(file: { url: string }) {
    setSelectedPath(file.url);
    onChange?.(file.url);
    setOpen(false);
  }

  const currentValue = value ?? selectedPath;
  const fileName = currentValue ? fileNameFromPath(currentValue) : null;

  return (
    <div {...rootProps} className={cn(rootProps.className, "space-y-2", className)}>
      {label ? <label className="text-sm font-medium text-[var(--bfml-foreground)]">{label}</label> : null}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-xl border border-[var(--bfml-border)] bg-[var(--bfml-surface-soft)] px-3 py-3 text-left transition hover:border-[var(--bfml-primary-border)] hover:bg-[var(--bfml-surface)] sm:gap-4 sm:px-4 sm:py-4"
      >
        <PickerThumbnail path={currentValue} alt={fileName ?? label} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-[var(--bfml-foreground)]">{label}</span>
          <span className="mt-0.5 block truncate text-xs text-[var(--bfml-muted-foreground)]">
            {fileName ?? "Select from folders or upload new"}
          </span>
        </span>
        <Upload className="hidden h-5 w-5 shrink-0 text-[var(--bfml-muted-foreground)] sm:block" aria-hidden="true" />
      </button>

      <input type="hidden" name={name} value={currentValue} />

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
