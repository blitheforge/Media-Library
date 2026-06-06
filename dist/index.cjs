"use client";
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  MAX_MEDIA_UPLOAD_BYTES: () => MAX_MEDIA_UPLOAD_BYTES,
  MediaLibraryModal: () => MediaLibraryModal,
  MediaLibraryPanel: () => MediaLibraryPanel,
  MediaLibraryWidget: () => MediaLibraryWidget,
  MediaPicker: () => MediaPicker,
  MediaPickerMulti: () => MediaPickerMulti,
  MediaPreview: () => MediaPreview,
  bfmlRootProps: () => bfmlRootProps,
  createMediaLibraryClient: () => createMediaLibraryClient,
  defaultMediaCapabilities: () => defaultMediaCapabilities,
  defaultMediaLibraryConfig: () => defaultMediaLibraryConfig,
  fileMatchesAccept: () => fileMatchesAccept,
  fileMatchesAcceptForUpload: () => fileMatchesAcceptForUpload,
  fileNameFromPath: () => fileNameFromPath,
  formatUploadSizeLimit: () => formatUploadSizeLimit,
  isFileWithinUploadSizeLimit: () => isFileWithinUploadSizeLimit,
  isImagePath: () => isImagePath,
  resolveThemeMode: () => resolveThemeMode
});
module.exports = __toCommonJS(index_exports);

// src/types.ts
var defaultMediaCapabilities = {
  view: true,
  upload: true,
  createFolder: true,
  delete: true,
  rename: true,
  select: true
};
var defaultMediaLibraryConfig = {
  listUrl: "/api/media",
  uploadUrl: "/api/media/upload",
  createFolderUrl: "/api/media/folders",
  updateUrl: "/api/media",
  deleteUrl: "/api/media",
  rootLabel: "Root"
};

// src/client.ts
function resolveConfig(config) {
  return { ...defaultMediaLibraryConfig, ...config };
}
async function parseResponse(response) {
  const payload = await response.json();
  if (!payload.success) throw new Error(payload.error?.message ?? "Media request failed.");
  return payload.data;
}
function createMediaLibraryClient(config) {
  const urls = resolveConfig(config);
  return {
    async list(path = "", q = "") {
      const params = new URLSearchParams();
      if (path) params.set("path", path);
      if (q) params.set("q", q);
      const response = await fetch(`${urls.listUrl}?${params.toString()}`);
      return parseResponse(response);
    },
    async createFolder(path, name, nested = true) {
      const response = await fetch(urls.createFolderUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path, name, nested })
      });
      return parseResponse(response);
    },
    async upload(path, files) {
      const form = new FormData();
      form.set("path", path);
      files.forEach((file) => form.append("files", file));
      const response = await fetch(urls.uploadUrl, { method: "POST", body: form });
      return parseResponse(response);
    },
    async uploadOne(path, file) {
      const uploaded = await this.upload(path, [file]);
      return uploaded[0];
    },
    async rename(path, newName, type) {
      const response = await fetch(urls.updateUrl, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path, newName, type })
      });
      return parseResponse(response);
    },
    async remove(path, type) {
      const response = await fetch(urls.deleteUrl, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path, type })
      });
      return parseResponse(response);
    }
  };
}
var MAX_MEDIA_UPLOAD_BYTES = 5 * 1024 * 1024;
function isFileWithinUploadSizeLimit(file, maxBytes = MAX_MEDIA_UPLOAD_BYTES) {
  return file.size <= maxBytes;
}
function formatUploadSizeLimit(maxBytes = MAX_MEDIA_UPLOAD_BYTES) {
  return `${Math.round(maxBytes / (1024 * 1024))} MB`;
}
function fileMatchesAccept(file, accept) {
  if (!accept || accept.length === 0) return true;
  const isImage = file.mimeType.startsWith("image/");
  const isPdf = file.mimeType === "application/pdf";
  if (accept.includes("image") && isImage) return true;
  if (accept.includes("pdf") && isPdf) return true;
  return false;
}
function fileMatchesAcceptForUpload(file, accept) {
  if (!accept || accept.length === 0) return true;
  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf";
  if (accept.includes("image") && isImage) return true;
  if (accept.includes("pdf") && isPdf) return true;
  return false;
}
function fileNameFromPath(path) {
  return path.split("/").pop() ?? path;
}
function isImagePath(path) {
  return /\.(png|jpe?g|webp|gif)$/i.test(path);
}

// src/components/media-library-modal.tsx
var import_react_dom2 = require("react-dom");

// src/utils/cn.ts
var import_clsx = require("clsx");
var import_tailwind_merge = require("tailwind-merge");
function cn(...inputs) {
  return (0, import_tailwind_merge.twMerge)((0, import_clsx.clsx)(inputs));
}

// src/utils/bfml-theme.ts
function bfmlRootProps(theme = "sync") {
  return {
    className: "bfml-root",
    ...theme !== "sync" ? { "data-theme": theme } : {}
  };
}
function resolveThemeMode(theme) {
  return theme ?? "sync";
}

// src/components/media-library-panel.tsx
var import_react2 = require("react");
var import_lucide_react3 = require("lucide-react");

// src/components/ui/button.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var variants = {
  primary: "bg-[var(--bfml-primary)] text-[var(--bfml-primary-foreground)] shadow-[var(--bfml-shadow)] hover:brightness-95",
  secondary: "border border-[var(--bfml-border)] bg-[var(--bfml-surface)] text-[var(--bfml-foreground)] shadow-[var(--bfml-shadow)] hover:bg-[var(--bfml-surface-soft)]",
  danger: "bg-[var(--bfml-destructive)] text-[var(--bfml-primary-foreground)] hover:brightness-95",
  ghost: "bg-transparent text-[var(--bfml-muted-foreground)] hover:bg-[var(--bfml-surface-soft)] hover:text-[var(--bfml-foreground)]"
};
function Button({ className, variant = "primary", disabled, children, ...props }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "button",
    {
      className: cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className
      ),
      disabled,
      ...props,
      children
    }
  );
}

// src/components/ui/confirm-dialog.tsx
var import_react_dom = require("react-dom");
var import_jsx_runtime2 = require("react/jsx-runtime");
function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
  theme = "sync",
  onCancel,
  onConfirm
}) {
  if (!open || typeof document === "undefined") return null;
  const rootProps = bfmlRootProps(theme);
  return (0, import_react_dom.createPortal)(
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "div",
      {
        ...rootProps,
        className: cn(rootProps.className, "fixed inset-0 z-[10001] flex items-end justify-center p-0 backdrop-blur-sm sm:items-center sm:p-4"),
        style: { backgroundColor: "var(--bfml-overlay)" },
        role: "presentation",
        onClick: onCancel,
        children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
          "section",
          {
            role: "alertdialog",
            "aria-modal": "true",
            "aria-labelledby": "bfml-confirm-title",
            "aria-describedby": "bfml-confirm-description",
            className: "w-full max-w-md rounded-t-2xl border border-[var(--bfml-border)] bg-[var(--bfml-surface)] p-4 shadow-[var(--bfml-shadow-lg)] sm:rounded-2xl sm:p-6",
            onClick: (event) => event.stopPropagation(),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h3", { id: "bfml-confirm-title", className: "text-lg font-semibold text-[var(--bfml-foreground)]", children: title }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { id: "bfml-confirm-description", className: "mt-2 text-sm text-[var(--bfml-muted-foreground)]", children: description }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "mt-5 flex flex-col-reverse gap-2 sm:mt-6 sm:flex-row sm:justify-end", children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Button, { type: "button", variant: "secondary", disabled: loading, className: "w-full sm:w-auto", onClick: onCancel, children: cancelLabel }),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Button, { type: "button", variant: "danger", disabled: loading, className: "w-full sm:w-auto", onClick: onConfirm, children: loading ? "Deleting..." : confirmLabel })
              ] })
            ]
          }
        )
      }
    ),
    document.body
  );
}

// src/components/ui/input.tsx
var React = __toESM(require("react"), 1);
var import_jsx_runtime3 = require("react/jsx-runtime");
var Input = React.forwardRef(function Input2({ className, ...props }, ref) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    "input",
    {
      ref,
      className: cn(
        "h-11 w-full rounded-lg border border-[var(--bfml-border)] bg-[var(--bfml-surface)] px-4 text-sm text-[var(--bfml-foreground)] shadow-[var(--bfml-shadow)] outline-none transition placeholder:text-[var(--bfml-muted-foreground)] focus:border-[var(--bfml-primary-border)] focus:ring-4 focus:ring-[var(--bfml-primary-soft)]",
        className
      ),
      ...props
    }
  );
});

// src/components/ui/toast-container.tsx
var import_react = require("react");
var import_lucide_react = require("lucide-react");

// src/utils/toast-store.ts
var listeners = /* @__PURE__ */ new Set();
var toasts = [];
function emit() {
  listeners.forEach((listener) => listener([...toasts]));
}
function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
function dismissToast(id) {
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
}
function showToast(type, message, durationMs = 3500) {
  const id = createId();
  toasts = [...toasts, { id, type, message }];
  emit();
  window.setTimeout(() => dismissToast(id), durationMs);
}
function subscribeToasts(listener) {
  listeners.add(listener);
  listener([...toasts]);
  return () => {
    listeners.delete(listener);
  };
}
function toastSuccess(message) {
  showToast("success", message);
}
function toastError(message) {
  showToast("error", message);
}
function toastWarning(message) {
  showToast("warning", message);
}

// src/components/ui/toast-container.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
function ToastCard({ toast }) {
  const isSuccess = toast.type === "success";
  const isWarning = toast.type === "warning";
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
    "div",
    {
      role: "status",
      className: cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-[var(--bfml-shadow-lg)] transition",
        isSuccess ? "border-[var(--bfml-success)]/30 bg-[var(--bfml-success-soft)] text-[var(--bfml-success-foreground)]" : isWarning ? "border-[var(--bfml-warning)]/30 bg-[var(--bfml-warning-soft)] text-[var(--bfml-warning-foreground)]" : "border-[var(--bfml-destructive)]/30 bg-[var(--bfml-destructive-soft)] text-[var(--bfml-foreground)]"
      ),
      children: [
        isSuccess ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react.CheckCircle2, { className: "mt-0.5 h-4 w-4 shrink-0 text-[var(--bfml-success)]", "aria-hidden": "true" }) : isWarning ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react.TriangleAlert, { className: "mt-0.5 h-4 w-4 shrink-0 text-[var(--bfml-warning)]", "aria-hidden": "true" }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react.XCircle, { className: "mt-0.5 h-4 w-4 shrink-0 text-[var(--bfml-destructive)]", "aria-hidden": "true" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "min-w-0 flex-1 text-sm font-medium leading-5", children: toast.message }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "button",
          {
            type: "button",
            className: "rounded-md p-0.5 opacity-70 transition hover:opacity-100",
            "aria-label": "Dismiss notification",
            onClick: () => dismissToast(toast.id),
            children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react.X, { className: "h-4 w-4" })
          }
        )
      ]
    }
  );
}
function ToastContainer({ theme = "sync" }) {
  const [items, setItems] = (0, import_react.useState)([]);
  const rootProps = bfmlRootProps(theme);
  (0, import_react.useEffect)(() => {
    return subscribeToasts(setItems);
  }, []);
  if (items.length === 0) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
    "div",
    {
      ...rootProps,
      className: cn(rootProps.className, "pointer-events-none absolute right-3 top-3 z-[45] flex w-[min(100%,20rem)] flex-col items-end gap-2 sm:right-4 sm:top-4"),
      children: items.map((toast) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(ToastCard, { toast }, toast.id))
    }
  );
}

// src/components/upload-preview.tsx
var import_lucide_react2 = require("lucide-react");
var import_jsx_runtime5 = require("react/jsx-runtime");
function UploadPreviewCard({ item }) {
  const isImage = item.file.type.startsWith("image/");
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
    "div",
    {
      className: cn(
        "relative overflow-hidden rounded-xl border bg-[var(--bfml-surface)] p-2 sm:p-3",
        item.status === "done" ? "border-[var(--bfml-success)]/40" : item.status === "error" ? "border-[var(--bfml-destructive)]/40" : "border-[var(--bfml-border)]"
      ),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "relative flex h-20 items-center justify-center overflow-hidden rounded-lg bg-[var(--bfml-surface-soft)] sm:h-28", children: [
          isImage ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("img", { src: item.previewUrl, alt: item.file.name, className: "h-full w-full object-contain opacity-80" }) : /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "text-xs font-semibold uppercase text-[var(--bfml-muted-foreground)]", children: "PDF" }),
          item.status === "pending" || item.status === "uploading" ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
            "div",
            {
              className: "absolute inset-0 flex flex-col items-center justify-center gap-2 px-2 text-[var(--bfml-primary-foreground)]",
              style: { backgroundColor: "var(--bfml-overlay)" },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_lucide_react2.LoaderCircle, { className: "h-6 w-6 animate-spin" }),
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "text-xs font-medium", children: item.status === "uploading" ? "Uploading..." : "Waiting..." })
              ]
            }
          ) : null,
          item.status === "done" ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "div",
            {
              className: "absolute inset-0 flex items-center justify-center",
              style: { backgroundColor: "color-mix(in srgb, var(--bfml-success) 25%, transparent)" },
              children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_lucide_react2.CheckCircle2, { className: "h-8 w-8 text-[var(--bfml-success)]" })
            }
          ) : null,
          item.status === "error" ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "div",
            {
              className: "absolute inset-0 flex items-center justify-center",
              style: { backgroundColor: "color-mix(in srgb, var(--bfml-destructive) 25%, transparent)" },
              children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_lucide_react2.XCircle, { className: "h-8 w-8 text-[var(--bfml-destructive)]" })
            }
          ) : null
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "mt-2 truncate text-sm font-medium text-[var(--bfml-foreground)]", children: item.file.name }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "truncate text-xs text-[var(--bfml-muted-foreground)]", children: item.status === "error" ? item.error ?? "Upload failed" : item.status === "done" ? "Uploaded" : "In queue" })
      ]
    }
  );
}

// src/utils/media-library-utils.ts
function parentPath(path) {
  const segments = path.split("/").filter(Boolean);
  segments.pop();
  return segments.join("/");
}
function isPathInside(path, folderPath) {
  return path === folderPath || path.startsWith(`${folderPath}/`);
}
function buildBreadcrumb(path, rootLabel) {
  const segments = path ? path.split("/").filter(Boolean) : [];
  const crumbs = [{ label: rootLabel, path: "" }];
  segments.forEach((segment, index) => {
    crumbs.push({ label: segment, path: segments.slice(0, index + 1).join("/") });
  });
  return crumbs;
}
function createQueueId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
function toCssSize(value) {
  if (value === void 0) return void 0;
  if (typeof value === "number") return `${value}px`;
  const trimmed = value.trim();
  if (/^calc\s*\(/i.test(trimmed) || /^var\s*\(/i.test(trimmed)) return trimmed;
  if (/^[\d.]+\s*(vh|vw|vmin|vmax|%|px|rem|em)\s*[-+]\s*[\d.]+/i.test(trimmed)) {
    const normalized = trimmed.replace(/\s*([+-])\s*/g, " $1 ");
    return `calc(${normalized})`;
  }
  return trimmed;
}

// src/components/media-library-panel.tsx
var import_jsx_runtime6 = require("react/jsx-runtime");
function MediaLibraryPanel({
  active = true,
  config,
  theme,
  title = "Media Library",
  description = "Create folders, upload files, and choose media.",
  accept,
  variant = "embedded",
  selectable = false,
  onClose,
  onSelect,
  className
}) {
  const client = (0, import_react2.useMemo)(() => createMediaLibraryClient(config), [config]);
  const resolved = (0, import_react2.useMemo)(() => ({ ...defaultMediaLibraryConfig, ...config }), [config]);
  const themeMode = resolveThemeMode(theme ?? resolved.theme);
  const rootProps = bfmlRootProps(themeMode);
  const uploadInputRef = (0, import_react2.useRef)(null);
  const dragCounterRef = (0, import_react2.useRef)(0);
  const [currentPath, setCurrentPath] = (0, import_react2.useState)("");
  const [search, setSearch] = (0, import_react2.useState)("");
  const [folderName, setFolderName] = (0, import_react2.useState)("");
  const [nestedFolder, setNestedFolder] = (0, import_react2.useState)(true);
  const [loading, setLoading] = (0, import_react2.useState)(false);
  const [uploading, setUploading] = (0, import_react2.useState)(false);
  const [dragActive, setDragActive] = (0, import_react2.useState)(false);
  const [capabilities, setCapabilities] = (0, import_react2.useState)(defaultMediaCapabilities);
  const [uploadQueue, setUploadQueue] = (0, import_react2.useState)([]);
  const [folders, setFolders] = (0, import_react2.useState)([]);
  const [files, setFiles] = (0, import_react2.useState)([]);
  const [selected, setSelected] = (0, import_react2.useState)(null);
  const [deleteTarget, setDeleteTarget] = (0, import_react2.useState)(null);
  const [deleting, setDeleting] = (0, import_react2.useState)(false);
  const [sidebarOpen, setSidebarOpen] = (0, import_react2.useState)(false);
  async function load(path = currentPath, q = search, options) {
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
  (0, import_react2.useEffect)(() => {
    if (!active) return;
    setSelected(null);
    setDeleteTarget(null);
    setSidebarOpen(false);
    clearUploadQueue();
    setDragActive(false);
    dragCounterRef.current = 0;
    setSearch("");
    void load("", "");
  }, [active]);
  (0, import_react2.useEffect)(() => {
    if (!active || variant !== "modal" || !onClose) return;
    const handleClose = onClose;
    function onKeyDown(event) {
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
  async function processFiles(incoming) {
    if (!capabilities.upload || incoming.length === 0 || uploading) return;
    const sizeLimit = formatUploadSizeLimit();
    const accepted = [];
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
    const queue = accepted.map((file) => ({
      id: createQueueId(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: "pending"
    }));
    setUploadQueue(queue);
    setUploading(true);
    let successCount = 0;
    for (const item of queue) {
      setUploadQueue(
        (current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "uploading" } : entry)
      );
      try {
        await client.uploadOne(currentPath, item.file);
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
    }
    setUploading(false);
    if (uploadInputRef.current) uploadInputRef.current.value = "";
  }
  async function uploadFiles(fileList) {
    if (!fileList?.length) return;
    await processFiles(Array.from(fileList));
  }
  function handleDragEnter(event) {
    event.preventDefault();
    if (!capabilities.upload) return;
    dragCounterRef.current += 1;
    setDragActive(true);
  }
  function handleDragLeave(event) {
    event.preventDefault();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setDragActive(false);
    }
  }
  function handleDragOver(event) {
    event.preventDefault();
  }
  function handleDrop(event) {
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
      const reloadPath = deleteTarget.type === "folder" && isPathInside(currentPath, deleteTarget.path) ? parentPath(deleteTarget.path) : currentPath;
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
  function requestDelete(target, event) {
    if (!capabilities.delete) {
      toastError("You do not have permission to delete media.");
      return;
    }
    event?.preventDefault();
    event?.stopPropagation();
    setDeleteTarget(target);
  }
  function navigateTo(path) {
    void load(path, search);
    setSidebarOpen(false);
  }
  function confirmSelection() {
    if (!selected) return;
    onSelect?.(selected);
    onClose?.();
  }
  function handleFileClick(file) {
    setSelected(file);
    if (!selectable && onSelect) {
      onSelect(file);
    }
  }
  function handleFileDoubleClick(file) {
    setSelected(file);
    if (selectable) {
      onSelect?.(file);
      onClose?.();
    } else if (onSelect) {
      onSelect(file);
    }
  }
  if (!active) return null;
  const crumbs = buildBreadcrumb(currentPath, resolved.rootLabel ?? "Root");
  const sidebarFolders = [{ name: resolved.rootLabel ?? "Root", path: "" }, ...folders];
  const showFooter = selectable;
  const showCloseButton = variant === "modal" && Boolean(onClose);
  const sidebarFolderList = /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "mt-4 space-y-1 lg:mt-5", children: sidebarFolders.map((folder) => {
    const folderActive = folder.path === currentPath;
    const canDelete = Boolean(folder.path) && capabilities.delete;
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
      "div",
      {
        className: cn(
          "flex items-center gap-1 rounded-lg transition",
          folderActive ? "bg-[var(--bfml-primary)]" : "hover:bg-[var(--bfml-surface)]"
        ),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
            "button",
            {
              type: "button",
              onClick: () => navigateTo(folder.path),
              className: cn(
                "flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5 text-left text-sm font-medium transition",
                folderActive ? "text-[var(--bfml-primary-foreground)]" : "text-[var(--bfml-foreground)]"
              ),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react3.Folder, { className: "h-4 w-4 shrink-0", "aria-hidden": "true" }),
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "truncate", children: folder.name })
              ]
            }
          ),
          canDelete ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            "button",
            {
              type: "button",
              title: "Delete folder",
              className: cn(
                "mr-1 rounded-md p-1.5 transition",
                folderActive ? "text-[var(--bfml-primary-foreground)] hover:bg-[var(--bfml-primary-foreground)]/15" : "text-[var(--bfml-destructive)] hover:bg-[var(--bfml-destructive-soft)]"
              ),
              onClick: (event) => requestDelete({ path: folder.path, name: folder.name, type: "folder" }, event),
              children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react3.Trash2, { className: "h-3.5 w-3.5" })
            }
          ) : null
        ]
      },
      folder.path || "root"
    );
  }) });
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
    "section",
    {
      ...rootProps,
      className: cn(
        rootProps.className,
        "relative flex h-full min-h-0 flex-col overflow-hidden bg-[var(--bfml-surface)]",
        variant === "modal" && "h-[100dvh] w-full max-w-none border-0 shadow-[var(--bfml-shadow-lg)] sm:h-[min(92vh,760px)] sm:max-w-6xl sm:rounded-2xl sm:border sm:border-[var(--bfml-border)]",
        variant === "embedded" && "rounded-none border-0 shadow-none",
        className
      ),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("header", { className: "flex shrink-0 items-start justify-between gap-3 border-b border-[var(--bfml-border)] px-4 py-3 sm:gap-4 sm:px-6 sm:py-5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "min-w-0 pr-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h2", { className: "truncate text-base font-semibold text-[var(--bfml-foreground)] sm:text-lg", children: title }),
            description ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "mt-1 hidden text-sm text-[var(--bfml-muted-foreground)] sm:block", children: description }) : null
          ] }),
          showCloseButton ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Button, { type: "button", variant: "ghost", className: "h-10 w-10 shrink-0 px-0", onClick: onClose, "aria-label": "Close media library", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react3.X, { className: "h-4 w-4", "aria-hidden": "true" }) }) : null
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(ToastContainer, { theme: themeMode }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "relative flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,240px)_1fr]", children: [
          sidebarOpen ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            "button",
            {
              type: "button",
              className: "absolute inset-0 z-20 lg:hidden",
              style: { backgroundColor: "var(--bfml-overlay)" },
              "aria-label": "Close folders panel",
              onClick: () => setSidebarOpen(false)
            }
          ) : null,
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
            "aside",
            {
              className: cn(
                "absolute inset-y-0 left-0 z-30 flex w-[min(88vw,280px)] flex-col overflow-y-auto border-r border-[var(--bfml-border)] bg-[var(--bfml-surface-soft)] p-4 shadow-xl transition-transform duration-200 ease-out lg:static lg:z-auto lg:w-auto lg:translate-x-0 lg:shadow-none",
                sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
              ),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "mb-3 flex items-center justify-between lg:hidden", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "text-sm font-semibold text-[var(--bfml-foreground)]", children: "Folders" }),
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Button, { type: "button", variant: "ghost", className: "h-9 w-9 px-0", onClick: () => setSidebarOpen(false), "aria-label": "Close folders panel", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react3.X, { className: "h-4 w-4" }) })
                ] }),
                capabilities.createFolder ? /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "space-y-3", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex flex-col gap-2 sm:flex-row", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                      Input,
                      {
                        value: folderName,
                        onChange: (event) => setFolderName(event.target.value),
                        placeholder: "new-folder",
                        className: "min-w-0"
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Button, { type: "button", variant: "secondary", className: "shrink-0 sm:px-4", onClick: createFolder, children: "Add" })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("label", { className: "flex items-start gap-2 text-xs leading-5 text-[var(--bfml-muted-foreground)]", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                      "input",
                      {
                        type: "checkbox",
                        className: "mt-0.5",
                        checked: nestedFolder,
                        onChange: (event) => setNestedFolder(event.target.checked)
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: "Create as nested folder of current path" })
                  ] })
                ] }) : null,
                sidebarFolderList
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex min-h-0 min-w-0 flex-1 flex-col p-3 sm:p-5", children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex flex-wrap items-center gap-2 sm:gap-3", children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
                Button,
                {
                  type: "button",
                  variant: "secondary",
                  className: "shrink-0 lg:hidden",
                  onClick: () => setSidebarOpen(true),
                  "aria-label": "Open folders panel",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react3.PanelLeft, { className: "h-4 w-4" }),
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "hidden sm:inline", children: "Folders" })
                  ]
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "relative min-w-0 flex-1 basis-[180px]", children: [
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react3.Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bfml-muted-foreground)]" }),
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                  Input,
                  {
                    className: "pl-9",
                    value: search,
                    onChange: (event) => setSearch(event.target.value),
                    onKeyDown: (event) => {
                      if (event.key === "Enter") void load(currentPath, search);
                    },
                    placeholder: "Search files"
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                "input",
                {
                  ref: uploadInputRef,
                  type: "file",
                  multiple: true,
                  className: "hidden",
                  accept: accept?.includes("pdf") ? "image/*,application/pdf" : "image/*",
                  onChange: (event) => void uploadFiles(event.target.files)
                }
              ),
              capabilities.upload ? /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
                Button,
                {
                  type: "button",
                  disabled: uploading,
                  className: "w-full shrink-0 sm:w-auto",
                  onClick: () => uploadInputRef.current?.click(),
                  "aria-label": "Upload files",
                  children: [
                    uploading ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react3.LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react3.Upload, { className: "h-4 w-4" }),
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "sm:inline", children: "Upload" })
                  ]
                }
              ) : null
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "-mx-1 mt-3 flex items-center gap-1 overflow-x-auto px-1 pb-1 text-sm sm:mt-4", children: crumbs.map((crumb, index) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex shrink-0 items-center gap-1", children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                "button",
                {
                  type: "button",
                  className: cn(
                    "max-w-[9rem] truncate rounded px-1.5 py-1 font-medium transition sm:max-w-none",
                    index === crumbs.length - 1 ? "text-[var(--bfml-primary)]" : "text-[var(--bfml-muted-foreground)] hover:text-[var(--bfml-foreground)]"
                  ),
                  onClick: () => navigateTo(crumb.path),
                  children: crumb.label
                }
              ),
              index < crumbs.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react3.ChevronRight, { className: "h-4 w-4 shrink-0 text-[var(--bfml-muted-foreground)]" }) : null
            ] }, crumb.path)) }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
              "div",
              {
                className: cn(
                  "relative mt-3 min-h-0 flex-1 overflow-y-auto sm:mt-4",
                  dragActive && capabilities.upload && "rounded-xl ring-2 ring-[var(--bfml-primary)] ring-offset-2 ring-offset-[var(--bfml-surface)]"
                ),
                onDragEnter: handleDragEnter,
                onDragLeave: handleDragLeave,
                onDragOver: handleDragOver,
                onDrop: handleDrop,
                children: [
                  dragActive && capabilities.upload ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl border-2 border-dashed border-[var(--bfml-primary)] bg-[var(--bfml-primary-soft)]/80 px-4 text-center", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react3.Upload, { className: "mx-auto mb-2 h-8 w-8 text-[var(--bfml-primary)]" }),
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "text-sm font-semibold text-[var(--bfml-foreground)]", children: "Drop files to upload" }),
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "mt-1 text-xs text-[var(--bfml-muted-foreground)]", children: "Files upload one by one" })
                  ] }) }) : null,
                  loading && uploadQueue.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex h-32 items-center justify-center text-sm text-[var(--bfml-muted-foreground)] sm:h-40", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react3.LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
                    "Loading media..."
                  ] }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4", children: [
                    uploadQueue.map((item) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(UploadPreviewCard, { item }, item.id)),
                    folders.map((folder) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
                      "div",
                      {
                        className: "group relative rounded-xl border border-[var(--bfml-border)] bg-[var(--bfml-surface-soft)] transition hover:border-[var(--bfml-primary-border)]",
                        children: [
                          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
                            "button",
                            {
                              type: "button",
                              onDoubleClick: () => navigateTo(folder.path),
                              onClick: () => navigateTo(folder.path),
                              className: "block w-full p-3 text-left sm:p-4",
                              children: [
                                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react3.Folder, { className: "h-7 w-7 text-[var(--bfml-primary)] sm:h-8 sm:w-8" }),
                                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "mt-2 truncate text-sm font-medium text-[var(--bfml-foreground)] sm:mt-3", children: folder.name }),
                                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "text-xs text-[var(--bfml-muted-foreground)]", children: "Folder" })
                              ]
                            }
                          ),
                          capabilities.delete ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                            "button",
                            {
                              type: "button",
                              title: "Delete folder",
                              className: "absolute right-1.5 top-1.5 rounded-md border border-[var(--bfml-border)] bg-[var(--bfml-surface)] p-1.5 shadow-sm transition hover:bg-[var(--bfml-destructive-soft)] sm:right-2 sm:top-2",
                              onClick: (event) => requestDelete({ path: folder.path, name: folder.name, type: "folder" }, event),
                              children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react3.Trash2, { className: "h-3.5 w-3.5 text-[var(--bfml-destructive)] sm:h-4 sm:w-4" })
                            }
                          ) : null
                        ]
                      },
                      folder.path
                    )),
                    files.map((file) => {
                      const fileActive = selected?.path === file.path;
                      const isImage = file.mimeType.startsWith("image/");
                      return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
                        "div",
                        {
                          className: cn(
                            "group relative overflow-hidden rounded-xl border bg-[var(--bfml-surface)] transition",
                            fileActive && selectable ? "border-[var(--bfml-primary)] ring-2 ring-[var(--bfml-primary-soft)]" : "border-[var(--bfml-border)] hover:border-[var(--bfml-primary-border)]"
                          ),
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
                              "button",
                              {
                                type: "button",
                                className: "block w-full p-2 text-left sm:p-3",
                                onClick: () => handleFileClick(file),
                                onDoubleClick: () => handleFileDoubleClick(file),
                                children: [
                                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "flex h-20 items-center justify-center overflow-hidden rounded-lg bg-[var(--bfml-surface-soft)] sm:h-28", children: isImage ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("img", { src: file.url, alt: file.name, className: "h-full w-full object-contain" }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "text-xs font-semibold uppercase text-[var(--bfml-muted-foreground)]", children: "PDF" }) }),
                                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "mt-2 truncate text-sm font-medium text-[var(--bfml-foreground)] sm:mt-3", children: file.name }),
                                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "text-xs text-[var(--bfml-muted-foreground)]", children: "File" })
                                ]
                              }
                            ),
                            capabilities.delete ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                              "button",
                              {
                                type: "button",
                                title: "Delete file",
                                className: "absolute right-1.5 top-1.5 rounded-md border border-[var(--bfml-border)] bg-[var(--bfml-surface)] p-1.5 shadow-sm transition hover:bg-[var(--bfml-destructive-soft)] sm:right-2 sm:top-2",
                                onClick: (event) => requestDelete({ path: file.path, name: file.name, type: "file" }, event),
                                children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react3.Trash2, { className: "h-3.5 w-3.5 text-[var(--bfml-destructive)] sm:h-4 sm:w-4" })
                              }
                            ) : null
                          ]
                        },
                        file.path
                      );
                    })
                  ] }),
                  !loading && folders.length === 0 && files.length === 0 && uploadQueue.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--bfml-border)] px-4 text-center text-sm text-[var(--bfml-muted-foreground)] sm:h-40", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react3.ImagePlus, { className: "mb-2 h-6 w-6" }),
                    "No files in this folder yet.",
                    capabilities.upload ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "mt-2 text-xs", children: "Drag and drop files here or use Upload." }) : null
                  ] }) : null
                ]
              }
            )
          ] })
        ] }),
        showFooter ? /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("footer", { className: "flex shrink-0 flex-col-reverse gap-2 border-t border-[var(--bfml-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4", children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("p", { className: "truncate text-center text-sm text-[var(--bfml-muted-foreground)] sm:text-left", children: [
            "Selected: ",
            selected ? selected.name : "None"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Button, { type: "button", className: "w-full sm:w-auto", disabled: !selected, onClick: confirmSelection, children: "Done" })
        ] }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          ConfirmDialog,
          {
            open: Boolean(deleteTarget),
            title: deleteTarget?.type === "folder" ? "Delete folder?" : "Delete file?",
            description: deleteTarget ? deleteTarget.type === "folder" ? `Are you sure you want to delete the folder "${deleteTarget.name}" and everything inside it? This action cannot be undone.` : `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.` : "",
            confirmLabel: "Delete",
            loading: deleting,
            onCancel: () => {
              if (!deleting) setDeleteTarget(null);
            },
            onConfirm: () => void confirmDelete(),
            theme: themeMode
          }
        )
      ]
    }
  );
}

// src/components/media-library-modal.tsx
var import_jsx_runtime7 = require("react/jsx-runtime");
function MediaLibraryModal({
  open,
  onClose,
  onSelect,
  config,
  theme,
  title = "Media Library",
  description = "Create folders, upload files, and choose media.",
  accept
}) {
  const resolved = { ...defaultMediaLibraryConfig, ...config };
  const themeMode = resolveThemeMode(theme ?? resolved.theme);
  const rootProps = bfmlRootProps(themeMode);
  if (!open || typeof document === "undefined") return null;
  return (0, import_react_dom2.createPortal)(
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      "div",
      {
        ...rootProps,
        className: cn(
          rootProps.className,
          "fixed inset-0 z-[9999] flex items-stretch justify-center p-0 backdrop-blur-sm sm:items-center sm:p-2 md:p-4"
        ),
        style: { backgroundColor: "var(--bfml-overlay)" },
        children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          MediaLibraryPanel,
          {
            active: open,
            variant: "modal",
            selectable: true,
            config,
            theme,
            title,
            description,
            accept,
            onClose,
            onSelect
          }
        )
      }
    ),
    document.body
  );
}
function MediaPreview({ path, alt }) {
  const isImage = /\.(png|jpe?g|webp|gif)$/i.test(path);
  if (!path) {
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "flex h-32 items-center justify-center rounded-xl border border-dashed border-[var(--bfml-border)] bg-[var(--bfml-surface-soft)] px-4 text-center text-sm text-[var(--bfml-muted-foreground)] sm:h-40", children: "No media selected" });
  }
  if (isImage) {
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "overflow-hidden rounded-xl border border-[var(--bfml-border)] bg-[var(--bfml-surface-soft)]", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("img", { src: path, alt: alt ?? fileNameFromPath(path), className: "h-32 w-full object-contain sm:h-40" }) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "flex h-32 items-center justify-center rounded-xl border border-[var(--bfml-border)] bg-[var(--bfml-surface-soft)] px-4 text-center text-sm font-medium text-[var(--bfml-foreground)] sm:h-40", children: fileNameFromPath(path) });
}

// src/components/media-library-widget.tsx
var import_jsx_runtime8 = require("react/jsx-runtime");
function MediaLibraryWidget({
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
}) {
  const resolved = { ...defaultMediaLibraryConfig, ...config };
  const themeMode = resolveThemeMode(theme ?? resolved.theme);
  const rootProps = bfmlRootProps(themeMode);
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
    "div",
    {
      ...rootProps,
      className: cn(
        rootProps.className,
        "overflow-hidden rounded-2xl border border-[var(--bfml-border)] bg-[var(--bfml-surface)] shadow-[var(--bfml-shadow-lg)]",
        className
      ),
      style: {
        width: toCssSize(width),
        height: toCssSize(height)
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        MediaLibraryPanel,
        {
          active: true,
          variant: "embedded",
          config,
          theme,
          title,
          description,
          accept,
          selectable,
          onSelect,
          className: "h-full"
        }
      )
    }
  );
}

// src/components/media-picker.tsx
var import_react3 = require("react");
var import_lucide_react4 = require("lucide-react");
var import_jsx_runtime9 = require("react/jsx-runtime");
function MediaPicker({
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
}) {
  const themeMode = resolveThemeMode(theme ?? config?.theme);
  const rootProps = bfmlRootProps(themeMode);
  const [open, setOpen] = (0, import_react3.useState)(false);
  const [selectedPath, setSelectedPath] = (0, import_react3.useState)(value ?? defaultValue);
  function handleSelect(file) {
    setSelectedPath(file.url);
    onChange?.(file.url);
    setOpen(false);
  }
  const currentValue = value ?? selectedPath;
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { ...rootProps, className: cn(rootProps.className, "space-y-4", className), children: [
    label ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("label", { className: "text-sm font-medium text-[var(--bfml-foreground)]", children: label }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
      "button",
      {
        type: "button",
        onClick: () => setOpen(true),
        className: "flex w-full items-center gap-3 rounded-xl border border-[var(--bfml-border)] bg-[var(--bfml-surface-soft)] px-3 py-3 text-left transition hover:border-[var(--bfml-primary-border)] hover:bg-[var(--bfml-surface)] sm:gap-4 sm:px-4 sm:py-4",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--bfml-surface)] text-[var(--bfml-primary)] sm:h-12 sm:w-12", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_lucide_react4.ImagePlus, { className: "h-5 w-5", "aria-hidden": "true" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "block text-sm font-semibold text-[var(--bfml-foreground)]", children: label }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "mt-0.5 block text-xs text-[var(--bfml-muted-foreground)]", children: "Select from folders or upload new" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_lucide_react4.Upload, { className: "hidden h-5 w-5 shrink-0 text-[var(--bfml-muted-foreground)] sm:block", "aria-hidden": "true" })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("input", { type: "hidden", name, value: currentValue }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "rounded-xl border border-[var(--bfml-border)] bg-[var(--bfml-surface)] p-3 sm:p-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("p", { className: "text-sm font-semibold text-[var(--bfml-foreground)]", children: previewTitle }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("p", { className: "mt-1 text-xs text-[var(--bfml-muted-foreground)]", children: previewDescription }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "mt-4", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(MediaPreview, { path: currentValue, alt: fileNameFromPath(currentValue) }) }),
      currentValue ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("p", { className: "mt-2 truncate text-xs text-[var(--bfml-muted-foreground)]", children: fileNameFromPath(currentValue) }) : null
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
      MediaLibraryModal,
      {
        open,
        onClose: () => setOpen(false),
        onSelect: handleSelect,
        config,
        theme: themeMode,
        title,
        description,
        accept
      }
    )
  ] });
}

// src/components/media-picker-multi.tsx
var import_react4 = require("react");
var import_lucide_react5 = require("lucide-react");
var import_jsx_runtime10 = require("react/jsx-runtime");
function MediaPickerMulti({
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
}) {
  const themeMode = resolveThemeMode(theme ?? config?.theme);
  const rootProps = bfmlRootProps(themeMode);
  const [open, setOpen] = (0, import_react4.useState)(false);
  const [selectedPaths, setSelectedPaths] = (0, import_react4.useState)(values ?? defaultValues);
  const currentValues = values ?? selectedPaths;
  function handleSelect(file) {
    setSelectedPaths((current) => {
      if (current.includes(file.url) || current.length >= max) return current;
      const next = [...current, file.url];
      onChange?.(next);
      return next;
    });
    setOpen(false);
  }
  function removeAt(index) {
    setSelectedPaths((current) => {
      const next = current.filter((_, itemIndex) => itemIndex !== index);
      onChange?.(next);
      return next;
    });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { ...rootProps, className: cn(rootProps.className, "space-y-4", className), children: [
    label ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("label", { className: "text-sm font-medium text-[var(--bfml-foreground)]", children: label }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
      "button",
      {
        type: "button",
        onClick: () => setOpen(true),
        disabled: currentValues.length >= max,
        className: "flex w-full items-center gap-3 rounded-xl border border-[var(--bfml-border)] bg-[var(--bfml-surface-soft)] px-3 py-3 text-left transition hover:border-[var(--bfml-primary-border)] hover:bg-[var(--bfml-surface)] disabled:cursor-not-allowed disabled:opacity-60 sm:gap-4 sm:px-4 sm:py-4",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--bfml-surface)] text-[var(--bfml-primary)] sm:h-12 sm:w-12", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_lucide_react5.ImagePlus, { className: "h-5 w-5", "aria-hidden": "true" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "block text-sm font-semibold text-[var(--bfml-foreground)]", children: label }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { className: "mt-0.5 block text-xs text-[var(--bfml-muted-foreground)]", children: [
              "Select from folders or upload new (",
              currentValues.length,
              "/",
              max,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_lucide_react5.Upload, { className: "hidden h-5 w-5 shrink-0 text-[var(--bfml-muted-foreground)] sm:block", "aria-hidden": "true" })
        ]
      }
    ),
    currentValues.map((path, index) => /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("input", { type: "hidden", name: `${name}[${index}]`, value: path }, `${path}-${index}`)),
    currentValues.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3", children: currentValues.map((path, index) => /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "relative rounded-xl border border-[var(--bfml-border)] bg-[var(--bfml-surface)] p-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        "button",
        {
          type: "button",
          className: "absolute right-2 top-2 rounded-md bg-[var(--bfml-surface)] p-1 shadow-sm",
          onClick: () => removeAt(index),
          title: "Remove attachment",
          children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_lucide_react5.X, { className: "h-4 w-4 text-[var(--bfml-destructive)]" })
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(MediaPreview, { path, alt: fileNameFromPath(path) }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "mt-2 truncate text-xs text-[var(--bfml-muted-foreground)]", children: fileNameFromPath(path) })
    ] }, `${path}-${index}`)) }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      MediaLibraryModal,
      {
        open,
        onClose: () => setOpen(false),
        onSelect: handleSelect,
        config,
        theme: themeMode,
        title,
        description,
        accept
      }
    )
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MAX_MEDIA_UPLOAD_BYTES,
  MediaLibraryModal,
  MediaLibraryPanel,
  MediaLibraryWidget,
  MediaPicker,
  MediaPickerMulti,
  MediaPreview,
  bfmlRootProps,
  createMediaLibraryClient,
  defaultMediaCapabilities,
  defaultMediaLibraryConfig,
  fileMatchesAccept,
  fileMatchesAcceptForUpload,
  fileNameFromPath,
  formatUploadSizeLimit,
  isFileWithinUploadSizeLimit,
  isImagePath,
  resolveThemeMode
});
//# sourceMappingURL=index.cjs.map