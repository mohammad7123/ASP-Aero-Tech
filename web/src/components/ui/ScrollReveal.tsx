"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * One IntersectionObserver for the whole site: any element with
 * [data-animate] fades/slides in when it enters the viewport. Hidden states
 * only apply under html.js (set by the inline head script), so content is
 * always visible without JavaScript. Optional stagger: style={{"--d": "120ms"}}.
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    const scan = () => document.querySelectorAll("[data-animate]:not(.is-in)").forEach((el) => io.observe(el));
    scan();
    // Catch content streamed in after the first paint. Only element insertions
    // matter (text updates from counters/telemetry are ignored), batched per frame.
    let queued = 0;
    const mo = new MutationObserver((records) => {
      if (queued) return;
      if (!records.some((r) => Array.from(r.addedNodes).some((n) => n.nodeType === Node.ELEMENT_NODE))) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        scan();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(queued);
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
