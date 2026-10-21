import { ArrowUpRight, BriefcaseBusiness, MapPin, Users } from "lucide-react";
import type { Metadata } from "next";
import { TLink } from "@/components/providers/PageTransition";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/ui/Section";
import { site } from "@/content/site";
import { getJobs } from "@/lib/api";
import { siteUrl } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Careers",
  description: "Explore career opportunities in drone engineering, manufacturing, avionics, autonomy, testing, and field operations at ASP Aero Tech.",
  alternates: { canonical: "/careers" },
};

const perks = [
  { icon: BriefcaseBusiness, title: "Mission-led work", text: "Build systems around real operational requirements." },
  { icon: Users, title: "One engineering team", text: "Collaborate across hardware, software, flight, and manufacturing." },
  { icon: MapPin, title: "Made in India", text: "Strengthen indigenous unmanned aerial capability." },
];

export default async function CareersPage() {
  const jobs = await getJobs();
  return (
    <>
      {jobs.length > 0 && (
        <JsonLd
          data={jobs.map((j) => ({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            title: j.title,
            description: j.description,
            employmentType: j.type,
            hiringOrganization: { "@type": "Organization", name: site.name, sameAs: siteUrl() },
            jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: j.location, addressCountry: "IN" } },
          }))}
        />
      )}
      <PageHero
        eyebrow="Careers at ASP Aero Tech"
        title={
          <>
            Build aircraft that matter <span className="text-cyan">in the real world.</span>
          </>
        }
        text="Join a multidisciplinary team working across aerostructures, avionics, autonomy, manufacturing, flight testing, and mission operations."
        crumbs={[{ label: "Careers" }]}
      />

      <section className="pb-24 sm:pb-32">
        <div className="container-x">
          <ul className="grid gap-4 sm:grid-cols-3">
            {perks.map(({ icon: Icon, title, text }) => (
              <li key={title} className="glass-solid rounded-2xl p-6" data-animate>
                <Icon className="size-6 text-cyan" strokeWidth={1.4} />
                <h2 className="mt-4 font-semibold">{title}</h2>
                <p className="mt-1.5 text-sm text-fg-muted">{text}</p>
              </li>
            ))}
          </ul>

          <div className="mt-16">
            <p className="eyebrow">Open roles</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Find your next mission.</h2>
          </div>

          {jobs.length ? (
            <ul className="mt-8 space-y-4">
              {jobs.map((job) => (
                <li key={job.id} className="glass-solid rounded-3xl p-6 sm:p-8">
                  <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
                    <div className="max-w-3xl">
                      <p className="label-mono text-fg-dim">
                        {job.department} · {job.type}
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold">{job.title}</h3>
                      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-fg-muted">{job.description}</p>
                      {job.requirements && (
                        <details className="group mt-4">
                          <summary className="link-arrow cursor-pointer list-none">View requirements</summary>
                          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-fg-muted">{job.requirements}</p>
                        </details>
                      )}
                    </div>
                    <div className="shrink-0 md:text-right">
                      <p className="flex items-center gap-2 text-sm text-fg-muted md:justify-end">
                        <MapPin size={15} className="text-cyan" /> {job.location}
                      </p>
                      {job.salaryRange && <p className="mt-2 text-sm text-fg">{job.salaryRange}</p>}
                      <TLink href={`/contact?role=${encodeURIComponent(job.title)}`} className="btn btn-primary mt-5 min-h-0 px-5 py-2.5 text-sm">
                        Apply for this role <ArrowUpRight size={15} />
                      </TLink>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="glass-solid mt-8 rounded-3xl px-6 py-14 text-center">
              <BriefcaseBusiness className="mx-auto size-9 text-signal" strokeWidth={1.4} />
              <h3 className="mt-5 text-xl font-semibold">No open roles right now.</h3>
              <p className="mx-auto mt-2 max-w-lg text-sm text-fg-muted">
                New opportunities will appear here when published by our team. You can still introduce yourself for future roles.
              </p>
              <TLink href="/contact?interest=other" className="link-arrow mt-6">
                Contact our team <ArrowUpRight size={14} />
              </TLink>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
