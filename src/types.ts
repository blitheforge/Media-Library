import type { MediaLibraryThemeMode } from "./theme";

export type MediaFile = {
  name: string;
  path: string;
  url: string;
  size: number;
  mimeType: string;
  updatedAt: string;
};

export type MediaFolder = {
  name: string;
  path: string;
};

export type MediaCapabilities = {
  view: boolean;
  upload: boolean;
  createFolder: boolean;
  delete: boolean;
  rename: boolean;
  select: boolean;
};

export const defaultMediaCapabilities: MediaCapabilities = {
  view: true,
  upload: true,
  createFolder: true,
  delete: true,
  rename: true,
  select: true
};

export type MediaListing = {
  path: string;
  folders: MediaFolder[];
  files: MediaFile[];
  capabilities?: MediaCapabilities;
};

/**
 * Configure API endpoints for your backend.
 * See README.md for the required request/response contract.
 */
export type MediaLibraryConfig = {
  listUrl: string;
  uploadUrl: string;
  createFolderUrl: string;
  updateUrl: string;
  deleteUrl: string;
  rootLabel?: string;
  /** `sync` inherits host CSS variables (default). Use `light` or `dark` for standalone theming. */
  theme?: MediaLibraryThemeMode;
};

export const defaultMediaLibraryConfig: MediaLibraryConfig = {
  listUrl: "/api/media",
  uploadUrl: "/api/media/upload",
  createFolderUrl: "/api/media/folders",
  updateUrl: "/api/media",
  deleteUrl: "/api/media",
  rootLabel: "Root"
};

export type MediaLibraryPanelProps = {
  /** When false, the panel does not load or render. */
  active?: boolean;
  config?: Partial<MediaLibraryConfig>;
  theme?: MediaLibraryThemeMode;
  title?: string;
  description?: string;
  accept?: Array<"image" | "pdf">;
  variant?: "modal" | "embedded";
  /** Show selection footer with Done button (picker flow). */
  selectable?: boolean;
  /** Close modal after selecting a file. Default true. */
  closeOnSelect?: boolean;
  /** `multi` allows selecting several files before confirming. Default `single`. */
  selectionMode?: "single" | "multi";
  /** Max files that can be added in one modal session (multi mode). */
  maxSelections?: number;
  /** After upload completes, add uploaded files and close (multi picker). */
  autoSelectUploads?: boolean;
  onClose?: () => void;
  onSelect?: (file: MediaFile) => void;
  onSelectMany?: (files: MediaFile[]) => void;
  className?: string;
};

export type MediaLibraryWidgetProps = {
  /** CSS width, e.g. `"100%"`, `800`, or `"70vw"`. Default `"100%"`. */
  width?: string | number;
  /** CSS height, e.g. `640`, `"600px"`, or `"70vh"`. Default `640`. */
  height?: string | number;
  config?: Partial<MediaLibraryConfig>;
  theme?: MediaLibraryThemeMode;
  title?: string;
  description?: string;
  accept?: Array<"image" | "pdf">;
  selectable?: boolean;
  onSelect?: (file: MediaFile) => void;
  className?: string;
};

export type MediaLibraryModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect?: (file: MediaFile) => void;
  onSelectMany?: (files: MediaFile[]) => void;
  closeOnSelect?: boolean;
  selectionMode?: "single" | "multi";
  maxSelections?: number;
  autoSelectUploads?: boolean;
  config?: Partial<MediaLibraryConfig>;
  theme?: MediaLibraryThemeMode;
  title?: string;
  description?: string;
  accept?: Array<"image" | "pdf">;
};

export type MediaPickerProps = {
  name: string;
  label?: string;
  title?: string;
  description?: string;
  /** @deprecated Preview is shown inline in the picker button. */
  previewTitle?: string;
  /** @deprecated Preview is shown inline in the picker button. */
  previewDescription?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (path: string) => void;
  config?: Partial<MediaLibraryConfig>;
  theme?: MediaLibraryThemeMode;
  accept?: Array<"image" | "pdf">;
  className?: string;
};

export type MediaPickerMultiProps = {
  name: string;
  label?: string;
  title?: string;
  description?: string;
  max?: number;
  values?: string[];
  defaultValues?: string[];
  onChange?: (paths: string[]) => void;
  config?: Partial<MediaLibraryConfig>;
  theme?: MediaLibraryThemeMode;
  accept?: Array<"image" | "pdf">;
  className?: string;
};
