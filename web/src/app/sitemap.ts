import type { MetadataRoute } from "next";
import { getBlogPosts, getProducts } from "@/lib/api";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([getProducts(), getBlogPosts()]);
  const now = new Date();
  const pages: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
    ["/", 1, "weekly"],
    ["/products", 0.9, "weekly"],
    ["/about", 0.8, "monthly"],
    ["/services", 0.8, "monthly"],
    ["/industries", 0.8, "monthly"],
    ["/training", 0.6, "monthly"],
    ["/gallery", 0.5, "monthly"],
    ["/blog", 0.6, "weekly"],
    ["/careers", 0.5, "weekly"],
    ["/contact", 0.7, "yearly"],
    ["/privacy-policy", 0.2, "yearly"],
  ];
  return [
    ...pages.map(([path, priority, changeFrequency]) => ({ url: absoluteUrl(path), lastModified: now, changeFrequency, priority })),
    ...products.map((p) => ({ url: absoluteUrl(`/products/${p.slug}`), lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...posts.map((p) => ({
      url: absoluteUrl(`/blog/${p.slug}`),
      lastModified: p.publishedAt ? new Date(p.publishedAt) : now,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
