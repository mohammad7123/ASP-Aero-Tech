import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { ProductGrid } from "@/components/products/ProductGrid";
import { TLink } from "@/components/providers/PageTransition";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHero, SectionHeading } from "@/components/ui/Section";
import { productCategories } from "@/content/products";
import { getProducts } from "@/lib/api";
import { productListJsonLd } from "@/lib/seo";
import { formatSpec, specMeta, specOrder } from "@/lib/specs";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "UAS Platforms",
  description: "Explore our complete range of mission-configurable unmanned aerial systems — surveillance, fixed wing, VTOL, tethered, fibre-optic, FPV, mini, micro and loitering platforms.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage() {
  const products = await getProducts();
  const rows = specOrder.filter((k) => products.some((p) => p.specs[k]));

  return (
    <>
      <JsonLd data={productListJsonLd(products)} />
      <PageHero
        eyebrow="Portfolio"
        title={
          <>
            Aircraft engineered for <span className="text-cyan">your mission.</span>
          </>
        }
        text="ASP Aero Tech develops configurable UAS platforms spanning persistent ISR, tactical awareness, industrial inspection, and autonomous field operations. Select a mission profile below to view capable platforms."
        crumbs={[{ label: "Platforms" }]}
      />

      <section className="pb-24 sm:pb-32">
        <div className="container-x">
          <ProductGrid products={products} categories={productCategories} />
        </div>
      </section>

      {/* Side-by-side specifications */}
      <section id="compare" className="border-y border-line bg-void py-24 sm:py-28" aria-labelledby="compare-title">
        <div className="container-x">
          <SectionHeading eyebrow="Compare" title={<span id="compare-title">Specifications at a glance.</span>} text="Published figures for each platform. Configurations vary with payload and mission profile — our engineers will confirm the envelope for your requirement." />
          <div className="mt-12 overflow-x-auto rounded-2xl border border-line" data-lenis-prevent-horizontal>
            <table className="w-full min-w-[960px] border-collapse text-left text-sm">
              <caption className="sr-only">Specification comparison of ASP Aero Tech UAS platforms</caption>
              <thead>
                <tr className="border-b border-line bg-navy-950">
                  <th scope="col" className="label-mono sticky left-0 z-10 bg-navy-950 p-4 text-fg-dim">
                    Specification
                  </th>
                  {products.map((p) => (
                    <th key={p.slug} scope="col" className="p-4 align-bottom">
                      <TLink href={`/products/${p.slug}`} className="font-display text-sm font-medium text-fg hover:text-cyan">
                        {p.name}
                      </TLink>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((k) => (
                  <tr key={k} className="border-b border-line last:border-0 hover:bg-fg/[0.03]">
                    <th scope="row" className="label-mono sticky left-0 z-10 bg-void p-4 font-normal text-fg-dim">
                      {specMeta[k].label}
                    </th>
                    {products.map((p) => (
                      <td key={p.slug} className="p-4 font-mono text-[13px] text-fg-muted">
                        {p.specs[k] ? formatSpec(p.specs[k] as string) : <span className="text-fg-dim/60">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <th scope="row" className="label-mono sticky left-0 z-10 bg-void p-4 font-normal text-fg-dim">
                    Airframe
                  </th>
                  {products.map((p) => (
                    <td key={p.slug} className="p-4 text-[13px] text-fg-muted">
                      {p.presentation.airframe}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-28">
        <div className="container-x">
          <div className="glass hud-corners flex flex-col items-start justify-between gap-8 rounded-3xl p-8 sm:p-12 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <p className="eyebrow">Need a custom configuration?</p>
              <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Define the operating envelope with our engineers.</h2>
              <p className="mt-4 text-fg-muted">Share the mission, payload, range, endurance, and deployment conditions to identify the right system architecture.</p>
            </div>
            <TLink href="/contact" className="btn btn-primary shrink-0">
              Request a briefing <ArrowUpRight size={18} />
            </TLink>
          </div>
        </div>
      </section>
    </>
  );
}
