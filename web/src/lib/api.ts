/**
 * Server-side data access for the existing ASP Aero Tech API
 * (artifacts/api-server, Express, mounted at /api).
 *
 * Every getter degrades gracefully: when ASP_API_URL is unset, the API is
 * down, or it returns an error, the site renders from src/content/* instead
 * of failing the build or the request.
 *
 * Only import this module from Server Components, Route Handlers or Server
 * Actions — ASP_API_URL is a server-only variable.
 */
import { cache } from "react";
import { inferPreset, products as staticProducts, type Product, type SpecKey } from "@/content/products";
import { site } from "@/content/site";

const API_ORIGIN = (process.env.ASP_API_URL || "").trim().replace(/\/+$/, "").replace(/\/api$/, "");
const REVALIDATE = Math.max(30, Number(process.env.ASP_REVALIDATE_SECONDS) || 300);

export const apiConfigured = API_ORIGIN.length > 0;
export const apiUrl = (path: string) => `${API_ORIGIN}/api${path}`;

async function apiGet<T>(path: string, tags: string[]): Promise<T | null> {
  if (!apiConfigured) return null;
  try {
    const res = await fetch(apiUrl(path), {
      headers: { accept: "application/json" },
      next: { revalidate: REVALIDATE, tags },
      // A timeout keeps a slow/unreachable API from stalling builds and renders.
      // (Signals only opt out of per-render memoisation; React.cache below covers that.)
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[asp-api] GET ${path} unavailable — using bundled content.`, (error as Error).message);
    }
    return null;
  }
}

/* ───────────────────────────── Settings ───────────────────────────── */

export type ContactAddress = { label: string; address: string; phone: string; email: string };

type ApiSettings = Partial<{
  siteName: string | null;
  tagline: string | null;
  description: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactPhone2: string | null;
  address: string | null;
  addresses: ContactAddress[] | null;
  whatsappNumber: string | null;
  whatsappGreeting: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  chatbotEnabled: boolean | null;
  chatbotName: string | null;
  chatbotGreeting: string | null;
  analyticsId: string | null;
}>;

export type SiteSettings = {
  siteName: string;
  tagline: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  contactPhone2: string;
  address: string;
  addresses: ContactAddress[];
  whatsappNumber: string;
  whatsappGreeting: string;
  socials: { label: string; href: string; key: "linkedin" | "twitter" | "facebook" | "instagram" | "youtube" }[];
  chatbot: { enabled: boolean; name: string; greeting: string };
  analyticsId: string;
};

const pick = (value: string | null | undefined, fallback: string) => (value && value.trim() ? value.trim() : fallback);

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const s = (await apiGet<ApiSettings>("/settings", ["settings"])) ?? {};
  const contactEmail = pick(s.contactEmail, site.contact.email);
  const contactPhone = pick(s.contactPhone, site.contact.phone);
  const address = pick(s.address, site.contact.address);
  const addresses =
    Array.isArray(s.addresses) && s.addresses.length
      ? s.addresses.filter((a) => a && (a.address || a.phone || a.email))
      : address && address !== "India"
        ? [{ label: site.name, address, phone: contactPhone, email: contactEmail }]
        : [];

  const socialPairs = [
    ["linkedin", "LinkedIn", s.linkedinUrl, site.socials.linkedin],
    ["twitter", "X (Twitter)", s.twitterUrl, site.socials.twitter],
    ["facebook", "Facebook", s.facebookUrl, site.socials.facebook],
    ["instagram", "Instagram", s.instagramUrl, site.socials.instagram],
    ["youtube", "YouTube", s.youtubeUrl, site.socials.youtube],
  ] as const;

  return {
    siteName: pick(s.siteName, site.name),
    tagline: pick(s.tagline, site.tagline),
    description: pick(s.description, site.footerDescription),
    contactEmail,
    contactPhone,
    contactPhone2: pick(s.contactPhone2, site.contact.phone2),
    address,
    addresses,
    whatsappNumber: pick(s.whatsappNumber, site.contact.whatsappNumber),
    whatsappGreeting: pick(s.whatsappGreeting, site.contact.whatsappGreeting),
    socials: socialPairs
      .map(([key, label, apiValue, fallback]) => ({ key, label, href: pick(apiValue, fallback) }))
      .filter((social) => /^https?:\/\//.test(social.href)),
    chatbot: {
      enabled: Boolean(s.chatbotEnabled) && apiConfigured,
      name: pick(s.chatbotName, "ASP Support"),
      greeting: pick(s.chatbotGreeting, "Hello. How can I assist you with your mission requirements today?"),
    },
    analyticsId: pick(s.analyticsId, ""),
  };
});

/* ───────────────────────────── Products ───────────────────────────── */

type ApiProduct = {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  specs: Record<string, string>;
  features: string[];
  categories: string[];
};

/** Uploaded images live in the API's object storage; bundled ones in /public. */
export function resolveImage(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("/objects/")) return apiConfigured ? `${API_ORIGIN}/api/storage${path}` : null;
  return path;
}

function mergeProduct(api: ApiProduct): Product {
  const local = staticProducts.find((p) => p.slug === api.slug);
  return {
    slug: api.slug,
    name: api.name,
    description: api.description || local?.description || "",
    image: resolveImage(api.image) ?? local?.image ?? null,
    specs: (api.specs ?? {}) as Partial<Record<SpecKey, string>>,
    features: api.features?.length ? api.features : (local?.features ?? []),
    categories: api.categories ?? [],
    presentation: local?.presentation ?? {
      label: "UAS PLATFORM",
      airframe: "Unmanned aerial system",
      model: { kind: "procedural", preset: inferPreset(api.name) },
    },
  };
}

export const getProducts = cache(async (): Promise<Product[]> => {
  const list = await apiGet<ApiProduct[]>("/products", ["products"]);
  if (!Array.isArray(list) || list.length === 0) return staticProducts;
  return list.map(mergeProduct);
});

export const getProduct = cache(async (slug: string): Promise<Product | null> => {
  const all = await getProducts();
  return all.find((p) => p.slug === slug) ?? null;
});

/* ───────────────────────────── Careers & insights ───────────────────────────── */

export type Job = {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
  salaryRange: string | null;
};

export type BlogPostSummary = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  category: string | null;
  publishedAt: string | null;
};

export type BlogPost = BlogPostSummary & { content: string; metaTitle: string | null; metaDescription: string | null };

export const getJobs = cache(async (): Promise<Job[]> => (await apiGet<Job[]>("/content/jobs", ["jobs"])) ?? []);

export const getBlogPosts = cache(async (): Promise<BlogPostSummary[]> => {
  const posts = (await apiGet<BlogPostSummary[]>("/content/blog-posts", ["blog"])) ?? [];
  return posts.map((p) => ({ ...p, featuredImage: resolveImage(p.featuredImage) }));
});

export const getBlogPost = cache(async (slug: string): Promise<BlogPost | null> => {
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  const post = await apiGet<BlogPost>(`/content/blog-posts/${encodeURIComponent(slug)}`, ["blog", `blog:${slug}`]);
  return post ? { ...post, featuredImage: resolveImage(post.featuredImage) } : null;
});
