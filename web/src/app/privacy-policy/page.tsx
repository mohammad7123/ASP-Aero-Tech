import { Cookie, Server, Settings, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { CookiePreferencesButton } from "@/components/fx/CookieConsent";
import { PageHero } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Privacy & Cookie Policy",
  description: "Read ASP Aero Tech's Privacy & Cookie Policy explaining how we manage cookies, local storage, and your personal data.",
  alternates: { canonical: "/privacy-policy" },
};

const categories = [
  { title: "Essential", text: "Necessary for core website functionality and saving your consent choices. These cannot be disabled." },
  { title: "Functional", text: "Allows the site to remember choices you make, such as language settings or custom preferences." },
  { title: "Analytics", text: "Helps us analyze visitor behavior to improve website performance and user experience." },
  { title: "Marketing", text: "Used to deliver relevant advertisements. ASP Aero Tech does not currently utilize third-party marketing trackers." },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy & Cookie Policy"
        text="ASP Aero Tech respects your privacy. This policy explains how we collect data, manage cookies, and respect your preferences."
        crumbs={[{ label: "Privacy policy" }]}
      />
      <section className="pb-24 sm:pb-32">
        <div className="container-x max-w-4xl space-y-14">
          <section>
            <h2 className="flex items-center gap-3 text-2xl font-semibold">
              <ShieldCheck className="text-signal" size={24} /> Data collection
            </h2>
            <p className="mt-4 leading-relaxed text-fg-muted">
              We collect information when you submit forms, contact us for technical briefings, or interact with our platform. This data is used exclusively to respond to your inquiries, provide support, and improve our unmanned aerial systems and services. We do not sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-3 text-2xl font-semibold">
              <Cookie className="text-signal" size={24} /> How we use cookies
            </h2>
            <p className="mt-4 leading-relaxed text-fg-muted">
              Cookies and similar technologies (like Local Storage) allow us to store your preferences and understand how visitors interact with our site. We categorize these technologies as follows:
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {categories.map((c) => (
                <div key={c.title} className="glass-solid rounded-2xl p-5">
                  <h3 className="font-semibold">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-fg-muted">{c.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="flex items-center gap-3 text-2xl font-semibold">
              <Server className="text-signal" size={24} /> Local storage of consent
            </h2>
            <p className="mt-4 leading-relaxed text-fg-muted">
              To respect your preferences without unnecessarily tracking you, we store your consent choices securely in your browser&apos;s Local Storage (under the key{" "}
              <code className="rounded bg-fg/5 px-1.5 py-0.5 font-mono text-sm text-cyan">asp_cookie_consent</code>). This ensures you are not repeatedly asked for permission on subsequent visits. The site also keeps a session-only flag so the introductory animation plays once per visit.
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-3 text-2xl font-semibold">
              <Settings className="text-signal" size={24} /> Managing your preferences
            </h2>
            <p className="mt-4 leading-relaxed text-fg-muted">You retain full control over your data and cookies. You can update or withdraw your consent at any time.</p>
            <CookiePreferencesButton className="btn btn-primary mt-6">Manage cookie preferences</CookiePreferencesButton>
          </section>
        </div>
      </section>
    </>
  );
}
