import { ArrowUpRight, Check } from "lucide-react";
import type { Metadata } from "next";
import { CtaSection } from "@/components/home/Sections";
import { TLink } from "@/components/providers/PageTransition";
import { ServiceIcon } from "@/components/ui/Icons";
import { PageHero, SectionHeading } from "@/components/ui/Section";
import { TiltCard } from "@/components/ui/TiltCard";
import { services, servicesPage } from "@/content/services";

export const metadata: Metadata = {
  title: "Engineering Services",
  description: servicesPage.hero.text,
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  const { hero, capabilities, process, operations } = servicesPage;
  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        title={
          <>
            Complete UAS development, <span className="text-cyan">integration, and support.</span>
          </>
        }
        text={hero.text}
        crumbs={[{ label: "Services" }]}
      />

      <section className="pb-24 sm:pb-32" aria-labelledby="capabilities-title">
        <div className="container-x">
          <SectionHeading eyebrow={capabilities.eyebrow} title={<span id="capabilities-title">{capabilities.title}</span>} text={capabilities.text} />
          <div className="mt-14 space-y-4">
            {services.map((s, i) => (
              <article key={s.slug} id={s.slug} className="scroll-mt-28" data-animate>
                <TiltCard max={3} className="rounded-3xl">
                  <div className="glass-solid grid gap-8 rounded-3xl p-7 sm:p-10 lg:grid-cols-[auto_1fr_1fr] lg:items-center">
                    <div className="flex items-center gap-5 lg:block">
                      <span className="text-cyan">
                        <ServiceIcon name={s.icon} className="size-16 sm:size-20" />
                      </span>
                      <span className="label-mono text-fg-dim lg:mt-4 lg:block">{String(i + 1).padStart(2, "0")} / 06</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold sm:text-3xl">{s.title}</h2>
                      <p className="mt-3 leading-relaxed text-fg-muted">{s.text}</p>
                    </div>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {s.bullets.map((b) => (
                        <li key={b} className="flex items-center gap-2.5 rounded-xl border border-line px-4 py-3 text-sm text-fg">
                          <Check size={15} className="shrink-0 text-cyan" /> {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TiltCard>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-void py-24 sm:py-32">
        <div className="container-x grid gap-6 lg:grid-cols-2">
          <div className="glass hud-corners rounded-3xl p-8 sm:p-10" data-animate>
            <p className="eyebrow">{process.eyebrow}</p>
            <h2 className="mt-5 text-3xl font-semibold sm:text-4xl">{process.title}</h2>
            <p className="mt-4 leading-relaxed text-fg-muted">{process.text}</p>
            <ol className="mt-8 space-y-4">
              {process.steps.map((step, i) => (
                <li key={step} className="flex items-center gap-4">
                  <span className={`grid size-10 shrink-0 place-items-center rounded-full border font-mono text-sm ${i === 1 ? "border-signal text-signal" : "border-cyan text-cyan"}`}>
                    {i + 1}
                  </span>
                  <span className="font-medium text-fg">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex flex-col justify-center p-2 sm:p-6" data-animate style={{ ["--d" as string]: "120ms" }}>
            <p className="eyebrow">{operations.eyebrow}</p>
            <h2 className="mt-5 text-3xl font-semibold sm:text-4xl">{operations.title}</h2>
            <p className="mt-4 leading-relaxed text-fg-muted">{operations.text}</p>
            <ul className="mt-8 space-y-3">
              {operations.checklist.map((line) => (
                <li key={line} className="flex items-start gap-3 text-fg">
                  <Check size={18} className="mt-0.5 shrink-0 text-signal" /> {line}
                </li>
              ))}
            </ul>
            <TLink href="/contact" className="btn btn-primary mt-10 self-start">
              Discuss your mission <ArrowUpRight size={18} />
            </TLink>
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
