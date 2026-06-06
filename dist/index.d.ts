import * as react from 'react';

type MediaLibraryThemeMode$1 = "sync" | "light" | "dark";

type MediaFile = {
    name: string;
    path: string;
    url: string;
    size: number;
    mimeType: string;
    updatedAt: string;
};
type MediaFolder = {
    name: string;
    path: string;
};
type MediaCapabilities = {
    view: boolean;
    upload: boolean;
    createFolder: boolean;
    delete: boolean;
    rename: boolean;
    select: boolean;
};
declare const defaultMediaCapabilities: MediaCapabilities;
type MediaListing = {
    path: string;
    folders: MediaFolder[];
    files: MediaFile[];
    capabilities?: MediaCapabilities;
};
/**
 * Configure API endpoints for your backend.
 * See README.md for the required request/response contract.
 */
type MediaLibraryConfig = {
    listUrl: string;
    uploadUrl: string;
    createFolderUrl: string;
    updateUrl: string;
    deleteUrl: string;
    rootLabel?: string;
    /** `sync` inherits host CSS variables (default). Use `light` or `dark` for standalone theming. */
    theme?: MediaLibraryThemeMode$1;
};
declare const defaultMediaLibraryConfig: MediaLibraryConfig;
type MediaLibraryPanelProps = {
    /** When false, the panel does not load or render. */
    active?: boolean;
    config?: Partial<MediaLibraryConfig>;
    theme?: MediaLibraryThemeMode$1;
    title?: string;
    description?: string;
    accept?: Array<"image" | "pdf">;
    variant?: "modal" | "embedded";
    /** Show selection footer with Done button (picker flow). */
    selectable?: boolean;
    onClose?: () => void;
    onSelect?: (file: MediaFile) => void;
    className?: string;
};
type MediaLibraryWidgetProps = {
    /** CSS width, e.g. `"100%"`, `800`, or `"70vw"`. Default `"100%"`. */
    width?: string | number;
    /** CSS height, e.g. `640`, `"600px"`, or `"70vh"`. Default `640`. */
    height?: string | number;
    config?: Partial<MediaLibraryConfig>;
    theme?: MediaLibraryThemeMode$1;
    title?: string;
    description?: string;
    accept?: Array<"image" | "pdf">;
    selectable?: boolean;
    onSelect?: (file: MediaFile) => void;
    className?: string;
};
type MediaLibraryModalProps = {
    open: boolean;
    onClose: () => void;
    onSelect: (file: MediaFile) => void;
    config?: Partial<MediaLibraryConfig>;
    theme?: MediaLibraryThemeMode$1;
    title?: string;
    description?: string;
    accept?: Array<"image" | "pdf">;
};
type MediaPickerProps = {
    name: string;
    label?: string;
    title?: string;
    description?: string;
    previewTitle?: string;
    previewDescription?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (path: string) => void;
    config?: Partial<MediaLibraryConfig>;
    theme?: MediaLibraryThemeMode$1;
    accept?: Array<"image" | "pdf">;
    className?: string;
};
type MediaPickerMultiProps = {
    name: string;
    label?: string;
    title?: string;
    description?: string;
    max?: number;
    values?: string[];
    defaultValues?: string[];
    onChange?: (paths: string[]) => void;
    config?: Partial<MediaLibraryConfig>;
    theme?: MediaLibraryThemeMode$1;
    accept?: Array<"image" | "pdf">;
    className?: string;
};

declare function createMediaLibraryClient(config?: Partial<MediaLibraryConfig>): {
    list(path?: string, q?: string): Promise<MediaListing>;
    createFolder(path: string, name: string, nested?: boolean): Promise<{
        name: string;
        path: string;
    }>;
    upload(path: string, files: File[]): Promise<MediaFile[]>;
    uploadOne(path: string, file: File): Promise<MediaFile>;
    rename(path: string, newName: string, type: "file" | "folder"): Promise<MediaFile | {
        name: string;
        path: string;
    }>;
    remove(path: string, type: "file" | "folder"): Promise<{
        path: string;
    }>;
};
declare const MAX_MEDIA_UPLOAD_BYTES: number;
declare function isFileWithinUploadSizeLimit(file: File, maxBytes?: number): boolean;
declare function formatUploadSizeLimit(maxBytes?: number): string;
declare function fileMatchesAccept(file: MediaFile, accept?: Array<"image" | "pdf">): boolean;
declare function fileMatchesAcceptForUpload(file: File, accept?: Array<"image" | "pdf">): boolean;
declare function fileNameFromPath(path: string): string;
declare function isImagePath(path: string): boolean;

declare function MediaLibraryModal({ open, onClose, onSelect, config, theme, title, description, accept }: MediaLibraryModalProps): react.ReactPortal | null;
declare function MediaPreview({ path, alt }: {
    path: string;
    alt?: string;
}): react.JSX.Element;

declare function MediaLibraryPanel({ active, config, theme, title, description, accept, variant, selectable, onClose, onSelect, className }: MediaLibraryPanelProps): react.JSX.Element | null;

declare function MediaLibraryWidget({ width, height, config, theme, title, description, accept, selectable, onSelect, className }: MediaLibraryWidgetProps): react.JSX.Element;

declare function MediaPicker({ name, label, title, description, previewTitle, previewDescription, value, defaultValue, onChange, config, theme, accept, className }: MediaPickerProps): react.JSX.Element;

declare function MediaPickerMulti({ name, label, title, description, max, values, defaultValues, onChange, config, theme, accept, className }: MediaPickerMultiProps): react.JSX.Element;

type MediaLibraryThemeMode = "sync" | "light" | "dark";
declare function bfmlRootProps(theme?: MediaLibraryThemeMode): {
    "data-theme"?: "light" | "dark" | undefined;
    className: string;
};
declare function resolveThemeMode(theme?: MediaLibraryThemeMode): MediaLibraryThemeMode;

export { MAX_MEDIA_UPLOAD_BYTES, type MediaCapabilities, type MediaFile, type MediaFolder, type MediaLibraryConfig, MediaLibraryModal, type MediaLibraryModalProps, MediaLibraryPanel, type MediaLibraryPanelProps, type MediaLibraryThemeMode$1 as MediaLibraryThemeMode, MediaLibraryWidget, type MediaLibraryWidgetProps, type MediaListing, MediaPicker, MediaPickerMulti, type MediaPickerMultiProps, type MediaPickerProps, MediaPreview, bfmlRootProps, createMediaLibraryClient, defaultMediaCapabilities, defaultMediaLibraryConfig, fileMatchesAccept, fileMatchesAcceptForUpload, fileNameFromPath, formatUploadSizeLimit, isFileWithinUploadSizeLimit, isImagePath, resolveThemeMode };
