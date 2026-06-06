import type { MediaFile, MediaLibraryConfig, MediaListing } from "./types";
import { defaultMediaLibraryConfig } from "./types";

type ApiPayload<T> = { success: boolean; data?: T; error?: { message?: string } };

function resolveConfig(config?: Partial<MediaLibraryConfig>): MediaLibraryConfig {
  return { ...defaultMediaLibraryConfig, ...config };
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiPayload<T>;
  if (!payload.success) throw new Error(payload.error?.message ?? "Media request failed.");
  return payload.data as T;
}

export function createMediaLibraryClient(config?: Partial<MediaLibraryConfig>) {
  const urls = resolveConfig(config);

  return {
    async list(path = "", q = "") {
      const params = new URLSearchParams();
      if (path) params.set("path", path);
      if (q) params.set("q", q);
      const response = await fetch(`${urls.listUrl}?${params.toString()}`);
      return parseResponse<MediaListing>(response);
    },

    async createFolder(path: string, name: string, nested = true) {
      const response = await fetch(urls.createFolderUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path, name, nested })
      });
      return parseResponse<{ name: string; path: string }>(response);
    },

    async upload(path: string, files: File[]) {
      const form = new FormData();
      form.set("path", path);
      files.forEach((file) => form.append("files", file));
      const response = await fetch(urls.uploadUrl, { method: "POST", body: form });
      return parseResponse<MediaFile[]>(response);
    },

    async uploadOne(path: string, file: File) {
      const uploaded = await this.upload(path, [file]);
      return uploaded[0];
    },

    async rename(path: string, newName: string, type: "file" | "folder") {
      const response = await fetch(urls.updateUrl, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path, newName, type })
      });
      return parseResponse<MediaFile | { name: string; path: string }>(response);
    },

    async remove(path: string, type: "file" | "folder") {
      const response = await fetch(urls.deleteUrl, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path, type })
      });
      return parseResponse<{ path: string }>(response);
    }
  };
}

export const MAX_MEDIA_UPLOAD_BYTES = 5 * 1024 * 1024;

export function isFileWithinUploadSizeLimit(file: File, maxBytes = MAX_MEDIA_UPLOAD_BYTES) {
  return file.size <= maxBytes;
}

export function formatUploadSizeLimit(maxBytes = MAX_MEDIA_UPLOAD_BYTES) {
  return `${Math.round(maxBytes / (1024 * 1024))} MB`;
}

export function fileMatchesAccept(file: MediaFile, accept?: Array<"image" | "pdf">) {
  if (!accept || accept.length === 0) return true;
  const isImage = file.mimeType.startsWith("image/");
  const isPdf = file.mimeType === "application/pdf";
  if (accept.includes("image") && isImage) return true;
  if (accept.includes("pdf") && isPdf) return true;
  return false;
}

export function fileMatchesAcceptForUpload(file: File, accept?: Array<"image" | "pdf">) {
  if (!accept || accept.length === 0) return true;
  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf";
  if (accept.includes("image") && isImage) return true;
  if (accept.includes("pdf") && isPdf) return true;
  return false;
}

export function fileNameFromPath(path: string) {
  return path.split("/").pop() ?? path;
}

export function isImagePath(path: string) {
  return /\.(png|jpe?g|webp|gif)$/i.test(path);
}
