import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { TLink } from "@/components/providers/PageTransition";
import { ServiceIcon } from "@/components/ui/Icons";
import { PageHero, SectionHeading } from "@/components/ui/Section";
import { TiltCard } from "@/components/ui/TiltCard";
import { training } from "@/content/highlights";

export const metadata: Metadata = {
  title: "Training & Lifecycle Support",
  description: training.hero.text,
  alternates: { canonical: "/training" },
};

export default function TrainingPage() {
  return (
    <>
      <PageHero
        eyebrow={training.hero.eyebrow}
        title={
          <>
            Trained crews. <span className="text-cyan">Supported aircraft.</span>
          </>
        }
        text={training.hero.text}
        crumbs={[{ label: "Training" }]}
        aside={
          <div className="glass hud-corners hidden rounded-3xl p-8 text-cyan lg:block">
            <ServiceIcon name="support" className="size-24" />
            <p className="label-mono mt-6 text-fg-dim">From delivery to every upgrade</p>
          </div>
        }
      />

      <section className="pb-24 sm:pb-32" aria-labelledby="modules-title">
        <div className="container-x">
          <SectionHeading eyebrow="What's covered" title={<span id="modules-title">Support that stays with the aircraft.</span>} />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {training.modules.map((m, i) => (
              <div key={m.n} data-animate style={{ ["--d" as string]: `${(i % 3) * 90}ms` }}>
                <TiltCard className="h-full rounded-2xl">
                  <div className="glass-solid h-full rounded-2xl p-7">
                    <span className="label-mono text-signal">{m.n}</span>
                    <h2 className="mt-5 text-xl font-semibold">{m.title}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-fg-muted">{m.text}</p>
                  </div>
                </TiltCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-void py-24 sm:py-28" aria-labelledby="lifecycle-title">
        <div className="container-x">
          <SectionHeading eyebrow="Lifecycle" title={<span id="lifecycle-title">One team across the aircraft&apos;s life.</span>} />
          <ol className="mt-14 flex flex-wrap items-center gap-3">
            {training.lifecycle.map((stage, i) => (
              <li key={stage} className="flex items-center gap-3" data-animate style={{ ["--d" as string]: `${i * 80}ms` }}>
                <span className="glass-solid rounded-full px-5 py-3 font-display text-sm font-medium text-fg">
                  <span className="label-mono mr-2 text-cyan">{String(i + 1).padStart(2, "0")}</span>
                  {stage}
                </span>
                {i < training.lifecycle.length - 1 && <span className="h-px w-8 bg-gradient-to-r from-cyan to-signal" aria-hidden />}
              </li>
            ))}
          </ol>
          <div className="mt-14 flex flex-wrap gap-3">
            <TLink href="/contact?interest=training-support" className="btn btn-primary">
              Request a training briefing <ArrowUpRight size={18} />
            </TLink>
            <TLink href="/services#training-lifecycle-support" className="btn btn-ghost">
              Lifecycle support details
            </TLink>
          </div>
        </div>
      </section>
    </>
  );
}
