export type DeleteTarget = {
  path: string;
  name: string;
  type: "file" | "folder";
};

export function parentPath(path: string) {
  const segments = path.split("/").filter(Boolean);
  segments.pop();
  return segments.join("/");
}

export function isPathInside(path: string, folderPath: string) {
  return path === folderPath || path.startsWith(`${folderPath}/`);
}

export function buildBreadcrumb(path: string, rootLabel: string) {
  const segments = path ? path.split("/").filter(Boolean) : [];
  const crumbs = [{ label: rootLabel, path: "" }];
  segments.forEach((segment, index) => {
    crumbs.push({ label: segment, path: segments.slice(0, index + 1).join("/") });
  });
  return crumbs;
}

export function createQueueId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function toCssSize(value?: string | number) {
  if (value === undefined) return undefined;
  if (typeof value === "number") return `${value}px`;

  const trimmed = value.trim();
  if (/^calc\s*\(/i.test(trimmed) || /^var\s*\(/i.test(trimmed)) return trimmed;

  // e.g. "100vh-200px" or "100vh - 200px" → calc(100vh - 200px)
  if (/^[\d.]+\s*(vh|vw|vmin|vmax|%|px|rem|em)\s*[-+]\s*[\d.]+/i.test(trimmed)) {
    const normalized = trimmed.replace(/\s*([+-])\s*/g, " $1 ");
    return `calc(${normalized})`;
  }

  return trimmed;
}
