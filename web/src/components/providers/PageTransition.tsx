"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/device";
import { gsap } from "@/lib/gsap";
import { getLenis } from "./SmoothScroll";

type Ctx = { navigate: (href: string) => void };
const TransitionContext = createContext<Ctx>({ navigate: () => {} });
export const usePageTransition = () => useContext(TransitionContext);

type Status = "idle" | "covering" | "covered" | "revealing";

/**
 * "Scan line" route transition: a glowing line sweeps down drawing a panel
 * over the page, the route changes underneath, then the line keeps sweeping
 * to reveal the new page. Skipped for reduced motion and same-page links.
 */
export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const overlay = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const status = useRef<Status>("idle");
  const safety = useRef<number | undefined>(undefined);

  const reveal = useCallback(() => {
    if (status.current === "revealing" || status.current === "idle") return;
    status.current = "revealing";
    window.clearTimeout(safety.current);
    getLenis()?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    gsap
      .timeline({
        onComplete: () => {
          status.current = "idle";
          gsap.set(overlay.current, { display: "none" });
        },
      })
      .to(label.current, { opacity: 0, duration: 0.15 }, 0)
      .to(panel.current, { clipPath: "inset(100% 0% 0% 0%)", duration: 0.7, ease: "expo.inOut" }, 0.05)
      .to(line.current, { top: "100%", duration: 0.7, ease: "expo.inOut" }, 0.05);
  }, []);

  const navigate = useCallback(
    (href: string) => {
      const url = new URL(href, window.location.href);
      if (url.pathname === window.location.pathname) {
        const lenis = getLenis();
        if (url.hash) {
          if (lenis) lenis.scrollTo(url.hash, { offset: -88 });
          else document.querySelector(url.hash)?.scrollIntoView({ behavior: "smooth" });
          history.replaceState(null, "", url.hash);
        } else if (lenis) lenis.scrollTo(0);
        else window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (prefersReducedMotion() || status.current !== "idle" || !overlay.current) {
        router.push(href);
        return;
      }
      status.current = "covering";
      if (label.current) label.current.textContent = `Routing ▸ ${url.pathname === "/" ? "/home" : url.pathname}`;
      gsap.set(overlay.current, { display: "block" });
      gsap.set(panel.current, { clipPath: "inset(0% 0% 100% 0%)" });
      gsap.set(line.current, { top: "0%" });
      gsap.set(label.current, { opacity: 0 });
      gsap
        .timeline({
          onComplete: () => {
            status.current = "covered";
            router.push(href);
            // Never leave the overlay stuck if navigation fails.
            safety.current = window.setTimeout(reveal, 6000);
          },
        })
        .to(panel.current, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "expo.inOut" }, 0)
        .to(line.current, { top: "100%", duration: 0.5, ease: "expo.inOut" }, 0)
        .to(label.current, { opacity: 1, duration: 0.2 }, 0.22);
    },
    [router, reveal],
  );

  useEffect(() => {
    if (status.current !== "covered") return;
    // Let the new route paint before sweeping the panel away.
    const id = requestAnimationFrame(() => requestAnimationFrame(reveal));
    return () => cancelAnimationFrame(id);
  }, [pathname, reveal]);

  useEffect(() => () => window.clearTimeout(safety.current), []);

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
      <div ref={overlay} className="fixed inset-0 z-[110] hidden" aria-hidden>
        <div ref={panel} className="grid-bg absolute inset-0 bg-ink" style={{ clipPath: "inset(0% 0% 100% 0%)" }}>
          <span ref={label} className="label-mono absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan opacity-0">
            Routing
          </span>
        </div>
        <div ref={line} className="absolute inset-x-0 h-px bg-cyan shadow-[0_0_28px_6px_rgba(43,217,255,0.65)]" style={{ top: "0%" }} />
      </div>
    </TransitionContext.Provider>
  );
}

type TLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/** next/link with the scan-line transition (keeps prefetching and a11y semantics). */
export function TLink({ href, onClick, children, ...rest }: TLinkProps) {
  const { navigate } = usePageTransition();
  return (
    <Link
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (rest.target && rest.target !== "_self") return;
        if (!href.startsWith("/")) return;
        e.preventDefault();
        navigate(href);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
