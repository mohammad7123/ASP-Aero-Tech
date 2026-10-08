"use client";

import { useSyncExternalStore } from "react";

/**
 * Media-query subscription that is SSR-safe: the server snapshot is `false`,
 * and React re-renders with the real value right after hydration.
 */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const useFinePointer = () => useMediaQuery("(hover: hover) and (pointer: fine)");
export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");

const noop = () => () => {};

/* ───────────── Deferred heavy work (WebGL) ─────────────
 * 3D scenes start only after the page has loaded and gone idle, or on the
 * visitor's first interaction — whichever comes first — so shader
 * compilation never competes with first paint, hydration or LCP. Until then
 * the SVG blueprints stand in. After client-side navigations it is already
 * released, so later pages mount 3D immediately.
 */
let heavyReady = false;
let heavyArmed = false;
const heavyListeners = new Set<() => void>();

function releaseHeavy() {
  if (heavyReady) return;
  heavyReady = true;
  heavyListeners.forEach((fn) => fn());
}

function armHeavy() {
  if (heavyArmed || typeof window === "undefined") return;
  heavyArmed = true;
  const events = ["pointerdown", "pointermove", "keydown", "wheel", "touchstart"] as const;
  const onInteract = () => {
    events.forEach((e) => window.removeEventListener(e, onInteract));
    releaseHeavy();
  };
  events.forEach((e) => window.addEventListener(e, onInteract, { passive: true }));
  const afterLoad = () =>
    window.setTimeout(() => {
      if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(releaseHeavy, { timeout: 1500 });
      else releaseHeavy();
    }, 1800);
  if (document.readyState === "complete") afterLoad();
  else window.addEventListener("load", afterLoad, { once: true });
}

export function subscribeHeavyReady(onChange: () => void) {
  armHeavy();
  heavyListeners.add(onChange);
  return () => {
    heavyListeners.delete(onChange);
  };
}

export const isHeavyReady = () => heavyReady;

export function useHeavyReady() {
  return useSyncExternalStore(subscribeHeavyReady, isHeavyReady, () => false);
}

/** Reads a client-only value once (server snapshot provided), without effects. */
export function useClientValue<T>(read: () => T, serverValue: T) {
  return useSyncExternalStore(noop, read, () => serverValue);
}
