export type MediaLibraryThemeMode = "sync" | "light" | "dark";

export function bfmlRootProps(theme: MediaLibraryThemeMode = "sync") {
  return {
    className: "bfml-root",
    ...(theme !== "sync" ? ({ "data-theme": theme } as const) : {})
  };
}

export function resolveThemeMode(theme?: MediaLibraryThemeMode) {
  return theme ?? "sync";
}
