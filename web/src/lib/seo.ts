import type { Product } from "@/content/products";
import { site } from "@/content/site";
import type { SiteSettings } from "@/lib/api";
import { orderedSpecs } from "@/lib/specs";

/** Canonical origin: NEXT_PUBLIC_SITE_URL → Vercel production domain → localhost. */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const url = explicit || (vercel ? `https://${vercel}` : "http://localhost:3000");
  return url.replace(/\/+$/, "");
}

export const absoluteUrl = (path = "/") => `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;

/** Safe serialisation for <script type="application/ld+json">. */
export const serializeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

export function organizationJsonLd(settings: SiteSettings) {
  const contactPoint =
    settings.contactPhone || settings.contactEmail
      ? [
          {
            "@type": "ContactPoint",
            contactType: "sales",
            areaServed: "IN",
            availableLanguage: ["en"],
            ...(settings.contactPhone ? { telephone: settings.contactPhone } : {}),
            ...(settings.contactEmail ? { email: settings.contactEmail } : {}),
          },
        ]
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl()}/#organization`,
    name: settings.siteName,
    alternateName: `${site.shortName} — ${site.expansion}`,
    url: siteUrl(),
    logo: absoluteUrl("/brand/asp-logo.png"),
    description: site.description,
    slogan: site.slogan,
    address: { "@type": "PostalAddress", addressCountry: "IN", ...(settings.address !== "India" ? { streetAddress: settings.address } : {}) },
    ...(contactPoint ? { contactPoint } : {}),
    ...(settings.socials.length ? { sameAs: settings.socials.map((s) => s.href) } : {}),
    knowsAbout: ["Unmanned aerial systems", "Drones", "Aerospace electronics", "Embedded systems", "Artificial intelligence", "Command and control"],
  };
}

export function websiteJsonLd(settings: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl()}/#website`,
    url: siteUrl(),
    name: settings.siteName,
    inLanguage: "en-IN",
    publisher: { "@id": `${siteUrl()}/#organization` },
  };
}

export function productJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": absoluteUrl(`/products/${product.slug}#product`),
    name: product.name,
    description: product.presentation.summary ?? product.description,
    sku: product.slug,
    category: `Unmanned aerial vehicle — ${product.presentation.airframe}`,
    url: absoluteUrl(`/products/${product.slug}`),
    ...(product.image ? { image: product.image.startsWith("http") ? product.image : absoluteUrl(product.image) } : {}),
    brand: { "@type": "Brand", name: site.name },
    manufacturer: { "@id": `${siteUrl()}/#organization` },
    countryOfOrigin: "IN",
    additionalProperty: [
      ...orderedSpecs(product).map((s) => ({ "@type": "PropertyValue", name: s.label, value: s.value })),
      ...product.features.map((f) => ({ "@type": "PropertyValue", name: "Feature", value: f })),
    ],
  };
}

export function productListJsonLd(products: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${site.name} UAS platforms`,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/products/${p.slug}`),
      name: p.name,
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: absoluteUrl(item.path) })),
  };
}
