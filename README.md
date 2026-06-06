# @blitheforge/media-library

Production-ready React media library with nested folders, drag-and-drop upload, search, RBAC-driven UI, toast notifications, and configurable API URLs. Built with Tailwind CSS — works in Next.js, Vite, or any React 18+ app.

## Features

- **Nested folder management** — browse, create, and delete folders
- **File upload** — click to upload or drag-and-drop; files upload one-by-one with live preview cards in the grid
- **5 MB client-side limit** — oversized files show a warning toast and are skipped (configurable via `MAX_MEDIA_UPLOAD_BYTES`)
- **Search** — filter files in the current folder
- **RBAC / capabilities** — upload, create-folder, and delete UI is driven by your API `capabilities` response
- **Delete confirmation** — custom confirm dialog (not native `confirm()`)
- **Toast notifications** — success, error, and warning toasts (top-right inside the panel/modal)
- **Responsive** — mobile folder drawer, full-screen modal on small screens
- **Theme sync** — inherits host light/dark mode via CSS variables (`theme="sync"`)
- **Three display modes** — form pickers (`MediaPicker`), modal (`MediaLibraryModal`), embedded widget (`MediaLibraryWidget`)
- **Type-safe headless client** — `createMediaLibraryClient` for custom integrations

---

## Install

```bash
npm install @blitheforge/media-library
```

Peer dependencies:

```bash
npm install react react-dom
```

---

## Setup

### 1. Import styles once

In your app entry (e.g. `app/layout.tsx` or `main.tsx`):

```tsx
import "@blitheforge/media-library/styles.css";
import "./globals.css";
```

Import the library **before** your globals. Library utilities are scoped to a lower CSS layer so they will not override your app's responsive classes (e.g. `lg:block`).

Do **not** add `@source` for this package in your app Tailwind config.

### 2. Next.js (App Router)

Add the package to `transpilePackages` in `next.config.ts`:

```ts
const nextConfig = {
  transpilePackages: ["@blitheforge/media-library"]
};
export default nextConfig;
```

### 3. Monorepo / workspace

Link the local package via pnpm workspace:

```yaml
# pnpm-workspace.yaml
packages:
  - "Blitheforge-media-library"
  - "."
```

```json
// package.json
{
  "dependencies": {
    "@blitheforge/media-library": "workspace:*"
  }
}
```

Rebuild after package changes:

```bash
cd Blitheforge-media-library && npm run build
```

---

## Publishing

Pushes to `main` run `.github/workflows/publish.yml`. The workflow
typechecks and builds the package, then publishes it only when the version in
`package.json` is not already present on npm.

Before the first automated publish:

1. Create an npm granular access token with **Bypass 2FA** enabled and
   **Read and write** package permission for the `@blitheforge` scope.
2. In the GitHub repository, open **Settings > Secrets and variables >
   Actions**.
3. Add the token as a repository secret named `NPM_TOKEN`.

For each release, bump the package version and push to `main`:

```bash
npm version patch
git push --follow-tags
```

---

## Theming

Default is **`theme="sync"`** — the library reads your app's CSS variables:

| Host variable | Used for |
|---------------|----------|
| `--background` | Page background |
| `--foreground` | Text |
| `--surface` | Panel/card background |
| `--border` | Borders |
| `--primary` | Buttons, active states |
| `--destructive` | Delete actions |
| `--accent` | Hover/secondary surfaces |
| `--warning` | Warning toasts |

When your site toggles dark mode (e.g. `[data-theme="dark"]` on `<html>`), the media library follows automatically.

**Standalone** (no shared design tokens):

```tsx
<MediaPicker name="image" theme="light" />
<MediaPicker name="image" theme="dark" />
```

Or via config:

```tsx
<MediaPicker name="image" config={{ theme: "sync" }} />
```

Theme modes: `"sync"` | `"light"` | `"dark"`

---

## Components

| Export | Use case |
|--------|----------|
| `MediaPicker` | Single file field for forms — opens modal, shows live preview |
| `MediaPickerMulti` | Multiple attachments with preview cards |
| `MediaLibraryModal` | Full-screen/modal picker with Done button |
| `MediaLibraryWidget` | Embedded admin panel — fixed width/height, no overlay |
| `MediaLibraryPanel` | Low-level panel (`variant="modal"` or `"embedded"`) |
| `MediaPreview` | Standalone image/PDF preview block |
| `createMediaLibraryClient` | Headless API client |

---

## MediaPicker — single file (forms)

Best for donation proofs, expense vouchers, profile photos, etc.

```tsx
import { MediaPicker } from "@blitheforge/media-library";

export function DonationForm() {
  return (
    <form>
      <MediaPicker
        name="proofUrl"
        label="Donation proof"
        accept={["image", "pdf"]}
        onChange={(path) => console.log(path)}
      />
    </form>
  );
}
```

Props: `name`, `label`, `value`, `defaultValue`, `onChange`, `accept`, `config`, `theme`, `title`, `description`, `className`

---

## MediaPickerMulti — multiple attachments

```tsx
import { MediaPickerMulti } from "@blitheforge/media-library";

<MediaPickerMulti
  name="attachments"
  label="Attachments"
  max={5}
  accept={["image", "pdf"]}
  onChange={(paths) => console.log(paths)}
/>
```

---

## MediaLibraryModal — picker modal

Use when you need a custom trigger but still want the picker flow (select file → Done).

```tsx
import { useState } from "react";
import { MediaLibraryModal } from "@blitheforge/media-library";

function CustomTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Browse media</button>
      <MediaLibraryModal
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(file) => {
          console.log(file.url);
          setOpen(false);
        }}
        accept={["image", "pdf"]}
      />
    </>
  );
}
```

Modal behavior:
- Portal overlay with backdrop blur
- Escape key closes (unless delete confirm is open)
- Mobile: full viewport height; desktop: centered dialog
- Footer with **Selected** label and **Done** button

---

## MediaLibraryWidget — embedded admin panel

Use for a dedicated **Media Library** admin page — no modal, no overlay. Folders and files are always visible.

```tsx
import { MediaLibraryWidget } from "@blitheforge/media-library";

export function MediaAdminPage() {
  return (
    <MediaLibraryWidget
      width="100%"
      height="calc(100vh - 200px)"
      title="Media Library"
      description="Create folders, upload files, and manage media."
      accept={["image", "pdf"]}
    />
  );
}
```

### Width & height props

| Prop | Type | Default | Examples |
|------|------|---------|----------|
| `width` | `string \| number` | `"100%"` | `800`, `"70vw"`, `"100%"` |
| `height` | `string \| number` | `640` | `720`, `"70vh"`, `"calc(100vh - 200px)"` |

- **Numbers** → pixels (`720` → `720px`)
- **Strings** → passed as CSS values (`"100%"`, `"70vh"`)
- **`calc()`** — use proper CSS syntax with spaces: `"calc(100vh - 200px)"`
- **Shorthand** — `"100vh-200px"` is auto-converted to `calc(100vh - 200px)`

### Widget vs modal

| | `MediaLibraryWidget` | `MediaLibraryModal` |
|--|----------------------|---------------------|
| Display | Inline on page | Overlay / portal |
| Close button | No | Yes |
| Done footer | Hidden by default | Always shown |
| Loads | On mount | When `open={true}` |
| Best for | Admin manage page | Form file picking |

### Selectable widget (picker in embedded mode)

```tsx
<MediaLibraryWidget
  width={900}
  height={600}
  selectable
  onSelect={(file) => console.log(file.path)}
/>
```

---

## MediaLibraryPanel — low-level

Build custom layouts by composing the panel directly.

```tsx
import { MediaLibraryPanel } from "@blitheforge/media-library";

<MediaLibraryPanel
  active
  variant="embedded"
  selectable={false}
  title="Files"
  accept={["image"]}
  className="h-full"
/>
```

Props: `active`, `variant` (`"modal"` | `"embedded"`), `selectable`, `onClose`, `onSelect`, `config`, `theme`, `title`, `description`, `accept`, `className`

---

## MediaPreview

Standalone preview for a stored path/URL:

```tsx
import { MediaPreview } from "@blitheforge/media-library";

<MediaPreview path="/uploads/media/photo.png" alt="Donation proof" />
```

---

## Configure API URLs

All components accept an optional `config` prop:

```tsx
<MediaPicker
  name="imageUrl"
  config={{
    listUrl: "/api/media",
    uploadUrl: "/api/media/upload",
    createFolderUrl: "/api/media/folders",
    updateUrl: "/api/media",
    deleteUrl: "/api/media",
    rootLabel: "Root",
    theme: "sync"
  }}
/>
```

Default URLs (relative to your app):

| Key | Default |
|-----|---------|
| `listUrl` | `/api/media` |
| `uploadUrl` | `/api/media/upload` |
| `createFolderUrl` | `/api/media/folders` |
| `updateUrl` | `/api/media` |
| `deleteUrl` | `/api/media` |
| `rootLabel` | `"Root"` |

---

## Backend API contract

All responses must follow:

```json
{ "success": true, "data": ... }
```

Errors:

```json
{
  "success": false,
  "error": { "code": "VALIDATION_ERROR", "message": "Human readable message" }
}
```

### List — `GET {listUrl}?path=&q=`

Query params:
- `path` — current folder path (empty = root)
- `q` — search query (optional)

Response:

```json
{
  "success": true,
  "data": {
    "path": "donations",
    "folders": [
      { "name": "2026", "path": "donations/2026" }
    ],
    "files": [
      {
        "name": "receipt.png",
        "path": "donations/receipt.png",
        "url": "/uploads/media/donations/receipt.png",
        "size": 12345,
        "mimeType": "image/png",
        "updatedAt": "2026-06-06T00:00:00.000Z"
      }
    ],
    "capabilities": {
      "view": true,
      "upload": true,
      "createFolder": true,
      "delete": true,
      "rename": true,
      "select": true
    }
  }
}
```

### Capabilities (RBAC)

The UI reads `capabilities` from every list response to show or hide actions:

| Capability | Controls |
|------------|----------|
| `view` | Access to browse (required) |
| `upload` | Upload button + drag-and-drop |
| `createFolder` | Folder create form in sidebar |
| `delete` | Delete buttons on files/folders |
| `rename` | Reserved for future rename UI |
| `select` | File selection (picker flows) |

If `capabilities` is omitted, all actions default to enabled.

### Upload — `POST {uploadUrl}`

`multipart/form-data`:
- `path` — target folder path (empty string = root)
- `files` — one or more files

The UI uploads **one file at a time** sequentially and shows a preview card per file in the grid.

Recommended server limit: **5 MB per file** (matches client-side check).

### Create folder — `POST {createFolderUrl}`

```json
{
  "path": "donations",
  "name": "2026",
  "nested": true
}
```

- `nested: true` — create inside `path`
- `nested: false` — create at root level

### Rename — `PATCH {updateUrl}`

```json
{
  "path": "donations/old.png",
  "newName": "new.png",
  "type": "file"
}
```

`type`: `"file"` | `"folder"`

### Delete — `DELETE {deleteUrl}`

```json
{
  "path": "donations/old.png",
  "type": "file"
}
```

Deleting a folder should remove all nested content on the server.

---

## Headless client

Use without UI for scripts, tests, or custom interfaces:

```tsx
import { createMediaLibraryClient } from "@blitheforge/media-library";

const client = createMediaLibraryClient({
  listUrl: "/api/media",
  uploadUrl: "/api/media/upload",
  createFolderUrl: "/api/media/folders",
  updateUrl: "/api/media",
  deleteUrl: "/api/media"
});

const listing = await client.list("donations", "receipt");
await client.createFolder("", "archive", true);
await client.uploadOne("donations", file);
await client.rename("donations/old.png", "new.png", "file");
await client.remove("donations/old.png", "file");
```

### Utility exports

```tsx
import {
  MAX_MEDIA_UPLOAD_BYTES,       // 5 * 1024 * 1024
  isFileWithinUploadSizeLimit,
  formatUploadSizeLimit,        // "5 MB"
  fileMatchesAccept,
  fileMatchesAcceptForUpload,
  fileNameFromPath,
  isImagePath,
  bfmlRootProps,
  resolveThemeMode
} from "@blitheforge/media-library";
```

---

## Upload behavior

1. User selects files (click or drag-and-drop)
2. Client validates type (`accept` prop) and size (5 MB default)
3. Oversized files → warning toast, skipped
4. Invalid type → error toast, skipped
5. Valid files → preview cards appear in the file grid
6. Each file uploads sequentially; card removed on success
7. Folder list refreshes silently after each successful upload
8. Success toast when batch completes

---

## File type filtering

Pass `accept` to restrict allowed types:

```tsx
accept={["image"]}           // images only
accept={["pdf"]}             // PDF only
accept={["image", "pdf"]}    // both (default for admin widget)
```

Omit `accept` to allow all types returned by the API.

---

## TypeScript types

```tsx
import type {
  MediaFile,
  MediaFolder,
  MediaListing,
  MediaCapabilities,
  MediaLibraryConfig,
  MediaLibraryModalProps,
  MediaLibraryWidgetProps,
  MediaLibraryPanelProps,
  MediaPickerProps,
  MediaPickerMultiProps,
  MediaLibraryThemeMode
} from "@blitheforge/media-library";
```
