"use client";

import { useSyncExternalStore } from "react";

import { DEFAULT_THEME, THEME_COLOR, THEME_KEY, type Theme } from "./theme-config";

export type { Theme };

const read = (): Theme => (typeof document !== "undefined" && document.documentElement.dataset.theme === "dark" ? "dark" : "light");

function subscribe(onChange: () => void) {
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}

/**
 * The active theme. The source of truth is <html data-theme>, which the
 * inline preflight script sets before first paint. Works outside React
 * context, so it is safe to call from inside R3F canvases too.
 */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, read, () => DEFAULT_THEME);
}

export function setTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* storage blocked: the choice just won't persist */
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[theme]);
}

export const toggleTheme = () => setTheme(read() === "light" ? "dark" : "light");
