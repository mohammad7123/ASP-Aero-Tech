import { BriefcaseBusiness, Clock, IndianRupee, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApplicationForm } from "@/components/careers/ApplicationForm";
import { PageHero } from "@/components/ui/Section";
import { getJobs } from "@/lib/api";

export const revalidate = 300;
// Roles published later in the admin console render on first request, then cache.
export const dynamicParams = true;

type Params = { params: Promise<{ jobId: string }> };

async function getJob(jobId: string) {
  const id = Number(jobId);
  if (!Number.isInteger(id)) return null;
  return (await getJobs()).find((j) => j.id === id) ?? null;
}

export async function generateStaticParams() {
  const jobs = await getJobs();
  return jobs.map((j) => ({ jobId: String(j.id) }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const job = await getJob((await params).jobId);
  if (!job) return { title: "Role not found", robots: { index: false } };
  return {
    title: `Apply: ${job.title}`,
    description: `Apply for ${job.title} (${job.department}, ${job.location}) at ASP Aero Tech.`,
    alternates: { canonical: `/careers/apply/${job.id}` },
    robots: { index: false, follow: true },
  };
}

export default async function ApplyPage({ params }: Params) {
  const job = await getJob((await params).jobId);
  if (!job) notFound();

  const facts = [
    { icon: MapPin, label: job.location },
    { icon: Clock, label: job.type },
    { icon: BriefcaseBusiness, label: job.department },
    ...(job.salaryRange ? [{ icon: IndianRupee, label: job.salaryRange }] : []),
  ];

  return (
    <>
      <PageHero
        eyebrow={`Apply · ${job.department}`}
        title={job.title}
        text="Tell us about yourself and attach your CV. It takes about two minutes."
        crumbs={[{ label: "Careers", href: "/careers" }, { label: job.title }]}
      >
        <ul className="mt-8 flex flex-wrap gap-2">
          {facts.map(({ icon: Icon, label }) => (
            <li key={label} className="chip">
              <Icon size={13} className="text-cyan" /> {label}
            </li>
          ))}
        </ul>
      </PageHero>

      <section className="pb-24 sm:pb-32">
        <div className="container-x grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="glass-solid rounded-3xl p-6 sm:p-10" data-animate>
            <ApplicationForm jobId={job.id} jobTitle={job.title} />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start" data-animate style={{ ["--d" as string]: "120ms" }}>
            <div className="glass-solid rounded-3xl p-6 sm:p-8">
              <p className="eyebrow">About the role</p>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-fg-muted">{job.description}</p>
              {job.requirements && (
                <>
                  <p className="label-mono mt-6 text-fg-dim">Requirements</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-fg-muted">{job.requirements}</p>
                </>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
