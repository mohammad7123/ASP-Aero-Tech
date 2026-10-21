import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { CookiePreferencesButton } from "@/components/fx/CookieConsent";
import { TLink } from "@/components/providers/PageTransition";
import type { Product } from "@/content/products";
import { mainNav, secondaryNav, site } from "@/content/site";
import type { SiteSettings } from "@/lib/api";
import { formatPhoneHref, whatsappHref } from "@/lib/utils";

const socialIcon: Record<SiteSettings["socials"][number]["key"], string> = {
  linkedin: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.5c0-1.31-.02-3-1.83-3-1.83 0-2.11 1.43-2.11 2.9V21h-4V9Z",
  twitter: "M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.2h1.7L7.4 4.73H5.58L16.67 19.2Z",
  facebook: "M13.5 21v-7.5h2.53l.38-2.93H13.5V8.7c0-.85.24-1.43 1.45-1.43H16.5V4.65A20.7 20.7 0 0 0 14.24 4.5c-2.24 0-3.77 1.37-3.77 3.88v2.19H7.94v2.93h2.53V21h3.03Z",
  instagram: "M12 7.4a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2Zm0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm5.85-7.78a1.08 1.08 0 1 1-2.15 0 1.08 1.08 0 0 1 2.15 0ZM21 7.1c-.06-1.43-.38-2.7-1.43-3.74S17.26 2 15.83 1.94C14.35 1.86 9.65 1.86 8.17 1.94 6.75 2 5.48 2.32 4.43 3.36S3.06 5.67 3 7.1c-.08 1.48-.08 6.18 0 7.66.06 1.43.38 2.7 1.43 3.74s2.31 1.37 3.74 1.43c1.48.08 6.18.08 7.66 0 1.43-.06 2.7-.38 3.74-1.43S20.94 16.19 21 14.76c.08-1.48.08-6.18 0-7.66Z",
  youtube: "M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.29 5 12 5 12 5s-6.29 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.71 19 12 19 12 19s6.29 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z",
};

export function Footer({ settings, products }: { settings: SiteSettings; products: Product[] }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden border-t border-line bg-void">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,transparent,#000_40%)]" aria-hidden />
      <div className="container-x relative grid gap-12 py-16 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr] lg:py-20">
        <div>
          <TLink href="/" aria-label={`${site.name} — home`} className="inline-block">
            <Logo alt={site.name} sizes="180px" className="h-16 w-auto" />
          </TLink>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-fg-muted">{settings.description}</p>
          <p className="label-mono mt-6 text-fg-dim">{site.expansion}</p>
          {settings.socials.length > 0 && (
            <ul className="mt-6 flex gap-2">
              {settings.socials.map((s) => (
                <li key={s.key}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="grid size-10 place-items-center rounded-full border border-line text-fg-muted transition-colors hover:border-cyan hover:text-cyan"
                  >
                    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
                      <path d={socialIcon[s.key]} />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="label-mono text-cyan">Platforms</h2>
          <ul className="mt-5 space-y-2.5 text-sm">
            {products.map((p) => (
              <li key={p.slug}>
                <TLink href={`/products/${p.slug}`} className="text-fg-muted transition-colors hover:text-fg">
                  {p.name}
                </TLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="label-mono text-cyan">Company</h2>
          <ul className="mt-5 space-y-2.5 text-sm">
            {[...mainNav.filter((n) => n.href !== "/products"), ...secondaryNav].map((n) => (
              <li key={n.href}>
                <TLink href={n.href} className="text-fg-muted transition-colors hover:text-fg">
                  {n.label}
                </TLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="label-mono text-cyan">Get in touch</h2>
          <ul className="mt-5 space-y-3 text-sm text-fg-muted">
            {settings.contactPhone && (
              <li>
                <a href={formatPhoneHref(settings.contactPhone)} className="inline-flex items-center gap-2.5 hover:text-fg">
                  <Phone size={15} className="text-signal" /> {settings.contactPhone}
                </a>
              </li>
            )}
            {settings.contactEmail && (
              <li>
                <a href={`mailto:${settings.contactEmail}`} className="inline-flex items-center gap-2.5 hover:text-fg">
                  <Mail size={15} className="text-signal" /> {settings.contactEmail}
                </a>
              </li>
            )}
            <li className="flex items-start gap-2.5">
              <MapPin size={15} className="mt-0.5 shrink-0 text-signal" />
              <span>{settings.addresses[0]?.address || settings.address}</span>
            </li>
            {settings.whatsappNumber && (
              <li>
                <a href={whatsappHref(settings.whatsappNumber, settings.whatsappGreeting)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 hover:text-fg">
                  <span className="size-[15px] rounded-full bg-[#25D366]" aria-hidden /> WhatsApp
                </a>
              </li>
            )}
          </ul>
          <TLink href="/contact" className="btn btn-ghost mt-6 text-sm">
            Request a technical briefing <ArrowUpRight size={15} />
          </TLink>
        </div>
      </div>

      <div className="container-x relative">
        <p aria-hidden className="pointer-events-none select-none bg-gradient-to-b from-fg/[0.08] to-transparent bg-clip-text font-display text-[18vw] font-bold leading-[0.8] tracking-tighter text-transparent lg:text-[15vw]">
          ASP AERO
        </p>
      </div>

      <div className="relative border-t border-line">
        <div className="container-x flex flex-col items-start justify-between gap-4 py-6 text-xs text-fg-dim sm:flex-row sm:items-center">
          <span>
            © {year} {settings.siteName}. All rights reserved.
          </span>
          <div className="flex items-center gap-5">
            <TLink href="/privacy-policy" className="hover:text-fg">
              Privacy policy
            </TLink>
            <CookiePreferencesButton className="hover:text-fg" />
          </div>
          <span className="label-mono">Built in India · Designed for the future</span>
        </div>
        {/* tricolour hairline from the logo */}
        <div className="h-[3px] bg-[linear-gradient(90deg,#F47E20_0%,#F47E20_33%,#E8EEF8_33%,#E8EEF8_66%,#138808_66%,#138808_100%)] opacity-80" aria-hidden />
      </div>
    </footer>
  );
}
