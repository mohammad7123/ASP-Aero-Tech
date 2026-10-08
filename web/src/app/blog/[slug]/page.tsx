import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { TLink } from "@/components/providers/PageTransition";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/content/site";
import { getBlogPost, getBlogPosts } from "@/lib/api";
import { absoluteUrl, breadcrumbJsonLd, siteUrl } from "@/lib/seo";

export const revalidate = 300;
export const dynamicParams = true;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Article not found", robots: { index: false } };
  const description = post.metaDescription || post.excerpt || undefined;
  return {
    title: post.metaTitle || post.title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      title: post.metaTitle || post.title,
      description,
      url: `/blog/${slug}`,
      publishedTime: post.publishedAt ?? undefined,
      ...(post.featuredImage ? { images: [{ url: post.featuredImage }] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  // Content is stored as plain text with blank-line paragraph breaks (no HTML), so it renders safely.
  const paragraphs = post.content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <article>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.metaDescription || post.excerpt || undefined,
            datePublished: post.publishedAt ?? undefined,
            mainEntityOfPage: absoluteUrl(`/blog/${slug}`),
            ...(post.featuredImage ? { image: post.featuredImage } : {}),
            author: { "@type": "Organization", name: site.name, url: siteUrl() },
            publisher: { "@id": `${siteUrl()}/#organization` },
          },
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Insights", path: "/blog" },
            { name: post.title, path: `/blog/${slug}` },
          ]),
        ]}
      />
      <header className="relative overflow-hidden pt-[calc(var(--header-h)+3rem)] pb-12">
        <div className="grid-bg grid-fade pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="container-x relative max-w-4xl">
          <TLink href="/blog" className="link-arrow">
            <ArrowLeft size={14} /> All insights
          </TLink>
          <p className="label-mono mt-8 text-fg-dim">
            {[post.category, post.publishedAt && new Date(post.publishedAt).toLocaleDateString("en-IN", { dateStyle: "long" })].filter(Boolean).join(" · ")}
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">{post.title}</h1>
          {post.excerpt && <p className="mt-6 text-lg leading-relaxed text-fg-muted">{post.excerpt}</p>}
        </div>
      </header>
      {post.featuredImage && (
        <div className="container-x max-w-5xl">
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-line">
            <Image src={post.featuredImage} alt="" fill priority sizes="(min-width: 1024px) 64rem, 100vw" className="object-cover" />
          </div>
        </div>
      )}
      <div className="container-x prose-hud max-w-3xl pb-24 pt-10 sm:pb-32">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </article>
  );
}
