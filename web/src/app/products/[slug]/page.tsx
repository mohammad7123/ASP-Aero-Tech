import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { DroneBlueprint } from "@/components/blueprint/DroneBlueprint";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { TLink } from "@/components/providers/PageTransition";
import { JsonLd } from "@/components/seo/JsonLd";
import { industryIcons } from "@/components/ui/Icons";
import { industries } from "@/content/industries";
import { getProduct, getProducts } from "@/lib/api";
import { absoluteUrl, breadcrumbJsonLd, productJsonLd } from "@/lib/seo";
import { formatSpec } from "@/lib/specs";

export const revalidate = 300;
// Products added later in the admin console render on first request, then cache.
export const dynamicParams = true;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Platform not found", robots: { index: false } };
  const description = `${product.presentation.summary ?? product.description} ${Object.values(product.specs).length ? "Range, endurance, payload and full specifications." : ""}`.trim();
  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      title: `${product.name} | ASP Aero Tech`,
      description,
      url: `/products/${slug}`,
      ...(product.image ? { images: [{ url: product.image.startsWith("http") ? product.image : absoluteUrl(product.image), alt: product.name }] } : {}),
    },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const related = products.filter((p) => p.slug !== slug && p.categories.some((c) => product.categories.includes(c))).slice(0, 3);
  const matched = industries.filter((i) => i.categories.some((c) => product.categories.includes(c)));

  return (
    <>
      <JsonLd
        data={[
          productJsonLd(product),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Platforms", path: "/products" },
            { name: product.name, path: `/products/${slug}` },
          ]),
        ]}
      />

      <section className="relative overflow-hidden pt-[calc(var(--header-h)+3rem)] pb-10">
        <div className="grid-bg grid-fade pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="container-x relative">
          <nav aria-label="Breadcrumb">
            <ol className="label-mono flex flex-wrap items-center gap-2 text-fg-dim">
              <li>
                <TLink href="/" className="hover:text-cyan">
                  Home
                </TLink>
              </li>
              <li aria-hidden>/</li>
              <li>
                <TLink href="/products" className="hover:text-cyan">
                  Platforms
                </TLink>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-fg-muted">
                {product.name}
              </li>
            </ol>
          </nav>
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="eyebrow">{product.presentation.label}</p>
              <h1 className="mt-4 text-5xl font-semibold leading-[0.98] sm:text-6xl lg:text-7xl">{product.name}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-fg-muted">{product.presentation.summary ?? product.description}</p>
            </div>
            <ul className="flex flex-wrap gap-2 lg:justify-end">
              {product.features.map((f) => (
                <li key={f} className="chip">
                  <Check size={12} className="text-go" /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="container-x pb-20">
        <ProductShowcase products={[product]} heading={false} compact />
      </div>

      {/* Mission profiles */}
      <section className="border-y border-line bg-void py-20 sm:py-24" aria-labelledby="profiles-title">
        <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">Mission profiles</p>
            <h2 id="profiles-title" className="mt-4 text-3xl font-semibold sm:text-4xl">
              Where the {product.name} fits.
            </h2>
            <ul className="mt-6 flex flex-wrap gap-2">
              {product.categories.map((c) => (
                <li key={c} className="chip">
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2">
            {matched.map((ind) => {
              const Icon = industryIcons[ind.icon];
              return (
                <TLink key={ind.slug} href={`/industries#${ind.slug}`} className="group bg-void p-6 transition-colors hover:bg-navy-900">
                  <Icon className="size-6 text-cyan" strokeWidth={1.4} />
                  <h3 className="mt-5 text-lg font-semibold">{ind.title}</h3>
                  <p className="mt-2 text-sm text-fg-muted">{ind.text}</p>
                </TLink>
              );
            })}
            {matched.length === 0 && <p className="bg-void p-6 text-fg-muted">Configured to order — discuss your mission with our engineers.</p>}
          </div>
        </div>
      </section>

      {/* Reference sheet */}
      {product.image && (
        <section className="py-20 sm:py-24" aria-labelledby="sheet-title">
          <div className="container-x grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="eyebrow">Reference sheet</p>
              <h2 id="sheet-title" className="mt-4 text-3xl font-semibold sm:text-4xl">
                Platform data sheet
              </h2>
              <dl className="mt-8 divide-y divide-line border-y border-line">
                {Object.entries(product.specs).map(([k, v]) =>
                  v ? (
                    <div key={k} className="flex items-baseline justify-between gap-6 py-3">
                      <dt className="label-mono text-fg-dim">{k.replace(/([A-Z])/g, " $1")}</dt>
                      <dd className="font-mono text-sm text-fg">{formatSpec(v)}</dd>
                    </div>
                  ) : null,
                )}
              </dl>
            </div>
            <figure className="hud-corners relative overflow-hidden rounded-3xl border border-line p-2">
              <Image
                src={product.image}
                alt={`${product.name} reference sheet`}
                width={1448}
                height={1086}
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="h-auto w-full rounded-2xl"
              />
            </figure>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="bg-ink pb-24 pt-4" aria-labelledby="related-title">
          <div className="container-x">
            <div className="flex items-end justify-between gap-6 border-t border-line pt-14">
              <h2 id="related-title" className="text-2xl font-semibold sm:text-3xl">
                Related platforms
              </h2>
              <TLink href="/products" className="link-arrow">
                All platforms <ArrowRight size={14} />
              </TLink>
            </div>
            <ul className="mt-8 grid gap-4 md:grid-cols-3">
              {related.map((p) => (
                <li key={p.slug}>
                  <TLink href={`/products/${p.slug}`} className="spot-card glass-solid group flex items-center gap-5 rounded-2xl p-5">
                    <DroneBlueprint preset={p.presentation.model.preset} className="size-24 shrink-0 rounded-xl bg-navy-950" />
                    <span>
                      <span className="label-mono block text-cyan">{p.presentation.label}</span>
                      <span className="mt-1 block font-display text-lg font-medium">{p.name}</span>
                    </span>
                    <ArrowUpRight className="ml-auto size-5 text-fg-dim group-hover:text-signal" />
                  </TLink>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
