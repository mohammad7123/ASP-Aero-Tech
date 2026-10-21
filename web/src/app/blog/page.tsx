import { ArrowUpRight, Newspaper } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { TLink } from "@/components/providers/PageTransition";
import { PageHero } from "@/components/ui/Section";
import { getBlogPosts } from "@/lib/api";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Insights",
  description: "Read ASP Aero Tech insights on unmanned aircraft engineering, drone applications, flight testing, autonomy, and mission operations.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const posts = await getBlogPosts();
  return (
    <>
      <PageHero
        eyebrow="Insights"
        title={
          <>
            Engineering notes <span className="text-cyan">from the field.</span>
          </>
        }
        text="Perspectives on unmanned aircraft design, mission integration, manufacturing, testing, and operational deployment."
        crumbs={[{ label: "Insights" }]}
      />
      <section className="pb-24 sm:pb-32">
        <div className="container-x">
          {posts.length === 0 ? (
            <div className="glass-solid rounded-3xl px-6 py-16 text-center">
              <Newspaper className="mx-auto size-9 text-cyan" strokeWidth={1.4} />
              <h2 className="mt-5 text-2xl font-semibold">No articles published yet.</h2>
              <p className="mx-auto mt-2 max-w-md text-fg-muted">New engineering notes will appear here when our team publishes them.</p>
            </div>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <li key={p.id}>
                  <TLink href={`/blog/${p.slug}`} className="spot-card glass-solid group flex h-full flex-col overflow-hidden rounded-3xl">
                    <div className="relative aspect-[16/9] overflow-hidden border-b border-line bg-navy-900">
                      {p.featuredImage ? (
                        <Image src={p.featuredImage} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="grid-bg absolute inset-0 grid place-items-center">
                          <Newspaper className="size-8 text-cyan/60" strokeWidth={1.2} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <p className="label-mono text-fg-dim">
                        {[p.category, p.publishedAt && new Date(p.publishedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })].filter(Boolean).join(" · ")}
                      </p>
                      <h2 className="mt-3 text-xl font-semibold leading-snug">{p.title}</h2>
                      {p.excerpt && <p className="mt-2 line-clamp-3 text-sm text-fg-muted">{p.excerpt}</p>}
                      <span className="link-arrow mt-auto pt-6">
                        Read article <ArrowUpRight size={14} />
                      </span>
                    </div>
                  </TLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
