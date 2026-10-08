"use client";

import { ArrowUpRight, Mail, Menu, Phone, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getLenis } from "@/components/providers/SmoothScroll";
import { TLink } from "@/components/providers/PageTransition";
import { useSound } from "@/components/providers/Sound";
import { Logo } from "@/components/ui/Logo";
import { Magnetic } from "@/components/ui/Magnetic";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { mainNav, secondaryNav, site } from "@/content/site";
import { cn, formatPhoneHref, whatsappHref } from "@/lib/utils";

type Props = { phone: string; email: string; whatsappNumber: string; whatsappGreeting: string };

export function Navbar({ phone, email, whatsappNumber, whatsappGreeting }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (y > 520 && y > last + 6) setHidden(true);
      else if (y < last - 6 || y < 520) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mobile menu: lock scroll, focus the first link, close on Escape.
  useEffect(() => {
    const lenis = getLenis();
    if (!open) {
      lenis?.start();
      document.documentElement.style.overflow = "";
      return;
    }
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    firstLinkRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const close = () => setOpen(false);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[80] transition-transform duration-500 ease-[var(--ease-out-expo)]",
        hidden && !open && "-translate-y-full",
      )}
    >
      {/* status strip */}
      <div className={cn("hidden overflow-hidden border-b border-line/60 transition-[max-height,opacity] duration-500 lg:block", scrolled ? "max-h-0 opacity-0" : "max-h-9 opacity-100")}>
        <div className="container-x flex h-9 items-center justify-between gap-6">
          <div className="label-mono flex items-center gap-4 text-fg-dim">
            <span className="inline-flex items-center gap-2 text-go">
              <span className="size-1.5 rounded-full bg-go shadow-[0_0_8px_var(--color-go)]" /> Sys nominal
            </span>
            <span className="hidden xl:inline">{site.tagline}</span>
          </div>
          <div className="label-mono flex items-center gap-5 text-fg-dim">
            {phone && (
              <a href={formatPhoneHref(phone)} className="inline-flex items-center gap-1.5 hover:text-cyan">
                <Phone size={11} /> {phone}
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className="inline-flex items-center gap-1.5 hover:text-cyan">
                <Mail size={11} /> {email}
              </a>
            )}
            {whatsappNumber && (
              <a href={whatsappHref(whatsappNumber, whatsappGreeting)} target="_blank" rel="noopener noreferrer" className="hover:text-cyan">
                WhatsApp
              </a>
            )}
            <UtcClock />
          </div>
        </div>
      </div>

      {/* main bar */}
      <div className={cn("relative z-[2] transition-[background-color,border-color,backdrop-filter] duration-500", scrolled || open ? "border-b border-line bg-ink/80 backdrop-blur-xl" : "border-b border-transparent")}>
        <nav aria-label="Primary" className="container-x flex h-[var(--header-h)] items-center justify-between gap-6">
          <TLink href="/" className="relative z-[2] shrink-0" aria-label={`${site.name} — home`} onClick={close}>
            <Logo alt={site.name} priority sizes="120px" className="h-11 w-auto sm:h-12" />
          </TLink>

          <ul className="hidden items-center gap-1 lg:flex">
            {mainNav.map((item) => (
              <li key={item.href}>
                <TLink
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "group relative inline-flex h-10 items-center px-3.5 text-sm font-medium transition-colors",
                    isActive(item.href) ? "text-fg" : "text-fg-muted hover:text-fg",
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      "absolute inset-x-3.5 -bottom-0.5 h-px origin-left bg-cyan shadow-[0_0_8px_var(--color-cyan)] transition-transform duration-500",
                      isActive(item.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                    )}
                  />
                </TLink>
              </li>
            ))}
          </ul>

          <div className="relative z-[2] flex items-center gap-2">
            <SoundToggle className="hidden sm:inline-flex" />
            <ThemeToggle />
            <Magnetic className="hidden md:inline-block">
              <TLink href="/contact" className="btn btn-primary min-h-0 px-5 py-2.5 text-sm" data-cursor="Brief us">
                Request briefing <ArrowUpRight size={16} />
              </TLink>
            </Magnetic>
            <button
              ref={toggleRef}
              type="button"
              className="grid size-11 place-items-center rounded-full border border-line-strong text-fg lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </div>

      {/* mobile menu */}
      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-0 top-0 z-[1] bg-ink/95 backdrop-blur-xl transition-[clip-path] duration-700 ease-[var(--ease-in-out-quint)] lg:hidden",
          open ? "visible [clip-path:inset(0_0_0_0)]" : "invisible [clip-path:inset(0_0_100%_0)]",
        )}
        aria-hidden={!open}
        data-lenis-prevent
      >
        <div className="grid-bg grid-fade absolute inset-0 opacity-50" aria-hidden />
        <div className="container-x relative flex h-full flex-col overflow-y-auto pb-10 pt-[calc(var(--header-h)+1.5rem)]">
          <ul className="space-y-1">
            {[...mainNav, ...secondaryNav].map((item, i) => (
              <li key={item.href}>
                <TLink
                  ref={i === 0 ? firstLinkRef : undefined}
                  href={item.href}
                  onClick={close}
                  tabIndex={open ? 0 : -1}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn("flex items-baseline gap-4 border-b border-line py-3.5 font-display text-3xl font-medium", isActive(item.href) ? "text-cyan" : "text-fg")}
                >
                  <span className="label-mono w-6 text-fg-dim">{String(i + 1).padStart(2, "0")}</span>
                  {item.label}
                </TLink>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <TLink href="/contact" onClick={close} tabIndex={open ? 0 : -1} className="btn btn-primary">
              Request a briefing <ArrowUpRight size={16} />
            </TLink>
            <SoundToggle tabIndex={open ? 0 : -1} />
          </div>
          <div className="label-mono mt-auto space-y-2 pt-10 text-fg-dim">
            {phone && <a href={formatPhoneHref(phone)} className="block">{phone}</a>}
            {email && <a href={`mailto:${email}`} className="block">{email}</a>}
            <p>{site.positioning}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

/** Animated equaliser button that toggles the synthesised propeller hum. */
function SoundToggle({ className, tabIndex }: { className?: string; tabIndex?: number }) {
  const { enabled, supported, toggle } = useSound();
  if (!supported) return null;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      tabIndex={tabIndex}
      aria-label={enabled ? "Sound on: mute propeller sound" : "Sound off: play propeller sound"}
      data-cursor={enabled ? "Mute" : "Sound"}
      className={cn("h-11 items-center gap-2 rounded-full border border-line-strong px-3.5 text-fg-muted transition-colors hover:border-cyan hover:text-fg", className ?? "inline-flex")}
    >
      <span className="flex h-4 items-end gap-[3px]" aria-hidden>
        {[0.5, 1, 0.7, 0.9].map((h, i) => (
          <span
            key={i}
            className={cn("w-[2px] origin-bottom rounded-full bg-current", enabled && "animate-[eq_0.9s_ease-in-out_infinite_alternate]")}
            style={{ height: `${h * 100}%`, animationDelay: `${i * 0.15}s`, transform: enabled ? undefined : "scaleY(0.3)" }}
          />
        ))}
      </span>
      <span className="label-mono hidden xl:inline">{enabled ? "Sound on" : "Sound off"}</span>
    </button>
  );
}

function UtcClock() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const tick = () => {
      if (ref.current) ref.current.textContent = `${new Date().toISOString().slice(11, 19)} UTC`;
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span ref={ref} className="tabular text-fg-muted" suppressHydrationWarning>
      --:--:-- UTC
    </span>
  );
}
