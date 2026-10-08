import { ArrowUpRight, Check } from "lucide-react";
import type { Metadata } from "next";
import { DroneBlueprint } from "@/components/blueprint/DroneBlueprint";
import { CtaSection } from "@/components/home/Sections";
import { TLink } from "@/components/providers/PageTransition";
import { industryIcons } from "@/components/ui/Icons";
import { PageHero } from "@/components/ui/Section";
import { industries, industriesPage } from "@/content/industries";
import { getProducts } from "@/lib/api";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Industries & Mission Applications",
  description: industriesPage.hero.text,
  alternates: { canonical: "/industries" },
};

export default async function IndustriesPage() {
  const products = await getProducts();
  return (
    <>
      <PageHero
        eyebrow={industriesPage.hero.eyebrow}
        title={
          <>
            Aerial capability for <span className="text-cyan">complex operating environments.</span>
          </>
        }
        text={industriesPage.hero.text}
        crumbs={[{ label: "Industries" }]}
      >
        <nav aria-label="Jump to an industry" className="mt-10 flex flex-wrap gap-2">
          {industries.map((ind) => (
            <TLink key={ind.slug} href={`/industries#${ind.slug}`} className="chip hover:border-cyan hover:text-fg">
              {ind.title}
            </TLink>
          ))}
        </nav>
      </PageHero>

      <section className="pb-24 sm:pb-32" aria-label={industriesPage.sectors.title}>
        <div className="container-x space-y-4">
          {industries.map((ind, i) => {
            const Icon = industryIcons[ind.icon];
            const matches = products.filter((p) => p.categories.some((c) => ind.categories.includes(c)));
            return (
              <article key={ind.slug} id={ind.slug} className="glass-solid scroll-mt-28 overflow-hidden rounded-3xl" data-animate>
                <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[1fr_1fr]">
                  <div>
                    <div className="flex items-center gap-4">
                      <span className="grid size-12 place-items-center rounded-2xl border border-line-strong bg-cyan/[0.06] text-cyan">
                        <Icon className="size-6" strokeWidth={1.4} />
                      </span>
                      <span className="label-mono text-fg-dim">Sector {String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h2 className="mt-6 text-3xl font-semibold sm:text-4xl">{ind.title}</h2>
                    <p className="mt-4 leading-relaxed text-fg-muted">{ind.text}</p>
                    <p className="mt-3 text-sm leading-relaxed text-fg-dim">{industriesPage.advisory}</p>
                    <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                      {ind.applications.map((a) => (
                        <li key={a} className="flex items-center gap-2.5 text-sm text-fg">
                          <Check size={15} className="shrink-0 text-cyan" /> {a}
                        </li>
                      ))}
                    </ul>
                    <TLink href="/contact" className="btn btn-ghost mt-8">
                      Discuss the mission <ArrowUpRight size={16} />
                    </TLink>
                  </div>
                  <div>
                    <p className="label-mono text-fg-dim">Recommended platforms · {matches.length}</p>
                    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                      {matches.slice(0, 6).map((p) => (
                        <li key={p.slug}>
                          <TLink href={`/products/${p.slug}`} className="group flex items-center gap-4 rounded-2xl border border-line p-3 transition-colors hover:border-cyan/50 hover:bg-cyan/[0.04]">
                            <DroneBlueprint preset={p.presentation.model.preset} className="size-16 shrink-0 rounded-xl bg-navy-950" />
                            <span className="min-w-0">
                              <span className="block truncate font-display text-sm font-medium text-fg">{p.name}</span>
                              <span className="label-mono block truncate text-[10px] text-fg-dim">{p.presentation.airframe}</span>
                            </span>
                          </TLink>
                        </li>
                      ))}
                    </ul>
                    {matches.length === 0 && <p className="mt-4 text-sm text-fg-muted">Configured to order for this sector.</p>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <CtaSection />
    </>
  );
}
