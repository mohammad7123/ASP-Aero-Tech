import { ArrowRight, ArrowUpRight, Check, ChevronDown, Quote } from "lucide-react";
import Image from "next/image";
import { DroneBlueprint } from "@/components/blueprint/DroneBlueprint";
import { TLink } from "@/components/providers/PageTransition";
import { CountUp } from "@/components/ui/CountUp";
import { industryIcons, ServiceIcon } from "@/components/ui/Icons";
import { Magnetic } from "@/components/ui/Magnetic";
import { SectionHeading, StatusDot } from "@/components/ui/Section";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { about } from "@/content/about";
import { anatomyParts, stats, testimonials } from "@/content/highlights";
import { industries, industriesIntro } from "@/content/industries";
import type { Product } from "@/content/products";
import { services, servicesIntro } from "@/content/services";
import { assurances, ctaContent, heroContent } from "@/content/site";
import type { BlogPostSummary } from "@/lib/api";
import { HeroFallbackVisual, StaticOnly } from "./Flight";
import { HeroTelemetry, TelemetryHud } from "./TelemetryHud";

/* ───────────────────────────── Hero ───────────────────────────── */

export function HeroSection() {
  return (
    <section data-flight-segment="hero" className="relative flex min-h-[100svh] flex-col overflow-hidden pt-[calc(var(--header-h)+2.25rem)]">
      {/* viewport HUD frame */}
      <div className="hud-corners pointer-events-none absolute inset-4 opacity-50 sm:inset-6 [--s:22px]" aria-hidden />
      {/* legibility scrim for the copy over the 3D scene */}
      <div className="hero-scrim pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,#000_55%,transparent)]" aria-hidden />
      <HeroFallbackVisual />

      {/* phones: headline on top, drone in the clear middle, copy + CTAs below; from sm up it is one centred block */}
      <div className="container-x relative flex flex-1 flex-col justify-between pb-6 sm:justify-center sm:pb-10">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="eyebrow">{heroContent.eyebrow}</span>
            <span className="chip text-go">
              <span className="size-1.5 rounded-full bg-go" /> {heroContent.badge}
            </span>
          </div>
          <SplitReveal
            as="h1"
            text={heroContent.title}
            trigger="boot"
            accent={["mission."]}
            accentClassName="accent-swoosh"
            className="mt-6 text-[2.75rem] font-semibold leading-[0.98] tracking-[-0.035em] text-fg sm:text-6xl lg:text-[5.4rem]"
          />
        </div>
        <div className="max-w-3xl">
          <p className="max-w-xl text-base leading-relaxed text-fg-muted sm:mt-6 sm:text-lg">{heroContent.subtitle}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-9">
            <Magnetic>
              <TLink href={heroContent.primaryCta.href} className="btn btn-primary" data-cursor="Brief us">
                {heroContent.primaryCta.label} <ArrowUpRight size={18} />
              </TLink>
            </Magnetic>
            <Magnetic>
              <TLink href={heroContent.secondaryCta.href} className="btn btn-ghost" data-cursor="Explore">
                {heroContent.secondaryCta.label} <ArrowRight size={18} />
              </TLink>
            </Magnetic>
          </div>
          <ul className="mt-10 hidden max-w-2xl gap-3 sm:grid sm:grid-cols-3">
            {heroContent.checks.map((c) => (
              <li key={c} className="flex items-start gap-2 text-xs uppercase leading-snug tracking-[0.12em] text-fg-dim">
                <Check size={14} className="mt-px shrink-0 text-signal" /> {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container-x relative flex items-end justify-between gap-6 pb-8">
        <HeroTelemetry />
        <a href="#about-snapshot" className="label-mono group hidden flex-col items-center gap-2 text-fg-dim hover:text-cyan sm:flex" aria-label="Scroll to launch: begin the flight">
          Scroll to launch
          <span className="relative block h-12 w-px overflow-hidden bg-line">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[scan-y_1.8s_ease-in-out_infinite] bg-cyan" />
          </span>
          <ChevronDown size={14} />
        </a>
      </div>
    </section>
  );
}

/* ───────────────────────────── Journey waypoints ───────────────────────────── */

function Waypoint({ code, label }: { code: string; label: string }) {
  return (
    <div className="label-mono flex items-center gap-3 text-signal">
      <span className="grid size-7 place-items-center rounded-full border border-signal/50 bg-signal/10 text-[10px]">◆</span>
      {code} <span className="text-fg-dim">·</span> <span className="text-fg-muted">{label}</span>
    </div>
  );
}

export function AboutWaypoint() {
  const pillars = [
    { title: "Software-driven", text: "Drone systems built as integrated platforms, not standalone hardware." },
    { title: "Defence experience", text: "An advisory board of senior defence professionals guides every program." },
    { title: "IIT engineering", text: "IIT alumni across aerospace, electronics, embedded systems and AI." },
  ];
  return (
    <section id="about-snapshot" data-flight-segment="about" className="relative flex min-h-[130vh] items-center py-24">
      <div className="container-x">
        <div className="glass max-w-xl rounded-3xl p-7 sm:p-10" data-animate>
          <Waypoint code="WP-01" label="Who we are" />
          <SplitReveal
            as="h2"
            text="Engineering the future of Indian aerospace & defence."
            accent={["Indian"]}
            className="mt-6 text-3xl font-semibold leading-[1.05] sm:text-[2.6rem]"
          />
          <p className="mt-5 leading-relaxed text-fg-muted">{about.hero.intro}</p>
          <ul className="mt-8 space-y-4 border-t border-line pt-6">
            {pillars.map((p, i) => (
              <li key={p.title} className="grid grid-cols-[2.5rem_1fr] gap-2">
                <span className="label-mono pt-1 text-cyan">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="block font-display text-lg font-medium text-fg">{p.title}</span>
                  <span className="text-sm text-fg-muted">{p.text}</span>
                </span>
              </li>
            ))}
          </ul>
          <TLink href="/about" className="link-arrow mt-8">
            Our story <ArrowRight size={14} />
          </TLink>
        </div>
      </div>
    </section>
  );
}

export function AnatomyWaypoint() {
  return (
    <section data-flight-segment="anatomy" className="relative h-[260vh]" aria-labelledby="anatomy-title">
      <div className="sticky top-0 flex min-h-[100svh] items-end pb-6 pt-24 lg:items-center lg:py-24">
        <div className="container-x grid items-center gap-10 lg:grid-cols-[minmax(0,30rem)_1fr]">
          <div className="glass rounded-3xl p-5 sm:p-9">
            <Waypoint code="WP-02" label="Platform anatomy" />
            <h2 id="anatomy-title" className="mt-4 text-2xl font-semibold leading-[1.05] sm:mt-6 sm:text-[2.4rem]">
              Every subsystem, engineered as <span className="text-cyan">one platform.</span>
            </h2>
            <p className="mt-4 hidden text-sm leading-relaxed text-fg-muted sm:block">
              Software, electronics and aerospace engineering integrated under one roof — keep scrolling to take the aircraft apart.
            </p>
            <ol className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:mt-6 sm:gap-x-6 sm:gap-y-4">
              {anatomyParts.map((p, i) => (
                <li key={p.key} className="border-t border-line pt-2 sm:pt-3">
                  <span className="label-mono text-signal">{String(i + 1).padStart(2, "0")}</span>
                  <span className="mt-1 block font-display text-sm font-medium text-fg sm:text-base">{p.label}</span>
                  <span className="mt-1 hidden text-xs leading-relaxed text-fg-dim sm:block">{p.text}</span>
                </li>
              ))}
            </ol>
          </div>
          <StaticOnly className="hidden lg:block">
            <DroneBlueprint preset="hero-quad" annotated animated title="Annotated schematic of an ASP multirotor" />
          </StaticOnly>
        </div>
      </div>
    </section>
  );
}

export function ControlWaypoint() {
  return (
    <section data-flight-segment="control" className="relative flex min-h-[190vh] items-center py-24">
      <div className="container-x flex justify-end">
        <div className="w-full max-w-xl space-y-5">
          <div className="glass-strong rounded-3xl p-7 sm:p-9" data-animate>
            <Waypoint code="WP-03" label="Command & control" />
            <h2 className="mt-6 text-3xl font-semibold leading-[1.05] sm:text-[2.4rem]">
              Mission control, <span className="text-cyan">built in.</span>
            </h2>
            <p className="mt-4 leading-relaxed text-fg-muted">{about.build.items[3].text}</p>
            <p className="mt-3 text-sm leading-relaxed text-fg-dim">{about.build.items[2].text}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Encrypted Comms", "Autonomous", "Mission-Ready"].map((f) => (
                <span key={f} className="chip">
                  <Check size={12} className="text-go" /> {f}
                </span>
              ))}
            </div>
          </div>
          <div data-animate style={{ ["--d" as string]: "120ms" }}>
            <TelemetryHud />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Assurances strip ───────────────────────────── */

export function AssuranceStrip() {
  return (
    <section className="relative border-y border-line bg-ink" aria-label="Why ASP Aero Tech">
      <div className="container-x grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
        {assurances.map((a, i) => (
          <div key={a.title} className="flex gap-5 py-8 md:px-8 md:first:pl-0" data-animate style={{ ["--d" as string]: `${i * 90}ms` }}>
            <span className="label-mono pt-1 text-signal">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h3 className="text-lg font-semibold">{a.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-fg-muted">{a.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────────── Services ───────────────────────────── */

export function ServicesSection() {
  return (
    <section className="relative overflow-hidden bg-ink py-24 sm:py-32" aria-labelledby="services-title">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan/40 to-transparent" aria-hidden />
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading eyebrow={servicesIntro.eyebrow} title={<span id="services-title">{servicesIntro.title}</span>} text={servicesIntro.text} />
          <TLink href="/services" className="link-arrow" data-animate>
            All capabilities <ArrowRight size={14} />
          </TLink>
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <div key={s.slug} data-animate style={{ ["--d" as string]: `${(i % 3) * 90}ms` }}>
              <TiltCard className="h-full rounded-2xl">
                <TLink href={`/services#${s.slug}`} className="glass-solid flex h-full flex-col rounded-2xl p-7" data-cursor="Open">
                  <div className="flex items-start justify-between">
                    <span className="text-cyan">
                      <ServiceIcon name={s.icon} />
                    </span>
                    <span className="label-mono text-fg-dim">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-fg-muted">{s.text}</p>
                  <ul className="mt-auto flex flex-wrap gap-1.5 pt-6">
                    {s.bullets.map((b) => (
                      <li key={b} className="chip">
                        {b}
                      </li>
                    ))}
                  </ul>
                </TLink>
              </TiltCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Stats ───────────────────────────── */

export function StatsSection({ productCount }: { productCount: number }) {
  return (
    <section className="relative overflow-hidden border-y border-line bg-void py-20 sm:py-28" aria-label="ASP Aero Tech in numbers">
      <div className="grid-bg grid-fade pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <div className="container-x relative grid grid-cols-2 gap-x-6 gap-y-14 lg:grid-cols-4">
        {stats.map((s, i) => {
          const value = s.value === -1 ? productCount : s.value;
          return (
            <div key={s.label} className="relative" data-animate style={{ ["--d" as string]: `${i * 100}ms` }}>
              <span className="label-mono text-fg-dim">{String(i + 1).padStart(2, "0")} / {s.label}</span>
              <p className="mt-4 font-display text-5xl font-semibold tracking-tight text-fg sm:text-6xl lg:text-7xl">
                <CountUp value={value} pad={s.pad} className="tabular" />
                {s.unit && <span className="ml-2 align-top text-2xl text-cyan sm:text-3xl">{s.unit}</span>}
              </p>
              <p className="mt-3 max-w-[16rem] text-sm text-fg-muted">{s.detail}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ───────────────────────────── Industries ───────────────────────────── */

export function IndustriesSection({ products }: { products: Product[] }) {
  return (
    <section className="relative bg-ink py-24 sm:py-32" aria-labelledby="industries-title">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <SectionHeading eyebrow={industriesIntro.eyebrow} title={<span id="industries-title">{industriesIntro.title}</span>} text={industriesIntro.text} />
          <div className="flex lg:justify-end" data-animate>
            <TLink href="/industries" className="btn btn-ghost">
              Explore applications <ArrowRight size={16} />
            </TLink>
          </div>
        </div>
        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((ind, i) => {
            const Icon = industryIcons[ind.icon];
            const count = products.filter((p) => p.categories.some((c) => ind.categories.includes(c))).length;
            return (
              <TLink
                key={ind.slug}
                href={`/industries#${ind.slug}`}
                className="group relative flex min-h-64 flex-col bg-ink p-8 transition-colors hover:bg-navy-900"
                data-animate
                style={{ ["--d" as string]: `${(i % 3) * 80}ms` }}
              >
                <div className="flex items-center justify-between">
                  <Icon className="size-7 text-cyan transition-transform duration-500 group-hover:scale-110" strokeWidth={1.4} />
                  <span className="label-mono text-fg-dim">{count} platforms</span>
                </div>
                <h3 className="mt-10 text-2xl font-semibold">{ind.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">{ind.text}</p>
                <span className="link-arrow mt-auto pt-6 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  View application <ArrowRight size={14} />
                </span>
                <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-cyan to-signal transition-transform duration-700 group-hover:scale-x-100" aria-hidden />
              </TLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Vision & values (and testimonials when available) ───────────────────────────── */

export function ValuesSection() {
  return (
    <section className="relative overflow-hidden bg-void py-24 sm:py-32" aria-labelledby="vision-title">
      <div className="pointer-events-none absolute -left-40 top-20 size-[30rem] rounded-full bg-signal/10 blur-[140px]" aria-hidden />
      <div className="container-x relative">
        <StatusDot label="Our vision" tone="signal" />
        <blockquote className="mt-8 max-w-5xl">
          <Quote className="size-10 text-signal/60" aria-hidden />
          <SplitReveal
            as="p"
            text={about.vision}
            accent={["indigenous", "self-reliant"]}
            className="mt-4 font-display text-3xl font-medium leading-[1.12] tracking-tight text-fg sm:text-5xl lg:text-6xl"
          />
          <h2 id="vision-title" className="sr-only">
            Vision and values
          </h2>
        </blockquote>

        {testimonials.length > 0 && (
          <div className="mt-16 grid gap-4 md:grid-cols-2">
            {testimonials.map((t) => (
              <figure key={t.quote} className="glass-solid rounded-2xl p-7">
                <blockquote className="text-lg leading-relaxed text-fg">“{t.quote}”</blockquote>
                <figcaption className="label-mono mt-5 text-fg-dim">
                  {t.name} · {t.role}
                  {t.organization ? `, ${t.organization}` : ""}
                </figcaption>
              </figure>
            ))}
          </div>
        )}

        <ul className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {about.values.map((v, i) => (
            <li key={v.title} className="bg-void p-7" data-animate style={{ ["--d" as string]: `${(i % 3) * 80}ms` }}>
              <span className="label-mono text-cyan">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 text-xl font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm text-fg-muted">{v.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ───────────────────────────── Insights teaser (only when posts exist) ───────────────────────────── */

export function InsightsTeaser({ posts }: { posts: BlogPostSummary[] }) {
  if (!posts.length) return null;
  return (
    <section className="bg-ink py-24 sm:py-28" aria-labelledby="insights-title">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Latest insights" title={<span id="insights-title">Engineering notes from the field.</span>} />
          <TLink href="/blog" className="link-arrow">
            View all insights <ArrowRight size={14} />
          </TLink>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {posts.slice(0, 3).map((p) => (
            <TLink key={p.id} href={`/blog/${p.slug}`} className="glass-solid group overflow-hidden rounded-2xl" data-animate>
              <div className="relative aspect-[16/9] overflow-hidden bg-navy-900">
                {p.featuredImage ? (
                  <Image src={p.featuredImage} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="grid-bg absolute inset-0" />
                )}
              </div>
              <div className="p-6">
                <p className="label-mono text-fg-dim">
                  {[p.category, p.publishedAt && new Date(p.publishedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })].filter(Boolean).join(" · ")}
                </p>
                <h3 className="mt-3 text-lg font-semibold leading-snug">{p.title}</h3>
                {p.excerpt && <p className="mt-2 line-clamp-2 text-sm text-fg-muted">{p.excerpt}</p>}
              </div>
            </TLink>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── CTA ───────────────────────────── */

export function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-ink py-24 sm:py-32" aria-labelledby="cta-title">
      <div className="container-x">
        <div className="hud-corners relative overflow-hidden rounded-[2rem] border border-line px-6 py-16 text-center sm:px-12 sm:py-24 [--s:26px]">
          <div className="grid-bg grid-fade absolute inset-0 opacity-70" aria-hidden />
          <div className="absolute left-1/2 top-1/2 size-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(43,217,255,0.16),transparent_60%)]" aria-hidden />
          <div className="relative">
            <p className="eyebrow justify-center">{ctaContent.eyebrow}</p>
            <h2 id="cta-title" className="mx-auto mt-6 max-w-4xl text-4xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
              {ctaContent.title}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-fg-muted sm:text-lg">{ctaContent.text}</p>
            <Magnetic className="mt-10">
              <TLink href={ctaContent.cta.href} className="btn btn-primary px-8 py-4 text-base" data-cursor="Brief us">
                {ctaContent.cta.label} <ArrowUpRight size={18} />
              </TLink>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
