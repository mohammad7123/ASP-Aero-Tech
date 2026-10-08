import type { Metadata } from "next";
import { Gallery, type GalleryItem } from "@/components/gallery/Gallery";
import { PageHero } from "@/components/ui/Section";
import { getProducts } from "@/lib/api";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Gallery",
  description: "Platform reference imagery from the ASP Aero Tech unmanned aerial systems portfolio.",
  alternates: { canonical: "/gallery" },
};

/**
 * Built from the product catalogue today. To add mission photography, append
 * items here (or wire a CMS) — e.g. { src: "/gallery/mission-01.jpg", title,
 * caption, category: "Missions" }. Only publish imagery you own the rights to.
 */
export default async function GalleryPage() {
  const products = await getProducts();
  const items: GalleryItem[] = products
    .filter((p) => p.image)
    .map((p) => ({
      src: p.image as string,
      title: p.name,
      caption: p.description,
      category: p.categories.includes("Military & Defense") && p.categories.length <= 2 ? "Defence" : (p.categories[0] ?? "Platforms"),
    }));

  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title={
          <>
            Platforms in <span className="text-cyan">focus.</span>
          </>
        }
        text="Reference imagery from across the ASP Aero Tech UAS portfolio."
        crumbs={[{ label: "Gallery" }]}
      />
      <section className="pb-24 sm:pb-32">
        <div className="container-x">
          {items.length ? <Gallery items={items} /> : <p className="text-fg-muted">Imagery will appear here soon.</p>}
        </div>
      </section>
    </>
  );
}
