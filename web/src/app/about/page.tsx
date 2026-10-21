import { ArrowRight, Check, Quote } from "lucide-react";
import type { Metadata } from "next";
import { IntegrationOrbit } from "@/components/about/IntegrationOrbit";
import { CtaSection } from "@/components/home/Sections";
import { TLink } from "@/components/providers/PageTransition";
import { PageHero, SectionHeading } from "@/components/ui/Section";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { about } from "@/content/about";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description: about.hero.intro,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow={about.hero.eyebrow}
        title={
          <>
            Engineering the future of <span className="text-cyan">Indian aerospace</span> & defence.
          </>
        }
        text={about.hero.intro}
        crumbs={[{ label: "About" }]}
        aside={
          <div className="glass hud-corners rounded-3xl p-7">
            <p className="label-mono text-signal">ASP · {site.expansion}</p>
            <p className="mt-4 text-sm leading-relaxed text-fg-muted">{about.hero.body}</p>
            <p className="label-mono mt-6 border-t border-line pt-5 text-fg-dim">{site.positioning}</p>
          </div>
        }
      />

      {/* Vision statement */}
      <section className="border-y border-line bg-void py-20 sm:py-28">
        <div className="container-x">
          <p className="eyebrow">Our vision is simple</p>
          <SplitReveal as="p" text={about.vision} accent={["indigenous"]} className="mt-6 max-w-5xl font-display text-3xl font-medium leading-[1.12] sm:text-5xl" />
        </div>
      </section>

      {/* Where technology meets mission */}
      <section className="py-24 sm:py-32">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow={about.integration.eyebrow} title={about.integration.title} />
            <p className="mt-6 leading-relaxed text-fg-muted" data-animate>
              {about.integration.body}
            </p>
            <p className="mt-4 leading-relaxed text-fg-muted" data-animate>
              {about.integration.body2}
            </p>
            <p className="label-mono mt-8 text-cyan" data-animate>
              {about.integration.disciplines.join(" + ")}
            </p>
          </div>
          <div data-animate>
            <IntegrationOrbit disciplines={about.integration.disciplines} />
          </div>
        </div>
      </section>

      {/* Foundation pillars */}
      <section className="bg-ink py-24 sm:py-32" aria-labelledby="foundation-title">
        <div className="container-x">
          <SectionHeading eyebrow="Our foundation" title={<span id="foundation-title">Three pillars behind every platform.</span>} />
          <div className="mt-14 space-y-4">
            {about.foundation.map((f, i) => (
              <article key={f.key} className="glass-solid grid gap-8 rounded-3xl p-7 sm:p-10 lg:grid-cols-[0.9fr_1.1fr]" data-animate>
                <div>
                  <p className="label-mono text-signal">
                    {String(i + 1).padStart(2, "0")} · {f.eyebrow}
                  </p>
                  <h3 className="mt-4 text-2xl font-semibold sm:text-3xl">{f.title}</h3>
                  <p className="mt-4 leading-relaxed text-fg-muted">{f.body}</p>
                  <p className="mt-4 text-sm leading-relaxed text-fg-dim">{f.footnote}</p>
                </div>
                <div className="lg:border-l lg:border-line lg:pl-10">
                  {"list" in f && f.list ? (
                    <>
                      <p className="label-mono text-fg-dim">{f.listTitle}</p>
                      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                        {f.list.map((item) => (
                          <li key={item} className="flex items-start gap-2.5 text-sm text-fg">
                            <Check size={15} className="mt-0.5 shrink-0 text-cyan" /> {item}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                  {"bridge" in f && f.bridge ? (
                    <div className="flex h-full flex-col justify-center gap-4">
                      <p className="label-mono text-fg-dim">This helps us bridge the gap between</p>
                      <p className="font-display text-2xl text-fg">{f.bridge[0]}</p>
                      <span className="h-px w-16 bg-gradient-to-r from-cyan to-signal" aria-hidden />
                      <p className="font-display text-2xl text-cyan">{f.bridge[1]}</p>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* What we build */}
      <section className="py-24 sm:py-32" aria-labelledby="build-title">
        <div className="container-x">
          <SectionHeading eyebrow={about.build.eyebrow} title={<span id="build-title">{about.build.title}</span>} />
          <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-2 lg:grid-cols-5">
            {about.build.items.map((b, i) => (
              <div key={b.title} className="bg-ink p-7" data-animate style={{ ["--d" as string]: `${i * 70}ms` }}>
                <span className="label-mono text-cyan">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-5 text-lg font-semibold">{b.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Approach timeline */}
      <section className="relative overflow-hidden border-y border-line bg-void py-24 sm:py-32" aria-labelledby="approach-title">
        <div className="grid-bg grid-fade pointer-events-none absolute inset-0 opacity-50" aria-hidden />
        <div className="container-x relative">
          <SectionHeading eyebrow={about.approach.eyebrow} title={<span id="approach-title">{about.approach.title}</span>} text={about.approach.lead} />
          <ol className="relative mt-16 grid gap-10 md:grid-cols-3 lg:grid-cols-6 lg:gap-6">
            <span className="absolute left-0 right-0 top-[11px] hidden h-px bg-gradient-to-r from-cyan via-signal to-cyan opacity-50 lg:block" aria-hidden />
            {about.approach.steps.map((s, i) => (
              <li key={s.n} className="relative" data-animate style={{ ["--d" as string]: `${i * 90}ms` }}>
                <span className="relative z-10 grid size-6 place-items-center rounded-full border border-cyan bg-void">
                  <span className="size-2 rounded-full bg-cyan shadow-[0_0_10px_var(--color-cyan)]" />
                </span>
                <p className="label-mono mt-6 text-signal">{s.n}</p>
                <h3 className="mt-2 text-xl font-semibold">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Built in India */}
      <section className="py-24 sm:py-32" aria-labelledby="india-title">
        <div className="container-x grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <SectionHeading eyebrow={about.india.eyebrow} title={<span id="india-title">{about.india.title}</span>} text={about.india.body} />
            <p className="mt-5 leading-relaxed text-fg-muted" data-animate>
              {about.india.body2}
            </p>
            <p className="mt-4 leading-relaxed text-fg-muted" data-animate>
              {about.india.body3}
            </p>
          </div>
          <figure className="glass hud-corners relative overflow-hidden rounded-3xl p-8 sm:p-10" data-animate>
            <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#F47E20_0_33%,#E8EEF8_33%_66%,#138808_66%)]" aria-hidden />
            <Quote className="size-9 text-signal/70" aria-hidden />
            <blockquote className="mt-5 font-display text-2xl leading-snug text-fg sm:text-3xl">{about.india.quote}</blockquote>
            <figcaption className="label-mono mt-6 text-fg-dim">{site.name}</figcaption>
          </figure>
        </div>
      </section>

      {/* Vision, mission & values */}
      <section className="bg-ink py-24 sm:py-32" aria-labelledby="mission-title">
        <div className="container-x">
          <div className="grid gap-4 lg:grid-cols-2">
            <article className="glass-solid rounded-3xl p-8 sm:p-10" data-animate>
              <p className="label-mono text-cyan">Our vision</p>
              <h2 className="mt-4 text-2xl font-semibold leading-snug sm:text-3xl">{about.visionLong.title}</h2>
              <p className="mt-4 leading-relaxed text-fg-muted">{about.visionLong.body}</p>
            </article>
            <article className="glass-solid rounded-3xl p-8 sm:p-10" data-animate style={{ ["--d" as string]: "100ms" }}>
              <p className="label-mono text-signal">Our mission</p>
              <h2 id="mission-title" className="mt-4 text-2xl font-semibold leading-snug sm:text-3xl">
                {about.mission}
              </h2>
            </article>
          </div>
          <p className="label-mono mt-14 text-fg-dim">We are driven by</p>
          <ul className="mt-5 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {about.values.map((v, i) => (
              <li key={v.title} className="bg-ink p-7" data-animate style={{ ["--d" as string]: `${(i % 3) * 80}ms` }}>
                <h3 className="text-xl font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-fg-muted">{v.text}</p>
              </li>
            ))}
          </ul>
          <div className="mt-12 flex flex-wrap gap-3">
            <TLink href="/products" className="btn btn-ghost">
              Explore our platforms <ArrowRight size={16} />
            </TLink>
            <TLink href="/careers" className="btn btn-ghost">
              Join the team <ArrowRight size={16} />
            </TLink>
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
