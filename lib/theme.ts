// lib/theme.ts
// Dark/light theme persisted in localStorage; applied via <html data-theme>.
export const THEME_KEY = "ksadb-theme";
export type Theme = "dark" | "light";

function storage(): Pick<Storage, "getItem" | "setItem"> | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null; // storage blocked (private mode etc.)
  }
}

/** Apply the stored theme (default dark) to `doc`; returns the theme applied. */
export function applyStoredTheme(doc: Document = document): Theme {
  const stored = storage()?.getItem(THEME_KEY);
  const theme: Theme = stored === "light" || stored === "dark" ? stored : "dark";
  doc.documentElement.dataset.theme = theme;
  return theme;
}

export function setTheme(theme: Theme, doc: Document = document): void {
  try {
    storage()?.setItem(THEME_KEY, theme);
  } catch {
    // ignore persistence failure; still apply
  }
  doc.documentElement.dataset.theme = theme;
}
