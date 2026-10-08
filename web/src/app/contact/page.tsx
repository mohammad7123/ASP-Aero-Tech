import { Headphones, Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { MapEmbed } from "@/components/contact/MapEmbed";
import { PageHero } from "@/components/ui/Section";
import { getProducts, getSettings } from "@/lib/api";
import { formatPhoneHref, whatsappHref } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Contact — Request a Technical Briefing",
  description:
    "Share the operating environment, range, endurance, payload, communications, and deployment objectives. The ASP Aero Tech engineering team will review the requirement.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const [settings, products] = await Promise.all([getSettings(), getProducts()]);
  const addresses = settings.addresses;
  const primaryAddress = addresses[0]?.address || (settings.address !== "India" ? settings.address : "");

  return (
    <>
      <PageHero
        eyebrow="Request a technical briefing"
        title={
          <>
            Tell us about the <span className="text-cyan">mission.</span>
          </>
        }
        text="Share the operating environment, range, endurance, payload, communications, and deployment objectives. Our engineering team will review the requirement."
        crumbs={[{ label: "Contact" }]}
      />

      <section className="pb-24 sm:pb-32">
        <div className="container-x grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-4">
            <div className="glass-solid rounded-3xl p-7 sm:p-8">
              <p className="eyebrow">Engage ASP Aero Tech</p>
              <h2 className="mt-4 text-2xl font-semibold">Start with the operating requirement.</h2>
              <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                Contact us for product information, a technical briefing, platform configuration, integration support, training, or a demonstration discussion.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-fg">
                <li className="flex items-center gap-3">
                  <MessageSquare size={17} className="text-cyan" /> Technical and mission enquiries
                </li>
                <li className="flex items-center gap-3">
                  <Headphones size={17} className="text-cyan" /> Training and lifecycle support
                </li>
              </ul>
              {(settings.contactPhone || settings.contactEmail || settings.whatsappNumber) && (
                <div className="mt-7 flex flex-wrap gap-2 border-t border-line pt-6">
                  {settings.contactPhone && (
                    <a href={formatPhoneHref(settings.contactPhone)} className="btn btn-ghost min-h-0 px-4 py-2 text-sm">
                      <Phone size={15} /> {settings.contactPhone}
                    </a>
                  )}
                  {settings.contactEmail && (
                    <a href={`mailto:${settings.contactEmail}`} className="btn btn-ghost min-h-0 px-4 py-2 text-sm">
                      <Mail size={15} /> Email us
                    </a>
                  )}
                  {settings.whatsappNumber && (
                    <a
                      href={whatsappHref(settings.whatsappNumber, settings.whatsappGreeting)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn min-h-0 bg-[#25D366] px-4 py-2 text-sm text-[#04220f] hover:brightness-110"
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              )}
            </div>

            {addresses.map((loc, i) => (
              <article key={`${loc.label}-${i}`} className="glass-solid rounded-3xl p-7">
                <p className="label-mono text-signal">{loc.label || `Location ${i + 1}`}</p>
                <p className="mt-3 flex items-start gap-2.5 text-sm leading-relaxed text-fg-muted">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-cyan" /> {loc.address}
                </p>
                {loc.phone && (
                  <a href={formatPhoneHref(loc.phone)} className="mt-2 flex items-center gap-2.5 text-sm text-fg-muted hover:text-fg">
                    <Phone size={15} className="text-cyan" /> {loc.phone}
                  </a>
                )}
                {loc.email && (
                  <a href={`mailto:${loc.email}`} className="mt-2 flex items-center gap-2.5 text-sm text-fg-muted hover:text-fg">
                    <Mail size={15} className="text-cyan" /> {loc.email}
                  </a>
                )}
              </article>
            ))}

            {primaryAddress && <MapEmbed address={primaryAddress} label={addresses[0]?.label || settings.siteName} />}
          </div>

          <div className="glass rounded-3xl p-6 sm:p-10">
            <ContactForm products={products.map((p) => ({ slug: p.slug, name: p.name }))} />
          </div>
        </div>
      </section>
    </>
  );
}
