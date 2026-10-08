"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TLink } from "@/components/providers/PageTransition";
import { onBootComplete } from "@/lib/boot";

/**
 * Consent banner + preferences dialog. Uses the same storage key, payload
 * shape and events as the previous site, so existing visitors keep their
 * choices. Google Analytics (Settings → Analytics in the admin console) is
 * only injected after analytics consent.
 */
type Prefs = { essential: true; functional: boolean; analytics: boolean; marketing: boolean };
const KEY = "asp_cookie_consent";
const DEFAULTS: Prefs = { essential: true, functional: false, analytics: false, marketing: false };

function readPrefs(): Prefs | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw), essential: true } : null;
  } catch {
    return null;
  }
}

type GtagWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

function syncAnalytics(id: string) {
  const consent = readPrefs()?.analytics === true;
  const existing = document.getElementById("asp-google-analytics");
  if (!id || !consent) {
    existing?.remove();
    return;
  }
  if (existing) return;
  const script = document.createElement("script");
  script.id = "asp-google-analytics";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
  const w = window as GtagWindow;
  w.dataLayer = w.dataLayer || [];
  // gtag.js expects the `arguments` object, not an array.
  w.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  };
  w.gtag("js", new Date());
  w.gtag("config", id, { anonymize_ip: true });
}

export function CookieConsent({ analyticsId }: { analyticsId: string }) {
  const [banner, setBanner] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const saved = readPrefs();
    let timer: number | undefined;
    let stopWaiting: (() => void) | undefined;
    if (!saved)
      // Don't compete with the intro: show the banner shortly after it finishes.
      stopWaiting = onBootComplete(() => (timer = window.setTimeout(() => setBanner(true), 1800)));
    const open = () => {
      setPrefs(readPrefs() ?? DEFAULTS);
      dialog.current?.showModal();
    };
    window.addEventListener("open-cookie-settings", open);
    return () => {
      stopWaiting?.();
      window.clearTimeout(timer);
      window.removeEventListener("open-cookie-settings", open);
    };
  }, []);

  useEffect(() => {
    const sync = () => syncAnalytics(analyticsId);
    sync();
    window.addEventListener("asp-cookie-consent-changed", sync);
    return () => window.removeEventListener("asp-cookie-consent-changed", sync);
  }, [analyticsId]);

  const save = useCallback((next: Prefs) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage blocked — consent applies for this page view only */
    }
    setPrefs(next);
    setBanner(false);
    dialog.current?.close();
    window.dispatchEvent(new Event("asp-cookie-consent-changed"));
  }, []);

  const toggles: { key: keyof Omit<Prefs, "essential">; title: string; text: string }[] = [
    { key: "functional", title: "Functional", text: "Remembers choices you make, such as preferences on this site." },
    { key: "analytics", title: "Analytics", text: "Helps us understand how visitors use the site so we can improve it." },
    { key: "marketing", title: "Marketing", text: "ASP Aero Tech does not currently use third-party marketing trackers." },
  ];

  return (
    <>
      {banner && (
        <div className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[95] sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-md" role="region" aria-label="Cookie consent">
          <div className="glass-solid rounded-2xl p-4 shadow-2xl sm:p-5">
            <p className="label-mono text-cyan">Privacy & cookies</p>
            <p className="mt-1.5 text-[13px] leading-snug text-fg-muted sm:mt-2 sm:text-sm sm:leading-relaxed">
              We use essential cookies to run this site and, with your permission, analytics to improve it. You can change your choice at any time.{" "}
              <TLink href="/privacy-policy" className="text-cyan underline-offset-4 hover:underline">
                Privacy policy
              </TLink>
            </p>
            <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
              <button type="button" className="btn btn-primary min-h-0 px-4 py-2 text-sm" onClick={() => save({ essential: true, functional: true, analytics: true, marketing: false })}>
                Accept all
              </button>
              <button type="button" className="btn btn-ghost min-h-0 px-4 py-2 text-sm" onClick={() => save(DEFAULTS)}>
                Essential only
              </button>
              <button type="button" className="btn min-h-0 px-3 py-2 text-sm text-fg-muted hover:text-fg" onClick={() => dialog.current?.showModal()}>
                Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      <dialog
        ref={dialog}
        aria-labelledby="cookie-dialog-title"
        className="m-auto w-[min(92vw,30rem)] rounded-2xl border border-line bg-navy-900 p-0 text-fg shadow-2xl backdrop:bg-void/70 backdrop:backdrop-blur-sm"
      >
        <form
          method="dialog"
          className="p-6"
          onSubmit={(e) => {
            e.preventDefault();
            save(prefs);
          }}
        >
          <h2 id="cookie-dialog-title" className="text-xl font-semibold">
            Cookie preferences
          </h2>
          <p className="mt-2 text-sm text-fg-muted">Essential cookies keep the site working and store this choice. They can&apos;t be switched off.</p>
          <ul className="mt-5 space-y-3">
            <li className="flex items-start justify-between gap-4 rounded-xl border border-line p-4">
              <span>
                <span className="block text-sm font-semibold">Essential</span>
                <span className="mt-1 block text-xs text-fg-dim">Core functionality and your consent record.</span>
              </span>
              <span className="label-mono text-go">Always on</span>
            </li>
            {toggles.map((t) => (
              <li key={t.key} className="rounded-xl border border-line p-4">
                <label className="flex cursor-pointer items-start justify-between gap-4">
                  <span>
                    <span className="block text-sm font-semibold">{t.title}</span>
                    <span className="mt-1 block text-xs text-fg-dim">{t.text}</span>
                  </span>
                  <input
                    type="checkbox"
                    className="mt-1 size-5 accent-[var(--color-cyan)]"
                    checked={prefs[t.key]}
                    disabled={t.key === "marketing"}
                    onChange={(e) => setPrefs((p) => ({ ...p, [t.key]: e.target.checked }))}
                  />
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className="btn btn-ghost min-h-0 px-4 py-2 text-sm" onClick={() => dialog.current?.close()}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary min-h-0 px-4 py-2 text-sm">
              Save preferences
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

/** Footer / privacy-page trigger for the preferences dialog. */
export function CookiePreferencesButton({ className, children = "Cookie preferences" }: { className?: string; children?: React.ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event("open-cookie-settings"))}>
      {children}
    </button>
  );
}
