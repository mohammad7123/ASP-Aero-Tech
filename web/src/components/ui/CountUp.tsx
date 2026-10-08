"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/device";
import { gsap } from "@/lib/gsap";
import { formatSpecNumber, tokenizeSpec } from "@/lib/specs";

/**
 * Counts every number inside `value` up from zero when it scrolls into view,
 * keeping units in place ("5–10 KM", "500 G–1 KG", 15500). Server-renders the
 * final value so it's correct without JavaScript and for crawlers.
 */
export function CountUp({ value, pad = 0, duration = 1.6, className }: { value: string | number; pad?: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const tokens = tokenizeSpec(String(value));
  const render = (k: number) =>
    tokens.map((t) => (t.type === "num" ? formatSpecNumber(t.value * k, t.decimals).padStart(pad, "0") : t.value)).join("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const toks = tokenizeSpec(String(value));
    const draw = (k: number) =>
      (el.textContent = toks.map((t) => (t.type === "num" ? formatSpecNumber(t.value * k, t.decimals).padStart(pad, "0") : t.value)).join(""));
    if (prefersReducedMotion()) {
      draw(1);
      return;
    }
    draw(0);
    const state = { k: 0 };
    let tween: gsap.core.Tween | null = null;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        tween = gsap.to(state, { k: 1, duration, ease: "power3.out", onUpdate: () => draw(state.k) });
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      tween?.kill();
    };
  }, [value, pad, duration]);

  return (
    <span ref={ref} className={className} suppressHydrationWarning>
      {render(1)}
    </span>
  );
}
