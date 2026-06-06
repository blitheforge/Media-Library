import { cn } from "../utils/cn";
import { bfmlRootProps, resolveThemeMode } from "../utils/bfml-theme";
import { toCssSize } from "../utils/media-library-utils";
import { defaultMediaLibraryConfig } from "../types";
import type { MediaLibraryWidgetProps } from "../types";
import { MediaLibraryPanel } from "./media-library-panel";

export function MediaLibraryWidget({
  width = "100%",
  height = 640,
  config,
  theme,
  title = "Media Library",
  description = "Create folders, upload files, and manage media.",
  accept,
  selectable = false,
  onSelect,
  className
}: MediaLibraryWidgetProps) {
  const resolved = { ...defaultMediaLibraryConfig, ...config };
  const themeMode = resolveThemeMode(theme ?? resolved.theme);
  const rootProps = bfmlRootProps(themeMode);

  return (
    <div {...rootProps}>
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-[var(--bfml-border)] bg-[var(--bfml-surface)] shadow-[var(--bfml-shadow-lg)]",
          className
        )}
        style={{
          width: toCssSize(width),
          height: toCssSize(height)
        }}
      >
        <MediaLibraryPanel
        active
        variant="embedded"
        config={config}
        theme={theme}
        title={title}
        description={description}
        accept={accept}
        selectable={selectable}
        onSelect={onSelect}
        className="h-full"
      />
      </div>
    </div>
  );
}
