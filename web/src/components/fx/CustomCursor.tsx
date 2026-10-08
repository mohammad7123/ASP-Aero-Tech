"use client";

import { useEffect, useRef } from "react";
import { useFinePointer, useReducedMotion } from "@/lib/hooks";
import { gsap } from "@/lib/gsap";

/**
 * HUD crosshair cursor (mouse + fine pointer only, never on touch or with
 * reduced motion). Hovering anything interactive expands the reticle; elements
 * can show a label with data-cursor="Drag" etc. Text fields keep the native caret.
 */
export function CustomCursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const on = fine && !reduced;
  const root = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const coords = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!on || !el) return;
    const html = document.documentElement;
    html.classList.add("has-cursor");
    const xTo = gsap.quickTo(el, "x", { duration: 0.14, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.14, ease: "power3" });
    let visible = false;

    const move = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      if (!visible) {
        visible = true;
        gsap.set(el, { x: e.clientX, y: e.clientY });
      }
      xTo(e.clientX);
      yTo(e.clientY);
      if (coords.current) coords.current.textContent = `${String(Math.round(e.clientX)).padStart(4, "0")}·${String(Math.round(e.clientY)).padStart(4, "0")}`;
      const target = e.target as Element | null;
      const field = target?.closest?.("input, textarea, select, [contenteditable='true']");
      const hit = target?.closest?.("a, button, [role='button'], summary, label, [data-cursor]");
      el.dataset.state = hit ? "hover" : "idle";
      if (label.current) label.current.textContent = hit?.getAttribute("data-cursor") ?? "";
      el.style.opacity = field ? "0" : "1";
    };
    const down = () => (el.dataset.press = "1");
    const up = () => delete el.dataset.press;
    const leave = () => {
      el.style.opacity = "0";
      visible = false;
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    html.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      html.removeEventListener("mouseleave", leave);
      html.classList.remove("has-cursor");
    };
  }, [on]);

  if (!on) return null;

  return (
    <div ref={root} className="cursor-hud pointer-events-none fixed left-0 top-0 z-[130]" style={{ opacity: 0 }} data-state="idle" aria-hidden>
      <span className="c-ring" />
      <span className="c-ticks">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="c-dot" />
      <span ref={label} className="c-label" />
      <span ref={coords} className="c-coords" />
    </div>
  );
}
