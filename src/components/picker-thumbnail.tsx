import { FileText, ImagePlus } from "lucide-react";
import { cn } from "../utils/cn";
import { isImagePath } from "../client";

type PickerThumbnailProps = {
  path?: string;
  alt?: string;
  size?: "sm" | "md" | "grid";
  shape?: "circle" | "square";
  className?: string;
};

const sizeClasses = {
  sm: "h-9 w-9",
  md: "h-10 w-10 sm:h-12 sm:w-12",
  grid: "h-full w-full"
};

export function PickerThumbnail({
  path,
  alt,
  size = "md",
  shape = "circle",
  className
}: PickerThumbnailProps) {
  const isImage = Boolean(path && isImagePath(path));
  const rounded = shape === "circle" ? "rounded-full" : "rounded-lg";

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden border border-[var(--bfml-border)] bg-[var(--bfml-surface)]",
        size !== "grid" && sizeClasses[size],
        rounded,
        !path && "text-[var(--bfml-primary)]",
        className
      )}
    >
      {!path ? (
        <ImagePlus className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} aria-hidden="true" />
      ) : isImage ? (
        <img src={path} alt={alt ?? "Selected media"} className="h-full w-full object-cover" />
      ) : (
        <FileText className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} aria-hidden="true" />
      )}
    </span>
  );
}

export function PickerThumbnailStack({ paths }: { paths: string[] }) {
  if (paths.length === 0) {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--bfml-surface)] text-[var(--bfml-primary)] sm:h-12 sm:w-12">
        <ImagePlus className="h-5 w-5" aria-hidden="true" />
      </span>
    );
  }

  if (paths.length === 1) {
    return <PickerThumbnail path={paths[0]} alt="Selected media" />;
  }

  const visible = paths.slice(0, 3);

  return (
    <span className="relative flex h-10 w-10 shrink-0 items-center sm:h-12 sm:w-12">
      {visible.map((path, index) => (
        <span
          key={`${path}-${index}`}
          className={cn(
            "absolute overflow-hidden rounded-full border-2 border-[var(--bfml-surface-soft)] bg-[var(--bfml-surface)]",
            index === 0 && "left-0 top-0 z-30 h-7 w-7 sm:h-8 sm:w-8",
            index === 1 && "left-3 top-1 z-20 h-7 w-7 sm:left-4 sm:h-8 sm:w-8",
            index === 2 && "left-1 top-3 z-10 h-7 w-7 sm:top-4 sm:h-8 sm:w-8"
          )}
        >
          <PickerThumbnail path={path} size="grid" shape="circle" className="h-full w-full border-0" />
        </span>
      ))}
      {paths.length > 3 ? (
        <span className="absolute -bottom-0.5 -right-0.5 z-40 rounded-full bg-[var(--bfml-primary)] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-[var(--bfml-primary-foreground)]">
          +{paths.length - 3}
        </span>
      ) : null}
    </span>
  );
}
