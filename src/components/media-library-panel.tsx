import { useEffect, useMemo, useRef, useState, type DragEvent, type MouseEvent } from "react";
import { ChevronRight, Folder, ImagePlus, LoaderCircle, PanelLeft, Search, Trash2, Upload, X } from "lucide-react";
import { Button } from "./ui/button";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { Input } from "./ui/input";
import { ToastContainer } from "./ui/toast-container";
import { UploadPreviewCard, type UploadQueueItem } from "./upload-preview";
import { cn } from "../utils/cn";
import { bfmlRootProps, resolveThemeMode } from "../utils/bfml-theme";
import {
  buildBreadcrumb,
  createQueueId,
  isPathInside,
  parentPath,
  type DeleteTarget
} from "../utils/media-library-utils";
import { toastError, toastSuccess, toastWarning } from "../utils/toast-store";
import {
  createMediaLibraryClient,
  fileMatchesAccept,
  fileMatchesAcceptForUpload,
  formatUploadSizeLimit,
  isFileWithinUploadSizeLimit
} from "../client";
import type { MediaCapabilities, MediaFile, MediaFolder, MediaLibraryPanelProps } from "../types";
import { defaultMediaCapabilities, defaultMediaLibraryConfig } from "../types";

export function MediaLibraryPanel({
  active = true,
  config,
  theme,
  title = "Media Library",
  description = "Create folders, upload files, and choose media.",
  accept,
  variant = "embedded",
  selectable = false,
  closeOnSelect = true,
  selectionMode = "single",
  maxSelections,
  autoSelectUploads = false,
  onClose,
  onSelect,
  onSelectMany,
  className
}: MediaLibraryPanelProps) {
  const client = useMemo(() => createMediaLibraryClient(config), [config]);
  const resolved = useMemo(() => ({ ...defaultMediaLibraryConfig, ...config }), [config]);
  const themeMode = resolveThemeMode(theme ?? resolved.theme);
  const rootProps = bfmlRootProps(themeMode);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const [currentPath, setCurrentPath] = useState("");
  const [search, setSearch] = useState("");
  const [folderName, setFolderName] = useState("");
  const [nestedFolder, setNestedFolder] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [capabilities, setCapabilities] = useState<MediaCapabilities>(defaultMediaCapabilities);
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [folders, setFolders] = useState<Array<{ name: string; path: string }>>([]);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [selected, setSelected] = useState<MediaFile | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function load(path = currentPath, q = search, options?: { silent?: boolean }) {
    if (!options?.silent) setLoading(true);
    try {
      const listing = await client.list(path, q);
      setCurrentPath(listing.path);
      setFolders(listing.folders);
      setFiles(listing.files.filter((file) => fileMatchesAccept(file, accept)));
      setCapabilities({ ...defaultMediaCapabilities, ...listing.capabilities });
    } catch (caught) {
      toastError(caught instanceof Error ? caught.message : "Failed to load media.");
    } finally {
      if (!options?.silent) setLoading(false);
    }
  }

  function clearUploadQueue() {
    setUploadQueue((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
  }

  useEffect(() => {
    if (!active) return;
    setSelected(null);
    setSelectedFiles([]);
    setDeleteTarget(null);
    setSidebarOpen(false);
    clearUploadQueue();
    setDragActive(false);
    dragCounterRef.current = 0;
    setSearch("");
    void load("", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    if (!active || variant !== "modal" || !onClose) return;
    const handleClose = onClose;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (deleteTarget && !deleting) {
        setDeleteTarget(null);
        return;
      }
      handleClose();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [active, deleteTarget, deleting, onClose, variant]);

  async function createFolder() {
    if (!capabilities.createFolder) {
      toastError("You do not have permission to create folders.");
      return;
    }
    const name = folderName.trim();
    if (!name) {
      toastError("Enter a folder name.");
      return;
    }
    try {
      await client.createFolder(currentPath, name, nestedFolder);
      setFolderName("");
      await load(currentPath, search);
      toastSuccess(`Folder "${name}" created.`);
    } catch (caught) {
      toastError(caught instanceof Error ? caught.message : "Failed to create folder.");
    }
  }

  async function processFiles(incoming: File[]) {
    if (!capabilities.upload || incoming.length === 0 || uploading) return;

    const sizeLimit = formatUploadSizeLimit();
    const accepted: File[] = [];
    let invalidTypeCount = 0;

    for (const file of incoming) {
      if (!fileMatchesAcceptForUpload(file, accept)) {
        invalidTypeCount += 1;
        continue;
      }
      if (!isFileWithinUploadSizeLimit(file)) {
        toastWarning(`"${file.name}" exceeds ${sizeLimit} and was skipped.`);
        continue;
      }
      accepted.push(file);
    }

    if (invalidTypeCount > 0) {
      toastError(`${invalidTypeCount} file(s) were skipped due to type restrictions.`);
    }
    if (accepted.length === 0) return;

    const queue: UploadQueueItem[] = accepted.map((file) => ({
      id: createQueueId(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: "pending"
    }));

    setUploadQueue(queue);
    setUploading(true);

    const uploadedFiles: MediaFile[] = [];
    let successCount = 0;
    for (const item of queue) {
      setUploadQueue((current) =>
        current.map((entry) => (entry.id === item.id ? { ...entry, status: "uploading" } : entry))
      );

      try {
        const uploaded = await client.uploadOne(currentPath, item.file);
        uploadedFiles.push(uploaded);
        successCount += 1;
        URL.revokeObjectURL(item.previewUrl);
        setUploadQueue((current) => current.filter((entry) => entry.id !== item.id));
        await load(currentPath, search, { silent: true });
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : "Upload failed.";
        URL.revokeObjectURL(item.previewUrl);
        setUploadQueue((current) => current.filter((entry) => entry.id !== item.id));
        if (/5\s*mb|too large|file size/i.test(message)) {
          toastWarning(`"${item.file.name}" exceeds ${sizeLimit} and was skipped.`);
        } else {
          toastError(`${item.file.name}: ${message}`);
        }
      }
    }

    if (successCount > 0) {
      toastSuccess(successCount === 1 ? "File uploaded successfully." : `${successCount} files uploaded successfully.`);
      if (autoSelectUploads && onSelectMany && uploadedFiles.length > 0) {
        const limit = maxSelections ?? uploadedFiles.length;
        onSelectMany(uploadedFiles.slice(0, limit));
        onClose?.();
      }
    }

    setUploading(false);
    if (uploadInputRef.current) uploadInputRef.current.value = "";
  }

  async function uploadFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    await processFiles(Array.from(fileList));
  }

  function handleDragEnter(event: DragEvent) {
    event.preventDefault();
    if (!capabilities.upload) return;
    dragCounterRef.current += 1;
    setDragActive(true);
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setDragActive(false);
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragCounterRef.current = 0;
    setDragActive(false);
    if (!capabilities.upload) return;
    void processFiles(Array.from(event.dataTransfer.files ?? []));
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await client.remove(deleteTarget.path, deleteTarget.type);
      if (deleteTarget.type === "file" && selected?.path === deleteTarget.path) {
        setSelected(null);
      }
      const reloadPath =
        deleteTarget.type === "folder" && isPathInside(currentPath, deleteTarget.path)
          ? parentPath(deleteTarget.path)
          : currentPath;
      const deletedName = deleteTarget.name;
      const deletedType = deleteTarget.type;
      setDeleteTarget(null);
      await load(reloadPath, search);
      toastSuccess(deletedType === "folder" ? `Folder "${deletedName}" deleted.` : `File "${deletedName}" deleted.`);
    } catch (caught) {
      toastError(caught instanceof Error ? caught.message : "Delete failed.");
    } finally {
      setDeleting(false);
    }
  }

  function requestDelete(target: DeleteTarget, event?: MouseEvent) {
    if (!capabilities.delete) {
      toastError("You do not have permission to delete media.");
      return;
    }
    event?.preventDefault();
    event?.stopPropagation();
    setDeleteTarget(target);
  }

  function navigateTo(path: string) {
    void load(path, search);
    setSidebarOpen(false);
  }

  function toggleFileSelection(file: MediaFile) {
    setSelectedFiles((current) => {
      const exists = current.some((item) => item.path === file.path);
      if (exists) {
        return current.filter((item) => item.path !== file.path);
      }
      const limit = maxSelections ?? Number.POSITIVE_INFINITY;
      if (current.length >= limit) {
        toastWarning(`You can add up to ${limit} file${limit === 1 ? "" : "s"} at a time.`);
        return current;
      }
      return [...current, file];
    });
    setSelected(file);
  }

  function confirmSelection() {
    if (selectionMode === "multi" && onSelectMany) {
      if (selectedFiles.length === 0) return;
      onSelectMany(selectedFiles);
      onClose?.();
      return;
    }
    if (!selected) return;
    onSelect?.(selected);
    if (closeOnSelect) onClose?.();
    else setSelected(null);
  }

  function handleFileClick(file: MediaFile) {
    if (selectionMode === "multi" && onSelectMany) {
      toggleFileSelection(file);
      return;
    }
    setSelected(file);
    if (!selectable && onSelect) {
      onSelect(file);
    }
  }

  function handleFileDoubleClick(file: MediaFile) {
    if (selectionMode === "multi" && onSelectMany) {
      onSelectMany([file]);
      onClose?.();
      return;
    }
    setSelected(file);
    if (selectable) {
      onSelect?.(file);
      if (closeOnSelect) onClose?.();
      else setSelected(null);
    } else if (onSelect) {
      onSelect(file);
    }
  }

  if (!active) return null;

  const crumbs = buildBreadcrumb(currentPath, resolved.rootLabel ?? "Root");
  const sidebarFolders = [{ name: resolved.rootLabel ?? "Root", path: "" }, ...folders];
  const showFooter = selectable;
  const isMultiSelect = selectionMode === "multi" && Boolean(onSelectMany);
  const footerSelectionCount = isMultiSelect ? selectedFiles.length : selected ? 1 : 0;
  const footerCanConfirm = isMultiSelect ? selectedFiles.length > 0 : Boolean(selected);
  const showCloseButton = variant === "modal" && Boolean(onClose);

  const sidebarFolderList = (
    <div className="mt-4 space-y-1 lg:mt-5">
      {sidebarFolders.map((folder) => {
        const folderActive = folder.path === currentPath;
        const canDelete = Boolean(folder.path) && capabilities.delete;
        return (
          <div
            key={folder.path || "root"}
            className={cn(
              "flex items-center gap-1 rounded-lg transition",
              folderActive ? "bg-[var(--bfml-primary)]" : "hover:bg-[var(--bfml-surface)]"
            )}
          >
            <button
              type="button"
              onClick={() => navigateTo(folder.path)}
              className={cn(
                "flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5 text-left text-sm font-medium transition",
                folderActive ? "text-[var(--bfml-primary-foreground)]" : "text-[var(--bfml-foreground)]"
              )}
            >
              <Folder className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{folder.name}</span>
            </button>
            {canDelete ? (
              <button
                type="button"
                title="Delete folder"
                className={cn(
                  "mr-1 rounded-md p-1.5 transition",
                  folderActive
                    ? "text-[var(--bfml-primary-foreground)] hover:bg-[var(--bfml-primary-foreground)]/15"
                    : "text-[var(--bfml-destructive)] hover:bg-[var(--bfml-destructive-soft)]"
                )}
                onClick={(event) => requestDelete({ path: folder.path, name: folder.name, type: "folder" }, event)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );

  return (
    <section
      {...rootProps}
      className={cn(
        rootProps.className,
        "relative flex h-full min-h-0 flex-col overflow-hidden bg-[var(--bfml-surface)]",
        variant === "modal" &&
          "h-[100dvh] w-full max-w-none border-0 shadow-[var(--bfml-shadow-lg)] sm:h-[min(92vh,760px)] sm:max-w-6xl sm:rounded-2xl sm:border sm:border-[var(--bfml-border)]",
        variant === "embedded" && "rounded-none border-0 shadow-none",
        className
      )}
    >
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--bfml-border)] px-4 py-3 sm:gap-4 sm:px-6 sm:py-5">
        <div className="min-w-0 pr-2">
          <h2 className="truncate text-base font-semibold text-[var(--bfml-foreground)] sm:text-lg">{title}</h2>
          {description ? (
            <p className="mt-1 hidden text-sm text-[var(--bfml-muted-foreground)] sm:block">{description}</p>
          ) : null}
        </div>
        {showCloseButton ? (
          <Button type="button" variant="ghost" className="h-10 w-10 shrink-0 px-0" onClick={onClose} aria-label="Close media library">
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        ) : null}
      </header>

      <ToastContainer theme={themeMode} />

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden lg:grid lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,240px)_1fr] lg:grid-rows-1">
        {sidebarOpen ? (
          <button
            type="button"
            className="absolute inset-0 z-20 lg:hidden"
            style={{ backgroundColor: "var(--bfml-overlay)" }}
            aria-label="Close folders panel"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <aside
          className={cn(
            "absolute inset-y-0 left-0 z-30 flex w-[min(88vw,280px)] flex-col overflow-y-auto border-r border-[var(--bfml-border)] bg-[var(--bfml-surface-soft)] p-4 shadow-xl transition-transform duration-200 ease-out lg:static lg:z-auto lg:h-full lg:min-h-0 lg:w-auto lg:translate-x-0 lg:shadow-none",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="mb-3 flex items-center justify-between lg:hidden">
            <p className="text-sm font-semibold text-[var(--bfml-foreground)]">Folders</p>
            <Button type="button" variant="ghost" className="h-9 w-9 px-0" onClick={() => setSidebarOpen(false)} aria-label="Close folders panel">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {capabilities.createFolder ? (
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={folderName}
                  onChange={(event) => setFolderName(event.target.value)}
                  placeholder="new-folder"
                  className="min-w-0"
                />
                <Button type="button" variant="secondary" className="shrink-0 sm:px-4" onClick={createFolder}>
                  Add
                </Button>
              </div>
              <label className="flex items-start gap-2 text-xs leading-5 text-[var(--bfml-muted-foreground)]">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={nestedFolder}
                  onChange={(event) => setNestedFolder(event.target.checked)}
                />
                <span>Create as nested folder of current path</span>
              </label>
            </div>
          ) : null}

          {sidebarFolderList}
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-3 sm:p-5 lg:h-full lg:min-h-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button
              type="button"
              variant="secondary"
              className="shrink-0 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open folders panel"
            >
              <PanelLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Folders</span>
            </Button>

            <div className="relative min-w-0 flex-1 basis-[180px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bfml-muted-foreground)]" />
              <Input
                className="pl-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void load(currentPath, search);
                }}
                placeholder="Search files"
              />
            </div>

            <input
              ref={uploadInputRef}
              type="file"
              multiple
              className="hidden"
              accept={accept?.includes("pdf") ? "image/*,application/pdf" : "image/*"}
              onChange={(event) => void uploadFiles(event.target.files)}
            />
            {capabilities.upload ? (
              <Button
                type="button"
                disabled={uploading}
                className="w-full shrink-0 sm:w-auto"
                onClick={() => uploadInputRef.current?.click()}
                aria-label="Upload files"
              >
                {uploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                <span className="sm:inline">Upload</span>
              </Button>
            ) : null}
          </div>

          <div className="-mx-1 mt-3 flex items-center gap-1 overflow-x-auto px-1 pb-1 text-sm sm:mt-4">
            {crumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  className={cn(
                    "max-w-[9rem] truncate rounded px-1.5 py-1 font-medium transition sm:max-w-none",
                    index === crumbs.length - 1
                      ? "text-[var(--bfml-primary)]"
                      : "text-[var(--bfml-muted-foreground)] hover:text-[var(--bfml-foreground)]"
                  )}
                  onClick={() => navigateTo(crumb.path)}
                >
                  {crumb.label}
                </button>
                {index < crumbs.length - 1 ? (
                  <ChevronRight className="h-4 w-4 shrink-0 text-[var(--bfml-muted-foreground)]" />
                ) : null}
              </div>
            ))}
          </div>

          <div
            className={cn(
              "relative mt-3 min-h-0 flex-1 overflow-y-auto sm:mt-4",
              dragActive && capabilities.upload && "rounded-xl ring-2 ring-[var(--bfml-primary)] ring-offset-2 ring-offset-[var(--bfml-surface)]"
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {dragActive && capabilities.upload ? (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl border-2 border-dashed border-[var(--bfml-primary)] bg-[var(--bfml-primary-soft)]/80 px-4 text-center">
                <div>
                  <Upload className="mx-auto mb-2 h-8 w-8 text-[var(--bfml-primary)]" />
                  <p className="text-sm font-semibold text-[var(--bfml-foreground)]">Drop files to upload</p>
                  <p className="mt-1 text-xs text-[var(--bfml-muted-foreground)]">Files upload one by one</p>
                </div>
              </div>
            ) : null}

            {loading && uploadQueue.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-sm text-[var(--bfml-muted-foreground)] sm:h-40">
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Loading media...
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {uploadQueue.map((item) => (
                  <UploadPreviewCard key={item.id} item={item} />
                ))}

                {folders.map((folder: MediaFolder) => (
                  <div
                    key={folder.path}
                    className="group relative rounded-xl border border-[var(--bfml-border)] bg-[var(--bfml-surface-soft)] transition hover:border-[var(--bfml-primary-border)]"
                  >
                    <button
                      type="button"
                      onDoubleClick={() => navigateTo(folder.path)}
                      onClick={() => navigateTo(folder.path)}
                      className="block w-full p-3 text-left sm:p-4"
                    >
                      <Folder className="h-7 w-7 text-[var(--bfml-primary)] sm:h-8 sm:w-8" />
                      <p className="mt-2 truncate text-sm font-medium text-[var(--bfml-foreground)] sm:mt-3">{folder.name}</p>
                      <p className="text-xs text-[var(--bfml-muted-foreground)]">Folder</p>
                    </button>
                    {capabilities.delete ? (
                      <button
                        type="button"
                        title="Delete folder"
                        className="absolute right-1.5 top-1.5 rounded-md border border-[var(--bfml-border)] bg-[var(--bfml-surface)] p-1.5 shadow-sm transition hover:bg-[var(--bfml-destructive-soft)] sm:right-2 sm:top-2"
                        onClick={(event) =>
                          requestDelete({ path: folder.path, name: folder.name, type: "folder" }, event)
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5 text-[var(--bfml-destructive)] sm:h-4 sm:w-4" />
                      </button>
                    ) : null}
                  </div>
                ))}

                {files.map((file) => {
                  const fileActive = isMultiSelect
                    ? selectedFiles.some((item) => item.path === file.path)
                    : selected?.path === file.path;
                  const isImage = file.mimeType.startsWith("image/");
                  return (
                    <div
                      key={file.path}
                      className={cn(
                        "group relative overflow-hidden rounded-xl border bg-[var(--bfml-surface)] transition",
                        fileActive && selectable
                          ? "border-[var(--bfml-primary)] ring-2 ring-[var(--bfml-primary-soft)]"
                          : "border-[var(--bfml-border)] hover:border-[var(--bfml-primary-border)]"
                      )}
                    >
                      <button
                        type="button"
                        className="block w-full p-2 text-left sm:p-3"
                        onClick={() => handleFileClick(file)}
                        onDoubleClick={() => handleFileDoubleClick(file)}
                      >
                        <div className="flex h-20 items-center justify-center overflow-hidden rounded-lg bg-[var(--bfml-surface-soft)] sm:h-28">
                          {isImage ? (
                            <img src={file.url} alt={file.name} className="h-full w-full object-contain" />
                          ) : (
                            <div className="text-xs font-semibold uppercase text-[var(--bfml-muted-foreground)]">PDF</div>
                          )}
                        </div>
                        <p className="mt-2 truncate text-sm font-medium text-[var(--bfml-foreground)] sm:mt-3">{file.name}</p>
                        <p className="text-xs text-[var(--bfml-muted-foreground)]">File</p>
                      </button>
                      {capabilities.delete ? (
                        <button
                          type="button"
                          title="Delete file"
                          className="absolute right-1.5 top-1.5 rounded-md border border-[var(--bfml-border)] bg-[var(--bfml-surface)] p-1.5 shadow-sm transition hover:bg-[var(--bfml-destructive-soft)] sm:right-2 sm:top-2"
                          onClick={(event) => requestDelete({ path: file.path, name: file.name, type: "file" }, event)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-[var(--bfml-destructive)] sm:h-4 sm:w-4" />
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && folders.length === 0 && files.length === 0 && uploadQueue.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--bfml-border)] px-4 text-center text-sm text-[var(--bfml-muted-foreground)] sm:h-40">
                <ImagePlus className="mb-2 h-6 w-6" />
                No files in this folder yet.
                {capabilities.upload ? <p className="mt-2 text-xs">Drag and drop files here or use Upload.</p> : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {showFooter ? (
        <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-[var(--bfml-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4">
          <p className="truncate text-center text-sm text-[var(--bfml-muted-foreground)] sm:text-left">
            {isMultiSelect
              ? footerSelectionCount === 0
                ? "Select one or more files"
                : `${footerSelectionCount} file${footerSelectionCount === 1 ? "" : "s"} selected`
              : `Selected: ${selected ? selected.name : "None"}`}
          </p>
          <Button type="button" className="w-full sm:w-auto" disabled={!footerCanConfirm} onClick={confirmSelection}>
            {isMultiSelect
              ? footerSelectionCount > 0
                ? `Add ${footerSelectionCount} file${footerSelectionCount === 1 ? "" : "s"}`
                : "Add files"
              : closeOnSelect
                ? "Done"
                : "Add"}
          </Button>
        </footer>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={deleteTarget?.type === "folder" ? "Delete folder?" : "Delete file?"}
        description={
          deleteTarget
            ? deleteTarget.type === "folder"
              ? `Are you sure you want to delete the folder "${deleteTarget.name}" and everything inside it? This action cannot be undone.`
              : `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        loading={deleting}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={() => void confirmDelete()}
        theme={themeMode}
      />
    </section>
  );
}
