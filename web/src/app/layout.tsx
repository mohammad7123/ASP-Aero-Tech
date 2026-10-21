import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import { BootLoader } from "@/components/fx/BootLoader";
import { CookieConsent } from "@/components/fx/CookieConsent";
import { CustomCursor } from "@/components/fx/CustomCursor";
import { FloatingActions } from "@/components/fx/FloatingActions";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { AppProviders } from "@/components/providers/AppProviders";
import { JsonLd } from "@/components/seo/JsonLd";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { site } from "@/content/site";
import { getProducts, getSettings } from "@/lib/api";
import { organizationJsonLd, siteUrl, websiteJsonLd } from "@/lib/seo";
import { DEFAULT_THEME, THEME_COLOR, THEME_KEY } from "@/lib/theme-config";
import "./globals.css";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });
const body = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap", preload: false });

const title = "ASP Aero Tech | Unmanned Aerial Systems";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: title, template: "%s | ASP Aero Tech" },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "ASP Aero Tech",
    "drone manufacturer India",
    "unmanned aerial systems",
    "UAV",
    "surveillance drone",
    "VTOL drone",
    "fixed wing drone",
    "tethered drone",
    "FPV drone",
    "Make in India drones",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    title,
    description: site.shortDescription,
    url: "/",
  },
  twitter: { card: "summary_large_image", title, description: site.shortDescription },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: THEME_COLOR[DEFAULT_THEME],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/**
 * Runs before first paint:
 *  - applies the saved (or default) colour theme so there is no flash,
 *  - marks JS as available (enables scroll-reveal hidden states),
 *  - skips the boot loader on repeat visits in a session / reduced motion.
 */
const preflight = `(function(){var d=document.documentElement;d.classList.add('js');try{var t=localStorage.getItem('${THEME_KEY}');if(t!=='light'&&t!=='dark')t='${DEFAULT_THEME}';d.dataset.theme=t;d.style.colorScheme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='dark'?'${THEME_COLOR.dark}':'${THEME_COLOR.light}')}catch(e){d.dataset.theme='${DEFAULT_THEME}'}try{if(${!site.features.bootLoader}||sessionStorage.getItem('asp-booted')||matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('boot-skip')}}catch(e){d.classList.add('boot-skip')}})();`;

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [settings, products] = await Promise.all([getSettings(), getProducts()]);

  return (
    <html lang="en-IN" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preflight }} />
        <noscript>
          <style>{`.boot-loader{display:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <JsonLd data={[organizationJsonLd(settings), websiteJsonLd(settings)]} />
        <AppProviders>
          <a
            href="#main"
            className="fixed left-4 top-4 z-[200] -translate-y-20 rounded-full bg-signal px-5 py-3 text-sm font-semibold text-ink transition-transform focus:translate-y-0"
          >
            Skip to content
          </a>
          <BootLoader enabled={site.features.bootLoader} />
          <Navbar phone={settings.contactPhone} email={settings.contactEmail} whatsappNumber={settings.whatsappNumber} whatsappGreeting={settings.whatsappGreeting} />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer settings={settings} products={products} />
          <FloatingActions whatsappNumber={settings.whatsappNumber} whatsappGreeting={settings.whatsappGreeting} chatbot={settings.chatbot} />
          <CookieConsent analyticsId={settings.analyticsId} />
          <CustomCursor />
          <ScrollReveal />
        </AppProviders>
      </body>
    </html>
  );
}
