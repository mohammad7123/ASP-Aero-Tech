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

type ViewTransitionDocument = Document & { startViewTransition?: (update: () => void) => { ready: Promise<void> } };

/**
 * Switches theme with a circular reveal spreading from `origin` (the toggle
 * button) where View Transitions are supported, and a short colour
 * cross-fade elsewhere. Reduced-motion visitors get an instant switch.
 */
export function toggleTheme(origin?: { x: number; y: number }) {
  const next: Theme = read() === "light" ? "dark" : "light";
  const doc = document as ViewTransitionDocument;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return setTheme(next);

  if (!doc.startViewTransition) {
    const root = document.documentElement;
    root.classList.add("theme-fading");
    setTheme(next);
    window.setTimeout(() => root.classList.remove("theme-fading"), 500);
    return;
  }

  const x = origin?.x ?? window.innerWidth - 48;
  const y = origin?.y ?? 48;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const transition = doc.startViewTransition(() => setTheme(next));
  transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => undefined);
}
